import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'User name is required.'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    trim: true,
    lowercase: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: false,
    select: false,
  },
  avatar: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  refreshTokenHash: {
    type: String,
    select: false,
  },
  bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  readingHistory: [
    {
      post: { type: Schema.Types.ObjectId, ref: 'Post' },
      viewedAt: { type: Date, default: Date.now },
    },
  ],
  createdPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
}, { timestamps: true });

export default model('User', userSchema);
