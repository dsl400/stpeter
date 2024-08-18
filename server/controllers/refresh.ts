import {Request, Response } from "express";
import jwt from 'jwt-simple';
import { days, jwtIssuer, jwtSecret, unix } from "../common";
import pool from "../db";



const refresh = async (req: Request, res: Response) => {
    
    try{
        const old_refresh_token = req.cookies?.['sp-refresh-token'];
        if(!old_refresh_token){
            return res.status(401).send({error: 'invalid-token'})
        }
        const decoded = jwt.decode(old_refresh_token, jwtSecret);
        const response = await pool.query(`SELECT * FROM auth.users 
            WHERE id = $1 LIMIT 1`,
            [decoded.sub]);
        if(response.rowCount != 1){
            return res.status(401).send({error: 'invalid-token'})
        }
        const row = response.rows[0];
        
        const refreshTokenMaxAge = unix() + days(2) // 2 days
        const refreshTokenPayload = {
            sub: row.id,
            exp: refreshTokenMaxAge
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
            claims: {...row.user_claims, role:row.role, roles}
        }

        const access_token = jwt.encode(accessTokenPayload, jwtSecret)
        const new_refresh_token = jwt.encode(refreshTokenPayload, jwtSecret )
        res.cookie('sp-refresh-token', new_refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: refreshTokenMaxAge
        });
        
        return res.send({access_token})

    }catch(e){
        return res.status(400).send({error: 'bad-request'})
    }

}


export default refresh;