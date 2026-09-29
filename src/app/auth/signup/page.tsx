'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Gift, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [foundingCode, setFoundingCode] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        throw new Error(data.error || 'Failed to send OTP');
      }

      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

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

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_email', data.email);

      if (foundingCode) {
        localStorage.setItem('founding_code', foundingCode.trim().toUpperCase());
      }

      router.push('/auth/profile-setup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
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

          <h1 className="text-2xl font-bold mb-1 font-heading">Join CityCircle</h1>
          <p className="text-xs text-muted-foreground mb-6">
            {step === 'email'
              ? 'Enter your email or phone to verify your Surat residency'
              : 'Enter the 6-digit verification code sent to your inbox'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger">
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendOTP} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label htmlFor="email" className="block font-semibold mb-1">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com"
                />
              </div>

              {/* Founding Member Pass Box */}
              <div className="p-4 bg-accent/10 border border-accent/30 rounded-2xl">
                <div className="flex items-center gap-1.5 font-bold text-accent-foreground mb-1">
                  <Gift className="w-4 h-4 text-accent" />
                  <span>Founding Member Code (Optional)</span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-2">
                  First 300–400 verified signups join free. Enter your code or leave blank to pay the ₹250 joining fee later.
                </p>
                <input
                  type="text"
                  value={foundingCode}
                  onChange={(e) => setFoundingCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-accent/40 bg-card text-foreground uppercase tracking-wider font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary"
                  placeholder="e.g. FOUNDER2026 or SURATVIP"
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11" disabled={loading}>
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label htmlFor="otp" className="block font-semibold mb-1">
                  Verification Code *
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                />
                <p className="text-[11px] text-muted-foreground mt-1 text-center">
                  Verification code expires in 10 minutes
                </p>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </Button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-xs text-muted-foreground hover:text-foreground underline text-center"
              >
                Change email address
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            <p>
              Already a member?{' '}
              <Link href="/auth/login" className="text-primary font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
