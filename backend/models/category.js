import { Schema, model } from 'mongoose';

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 280,
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
    icon: {
      type: String,
    },
    postCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

categorySchema.index({ name: 1 });

export default model('Category', categorySchema);
