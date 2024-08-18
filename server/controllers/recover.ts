import { Request, Response } from "express";
import pool from "../db";
import {
    isAcceptedEmailAddress,
    sendPasswordResetEmail
} from "../common";

const recover = async (req: Request, res: Response) => {

    try {
        const { email } = req.body;
        if (!isAcceptedEmailAddress(email)) {
            return res.status(400).send({ error: 'invalid-request' });
        }
    
        const response = await pool.query(`
            UPDATE auth.users SET 
            recovery_token = gen_random_uuid(), 
            recovery_sent_at = NOW() 
            WHERE email = $1 RETURNING recovery_token`,
            [email]
        );

        if (response.rowCount != 1) {
            return res.status(400).send({ error: 'invalid-request' });
        }

        const row = response.rows[0];
        const resetToken = row.recovery_token;
        try {
            await sendPasswordResetEmail(email, resetToken);
        }
        catch (err) {
            console.error(err);
            return res.status(503).send({ error: 'error-sending-email' });
        }

        return res.send({ message: 'recovey-link-sent' });

    } catch (err) {
        return res.status(500).send({ error: 'internal-server-error' });
    }

}

export default recover;