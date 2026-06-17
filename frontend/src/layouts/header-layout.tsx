import ThemeToggle from '@/components/theme-toggle-button';
import AddIcon from '@/assets/svg/add-icon-white.svg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import Hero from '@/components/hero';
import { User, LayoutDashboard } from 'lucide-react';

export default function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="relative -mt-2 h-[460px] bg-[url('./assets/wanderlustbg.webp')] bg-cover bg-fixed bg-center">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="absolute inset-0 flex flex-col px-4 py-8 text-slate-50 md:px-16">
        <div className="flex w-full items-center justify-between">
          <div className="flex cursor-text items-center text-2xl font-semibold">
            WanderLust
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                <button
                  onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}
                  className="hidden items-center gap-1.5 rounded border border-slate-50/50 px-3 py-1.5 text-sm hover:bg-slate-500/25 md:flex"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/add-blog')}
                  className="hidden rounded border border-slate-50 px-4 py-2 text-sm hover:bg-slate-500/25 md:inline-block"
                >
                  Create post
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/signin')}
                  className="hidden rounded border border-slate-50 px-4 py-2 text-sm hover:bg-slate-500/25 md:inline-block"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="hidden rounded bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 md:inline-block"
                >
                  Sign Up
                </button>
              </>
            )}
            <button
              className="px-2 py-2 hover:bg-slate-500/25 md:hidden"
              onClick={() => navigate(user ? '/dashboard' : '/signin')}
            >
              {user ? <User className="h-6 w-6" /> : <img className="h-10 w-10" src={AddIcon} />}
            </button>
          </div>
        </div>
        <Hero />
      </div>
    </div>
  );
}

export default Header;
