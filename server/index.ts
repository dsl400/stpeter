
import express from 'express';
import cors from 'cors';
import confirm from './controllers/confirm';
import login from './controllers/login';
import register from './controllers/register';
import recover from './controllers/recover';
import refresh from './controllers/refresh';
import verify from './controllers/verify';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit'
import { SERVER_PORT } from './common';

const app = express();

var corsOptions = {
  origin: true
};

const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
})

app.use(limiter);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser())
app.use(bodyParser.text());

app.use((req, res, next) => {
  console.log(`[INFO] ${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${req.ip} - ${JSON.stringify(req.body)}`);
  next(); 
});

app.get('/confirm', confirm)
app.post('/login', login)
app.post('/register', register)
app.post('/recover', recover)
app.get('/refresh', refresh)
app.post('/verify', verify)

app.get('/', (req, res) => { res.send('auth works!') })
app.use((req, res) => { res.status(404).send('404') })


if (require.main === module) {
  app.listen(SERVER_PORT, () => {
    console.log(`Server is running on port ${SERVER_PORT}`);
  });
}

export default app;