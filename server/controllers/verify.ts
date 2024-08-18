import { Request, Response } from "express";
import {
    jwtSecret
} from "../common";
import pool from "../db";
import jwt from 'jwt-simple';


const verify = async (req: Request, res: Response) => {

    try {
        const { accessToken } = req.body;
        if(!accessToken) {
            return res.status(400).send({ error: 'invalid-request' });
        }
        try{
            jwt.decode(accessToken, jwtSecret )
        }catch(err){
            return res.status(401).send({ error: 'invalid-token' });
        }
        res.status(200).send({ status: 'ok' });
    }catch (err: any) {
        console.error(err)
        return res.status(500).send({ error: 'server-error' });
    }

}

export default verify;