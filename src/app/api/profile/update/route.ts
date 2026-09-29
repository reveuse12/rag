import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, display_name, avatar_url, bio, city, interest_tags, college_email_badge } = body;

    if (!display_name || display_name.trim().length === 0) {
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 });
    }

    if (interest_tags && (!Array.isArray(interest_tags) || interest_tags.length < 3 || interest_tags.length > 5)) {
      return NextResponse.json({ error: 'Please select between 3 and 5 interest tags' }, { status: 400 });
    }

    const updatedProfile = {
      display_name: display_name.trim().slice(0, 50),
      avatar_url: avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: (bio || '').trim().slice(0, 300),
      city: (city || 'Surat').trim().slice(0, 50),
      interest_tags: interest_tags || ['Tech', 'Startups', 'Food & Dining'],
      college_email_badge: !!college_email_badge,
      updated_at: new Date().toISOString(),
    };

    // Update in Supabase if configured
    const supabase = getSupabaseClient();
    if (supabase && (id || email)) {
      try {
        let query = supabase.from('users').update(updatedProfile);
        if (id) {
          query = query.eq('id', id);
        } else if (email) {
          query = query.eq('email', email);
        }
        await query;
      } catch (err) {
        console.warn('Supabase profile update warning:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update profile' },
      { status: 500 }
    );
  }
}
