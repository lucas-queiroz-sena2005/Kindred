import request from "supertest"; // [cite: 1]
import { describe, it, expect, vi, beforeEach } from "vitest"; // [cite: 2]
import { ApiError } from "../../errors/customErrors.js"; // [cite: 1]

const state = vi.hoisted(() => ({
  nextUserId: 1,
  users: new Map<number, any>(),
  connections: new Map<string, string>(),
}));

const mocks = vi.hoisted(() => ({
  dbQuery: vi.fn(),
}));

vi.mock("../../db/db.js", () => ({
  default: { query: mocks.dbQuery },
}));

import app from "../../src/server.js";

describe("Module Name", () => {
  beforeEach(() => {
    state.users.clear();
    state.connections.clear();
    state.nextUserId = 1;
    vi.clearAllMocks();

    mocks.dbQuery.mockImplementation(async (query, params) => {
      return { rows: [] };
    });
  });
});
