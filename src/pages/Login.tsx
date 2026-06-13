import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { authService } from '../services/api';
import { useAuthStore } from '../store/authStore';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response = await authService.login(data.email, data.password);
      setAuth(response.data.token, response.data.user);
      if (!response.data.user.isVerified) {
        toast.success('Welcome back! Please verify your email.');
        navigate('/verify-email');
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-900 rounded-xl mb-4">
            <Shield className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-primary-900 mb-2">DocNet</h1>
          <p className="text-ink-500">A secure network for verified medical professionals</p>
        </div>

        <section className="hf-card">
          <div className="hf-card-content">
            <h2 className="text-xl font-semibold text-ink-900">Sign In</h2>
            <p className="text-sm text-ink-500 mt-1">Enter your credentials to access your account</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Email Address</label>
                <input {...register('email')} type="email" placeholder="doctor@example.com" className="input-field" />
                {errors.email && <p className="text-sm text-rose-500 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Password</label>
                <input {...register('password')} type="password" placeholder="••••••••" className="input-field" />
                {errors.password && <p className="text-sm text-rose-500 mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-ink-300" />
                  <span className="text-ink-700">Remember me</span>
                </label>
                <button type="button" className="text-secondary-700 hover:underline">
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-ink-500">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-secondary-700 hover:underline font-medium">
                  Register here
                </Link>
              </p>
            </div>

            <div className="mt-4 p-3 bg-ink-100 rounded-lg text-xs text-ink-500 text-center">
              All applicants must be verified through AHPRA before accessing DocNet.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
