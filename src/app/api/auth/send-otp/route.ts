import { NextRequest, NextResponse } from 'next/server';
import { sendOTP } from '@/lib/email';
import { otpStore } from '@/lib/otp-store';
import { rateLimiter } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Rate limiting: max 3 OTP requests per minute
    const rateKey = `otp:${email.toLowerCase().trim()}:${ip}`;
    const limitCheck = rateLimiter.check(rateKey, 3, 60_000);
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Please wait a minute before requesting another code.' },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP (in production, use Redis or database)
    otpStore.set(email, { otp, expiresAt });

    // Send OTP email
    const result = await sendOTP(email, otp);

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const stored = otpStore.get(email);

  if (!stored || stored.expiresAt < Date.now()) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  return NextResponse.json({ valid: true });
}
