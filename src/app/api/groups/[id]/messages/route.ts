import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ChatMessage {
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

// Global in-memory group messages store (persists across API calls and worker threads in dev server)
const globalStore = globalThis as unknown as {
  __CITYCIRCLE_MESSAGES__?: Record<string, ChatMessage[]>;
};

if (!globalStore.__CITYCIRCLE_MESSAGES__) {
  globalStore.__CITYCIRCLE_MESSAGES__ = {
    'g-tech-surat': [
      {
        id: 'm1',
        sender_id: 'a0000000-0000-0000-0000-000000000002',
        sender_name: 'Aarav M.',
        sender_avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
        is_verified: true,
        text: 'Hey everyone! Excited for our upcoming meetup this weekend in Vesu.',
        timestamp: '10:15 AM',
        created_at: Date.now() - 3600000,
      },
      {
        id: 'm2',
        sender_id: 'a0000000-0000-0000-0000-000000000003',
        sender_name: 'Diya P.',
        sender_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        is_verified: true,
        text: 'Venue is finalized at The House of Caffeine, Vesu! Sharing the agenda flyer.',
        attachment_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
        attachment_status: 'approved',
        timestamp: '10:18 AM',
        created_at: Date.now() - 3000000,
      },
    ],
    'g-trekkers': [
      {
        id: 'm-trek-1',
        sender_id: 'a0000000-0000-0000-0000-000000000002',
        sender_name: 'Aarav M.',
        sender_avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
        is_verified: true,
        text: 'Welcome to Weekend Trekkers! Coordinate rides and trails here.',
        timestamp: '08:30 AM',
        created_at: Date.now() - 7200000,
      },
    ],
    'g-foodies': [
      {
        id: 'm-food-1',
        sender_id: 'a0000000-0000-0000-0000-000000000003',
        sender_name: 'Diya P.',
        sender_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        is_verified: true,
        text: 'Surat food lovers! Share your favorite cafes and food spots.',
        timestamp: '09:00 AM',
        created_at: Date.now() - 5400000,
      },
    ],
  };
}

const GROUP_MESSAGES_STORE = globalStore.__CITYCIRCLE_MESSAGES__;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const messages = GROUP_MESSAGES_STORE[id] || [];
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
    const body = await request.json();
    const { sender_id, sender_name, sender_avatar, is_verified, text, attachment_url, attachment_status } = body;

    if (!text && !attachment_url) {
      return NextResponse.json({ error: 'Message text or attachment is required' }, { status: 400 });
    }

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender_id: sender_id || 'u-anon',
      sender_name: sender_name || 'Member',
      sender_avatar:
        sender_avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      is_verified: is_verified ?? true,
      text: text || '',
      attachment_url: attachment_url || undefined,
      attachment_status: attachment_status || (attachment_url ? 'pending' : undefined),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      created_at: Date.now(),
    };

    if (!GROUP_MESSAGES_STORE[id]) {
      GROUP_MESSAGES_STORE[id] = [];
    }

    GROUP_MESSAGES_STORE[id].push(newMessage);

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
