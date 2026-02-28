process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "vitest-local-secret";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgres://kindred:kindred@localhost:5432/kindred_test";
