import { Request, Response } from "express";
import jwt from 'jwt-simple';
import pool from '../db';
import {
    confirmEmailOnRegistration,
    hashPassword,
    isAcceptedDisplayName,
    isAcceptedEmailAddress,
    isStrongPassword,
    jwtIssuer,
    jwtSecret,
    sendConfirmationEmail
} from "../common";

const register = async (req: Request, res: Response) => {

    try {
        let { name, email, password } = req.body;
        name = name?.trim();
        email = email?.trim();
        if (!isAcceptedEmailAddress(email)) {
            return res.status(400).send({ error: 'invalid-email' });
        }
        if (!isAcceptedDisplayName(name)) {
            return res.status(400).send({ error: 'invalid-name' });
        }
        if (!isStrongPassword(password)) {
            return res.status(400).send({ error: 'weak-password' });
        }
        const hashedPassword = await hashPassword(password);

        const confirmToken = confirmEmailOnRegistration ? 'gen_random_uuid()' : 'NULL';
        const confirmTokenTs = confirmEmailOnRegistration ? 'NOW()' : 'NULL';

        const response = await pool.query(`INSERT INTO auth.users 
            (email, encrypted_password, user_claims, confirmation_token, confirmation_sent_at) 
            VALUES ($1, $2,$3::jsonb, ${confirmToken},${confirmTokenTs}) RETURNING *`,
            [
                email,
                hashedPassword,
                { name }
            ]);
        const row = response.rows[0];

        const payload = {
            iss: jwtIssuer,
            iat: Date.now(),
            sub: row.id,
            exp: Date.now() +  60 * 60 * 1000,
            claims: row.user_claims
        }

        const access_token = jwt.encode(payload, jwtSecret);

        if(confirmEmailOnRegistration){
            try{
                sendConfirmationEmail(email, row.confirmation_token);
            }catch(err){
                console.error(err);
            }
        }

        return res.send({ access_token });

    }

    catch (err: any) {
        if (err.code === '23505') {
            return res.status(400).send({ error: 'email-already-exists' });
        }
        console.error(err); 
        return res.status(500).send({ error: 'server-error' });
    }

}

export default register;