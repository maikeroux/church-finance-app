const request = require("supertest");
const app = require("../src/app");

describe("User API", () => {
  it("should return 401 if no token is provided for /api/users", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/missing or invalid token/i);
  });
});
