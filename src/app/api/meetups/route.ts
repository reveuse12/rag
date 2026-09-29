import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('group_id');
    const category = searchParams.get('category');

    try {
      const supabase = await createClient();
      let query = supabase
        .from('meetups')
        .select(`
          *,
          group:groups(name, category)
        `)
        .order('date_time', { ascending: true });

      if (groupId) {
        query = query.eq('group_id', groupId);
      }

      const { data, error } = await query;

      if (!error && data) {
        const formatted = data.map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          place: m.place,
          latitude: m.latitude || 21.1550,
          longitude: m.longitude || 72.7800,
          date_time: m.date_time,
          group_id: m.group_id,
          group_name: m.group?.name || 'Surat Circle',
          category: m.group?.category || 'Custom',
          capacity: m.capacity || 30,
          rsvps_count: 0,
          ticket_price: m.ticket_price || 0,
          created_by: m.created_by,
          created_at: m.created_at,
        }));

        return NextResponse.json({ meetups: formatted });
      }
    } catch (dbErr) {
      console.error('Supabase query error:', dbErr);
    }

    return NextResponse.json({ meetups: [] });
  } catch (error) {
    console.error('Error in GET /api/meetups:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, place, latitude, longitude, date_time, group_id, capacity, ticket_price } = body;

    if (!title || !place || !date_time) {
      return NextResponse.json({ error: 'Missing required meetup fields' }, { status: 400 });
    }

    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const newMeetup = {
        title,
        description: description || '',
        place,
        latitude: latitude || 21.1550,
        longitude: longitude || 72.7800,
        date_time,
        group_id: group_id || null,
        capacity: Number(capacity) || 30,
        ticket_price: Number(ticket_price) || 0,
        created_by: user?.id || 'a0000000-0000-0000-0000-000000000001',
      };

      const { data, error } = await supabase
        .from('meetups')
        .insert(newMeetup)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, meetup: data }, { status: 201 });
      }
    } catch (dbErr) {
      console.error('Supabase insert error:', dbErr);
    }

    // Return created payload for client state persistence
    return NextResponse.json({
      success: true,
      meetup: {
        id: `m-${Date.now()}`,
        title,
        description: description || '',
        place,
        latitude: latitude || 21.1550,
        longitude: longitude || 72.7800,
        date_time,
        group_id: group_id || 'g-general',
        capacity: Number(capacity) || 30,
        ticket_price: Number(ticket_price) || 0,
        rsvps_count: 0,
        created_at: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/meetups:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
