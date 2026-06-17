import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Clock, Eye, FileText, User } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { usersApi, postApi } from '@/lib/api';
import Post from '@/types/post-type';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [history, setHistory] = useState<{ post: Post; viewedAt: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history' | 'profile'>('bookmarks');

  useEffect(() => {
    if (!authLoading && !user) navigate('/signin');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    usersApi.getBookmarks().then(setBookmarks);
    usersApi.getReadingHistory().then(setHistory);
  }, [user]);

  if (authLoading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-light dark:bg-dark">
      <header className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-dark-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{user.name}</span>
            <button onClick={() => navigate('/')} className="text-sm text-blue-600 hover:underline">Home</button>
            <button onClick={logout} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white">Logout</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-dark-card">
            <div className="flex items-center gap-3">
              <Bookmark className="h-8 w-8 text-emerald-500" />
              <div><div className="text-2xl font-bold">{bookmarks.length}</div><div className="text-xs text-slate-500">Bookmarks</div></div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-dark-card">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <div><div className="text-2xl font-bold">{history.length}</div><div className="text-xs text-slate-500">Read articles</div></div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-dark-card">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-purple-500" />
              <div><div className="text-2xl font-bold capitalize">{user.role}</div><div className="text-xs text-slate-500">Role</div></div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex gap-4 border-b border-slate-200 pb-2 dark:border-slate-700">
          {(['bookmarks', 'history', 'profile'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium capitalize ${activeTab === tab ? 'border-b-2 border-slate-900 text-slate-900 dark:border-slate-100 dark:text-white' : 'text-slate-500'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'bookmarks' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map((post) => (
              <motion.div
                key={post._id}
                whileHover={{ y: -2 }}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-dark-card"
                onClick={() => navigate(`/details-page/${post.title?.toLowerCase().replace(/\s+/g, '-')}/${post._id}`)}
              >
                <img src={post.imageLink} alt={post.title} className="mb-2 h-36 w-full rounded object-cover" />
                <h3 className="line-clamp-2 text-sm font-semibold">{post.title}</h3>
                <span className="text-xs text-slate-500">{post.readTimeMinutes || 1} min read</span>
              </motion.div>
            ))}
            {bookmarks.length === 0 && <p className="col-span-full text-sm text-slate-500">No bookmarks yet</p>}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {history.map((entry) => (
              <div
                key={`${entry.post?._id}-${entry.viewedAt}`}
                className="flex cursor-pointer items-center gap-4 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-dark-card"
                onClick={() => navigate(`/details-page/${entry.post?.title?.toLowerCase().replace(/\s+/g, '-')}/${entry.post?._id}`)}
              >
                <img src={entry.post?.imageLink} alt={entry.post?.title} className="h-16 w-16 rounded object-cover" />
                <div className="flex-1">
                  <h3 className="line-clamp-1 text-sm font-semibold">{entry.post?.title}</h3>
                  <span className="text-xs text-slate-500">{new Date(entry.viewedAt).toLocaleDateString()}</span>
                </div>
                <Eye className="h-4 w-4 text-slate-400" />
              </div>
            ))}
            {history.length === 0 && <p className="text-sm text-slate-500">No reading history yet</p>}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-dark-card">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{user.name}</h2>
                <p className="text-sm text-slate-500">{user.email}</p>
                <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs capitalize dark:bg-slate-800">{user.role}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
