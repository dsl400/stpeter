import { Request, Response } from "express";
import {
    comparePassword,
    days,
    isAcceptedEmailAddress,
    jwtIssuer,
    jwtSecret,
    unix
} from "../common";
import pool from "../db";
import jwt from 'jwt-simple';


const login = async (req: Request, res: Response) => {

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ error: 'invalid-request' });
        }

        if (!isAcceptedEmailAddress(email)) {
            return res.status(400).send({ error: 'invalid-email' });
        }

        const response = await pool.query(`SELECT * FROM auth.users 
            WHERE email = $1 LIMIT 1`,
            [email]);

        if (response.rowCount != 1) {
            return res.status(401).send({ error: 'invalid-credentials-' });
        }
        const row = response.rows[0];

        const isSamePassword = await comparePassword(password, row.encrypted_password);

        if (!isSamePassword) {
            return res.status(401).send({ error: 'invalid-credentials' });
        }

        const role = row.role.replace(/-/g, '').substring(2)
        const roles: number[] = []

        for (let i = 0; i < role.length; i++) {
            if (role[i] === '1') roles.push(i)
        }

        const accessTokenPayload = {
            iss: jwtIssuer,
            iat: unix(),
            sub: row.id,
            id: row.id,
            name: row.user_claims.name,
            exp: unix() + days(1),
            claims: { ...row.user_claims, role: row.role, roles }
        }

        const refreshTokenMaxAge = unix() + days(2) // 2 days
        const refreshTokenPayload = {
            sub: row.id,
            exp: refreshTokenMaxAge
        }

        const access_token = jwt.encode(accessTokenPayload, jwtSecret)
        const refresh_token = jwt.encode(refreshTokenPayload, jwtSecret)
        res.cookie('sp-refresh-token', refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: refreshTokenMaxAge
        });

        return res.status(200).send({ access_token });

    } catch (err: any) {
        console.error(err)
        return res.status(500).send({ error: 'server-error' });
    }

}

export default login;