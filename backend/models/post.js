import { Schema, model } from 'mongoose';

const commentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    replies: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        authorName: { type: String, required: true, trim: true },
        content: { type: String, required: true, trim: true, maxlength: 1200 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const postSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, trim: true, lowercase: true },
    imageLink: { type: String, required: true, trim: true },
    categories: {
      type: [String],
      required: true,
      validate: {
        validator: (categories) => categories.length > 0 && categories.length <= 3,
        message: 'Please select up to three categories only',
      },
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    description: { type: String, required: true, trim: true },
    excerpt: { type: String, trim: true, maxlength: 280 },
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled', 'archived'],
      default: 'published',
      index: true,
    },
    scheduledFor: { type: Date },
    publishedAt: { type: Date },
    isFeaturedPost: { type: Boolean, default: false, index: true },
    reactions: {
      like: { type: Number, default: 0 },
      love: { type: Number, default: 0 },
      insightful: { type: Number, default: 0 },
    },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    viewCount: { type: Number, default: 0, index: true },
    readTimeMinutes: { type: Number, default: 1 },
    timeOfPost: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

postSchema.index({ title: 'text', description: 'text', tags: 'text', categories: 'text' });
postSchema.index({ categories: 1, status: 1, timeOfPost: -1 });
postSchema.index({ isFeaturedPost: 1, status: 1, timeOfPost: -1 });

postSchema.pre('validate', function setDerivedFields(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  if (!this.excerpt && this.description) {
    this.excerpt = this.description.slice(0, 240);
  }
  if (!this.readTimeMinutes && this.description) {
    this.readTimeMinutes = Math.max(1, Math.ceil(this.description.split(/\s+/).length / 220));
  }
  if (!this.publishedAt && this.status === 'published') {
    this.publishedAt = this.timeOfPost || new Date();
  }
  next();
});

export default model('Post', postSchema);
