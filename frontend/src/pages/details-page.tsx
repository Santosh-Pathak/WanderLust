import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, Bookmark, Clock, Eye, Heart, ThumbsUp, Lightbulb, Share2, MessageCircle } from 'lucide-react';
import formatPostTime from '@/utils/format-post-time';
import CategoryPill from '@/components/category-pill';
import { postApi, usersApi } from '@/lib/api';
import Post from '@/types/post-type';
import { motion } from 'framer-motion';

export default function DetailsPage() {
  const { state } = useLocation();
  const [post, setPost] = useState<Post | null>(state?.post || null);
  const [loading, setLoading] = useState(!state?.post);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [readProgress, setReadProgress] = useState(0);
  const { postId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!postId) return;
    if (!state?.post) {
      postApi.byId(postId).then((data) => {
        setPost(data);
        setLoading(false);
      });
    }
    postApi.related(postId).then(setRelatedPosts);
    usersApi.recordReadingHistory(postId).catch(() => {});
  }, [postId]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleReaction = async (type: 'like' | 'love' | 'insightful') => {
    if (!post) return;
    await postApi.react(post._id, type);
  };

  const handleComment = async () => {
    if (!post || !commentText.trim()) return;
    await postApi.comment(post._id, { authorName: 'Guest', content: commentText });
    setCommentText('');
    const updated = await postApi.byId(post._id);
    setPost(updated);
  };

  const handleReply = async (commentId: string) => {
    if (!post || !replyText[commentId]?.trim()) return;
    await postApi.reply(post._id, commentId, { authorName: 'Guest', content: replyText[commentId] });
    setReplyText((prev) => ({ ...prev, [commentId]: '' }));
    const updated = await postApi.byId(post._id);
    setPost(updated);
  };

  const handleBookmark = async () => {
    if (!post) return;
    const result = await usersApi.toggleBookmark(post._id);
    setBookmarked(result.bookmarked);
  };

  const totalReactions = useMemo(() => {
    if (!post?.reactions) return 0;
    return (post.reactions.like || 0) + (post.reactions.love || 0) + (post.reactions.insightful || 0);
  }, [post]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-light dark:bg-dark">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900 dark:border-slate-600 dark:border-t-slate-100" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-light dark:bg-dark">
        <h1 className="text-2xl font-semibold">Post not found</h1>
        <button onClick={() => navigate('/')} className="text-sm text-blue-600 hover:underline">Go home</button>
      </div>
    );
  }

  return (
    <div className="bg-light dark:bg-dark">
      <div className="fixed left-0 top-0 z-50 h-1 bg-emerald-500 transition-all duration-150" style={{ width: `${readProgress}%` }} />

      <div className="relative">
        <img src={post.imageLink} alt={post.title} className="h-72 w-full object-cover md:h-96" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="absolute bottom-6 w-full max-w-4xl px-4 md:px-8 lg:px-12">
          <div className="mb-3 flex flex-wrap gap-2">
            {post.categories?.map((cat, idx) => <CategoryPill key={idx} category={cat} />)}
          </div>
          <h1 className="mb-3 text-2xl font-bold text-white md:text-4xl">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
            <span>{post.authorName}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatPostTime(post.timeOfPost)}</span>
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{post.viewCount || 0} views</span>
            <span>{post.readTimeMinutes || 1} min read</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <div className="mb-8 flex items-center gap-4 border-b border-slate-200 pb-4 dark:border-slate-700">
          <button onClick={() => handleReaction('like')} className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-sm hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
            <ThumbsUp className="h-4 w-4" /> {post.reactions?.like || 0}
          </button>
          <button onClick={() => handleReaction('love')} className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-sm hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
            <Heart className="h-4 w-4" /> {post.reactions?.love || 0}
          </button>
          <button onClick={() => handleReaction('insightful')} className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-sm hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
            <Lightbulb className="h-4 w-4" /> {post.reactions?.insightful || 0}
          </button>
          <span className="text-xs text-slate-500">{totalReactions} reactions</span>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={handleBookmark} className={`rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 ${bookmarked ? 'text-emerald-600' : ''}`}>
              <Bookmark className="h-5 w-5" />
            </button>
            <button onClick={() => navigator.share?.({ url: window.location.href })} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="prose prose-slate mx-auto max-w-none dark:prose-invert lg:prose-lg">
          {post.description?.split('\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </motion.div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {relatedPosts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="mb-6 text-2xl font-semibold">Related Articles</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedPosts.map((rp) => (
              <motion.div
                key={rp._id}
                whileHover={{ y: -4 }}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-dark-card"
                onClick={() => navigate(`/details-page/${rp.title?.toLowerCase().replace(/\s+/g, '-')}/${rp._id}`)}
              >
                <img src={rp.imageLink} alt={rp.title} className="mb-2 h-32 w-full rounded object-cover" />
                <h3 className="line-clamp-2 text-sm font-semibold">{rp.title}</h3>
                <span className="text-xs text-slate-500">{rp.readTimeMinutes || 1} min read</span>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
          <MessageCircle className="h-5 w-5" /> Comments ({post.comments?.length || 0})
        </h2>
        <div className="mb-8 flex gap-3">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-900"
          />
          <button onClick={handleComment} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900">
            Post
          </button>
        </div>
        <div className="space-y-6">
          {post.comments?.map((comment) => (
            <div key={comment._id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                  {comment.authorName?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{comment.authorName}</span>
                <span className="text-xs text-slate-500">{formatPostTime(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{comment.content}</p>
              <div className="mt-3">
                {comment.replies?.map((reply) => (
                  <div key={reply._id} className="ml-4 mt-2 border-l-2 border-slate-200 pl-3 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{reply.authorName}</span>
                      <span className="text-xs text-slate-500">{formatPostTime(reply.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{reply.content}</p>
                  </div>
                ))}
                <div className="mt-2 flex gap-2">
                  <input
                    value={replyText[comment._id] || ''}
                    onChange={(e) => setReplyText((prev) => ({ ...prev, [comment._id]: e.target.value }))}
                    placeholder="Reply..."
                    className="flex-1 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-900"
                  />
                  <button onClick={() => handleReply(comment._id)} className="rounded bg-slate-200 px-3 py-1.5 text-xs font-medium dark:bg-slate-700">Reply</button>
                </div>
              </div>
            </div>
          ))}
          {(!post.comments || post.comments.length === 0) && (
            <p className="text-sm text-slate-500">No comments yet. Be the first!</p>
          )}
        </div>
      </section>
    </div>
  );
}
