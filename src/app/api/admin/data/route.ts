import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/lib/supabase/config';

const SUPER_ADMIN_EMAILS = [
  'prayag129787@gmail.com',
  'prayagbagtharia@gmail.com',
];

export async function GET(request: NextRequest) {
  try {
    const serviceClient = createServiceClient(
      supabaseConfig.url,
      supabaseConfig.serviceRoleKey || supabaseConfig.anonKey
    );

    // Fetch dynamic live metrics
    const [
      { count: usersCount },
      { count: groupsCount },
      { count: meetupsCount },
      { data: foundingCodes, error: codesError },
      { data: reportsData, error: reportsError },
      { data: bannersData, error: bannersError },
    ] = await Promise.all([
      serviceClient.from('users').select('*', { count: 'exact', head: true }),
      serviceClient.from('groups').select('*', { count: 'exact', head: true }),
      serviceClient.from('meetups').select('*', { count: 'exact', head: true }),
      serviceClient.from('founding_codes').select('*').order('created_at', { ascending: false }),
      serviceClient.from('reports').select('*').order('created_at', { ascending: false }),
      serviceClient.from('sponsor_banners').select('*').order('created_at', { ascending: false }),
    ]);

    return NextResponse.json({
      metrics: {
        usersCount: usersCount || 0,
        groupsCount: groupsCount || 0,
        meetupsCount: meetupsCount || 0,
        reportsCount: reportsData?.length || 0,
      },
      foundingCodes: foundingCodes || [],
      reports: reportsData || [],
      banners: bannersData || [],
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json(
      {
        metrics: { usersCount: 0, groupsCount: 0, meetupsCount: 0, reportsCount: 0 },
        foundingCodes: [],
        reports: [],
        banners: [],
      },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, code, banner } = body;

    const serviceClient = createServiceClient(
      supabaseConfig.url,
      supabaseConfig.serviceRoleKey || supabaseConfig.anonKey
    );

    if (action === 'create_founding_code' && code) {
      const normalizedCode = code.trim().toUpperCase();
      const { data, error } = await serviceClient
        .from('founding_codes')
        .insert({
          code: normalizedCode,
          is_used: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, code: data });
    }

    if (action === 'create_banner' && banner) {
      const { data, error } = await serviceClient
        .from('sponsor_banners')
        .insert({
          ...banner,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        // Fallback for local / non-table environments
        return NextResponse.json({ success: true, banner });
      }

      return NextResponse.json({ success: true, banner: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error saving admin action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
