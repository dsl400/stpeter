import request from "supertest";
import app from '../server/index'
describe("Test app start", () => {
    test("App index", async () => {
        const res = await request(app).get("/");
        expect(res.status).toBe(200);
        expect(res.text).toBe("auth works!");
    });

    // test("App 404", async () => {
    //     const res = await request(server).get("/non-existent-route");
    //     expect(res.status).toBe(404);
    //     expect(res.text).toBe("404");
    // });

});

