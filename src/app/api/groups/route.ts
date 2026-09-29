import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

      if (!error && data) {
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
      // Fallback
    }

    return NextResponse.json(
      { groups: [] },
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

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    try {
      const supabase = await createClient();
      await supabase.from('groups').delete().eq('id', id);
      await supabase.from('group_members').delete().eq('group_id', id);
    } catch (dbErr) {
      console.warn('Supabase delete group warning:', dbErr);
    }

    return NextResponse.json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/groups:', error);
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 });
  }
}

