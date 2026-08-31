import { assertLocalResetTarget } from "./seed-reset-safety";

describe("assertLocalResetTarget", () => {
  it("allows the project development database on localhost", () => {
    expect(() =>
      assertLocalResetTarget({
        nodeEnv: "development",
        host: "localhost",
        database: "manga_marketplace",
      }),
    ).not.toThrow();
  });

  it("rejects production", () => {
    expect(() =>
      assertLocalResetTarget({
        nodeEnv: "production",
        host: "localhost",
        database: "manga_marketplace",
      }),
    ).toThrow("disabled when NODE_ENV=production");
  });

  it("rejects remote or unexpected database targets", () => {
    expect(() =>
      assertLocalResetTarget({
        nodeEnv: "development",
        host: "database.example.com",
        database: "manga_marketplace",
      }),
    ).toThrow("refused non-local database host");

    expect(() =>
      assertLocalResetTarget({
        nodeEnv: "development",
        host: "localhost",
        database: "customer_records",
      }),
    ).toThrow("refused unexpected database name");
  });
});
