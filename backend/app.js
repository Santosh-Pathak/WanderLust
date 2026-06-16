import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import swaggerDocument from './docs/openapi.js';
import { env } from './config/env.js';
import authRouter from './routes/auth.js';
import postsRouter from './routes/posts.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { rateLimit } from './middleware/rate-limit.js';
import { requestContext } from './middleware/request-context.js';
import { securityHeaders, sanitizeRequest } from './middleware/security.js';

const app = express();

app.disable('x-powered-by');
app.use(requestContext);
app.use(securityHeaders);
app.use(rateLimit());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(sanitizeRequest);
app.use(
  cors({
    origin: env.clientOrigin === '*' ? true : env.clientOrigin,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(compression());

app.get('/', (req, res) => {
  res.send('Yay!! Backend of wanderlust prod app is now accessible');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', requestId: req.requestId, environment: env.nodeEnv });
});

app.get('/api/docs.json', (req, res) => {
  res.json(swaggerDocument);
});

app.use('/api/posts', postsRouter);
app.use('/api/auth', authRouter);
app.use('/api/v1/posts', postsRouter);
app.use('/api/v1/auth', authRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
