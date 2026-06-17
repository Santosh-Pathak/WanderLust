import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import { TSignUpSchema, signUpSchema } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

function SignUp() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TSignUpSchema>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = async (data: FieldValues) => {
    try {
      await signup(data.username, data.email, data.password);
      toast.success('Account created successfully');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Sign up failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-dark dark:to-dark">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-dark-card">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="mt-1 text-sm text-slate-500">Join WanderLust today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register('username')}
              type="text"
              placeholder="Username"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900"
            />
            {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
          </div>

          <div>
            <input
              {...register('email')}
              type="email"
              placeholder="Email"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 pr-10 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <input
              {...register('confirmPassword')}
              type="password"
              placeholder="Confirm Password"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900"
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          <button
            disabled={isSubmitting}
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 p-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-slate-500">
            Already have an account?{' '}
            <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-500">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
