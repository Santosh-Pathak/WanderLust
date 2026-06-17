import { Schema, model } from 'mongoose';

const tagSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 1,
      maxlength: 30,
    },
    postCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

tagSchema.index({ name: 1 });

export default model('Tag', tagSchema);
