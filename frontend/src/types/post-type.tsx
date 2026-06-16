type Post = {
  _id: string;
  authorName: string;
  title: string;
  imageLink: string;
  timeOfPost: string;
  description: string;
  categories: string[];
  tags?: string[];
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
  scheduledFor?: string;
  excerpt?: string;
  readTimeMinutes?: number;
  viewCount?: number;
  reactions?: {
    like: number;
    love: number;
    insightful: number;
  };
  comments?: Array<{
    _id: string;
    authorName: string;
    content: string;
    createdAt: string;
    replies?: Array<{ _id: string; authorName: string; content: string; createdAt: string }>;
  }>;
};

export default Post;
