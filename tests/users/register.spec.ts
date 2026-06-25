import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../src/app";
describe("POST /auth/resgister", () => {
  describe("Given all fields", () => {
    it("should return 201 status code", async () => {
      // AAA :
      // Arrange (preparing all the things that are needed to run the test),
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        passord: "secret"
      };
      // Act  (call the function that we want to test)
      const response = await request(app).post("/auth/register").send(userData);
      // Assert (validating the expected value and the actual value that we got)
      expect(response.statusCode).toBe(201);
    });
    it("should return valid json response", async () => {
      // Arrange (preparing all the things that are needed to run the test),
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@email.com",
        passord: "secret"
      };
      // Act  (call the function that we want to test)
      const response = await request(app).post("/auth/register").send(userData);
      // Assert (validating the expected value and the actual value that we got)
      expect(response.headers["content-type"]).toContain("application/json");
    });
    it("should save data into the databse", async () => {});
  });
  //   describe("Fields are missing", () => {});
});
