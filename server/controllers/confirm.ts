import { Request, Response } from "express";
import pool from "../db";


const confirm = async (req: Request, res: Response) => {
    
    try {
        
        const { token } = req.query;
        if (!token) return res.status(400).send({ error: 'invalid-request' });

        const request = await pool.query(`
            UPDATE auth.users SET 
            confirmed_at = NOW() 
            WHERE 
                confirmation_token = $1 
                AND
                confirmation_sent_at > NOW() - INTERVAL '1 day'
            RETURNING id`,
            [token]
        );

        if (request.rowCount != 1) {
            return res.status(400).send({ error: 'invalid-request' });
        }
        
        return res.status(200).send({ message: 'email-confirmed' });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: 'internal-server-error' });
    }

}




export default confirm;