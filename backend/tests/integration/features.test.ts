import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";

const state = vi.hoisted(() => ({
  tmdbConfig: {
    base_url: "http://image.tmdb.org/t/p/",
    secure_base_url: "https://image.tmdb.org/t/p/",
    poster_sizes: ["w92", "w154", "w500"],
  },
  tierlists: [
    { id: 101, name: "Top Sci-Fi Movies", items: ["Movie A", "Movie B"] },
    { id: 102, name: "Best Directors", items: ["Director X", "Director Y"] },
  ],
}));

const mocks = vi.hoisted(() => ({
  dbQuery: vi.fn(),
  getTmdbConfig: vi.fn(),
  getTierlistList: vi.fn(),
  getTierlistById: vi.fn(),
  getAllTemplates: vi.fn(),
  getTierList: vi.fn(),
  saveRanking: vi.fn(),
}));

vi.mock("../../db/db.js", () => ({
  default: { query: mocks.dbQuery },
}));

vi.mock("../../services/configService.js", () => ({
  getTmdbConfig: mocks.getTmdbConfig,
}));

vi.mock("../../services/tierlistService.js", () => ({
  getTierlistList: mocks.getTierlistList,
  getAllTemplates: mocks.getAllTemplates,
  getTierlistById: mocks.getTierlistById,
  getTierList: mocks.getTierList,
  saveRanking: mocks.saveRanking,
}));

vi.mock("../../services/authService.js", () => ({
  login: vi.fn(async () => ({ id: 1, username: "tester" })),
  register: vi.fn(async () => ({ id: 1, username: "tester" })),
}));

import app from "../../src/server.js";
import { getAllTemplates } from "../../services/tierlistService.js";

describe("Features & Global Config Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.getTmdbConfig.mockResolvedValue(state.tmdbConfig);
    mocks.getTierlistList.mockResolvedValue(state.tierlists);
    mocks.getAllTemplates.mockResolvedValue(state.tierlists);
    mocks.getTierlistById.mockImplementation(async (id) => {
      const tierlist = state.tierlists.find((t) => t.id === Number(id));
      return tierlist ? { ...tierlist, items: ["Movie A", "Movie B"] } : null;
    });
    mocks.getTierList.mockImplementation(async (id) => {
      const list = state.tierlists.find((t) => t.id === Number(id));
      return list ? { ...list, items: ["Movie A", "Movie B"] } : null;
    });
  });

  it("should fetch TMDB configuration successfully", async () => {
    const res = await request(app).get("/api/config/tmdb");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(state.tmdbConfig);
    expect(mocks.getTmdbConfig).toHaveBeenCalledTimes(1);
  });

  it("should fetch the list of available tierlists when authenticated", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ username: "tester" });

    const res = await agent.get("/api/tierlist/list");

    expect(res.status).toBe(200);
    console.log("HEEEEEERE" + res.body);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe("Top Sci-Fi Movies");
  });

  it("should fetch a specific tierlist by ID", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ username: "tester" });

    const res = await agent.get("/api/tierlist/101");

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(101);
    expect(res.body.items).toContain("Movie A");
  });

  it("should block tierlist access if not logged in", async () => {
    const res = await request(app).get("/api/tierlist/list");
    expect(res.status).toBe(401);
  });
});
