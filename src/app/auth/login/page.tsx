'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Mail, Lock, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }

      localStorage.setItem('user_email', data.user.email);
      localStorage.setItem('user_id', data.user.id);
      localStorage.setItem('user_display_name', data.user.display_name);
      if (data.user.avatar_url) {
        localStorage.setItem('user_avatar', data.user.avatar_url);
      }
      router.push('/groups');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      localStorage.setItem('login_email', email);
      router.push('/auth/verify-login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4 py-8">
      <div className="max-w-md w-full">
        <Link href="/" className="inline-flex items-center gap-1.5 mb-6 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        <div className="bg-card text-card-foreground rounded-3xl p-6 sm:p-8 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-sm">
              C
            </div>
            <span className="font-extrabold text-base tracking-tight font-heading">CityCircle Surat</span>
          </div>

          <h1 className="text-2xl font-bold mb-1 font-heading">Sign In to Your Circle</h1>
          <p className="text-xs text-muted-foreground mb-6">
            {authMode === 'password'
              ? 'Enter your registered credentials to access your groups'
              : 'Enter your email or phone to receive a quick verification code'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger">
              {error}
            </div>
          )}

          {authMode === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label htmlFor="email" className="block font-semibold mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                  placeholder="prayag129787@gmail.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block font-semibold mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                  placeholder="Password123!"
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setAuthMode('otp');
                  }}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Sign in with Email OTP instead
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSendOTP} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label htmlFor="otp-email" className="block font-semibold mb-1">
                  Email
                </label>
                <input
                  id="otp-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com"
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11" disabled={loading}>
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setAuthMode('password');
                  }}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Sign in with Password instead
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            <p>
              New to CityCircle?{' '}
              <Link href="/auth/signup" className="text-primary font-bold hover:underline">
                Claim Membership
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
