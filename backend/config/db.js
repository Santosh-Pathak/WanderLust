import mongoose from 'mongoose';
import { env } from './env.js';
export default function connectDB() {
  if (!env.mongoUri) {
    console.warn('MONGODB_URI is not configured. Database connection skipped.');
    return;
  }

  try {
    mongoose.connect(env.mongoUri);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  const dbConnection = mongoose.connection;

  dbConnection.once('open', () => {
    console.log(`Database connected: ${env.mongoUri}`);
  });

  dbConnection.on('error', (err) => {
    console.error(`connection error: ${env.mongoUri}`, err.message);
  });
  return;
}
