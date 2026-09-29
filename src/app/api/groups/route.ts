import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { INITIAL_GROUPS } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    try {
      const supabase = await createClient();
      let query = supabase
        .from('groups')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return NextResponse.json(
          { groups: data },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=59',
            },
          }
        );
      }
    } catch {
      // Fallback to seeded groups
    }

    // High performance fallback
    let filtered = INITIAL_GROUPS;
    if (category) {
      filtered = INITIAL_GROUPS.filter((g) => g.category.toLowerCase() === category.toLowerCase());
    }

    return NextResponse.json(
      { groups: filtered },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=59',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, category, is_public, rules } = await request.json();

    if (!name || !description || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('groups')
      .insert({
        name,
        description,
        category,
        is_public: is_public !== false,
        rules,
        admin_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add admin as a member
    await supabase.from('group_members').insert({
      group_id: data.id,
      user_id: user.id,
      role: 'admin',
      status: 'approved',
    });

    return NextResponse.json({ group: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
