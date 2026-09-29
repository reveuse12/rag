'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

function VerifyLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendSuccess, setResendSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const storedEmail = localStorage.getItem('login_email');
    if (!storedEmail) {
      router.push('/auth/login');
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  // Resend Countdown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const submitOtp = async (code: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

      // Store token and clear temporary login_email
      localStorage.removeItem('login_email');
      const emailLower = data.email?.toLowerCase() || '';
      const isAdmin = emailLower === 'prayag129787@gmail.com' || emailLower === 'prayagbagtharia@gmail.com';
      const role = isAdmin ? 'admin' : 'member';

      document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user_email=${data.email}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user_role=${role}; path=/; max-age=86400; SameSite=Lax`;

      localStorage.setItem('user_email', data.email);
      localStorage.setItem('user_role', role);

      // Redirect to destination
      window.location.href = redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
      // Clear inputs and refocus first
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    // Take only the last entered char if multiple typed
    const char = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newDigits.join('');
    if (fullCode.length === 6 && !newDigits.includes('')) {
      submitOtp(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);

    const fullCode = newDigits.join('');
    if (fullCode.length === 6) {
      inputRefs.current[5]?.focus();
      submitOtp(fullCode);
    } else {
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = digits.join('');
    if (fullCode.length === 6) {
      submitOtp(fullCode);
    } else {
      setError('Please enter all 6 digits of the verification code.');
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    setError('');
    setResendSuccess(false);

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

      setResendSuccess(true);
      setResendCooldown(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

      setTimeout(() => {
        setResendSuccess(false);
      }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-md w-full">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 mb-6 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
        </Link>

        <div className="bg-card text-card-foreground rounded-3xl p-8 shadow-xl border border-border">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-4 mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold mb-1 font-heading text-center text-foreground">
            Verify Your Email
          </h1>
          <p className="text-xs text-muted-foreground mb-6 text-center leading-relaxed">
            Enter the 6-digit verification code sent to <strong className="text-foreground">{email}</strong>
          </p>

          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-2xl text-xs text-danger flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          {resendSuccess && (
            <div className="mb-4 p-3 bg-success/15 border border-success/30 rounded-2xl text-xs text-success flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>A fresh 6-digit code was sent to your email!</span>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-6">
            {/* 6 Auto-Advancing Boxes */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold font-mono rounded-2xl border-2 border-input bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-hidden transition-all shadow-2xs"
                  placeholder="•"
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 text-xs sm:text-sm rounded-xl shadow-xs"
              disabled={loading || digits.some((d) => !d)}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying Code...
                </>
              ) : (
                'Verify & Continue to CityCircle'
              )}
            </Button>

            {/* Resend Countdown */}
            <div className="text-center pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendCooldown > 0 || loading}
                className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 inline-flex items-center gap-1.5 font-semibold transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? '' : 'text-primary'}`} />
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : 'Didn’t receive code? Resend Code'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function VerifyLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">Loading verification...</div>}>
      <VerifyLoginForm />
    </Suspense>
  );
}

