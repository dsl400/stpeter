import pg from 'pg';

const { Pool } = pg;



const pool = new Pool({
    host: process.env.PGHOST ? process.env.PGHOST : 'localhost',
    user: process.env.PGUSER ? process.env.PGUSER : 'stpeter',
    password:  process.env.PGPASSWD ? process.env.PGPASSWD : 'stpeterspassword',
    database: process.env.PGDATABASE ? process.env.PGDATABASE : 'postgres',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 54322,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
})

export default pool;


