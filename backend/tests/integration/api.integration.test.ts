import request from "supertest";
import { vi } from "vitest";
import { ApiError } from "../../errors/customErrors.js";
import { describe, it, expect } from "vitest";

const state = vi.hoisted(() => ({
  nextUserId: 1,
  users: new Map<number, { id: number; username: string; email: string }>(),
  connections: new Map<string, "not_connected" | "pending" | "connected">(),
  tmdbConfig: {
    base_url: "http://image.tmdb.org/t/p/",
    secure_base_url: "https://image.tmdb.org/t/p/",
    poster_sizes: ["w92", "w154", "w500"],
  },
}));

const mocks = vi.hoisted(() => ({
  dbQuery: vi.fn(),
  getTmdbConfig: vi.fn(),
  askConnection: vi.fn(),
  getStatus: vi.fn(),
  cancelConnection: vi.fn(),
}));

function connectionKey(a: number, b: number): string {
  const [low, high] = [Math.min(a, b), Math.max(a, b)];
  return `${low}:${high}`;
}

vi.mock("../../db/db.js", () => ({
  default: {
    query: mocks.dbQuery,
  },
}));

vi.mock("../../services/configService.js", () => ({
  getTmdbConfig: mocks.getTmdbConfig,
}));

vi.mock("../../services/connectionService.js", () => ({
  askConnection: mocks.askConnection,
  getStatus: mocks.getStatus,
  cancelConnection: mocks.cancelConnection,
  rejectConnectionRequest: vi.fn(),
  getRequests: vi.fn(),
  blockUser: vi.fn(),
  unblockUser: vi.fn(),
}));

vi.mock("../../services/authService.js", () => ({
  register: vi.fn(async (payload: { username: string; email: string }) => {
    const user = {
      id: state.nextUserId++,
      username: payload.username,
      email: payload.email,
    };
    state.users.set(user.id, user);
    return { id: user.id, username: user.username };
  }),
  login: vi.fn(async (payload: { username: string }) => {
    const user = Array.from(state.users.values()).find(
      (entry) => entry.username === payload.username,
    );
    if (!user) {
      throw new ApiError("Invalid credentials.", 401);
    }
    return { id: user.id, username: user.username };
  }),
}));

import app from "../../src/server.js";

describe("API integration templates", () => {
  beforeEach(() => {
    state.nextUserId = 1;
    state.users.clear();
    state.connections.clear();

    vi.clearAllMocks();

    mocks.dbQuery.mockImplementation(
      async (query: string, params?: unknown[]) => {
        if (query.includes("SELECT id, username FROM users WHERE id = $1")) {
          const userId = Number(params?.[0]);
          const user = state.users.get(userId);
          return {
            rows: user ? [{ id: user.id, username: user.username }] : [],
          };
        }
        return { rows: [] };
      },
    );

    mocks.getTmdbConfig.mockResolvedValue(state.tmdbConfig);

    mocks.getStatus.mockImplementation(
      async (userId: number, targetId: number) => {
        const key = connectionKey(userId, targetId);
        const status = state.connections.get(key) ?? "not_connected";
        if (status === "connected") {
          return { status: "connected" };
        }
        if (status === "pending") {
          return { status: "pending_from_user" };
        }
        return { status: "not_connected" };
      },
    );

    mocks.askConnection.mockImplementation(
      async (userId: number, targetId: number) => {
        const key = connectionKey(userId, targetId);
        state.connections.set(key, "pending");
        return { status: "pending", message: "Connection request sent." };
      },
    );

    mocks.cancelConnection.mockImplementation(
      async (userId: number, targetId: number) => {
        const key = connectionKey(userId, targetId);
        state.connections.set(key, "not_connected");
        return { status: "cancelled" };
      },
    );
  });

  it("case 1: tests a simple public endpoint with pre/post conditions", async () => {
    // Pre-condition: service has not been called yet.
    expect(mocks.getTmdbConfig).not.toHaveBeenCalled();

    const response = await request(app).get("/api/config/tmdb");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.body).toEqual(state.tmdbConfig);

    // Post-condition: one service invocation and no state mutation.
    expect(mocks.getTmdbConfig).toHaveBeenCalledTimes(1);
    expect(state.connections.size).toBe(0);
  });

  it("case 2: runs a multi-step authenticated flow across endpoints", async () => {
    const agent = request.agent(app);

    // Pre-condition: protected endpoint rejects anonymous access.
    const anonymousStatus = await agent.get("/api/connection/2/status");
    expect(anonymousStatus.status).toBe(401);

    // Step 1: create a user to obtain an auth cookie.
    const registerResponse = await agent.post("/api/auth/register").send({
      email: "ana@example.com",
      username: "ana_dev",
      password: "password123",
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.headers["set-cookie"]).toBeDefined();
    expect(registerResponse.body.user).toMatchObject({
      id: 1,
      username: "ana_dev",
    });

    // Step 2: verify initial relationship state.
    const statusBefore = await agent.get("/api/connection/2/status");
    expect(statusBefore.status).toBe(200);
    expect(statusBefore.body).toEqual({ status: "not_connected" });

    // Step 3: ask for connection and verify transition.
    const askResponse = await agent.post("/api/connection/2/ask");
    expect(askResponse.status).toBe(200);
    expect(askResponse.body.status).toBe("pending");

    const statusAfterAsk = await agent.get("/api/connection/2/status");
    expect(statusAfterAsk.status).toBe(200);
    expect(statusAfterAsk.body).toEqual({ status: "pending_from_user" });

    // Step 4: cancel and verify final post-condition.
    const cancelResponse = await agent.delete("/api/connection/2/cancel");
    expect(cancelResponse.status).toBe(200);
    expect(cancelResponse.body).toEqual({ status: "cancelled" });

    const statusAfterCancel = await agent.get("/api/connection/2/status");
    expect(statusAfterCancel.status).toBe(200);
    expect(statusAfterCancel.body).toEqual({ status: "not_connected" });

    expect(mocks.getStatus).toHaveBeenCalledTimes(3);
    expect(mocks.askConnection).toHaveBeenCalledTimes(1);
    expect(mocks.cancelConnection).toHaveBeenCalledTimes(1);
  });
});
