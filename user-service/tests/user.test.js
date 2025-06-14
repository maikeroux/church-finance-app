const request = require("supertest");
const app = require("../src/app");

describe("User API", () => {
  it("should return 401 if no token", async () => {
    const res = await request(app).get("/api/protected");
    expect(res.statusCode).toBe(401);
  });
});
