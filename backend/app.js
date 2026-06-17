import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './docs/openapi.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import authRouter from './routes/auth.js';
import postsRouter from './routes/posts.js';
import usersRouter from './routes/users.js';
import categoriesRouter from './routes/categories.js';
import tagsRouter from './routes/tags.js';
import adminRouter from './routes/admin.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { rateLimit } from './middleware/rate-limit.js';
import { requestContext } from './middleware/request-context.js';
import { securityHeaders } from './middleware/security.js';

const app = express();

app.disable('x-powered-by');

app.use(helmet());
app.use(requestContext);

const morganStream = { write: (message) => logger.http(message.trim()) };
app.use(morgan(env.isProduction ? 'combined' : 'dev', { stream: morganStream }));

app.use(rateLimit());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(mongoSanitize());
app.use(
  cors({
    origin: env.clientOrigin === '*' ? true : env.clientOrigin.split(','),
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

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
app.get('/api/docs.json', (req, res) => {
  res.json(swaggerDocument);
});

app.use('/api/v1/posts', postsRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/tags', tagsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/posts', postsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/admin', adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
