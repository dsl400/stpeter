import request from "supertest"
import app from '../../server/index'
import pool from '../../server/db'

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

describe("Login", () => {
    test("empty post", async () => {
        const res = await request(app).post("/login");
        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
            error: 'invalid-request'
        });
    });
    test("wrong email", async () => {
        const res = await request(app).post("/login")
            .send({
                email: "test@test",
                password: "Test1234"
            });
        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
            error: 'invalid-email'
        });
    });
    test("wrong password", async () => {
        const res = await request(app).post("/login")
            .send({
                email: "test@test.lan",
                password: "wrong-password"
            });
        expect(res.status).toBe(401);
        expect(res.body).toStrictEqual({
            error: 'invalid-credentials'
        });
    });
    test("login success", async () => {
        const res = await request(app).post("/login")
            .send({
                email: "test@test.lan",
                password: "Test1234"
            });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('access_token');
        expect(res.body.access_token.split('.')).toHaveLength(3);
    });
});