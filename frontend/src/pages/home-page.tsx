import { Link } from 'react-router-dom';
import { ArrowDown, BookOpen, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import Header from '@/layouts/header-layout';
import PostCard from '@/components/post-card';
import FeaturedPostCard from '@/components/featured-post-card';
import LatestPostCard from '@/components/latest-post-card';
import CategoryPill from '@/components/category-pill';
import { PostCardSkeleton } from '@/components/skeletons/post-card-skeleton';
import { categories } from '@/utils/category-colors';
import { useDiscoveryPosts, usePostList } from '@/hooks/use-posts';

function HomePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('-timeOfPost');
  const [page, setPage] = useState(1);
  const listParams = useMemo(
    () => ({
      page,
      limit: 12,
      search: search || undefined,
      category: category || undefined,
      sort,
    }),
    [page, search, category, sort]
  );
  const { data: posts, loading, error } = usePostList(listParams);
  const { data: discovery } = useDiscoveryPosts();

  const hasMore = posts.meta ? page < posts.meta.totalPages : false;

  return (
    <div className="w-full cursor-default bg-light text-light-primary dark:bg-dark dark:text-dark-primary">
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-8 md:px-8 lg:px-12">
        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" /> Featured Articles
            </div>
            <div className="flex flex-col gap-5">
              {(discovery.featured.length ? discovery.featured : posts.data)
                .slice(0, 3)
                .map((post) => <FeaturedPostCard key={post._id} post={post} />)}
            </div>
          </div>
          <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-dark-card">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-rose-600 dark:text-rose-300" />
              <h2 className="text-lg font-semibold">Trending Now</h2>
            </div>
            <div className="flex flex-col gap-3">
              {(discovery.trending.length ? discovery.trending : discovery.latest)
                .slice(0, 5)
                .map((post) => <LatestPostCard key={post._id} post={post} />)}
            </div>
          </aside>
        </section>

        <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-dark-card md:grid-cols-[1fr_auto_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search destinations, guides, stories..."
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-900">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-11 bg-transparent text-sm outline-none"
            >
              <option value="-timeOfPost">Newest</option>
              <option value="timeOfPost">Oldest</option>
              <option value="-viewCount">Most viewed</option>
              <option value="title">Title A-Z</option>
            </select>
          </label>
          <Link
            to="/add-blog"
            className="flex h-11 items-center justify-center rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-950"
          >
            Write
          </Link>
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Explore The Journal</h2>
              <p className="text-sm text-light-secondary dark:text-dark-secondary">
                Filter by category, search, or keep scrolling for fresh travel writing.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setCategory('')} className="rounded-full border border-slate-300 px-3 py-1 text-sm dark:border-slate-600">
                All
              </button>
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setCategory(category === item ? '' : item);
                    setPage(1);
                  }}
                >
                  <CategoryPill category={item} selected={category === item} />
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Could not load posts: {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading
              ? Array(8)
                  .fill(0)
                  .map((_, index) => <PostCardSkeleton key={index} />)
              : posts.data.map((post) => <PostCard key={post._id} post={post} />)}
          </div>

          {!loading && posts.data.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
              <h3 className="text-lg font-semibold">No stories found</h3>
              <p className="mt-2 text-sm text-light-secondary dark:text-dark-secondary">
                Try a different search term or category.
              </p>
            </div>
          )}

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setPage((current) => current + 1)}
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Load more <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>

        <section className="grid gap-5 rounded-lg bg-slate-950 p-6 text-white md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-2xl font-semibold">Get the weekly travel brief</h2>
            <p className="mt-2 text-sm text-slate-300">
              Curated reads, new guides, and featured community stories.
            </p>
          </div>
          <form className="flex gap-2">
            <input className="h-11 rounded-lg px-3 text-sm text-slate-950 outline-none" placeholder="you@example.com" />
            <button className="h-11 rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-slate-950">
              Subscribe
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default HomePage;
