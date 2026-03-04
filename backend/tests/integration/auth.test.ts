import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "../../errors/customErrors.js";

const state = vi.hoisted(() => ({
  nextUserId: 1,
  users: new Map<number, { id: number; username: string; email: string }>(),
}));

const mocks = vi.hoisted(() => ({
  dbQuery: vi.fn(),
}));

vi.mock("../../db/db.js", () => ({
  default: {
    query: mocks.dbQuery,
  },
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
    if (!user) throw new ApiError("Invalid credentials.", 401);
    return { id: user.id, username: user.username };
  }),
  logout: vi.fn(async () => ({ message: "Logged out." })),
}));

import app from "../../src/server.js";

describe("Authentication & User Profile Integration", () => {
  beforeEach(() => {
    state.nextUserId = 1;
    state.users.clear();
    vi.clearAllMocks();

    mocks.dbQuery.mockImplementation(async (query: string, params?: any[]) => {
      if (query.includes("SELECT id, username FROM users WHERE id = $1")) {
        const userId = Number(params?.[0]);
        const user = state.users.get(userId);
        return {
          rows: user ? [{ id: user.id, username: user.username }] : [],
        };
      }
      return { rows: [] };
    });
  });

  it("should register a user and then fetch their profile using /me", async () => {
    const agent = request.agent(app); // Maintains the session cookie[cite: 16].

    const regRes = await agent.post("/api/auth/register").send({
      username: "crow_dev",
      email: "crow@endeavour.os",
      password: "securepassword",
    });

    expect(regRes.status).toBe(201);
    expect(regRes.body.user).toMatchObject({ id: 1, username: "crow_dev" }); // [cite: 17]

    const meRes = await agent.get("/api/user/me");

    expect(meRes.status).toBe(200);
    expect(meRes.body.user).toEqual({ id: 1, username: "crow_dev" }); // [cite: 35]
    expect(mocks.dbQuery).toHaveBeenCalledTimes(1);
  });

  it("should block access to /me if not authenticated", async () => {
    const response = await request(app).get("/api/user/me");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Access Denied. No token provided./i);
  });

  it("should logout successfully and lose access to protected routes", async () => {
    const agent = request.agent(app);

    await agent.post("/api/auth/register").send({
      username: "tester",
      email: "test@test.com",
      password: "password",
    });

    const logoutRes = await agent.post("/api/auth/logout");
    expect(logoutRes.status).toBe(200);

    const meRes = await agent.get("/api/user/me");
    expect(meRes.status).toBe(401);
  });
});
