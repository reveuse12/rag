import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { rateLimiter } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string;
  is_verified?: boolean;
  text: string;
  attachment_url?: string;
  attachment_status?: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  created_at: number;
}

// Global fast-path store & singleton client across serverless warm executions
const globalStore = globalThis as unknown as {
  __CITYCIRCLE_MESSAGES__?: Record<string, ChatMessage[]>;
  __CITYCIRCLE_SUPABASE_CLIENT__?: SupabaseClient | null;
  __CITYCIRCLE_INFLIGHT_READS__?: Map<string, Promise<ChatMessage[]>>;
};

if (!globalStore.__CITYCIRCLE_MESSAGES__) {
  globalStore.__CITYCIRCLE_MESSAGES__ = {};
}

if (!globalStore.__CITYCIRCLE_INFLIGHT_READS__) {
  globalStore.__CITYCIRCLE_INFLIGHT_READS__ = new Map();
}

const GROUP_MESSAGES_STORE = globalStore.__CITYCIRCLE_MESSAGES__;
const INFLIGHT_READS = globalStore.__CITYCIRCLE_INFLIGHT_READS__;

function getSupabaseSingleton(): SupabaseClient | null {
  if (globalStore.__CITYCIRCLE_SUPABASE_CLIENT__ !== undefined) {
    return globalStore.__CITYCIRCLE_SUPABASE_CLIENT__;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    globalStore.__CITYCIRCLE_SUPABASE_CLIENT__ = null;
    return null;
  }
  try {
    globalStore.__CITYCIRCLE_SUPABASE_CLIENT__ = createClient(url, key, {
      auth: { persistSession: false },
    });
  } catch {
    globalStore.__CITYCIRCLE_SUPABASE_CLIENT__ = null;
  }
  return globalStore.__CITYCIRCLE_SUPABASE_CLIENT__;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const since = searchParams.get('since');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

  const supabase = getSupabaseSingleton();

  if (supabase) {
    const cacheKey = `${id}:${since || 'all'}:${limit}`;
    let fetchPromise = INFLIGHT_READS.get(cacheKey);

    if (!fetchPromise) {
      fetchPromise = (async () => {
        try {
          let query = supabase
            .from('messages')
            .select('*')
            .eq('group_id', id)
            .order('created_at', { ascending: true })
            .limit(limit);

          if (since) {
            const sinceNum = parseInt(since, 10);
            if (!isNaN(sinceNum)) {
              query = query.gt('created_at', new Date(sinceNum).toISOString());
            }
          }

          const { data, error } = await query;
          if (!error && data && data.length > 0) {
            const formatted: ChatMessage[] = data.map((d: any) => ({
              id: d.id,
              sender_id: d.sender_id,
              sender_name: d.sender_name,
              sender_avatar: d.sender_avatar,
              is_verified: d.is_verified ?? true,
              text: d.text || '',
              attachment_url: d.attachment_url || undefined,
              attachment_status: d.attachment_status || undefined,
              timestamp: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              created_at: new Date(d.created_at).getTime(),
            }));

            // Merge into local store
            if (!GROUP_MESSAGES_STORE[id]) GROUP_MESSAGES_STORE[id] = [];
            formatted.forEach((msg) => {
              if (!GROUP_MESSAGES_STORE[id].some((m) => m.id === msg.id)) {
                GROUP_MESSAGES_STORE[id].push(msg);
              }
            });

            return since ? formatted : GROUP_MESSAGES_STORE[id];
          }
        } catch {
          // graceful fallback
        }
        return [];
      })();

      INFLIGHT_READS.set(cacheKey, fetchPromise);
      // Remove promise from inflight map after 100ms
      setTimeout(() => INFLIGHT_READS.delete(cacheKey), 100);
    }

    const fetched = await fetchPromise;
    if (fetched && fetched.length > 0) {
      return NextResponse.json(
        { success: true, messages: fetched },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      );
    }
  }

  // Fast-path in-memory fallback
  let messages = GROUP_MESSAGES_STORE[id] || [];
  if (since) {
    const sinceNum = parseInt(since, 10);
    if (!isNaN(sinceNum)) {
      messages = messages.filter((m) => m.created_at > sinceNum);
    }
  }

  return NextResponse.json(
    { success: true, messages },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    
    const body = await request.json();
    const { sender_id, sender_name, sender_avatar, is_verified, text, attachment_url, attachment_status } = body;

    // Rate Limit Check: max 8 messages per 10 seconds per sender
    const rateKey = `chat:${sender_id || ip}`;
    const limitResult = rateLimiter.check(rateKey, 8, 10_000);
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'You are sending messages too fast. Please wait a few seconds.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(limitResult.resetMs / 1000).toString(),
          },
        }
      );
    }

    if (!text && !attachment_url) {
      return NextResponse.json({ error: 'Message text or attachment is required' }, { status: 400 });
    }

    // Input sanitization & boundary limits
    const sanitizedText = (text || '').trim().slice(0, 2000);

    const now = Date.now();
    const newMessage: ChatMessage = {
      id: `msg-${now}-${Math.random().toString(36).substring(2, 6)}`,
      sender_id: sender_id || 'u-anon',
      sender_name: (sender_name || 'Member').trim().slice(0, 50),
      sender_avatar:
        sender_avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      is_verified: is_verified ?? true,
      text: sanitizedText,
      attachment_url: attachment_url || undefined,
      attachment_status: attachment_status || (attachment_url ? 'pending' : undefined),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      created_at: now,
    };

    if (!GROUP_MESSAGES_STORE[id]) {
      GROUP_MESSAGES_STORE[id] = [];
    }

    // Keep store capped to 500 recent messages per group to prevent memory leak
    if (GROUP_MESSAGES_STORE[id].length > 500) {
      GROUP_MESSAGES_STORE[id] = GROUP_MESSAGES_STORE[id].slice(-300);
    }

    GROUP_MESSAGES_STORE[id].push(newMessage);

    // Asynchronously insert into Supabase if configured
    const supabase = getSupabaseSingleton();
    if (supabase) {
      try {
        await supabase
          .from('messages')
          .insert({
            group_id: id,
            sender_id: newMessage.sender_id,
            sender_name: newMessage.sender_name,
            sender_avatar: newMessage.sender_avatar,
            is_verified: newMessage.is_verified,
            text: newMessage.text,
            attachment_url: newMessage.attachment_url,
            attachment_status: newMessage.attachment_status || 'approved',
            created_at: new Date(now).toISOString(),
          });
      } catch (err: unknown) {
        console.warn('Background Supabase message insert error:', err);
      }
    }

    return NextResponse.json(
      { success: true, message: newMessage },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to post message' },
      { status: 500 }
    );
  }
}
