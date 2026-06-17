import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, FileText, Users, Tag, Eye, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { adminApi } from '@/lib/api';
import Post from '@/types/post-type';

interface AdminStats {
  totalPosts: number;
  totalUsers: number;
  totalCategories: number;
  totalTags: number;
  totalViews: number;
  publishedPosts: number;
  draftPosts: number;
}

export default function AdminPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) navigate('/');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    adminApi.getStats().then(setStats);
    adminApi.getPosts({ limit: 5, sort: '-createdAt', status: 'all' }).then((res) => setRecentPosts(res.data || []));
  }, [user]);

  if (authLoading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" /></div>;
  if (!user || user.role !== 'admin') return null;

  const cards = [
    { label: 'Total Posts', value: stats?.totalPosts || 0, icon: FileText, color: 'text-blue-500' },
    { label: 'Published', value: stats?.publishedPosts || 0, icon: BookOpen, color: 'text-emerald-500' },
    { label: 'Drafts', value: stats?.draftPosts || 0, icon: FileText, color: 'text-yellow-500' },
    { label: 'Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-purple-500' },
    { label: 'Categories', value: stats?.totalCategories || 0, icon: Tag, color: 'text-pink-500' },
    { label: 'Total Views', value: stats?.totalViews || 0, icon: Eye, color: 'text-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark">
      <header className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-dark-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{user.name}</span>
            <button onClick={() => navigate('/')} className="text-sm text-blue-600 hover:underline">Home</button>
            <button onClick={logout} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white">Logout</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {cards.map((card) => (
            <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-dark-card">
              <div className="flex items-center gap-3">
                <card.icon className={`h-8 w-8 ${card.color}`} />
                <div>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <div className="text-xs text-slate-500">{card.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-dark-card">
          <h2 className="mb-4 text-lg font-semibold">Recent Posts</h2>
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <div key={post._id} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img src={post.imageLink} alt={post.title} className="h-10 w-10 rounded object-cover" />
                  <div>
                    <p className="line-clamp-1 text-sm font-medium">{post.title}</p>
                    <span className="text-xs text-slate-500">{post.authorName} · {post.viewCount || 0} views</span>
                  </div>
                </div>
                <span className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${
                  post.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                  post.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
