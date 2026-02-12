import supertest from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import fastify from "../../server";

describe("Server", () => {
  beforeAll(async () => {
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  it("health check returns 200", async () => {
    await supertest(fastify.server)
      .get("/health")
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("status", "ok");
        expect(res.body).toHaveProperty("uptime");
        expect(res.body).toHaveProperty("timestamp");
      });
  });

  it("root endpoint returns API info", async () => {
    await supertest(fastify.server)
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("name", "Kontaktar API");
        expect(res.body).toHaveProperty("version", "1.0.0");
        expect(res.body).toHaveProperty("status", "ok");
      });
  });
});
