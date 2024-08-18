import request from 'supertest';
import app from '../../server/index'
import { jwtSecret } from '../../server/common';
import jwt from 'jwt-simple';

const expiredToken = jwt.encode({exp:(Date.now() / 1000) - 1}, jwtSecret);
const notValidYetToken = jwt.encode({nbf:(Date.now() / 1000 ) + 50}, jwtSecret);
const invalidToken = jwt.encode({exp:(Date.now()/ 1000 ) + 150}, 'invalid-secret');
const validToken = jwt.encode({exp:(Date.now()/ 1000 ) + 150}, jwtSecret);

describe("Verify", () => {
    test("no accessToken provided", async () => {
        const res = await request(app).post("/verify");
        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
            error: 'invalid-request'
        });
    });

    test("expired token", async () => {
        const res = await request(app).post("/verify").send({ accessToken: expiredToken });
        expect(res.status).toBe(401);
        expect(res.body).toStrictEqual({
            error: 'invalid-token'
        });
    });

    test("token not valid yet", async () => {
        const res = await request(app).post("/verify").send({ accessToken: notValidYetToken });
        expect(res.status).toBe(401);
        expect(res.body).toStrictEqual({
            error: 'invalid-token'
        });
    });

    test("invalid token", async () => {
        const res = await request(app).post("/verify").send({ accessToken: invalidToken });
        expect(res.status).toBe(401);
        expect(res.body).toStrictEqual({
            error: 'invalid-token'
        });
    });
    test("valid token", async () => {
        const res = await request(app).post("/verify").send({ accessToken: validToken });
        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
            status: 'ok'
        });
    });

});