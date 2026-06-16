import app from './app.js';
import connectDB from './config/db.js';
import { env } from './config/env.js';
import { connectToRedis } from './services/redis.js';

// Connect to database
connectDB();

// Connect to redis
connectToRedis();

app.listen(env.port, () => {
  console.log(`Server is running on port ${env.port}`);
});

export default app;
