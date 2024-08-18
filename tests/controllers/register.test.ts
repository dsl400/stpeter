import request from "supertest";
import app from '../../server/index'
import pool from '../../server/db'

beforeAll(async () => {
    await pool.query("DELETE FROM auth.users WHERE email = 'test@test.lan'");
})

afterAll(async () => {
    await pool.query("DELETE FROM auth.users WHERE email = 'test@test.lan'");
})

describe("Register", () => {
    test("Invalid request", async () => {
        const res = await request(app).post("/register");
        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
            error: 'invalid-email'
        });
    });
    test("Invalid name", async () => {
        const res = await request(app).post("/register")
        .send({
            email: "test@test.lan",
        });
        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
            error: 'invalid-name'
        });
    });
    test("Invalid password", async () => {
        const res = await request(app).post("/register")
        .send({
            email: "test@test.lan",
            name: "Test2"
        });
        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
            error: 'weak-password'
        });
    });
    test("New registration", async () => {
        const res = await request(app).post("/register")
            .send({
                email: "test@test.lan",
                name: "Test1",
                password: "Test1234"
            });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('access_token');
        expect(res.body.access_token.split('.')).toHaveLength(3);
    });
});

