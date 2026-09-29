'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function VerifyLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('login_email');
    if (!storedEmail) {
      router.push('/auth/login');
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

      // Store token and clear localStorage
      localStorage.removeItem('login_email');
      document.cookie = `auth_token=${data.token}; path=/; max-age=3600`;
      document.cookie = `user_email=${data.email}; path=/; max-age=3600`;

      // For existing users, check if they have a profile and redirect accordingly
      // For now, redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
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
        throw new Error(data.error || 'Failed to resend OTP');
      }

      // Show success message
      setError(''); // Clear any existing error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="max-w-md w-full">
        <Link href="/auth/login" className="inline-block mb-8 text-sm text-zinc-600 dark:text-zinc-400 hover:underline">
          ← Back to sign in
        </Link>

        <div className="bg-white dark:bg-zinc-900 rounded-lg p-8 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h1 className="text-2xl font-bold mb-2 font-heading">Verify Your Email</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Enter the verification code sent to {email}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium mb-2">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 text-center text-2xl tracking-widest"
                placeholder="000000"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                Code expires in 10 minutes
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </Button>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading}
              className="w-full text-sm text-zinc-600 dark:text-zinc-400 hover:underline disabled:opacity-50"
            >
              Resend Code
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
