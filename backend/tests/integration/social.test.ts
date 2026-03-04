import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";

const state = vi.hoisted(() => ({
  nextUserId: 1,
  users: new Map<number, { id: number; username: string }>(),
  connections: new Map<string, string>(),
}));

const mocks = vi.hoisted(() => ({
  dbQuery: vi.fn(),
  getStatus: vi.fn(),
  askConnection: vi.fn(),
  cancelConnection: vi.fn(),
  getMessages: vi.fn(),
  sendMessage: vi.fn(),
}));

function connectionKey(a: number, b: number): string {
  const [low, high] = [Math.min(a, b), Math.max(a, b)];
  return `${low}:${high}`;
}

vi.mock("../../db/db.js", () => ({
  default: { query: mocks.dbQuery },
}));

vi.mock("../../services/connectionService.js", () => ({
  getStatus: mocks.getStatus,
  askConnection: mocks.askConnection,
  cancelConnection: mocks.cancelConnection,
  rejectConnectionRequest: vi.fn(),
  getRequests: vi.fn(),
  blockUser: vi.fn(),
  unblockUser: vi.fn(),
}));

vi.mock("../../services/messageService.js", () => ({
  getMessages: mocks.getMessages,
  sendMessage: mocks.sendMessage,
  getConversations: vi.fn(),
}));

vi.mock("../../services/authService.js", () => ({
  register: vi.fn(async (payload) => {
    const user = { id: state.nextUserId++, username: payload.username };
    state.users.set(user.id, user);
    return user;
  }),
  login: vi.fn(async (payload) => {
    const user = Array.from(state.users.values()).find(
      (u) => u.username === payload.username,
    );
    return user;
  }),
}));

import app from "../../src/server.js";

describe("Social & Messaging Integration", () => {
  beforeEach(() => {
    state.nextUserId = 1;
    state.users.clear();
    state.connections.clear();
    vi.clearAllMocks();

    mocks.getStatus.mockImplementation(async (userId, targetId) => {
      const key = connectionKey(userId, targetId);
      const status = state.connections.get(key) ?? "not_connected";
      return { status: status === "pending" ? "pending_from_user" : status };
    });

    mocks.askConnection.mockImplementation(async (userId, targetId) => {
      const key = connectionKey(userId, targetId);
      state.connections.set(key, "pending");
      return { status: "pending" };
    });

    mocks.sendMessage.mockImplementation(async (userId, targetId, content) => {
      return { id: 100, senderId: userId, receiverId: targetId, content };
    });
  });

  it("should navigate from connection request to messaging", async () => {
    const userA = request.agent(app);
    const userB = request.agent(app);

    await userA
      .post("/api/auth/register")
      .send({ username: "user_a", email: "a@test.com" });
    await userB
      .post("/api/auth/register")
      .send({ username: "user_b", email: "b@test.com" });

    const initialStatus = await userA.get("/api/connection/2/status");
    expect(initialStatus.body.status).toBe("not_connected");

    const askRes = await userA.post("/api/connection/2/ask");
    expect(askRes.status).toBe(200);
    expect(askRes.body.status).toBe("pending");

    const pendingStatus = await userA.get("/api/connection/2/status");
    expect(pendingStatus.body.status).toBe("pending_from_user");

    const msgRes = await userA
      .post("/api/messages/2")
      .send({ message: "Hello!" });
    expect(msgRes.status).toBe(200);
    expect(msgRes.body.content).toBe("Hello!");

    expect(mocks.askConnection).toHaveBeenCalledTimes(1);
    expect(mocks.sendMessage).toHaveBeenCalledTimes(1);
  });
});
