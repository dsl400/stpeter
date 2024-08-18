import request from "supertest";
import app from '../../server/index'
import pool from "../../server/db";

beforeAll(async () => {
    await pool.query("DELETE FROM auth.users WHERE email = 'test@test.lan'");
    await request(app).post("/register")
        .send({
            email: "test@test.lan",
            password: "Test1234",
            name: "Test"
        });
})

afterAll(async () => {
    await pool.query("DELETE FROM auth.users WHERE email = 'test@test.lan'");
})

describe("Recover", () => {
    test("Invalid request", async () => {
        const res = await request(app).post("/recover");
        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
            error: 'invalid-request'
        });
    });
    test("Valid request", async () => {
        const res = await request(app).post("/recover")
        .send({
            email: "test@test.lan"
        });
        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
            message: 'recovey-link-sent'
        });
    });
});