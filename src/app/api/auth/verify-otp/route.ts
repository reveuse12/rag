import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { otpStore } from '@/lib/otp-store';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Dev bypass for seeded users
    const SEEDED_EMAILS = [
      'prayag129787@gmail.com',
      'aarav@surat.in',
      'diya@surat.in',
      'rohan@svnit.ac.in',
    ];

    if (SEEDED_EMAILS.includes(normalizedEmail) && (otp === '123456' || otp === '000000')) {
      const token = Buffer.from(`${normalizedEmail}:${Date.now()}`).toString('base64');
      return NextResponse.json({
        success: true,
        message: 'OTP verified successfully',
        token,
        email: normalizedEmail,
      });
    }

    const stored = otpStore.get(normalizedEmail) || otpStore.get(email);

    if (!stored) {
      return NextResponse.json({ error: 'OTP not found or expired' }, { status: 400 });
    }

    if (stored.expiresAt < Date.now()) {
      otpStore.delete(email);
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    if (stored.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // OTP is valid, clear it
    otpStore.delete(email);

    // Check if user exists in Supabase
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // For now, we'll create a session token
    // In production, use Supabase Auth properly
    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');

    return NextResponse.json({ 
      success: true, 
      message: 'OTP verified successfully',
      token,
      email
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
