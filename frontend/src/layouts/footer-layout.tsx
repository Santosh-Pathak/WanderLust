import { Link } from 'react-router-dom';
import { Compass, Github, Twitter } from 'lucide-react';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-dark-card">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Compass className="h-5 w-5 text-emerald-600" />
              WanderLust
            </div>
            <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
              Discover stories, guides, and adventures from travelers around the world. Your journey begins here.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Home</Link></li>
              <li><Link to="/add-blog" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Write</Link></li>
              <li><Link to="/signin" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Connect</h3>
            <div className="flex gap-3">
              <a href="#" className="rounded-full bg-slate-200 p-2 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-400"><Github className="h-4 w-4" /></a>
              <a href="#" className="rounded-full bg-slate-200 p-2 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-400"><Twitter className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 dark:border-slate-700">
          &copy; {year} WanderLust. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
