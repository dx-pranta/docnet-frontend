import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail } from 'lucide-react';
import { OTPInput } from 'input-otp';
import toast from 'react-hot-toast';

import { authService } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { user, setUser, token, logout } = useAuthStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
      return;
    }
    if (user.isVerified) {
      navigate('/dashboard');
    }
  }, [token, user, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6 || !user) return;
    setLoading(true);
    try {
      const res = await authService.verifyEmail(user.email, code);
      setUser(res.data.user);
      toast.success('Email verified successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!user || resendCooldown > 0) return;
    try {
      await authService.resendCode(user.email);
      toast.success('Verification code resent');
      setResendCooldown(30);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-ink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-900 rounded-xl mb-3">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-primary-900">Verify Your Email</h1>
          <p className="text-ink-500 mt-1">Enter the 6-digit code sent to your email</p>
        </div>

        <section className="hf-card">
          <div className="hf-card-content">
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-secondary-50 flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-secondary-700" />
                </div>
                <p className="text-sm text-ink-500">
                  We've sent a 6-digit code to<br />
                  <strong className="text-ink-900">{user.email}</strong>
                </p>
              </div>

              <div className="flex justify-center">
                <OTPInput
                  maxLength={6}
                  value={code}
                  onChange={(value: string) => setCode(value)}
                  render={({ slots }) => (
                    <div className="flex gap-2">
                      {slots.map((slot, idx) => (
                        <div
                          key={idx}
                          className={`w-11 h-12 rounded-lg border-2 flex items-center justify-center text-lg font-semibold transition-colors ${
                            slot.isActive
                              ? 'border-primary-900 bg-white shadow-sm'
                              : 'border-ink-200 bg-white'
                          }`}
                        >
                          {slot.char}
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>

              <button type="submit" className="btn-primary w-full disabled:opacity-50" disabled={code.length !== 6 || loading}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <div className="text-center">
                <button type="button" className="text-sm text-secondary-700 hover:underline disabled:opacity-50" onClick={handleResend} disabled={resendCooldown > 0}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Didn't receive the code? Resend"}
                </button>
              </div>
            </form>
          </div>
        </section>

        <div className="mt-4 text-center">
          <button type="button" onClick={logout} className="text-sm text-ink-500 hover:text-ink-700">
            ← Use a different account
          </button>
        </div>
      </div>
    </div>
  );
}
