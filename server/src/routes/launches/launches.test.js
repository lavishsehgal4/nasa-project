const request = require("supertest");
const app = require("../../app");
describe("Test GET /launches", () => {
  test("it should response with 200", async () => {
    const response = await request(app).get("/launches").expect(200);
  });
});
