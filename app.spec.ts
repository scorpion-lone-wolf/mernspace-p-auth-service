import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "./src/app";
import { calculateDiscount } from "./src/utils";

describe("App", () => {
  it("should return correct discount price", () => {
    const actualDiscout = calculateDiscount(100, 10);
    // expected should be equal to actual(calculated) discount
    expect(actualDiscout).toBe(10);
  });
  it("should return 200 status code", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  });
});
