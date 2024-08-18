import request from "supertest";
import app from '../../server/index'
import pool from "../../server/db";


beforeAll(async () => {
    await pool.query("DELETE FROM auth.users WHERE email like '%@test.lan'");
    await pool.query(`
        INSERT INTO auth.users 
            (email, encrypted_password, user_claims, confirmation_token, confirmation_sent_at)
        VALUES 
        ('test.confirm.expired@test.lan','encrypted-password','{"name":"Test"}','expired-token',NOW() - INTERVAL '1 days'),
        ('test.confirm@test.lan','encrypted-password','{"name":"Test"}','valid-token',NOW())`);
})

afterAll(async () => {
    await pool.query("DELETE FROM auth.users WHERE email like '%@test.lan'");
})


describe("Register", () => {
    test("empty request", async () => {
        const res = await request(app).get("/confirm");
        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
            error: 'invalid-request'
        });
    });
    test("wrong token", async () => {
        const res = await request(app).get("/confirm?token=wrong-token");
        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
            error: 'invalid-request'
        });
    });
    test("valied expired token", async () => {
        const res = await request(app).get("/confirm?token=expired-token");
        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
            error: 'invalid-request'
        });
    });
    test("valid token", async () => {
        const res = await request(app).get("/confirm?token=valid-token");
        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
            message: 'email-confirmed'
        });
    });
});