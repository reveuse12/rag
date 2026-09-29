import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from '@/lib/email';
import { supabaseConfig } from '@/lib/supabase/config';

export async function POST(request: NextRequest) {
  try {
    const { email, display_name, interest_tags, founding_code, password, avatar_url } = await request.json();

    if (!email || !display_name || !interest_tags || interest_tags.length < 3) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Always use service client for server-side user creation and founding code verification
    const serviceClient = createServiceClient(
      supabaseConfig.url,
      supabaseConfig.serviceRoleKey || supabaseConfig.anonKey
    );

    // Check if founding code is valid and unused
    let isFoundingMember = false;
    let validFoundingCode: string | null = null;

    if (founding_code && founding_code.trim().length > 0) {
      const normalizedCode = founding_code.trim().toUpperCase();
      const { data: codeData, error: codeError } = await serviceClient
        .from('founding_codes')
        .select('*')
        .ilike('code', normalizedCode)
        .maybeSingle();

      if (codeError) {
        console.error('Error checking founding code:', codeError);
        return NextResponse.json({ error: 'Failed to verify founding code' }, { status: 500 });
      }

      if (!codeData || codeData.is_used) {
        return NextResponse.json({ error: 'Invalid or already used founding code' }, { status: 400 });
      }

      isFoundingMember = true;
      validFoundingCode = codeData.code;
    }

    // Create or retrieve auth user
    let userId: string;

    const { data: createdAuth, error: authError } = await serviceClient.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password || undefined,
      email_confirm: true,
      user_metadata: { display_name: display_name.trim(), avatar_url: avatar_url || undefined },
    });

    if (authError) {
      // If user already exists in auth, retrieve their user id and update password if provided
      if (authError.message.toLowerCase().includes('already') || authError.status === 422) {
        const { data: existingUserList, error: listError } = await serviceClient.auth.admin.listUsers();
        if (listError) {
          return NextResponse.json({ error: authError.message }, { status: 400 });
        }
        const existing = existingUserList.users.find(
          u => u.email?.toLowerCase() === email.trim().toLowerCase()
        );
        if (!existing) {
          return NextResponse.json({ error: authError.message }, { status: 400 });
        }
        userId = existing.id;
        if (password) {
          await serviceClient.auth.admin.updateUserById(userId, { password });
        }
      } else {
        console.error('Error creating auth user:', authError);
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }
    } else {
      if (!createdAuth.user) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
      userId = createdAuth.user.id;
    }

    // Create / update public user profile
    const { error: profileError } = await serviceClient.from('users').upsert({
      id: userId,
      email: email.trim().toLowerCase(),
      display_name: display_name.trim(),
      avatar_url: avatar_url || undefined,
      interest_tags,
      is_verified: isFoundingMember, // Founding members are auto-verified
      city: process.env.NEXT_PUBLIC_CITY || 'Surat',
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error('Error saving user profile:', profileError);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Mark founding code as used
    if (isFoundingMember && validFoundingCode) {
      await serviceClient
        .from('founding_codes')
        .update({
          is_used: true,
          used_by: userId,
          used_at: new Date().toISOString(),
        })
        .eq('code', validFoundingCode);
    }

    // Send welcome email (fire & forget / non-blocking if fails)
    try {
      await sendWelcomeEmail(email, display_name);
    } catch (emailErr) {
      console.error('Non-critical: welcome email failed:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      user_id: userId,
      is_founding_member: isFoundingMember,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
