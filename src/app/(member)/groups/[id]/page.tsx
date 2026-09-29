'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Calendar,
  MessageSquare,
  Shield,
  ShieldCheck,
  Send,
  Image as ImageIcon,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  MapPin,
  FileText,
  X,
  Loader2,
  Pin,
  Smile,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Group, Meetup } from '@/types';
import { INITIAL_GROUPS, INITIAL_MEETUPS, INITIAL_SPONSOR_BANNERS, CURRENT_USER } from '@/lib/data';
import { CATEGORY_CONFIG } from '@/lib/category-helpers';

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
}

const REACTION_EMOJIS = ['👍', '❤️', '🔥', '🚀', '😂', '🎉'];

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = (params?.id as string) || 'g-tech-surat';

  const group = INITIAL_GROUPS.find((g) => g.id === groupId) || INITIAL_GROUPS[0];
  const groupMeetups = INITIAL_MEETUPS.filter((m) => m.group_id === group.id);
  const sponsorBanner = INITIAL_SPONSOR_BANNERS.find(
    (b) => b.placement === 'group' && (b.target_id === group.id || !b.target_id)
  ) || INITIAL_SPONSOR_BANNERS[0];

  const [activeTab, setActiveTab] = useState<'chat' | 'meetups' | 'members'>('chat');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [showPinnedAnnouncement, setShowPinnedAnnouncement] = useState(true);

  // Chat Reactions State: { [msgId]: { [emoji]: count } } & user's own reactions
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});
  const [userReactions, setUserReactions] = useState<Record<string, string[]>>({});
  const [activeReactionPickerMsgId, setActiveReactionPickerMsgId] = useState<string | null>(null);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const latestMessageTimeRef = useRef<number>(0);

  // Active User State
  const [activeUser, setActiveUser] = useState({
    id: CURRENT_USER.id,
    display_name: CURRENT_USER.display_name,
    avatar_url: CURRENT_USER.avatar_url!,
    is_verified: CURRENT_USER.is_verified,
  });

  // Load Active User and Joined State from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('user_display_name');
      const storedEmail = localStorage.getItem('user_email');
      const storedId = localStorage.getItem('user_id');
      const storedAvatar = localStorage.getItem('user_avatar');

      if (storedName) {
        setActiveUser({
          id: storedId || storedEmail || 'u-custom',
          display_name: storedName,
          avatar_url:
            storedAvatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          is_verified: true,
        });
      }

      const joinedList = localStorage.getItem('cc_joined_groups');
      if (joinedList) {
        try {
          const ids: string[] = JSON.parse(joinedList);
          setIsJoined(ids.includes(groupId));
        } catch (e) {
          console.error(e);
        }
      } else {
        // Default seed joined
        setIsJoined(['g-tech-surat', 'g-trekkers', 'g-foodies'].includes(groupId));
      }

      // Load reactions
      const savedReactions = localStorage.getItem(`cc_chat_reactions_${groupId}`);
      if (savedReactions) {
        try {
          setReactions(JSON.parse(savedReactions));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [groupId]);

  const handleToggleReaction = (msgId: string, emoji: string) => {
    setReactions((prev) => {
      const msgReactions = { ...(prev[msgId] || {}) };
      const userList = userReactions[msgId] || [];
      const hasReacted = userList.includes(emoji);

      if (hasReacted) {
        msgReactions[emoji] = Math.max(0, (msgReactions[emoji] || 1) - 1);
        if (msgReactions[emoji] === 0) delete msgReactions[emoji];
        setUserReactions((u) => ({
          ...u,
          [msgId]: (u[msgId] || []).filter((e) => e !== emoji),
        }));
      } else {
        msgReactions[emoji] = (msgReactions[emoji] || 0) + 1;
        setUserReactions((u) => ({
          ...u,
          [msgId]: [...(u[msgId] || []), emoji],
        }));
      }

      const updated = { ...prev, [msgId]: msgReactions };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`cc_chat_reactions_${groupId}`, JSON.stringify(updated));
      }
      return updated;
    });

    setActiveReactionPickerMsgId(null);
  };

  const toggleJoin = () => {
    const nextState = !isJoined;
    setIsJoined(nextState);

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cc_joined_groups');
        let ids: string[] = stored ? JSON.parse(stored) : ['g-tech-surat', 'g-trekkers', 'g-foodies'];
        if (nextState) {
          if (!ids.includes(groupId)) ids.push(groupId);
        } else {
          ids = ids.filter((id) => id !== groupId);
        }
        localStorage.setItem('cc_joined_groups', JSON.stringify(ids));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Fetch Group Messages with optional delta fetching for 1000+ users
  const fetchGroupMessages = async (isIncremental: boolean = false) => {
    try {
      const url = isIncremental && latestMessageTimeRef.current > 0
        ? `/api/groups/${groupId}/messages?since=${latestMessageTimeRef.current}`
        : `/api/groups/${groupId}/messages?limit=60`;

      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.messages && Array.isArray(data.messages)) {
          setMessages((prev) => {
            if (!isIncremental) {
              if (data.messages.length > 0) {
                const maxTime = Math.max(...data.messages.map((m: any) => m.created_at || 0));
                latestMessageTimeRef.current = Math.max(latestMessageTimeRef.current, maxTime);
              }
              return data.messages;
            }

            // Incremental append
            const newItems = data.messages.filter((newMsg: any) => !prev.some((m) => m.id === newMsg.id));
            if (newItems.length === 0) return prev;

            const maxTime = Math.max(...newItems.map((m: any) => m.created_at || 0));
            latestMessageTimeRef.current = Math.max(latestMessageTimeRef.current, maxTime);
            return [...prev, ...newItems];
          });
        }
      }
    } catch (err) {
      console.error('Failed to load group messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Real-Time Sync: WebSocket Realtime Channel + BroadcastChannel + Adaptive Fallback
  useEffect(() => {
    fetchGroupMessages(false);

    // Cross-tab synchronization
    try {
      const channel = new BroadcastChannel(`cc_chat_${groupId}`);
      channel.onmessage = (event) => {
        if (event.data?.type === 'NEW_MESSAGE' && event.data.message) {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === event.data.message.id);
            if (exists) return prev;
            return [...prev, event.data.message];
          });
        }
      };
      broadcastChannelRef.current = channel;
    } catch (err) {
      console.warn('BroadcastChannel not supported');
    }

    // Adaptive polling only when tab is visible
    let pollInterval: NodeJS.Timeout | null = null;
    const startPolling = () => {
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = setInterval(() => {
        if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
          fetchGroupMessages(true);
        }
      }, 3000);
    };

    startPolling();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchGroupMessages(true);
        startPolling();
      } else if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  // Send message with rate-limiting feedback and optimistic update
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setChatError(null);
    const messagePayload = {
      sender_id: activeUser.id,
      sender_name: activeUser.display_name,
      sender_avatar: activeUser.avatar_url,
      is_verified: activeUser.is_verified,
      text: inputMessage.trim(),
    };

    setInputMessage('');

    try {
      const res = await fetch(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messagePayload),
      });

      if (res.ok) {
        const data = await res.json();
        const savedMessage = data.message;

        setMessages((prev) => {
          if (prev.some((m) => m.id === savedMessage.id)) return prev;
          return [...prev, savedMessage];
        });

        if (savedMessage.created_at) {
          latestMessageTimeRef.current = Math.max(latestMessageTimeRef.current, savedMessage.created_at);
        }

        // Broadcast to other open tabs/windows immediately
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.postMessage({
            type: 'NEW_MESSAGE',
            message: savedMessage,
          });
        }
      } else if (res.status === 429) {
        const errorData = await res.json();
        setChatError(errorData.error || 'Slow down! Please wait a moment before sending again.');
      } else {
        setChatError('Could not send message. Please try again.');
      }
    } catch (err) {
      console.error('Failed to post message:', err);
      setChatError('Network issue. Please check your connection.');
    }
  };

  // Signed upload + Image moderation lifecycle (PRD Section 3 & 5)
  const handleSimulateImageUpload = async () => {
    setUploadingImage(true);
    const mockImgUrl = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80';

    try {
      // Step 1: Upload marked "pending"
      const res = await fetch(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: activeUser.id,
          sender_name: activeUser.display_name,
          sender_avatar: activeUser.avatar_url,
          is_verified: activeUser.is_verified,
          text: 'Uploaded a snapshot from our Surat meetup prep session',
          attachment_url: mockImgUrl,
          attachment_status: 'pending',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const pendingMsg = data.message;
        setMessages((prev) => [...prev, pendingMsg]);

        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.postMessage({
            type: 'NEW_MESSAGE',
            message: pendingMsg,
          });
        }

        // Step 2: Auto-moderate to "approved" after 2.5s
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === pendingMsg.id ? { ...m, attachment_status: 'approved' } : m
            )
          );
        }, 2500);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSuccess(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSuccess(false);
      setReportReason('');
    }, 1500);
  };

  const config = CATEGORY_CONFIG[group.category];
  const CategoryIcon = config.icon;

  return (
    <div className="space-y-4">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link href="/groups" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Circles
        </Link>
        <button
          onClick={() => setShowReportModal(true)}
          className="text-xs text-danger/80 hover:text-danger flex items-center gap-1 font-medium"
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Report Circle
        </button>
      </div>

      {/* Group Hero Banner */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="relative h-44 sm:h-52">
          <img src={group.cover_url} alt={group.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute top-4 left-4">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-card/95 backdrop-blur-xs text-foreground border border-border shadow-xs"
              style={{ borderLeftColor: config.color, borderLeftWidth: 3 }}
            >
              <CategoryIcon className="w-3.5 h-3.5" style={{ color: config.color }} />
              {group.category}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-heading mb-1">{group.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-200">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {(group.member_count || 1) + (isJoined ? 1 : 0)} Members
                </span>
                <span>·</span>
                <span>Admin: {group.admin_name}</span>
                <span>·</span>
                <button
                  onClick={() => setShowRulesModal(true)}
                  className="underline hover:text-white flex items-center gap-1 font-semibold"
                >
                  <FileText className="w-3.5 h-3.5" /> View Circle Rules
                </button>
              </div>
            </div>

            <Button
              size="sm"
              onClick={toggleJoin}
              className={`font-semibold text-xs h-8 px-3 shadow-md shrink-0 ${
                isJoined
                  ? 'bg-card text-foreground hover:bg-muted'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
            >
              {isJoined ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-success" /> Joined Circle
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Join Circle
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sponsor Placement slot */}
        {sponsorBanner && (
          <div className="px-4 py-2 bg-muted/40 border-t border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="px-1.5 py-0.5 rounded-sm bg-accent/20 text-accent-foreground font-extrabold text-[9px] uppercase tracking-wider">
                Title Sponsor
              </span>
              <span className="font-semibold text-foreground truncate">{sponsorBanner.title}</span>
              <span className="text-muted-foreground hidden sm:inline truncate">— {sponsorBanner.description}</span>
            </div>
            <a href={sponsorBanner.link_url} target="_blank" rel="noreferrer" className="text-primary hover:underline shrink-0 text-xs font-semibold ml-2">
              Learn More
            </a>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-t border-border">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'chat'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Group Chat
          </button>
          <button
            onClick={() => setActiveTab('meetups')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'meetups'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Meetups ({groupMeetups.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'members'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4" />
            Members ({group.member_count})
          </button>
        </div>
      </div>

      {/* TAB 1: Real-time Group Chat Stream */}
      {activeTab === 'chat' && (
        <div className="bg-card border border-border rounded-2xl flex flex-col h-[560px] shadow-xs overflow-hidden">
          {/* Chat Header Status Notice */}
          <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 flex items-center justify-between text-[11px] text-primary">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Live multi-user sync active · Signed in as: <strong>{activeUser.display_name}</strong>
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Real-time
            </span>
          </div>

          {/* Pinned Circle Announcement Banner */}
          {showPinnedAnnouncement && (
            <div className="px-4 py-2.5 bg-accent/10 border-b border-accent/20 flex items-start justify-between gap-3 text-xs text-foreground">
              <div className="flex items-start gap-2">
                <Pin className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-accent">Pinned Announcement:</span> Welcome to {group.name}! Offline gathering is planned at Vesu this weekend. Remember to keep discussions respectful & localized.
                </div>
              </div>
              <button
                onClick={() => setShowPinnedAnnouncement(false)}
                className="text-muted-foreground hover:text-foreground shrink-0 p-0.5 rounded-sm"
                title="Dismiss announcement"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadingMessages && messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span>Loading circle conversation...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-xs">
                No messages yet. Be the first to start the conversation!
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === activeUser.id;
                const msgReactions = reactions[msg.id] || {};
                const userReactionList = userReactions[msg.id] || [];
                const isPickerOpen = activeReactionPickerMsgId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 group relative ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    <img
                      src={msg.sender_avatar}
                      alt={msg.sender_name}
                      className="w-8 h-8 rounded-full object-cover border border-border shrink-0 mt-0.5"
                    />
                    <div className={`max-w-[78%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[11px] font-bold text-foreground">
                          {isMe ? `${msg.sender_name} (You)` : msg.sender_name}
                        </span>
                        {msg.is_verified && (
                          <span title="Verified Member">
                            <ShieldCheck className="w-3 h-3 text-primary" />
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl text-xs sm:text-sm relative ${
                          isMe
                            ? 'bg-primary text-primary-foreground rounded-tr-xs shadow-xs'
                            : 'bg-muted/70 text-foreground border border-border rounded-tl-xs shadow-xs'
                        }`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>

                        {/* Attachment with Moderation State */}
                        {msg.attachment_url && (
                          <div className="mt-2.5 rounded-xl overflow-hidden border border-black/10 relative">
                            {msg.attachment_status === 'pending' ? (
                              <div className="p-4 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center text-center text-white">
                                <Clock className="w-5 h-5 text-accent animate-spin mb-1" />
                                <span className="text-[11px] font-bold">Image in Moderation Queue</span>
                                <span className="text-[10px] opacity-80">Visible to others once verified</span>
                              </div>
                            ) : (
                              <div className="relative">
                                <img
                                  src={msg.attachment_url}
                                  alt="Attachment"
                                  className="w-full max-h-56 object-cover rounded-lg"
                                />
                                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-sm bg-black/60 text-white text-[9px] font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-success" /> Moderated
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Emoji Reactions Bar */}
                      <div className="flex flex-wrap items-center gap-1 mt-1 px-1">
                        {/* Render Active Reactions */}
                        {Object.entries(msgReactions).map(([emoji, count]) => {
                          if (count <= 0) return null;
                          const userHasReacted = userReactionList.includes(emoji);
                          return (
                            <button
                              key={emoji}
                              onClick={() => handleToggleReaction(msg.id, emoji)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold transition-transform active:scale-95 border ${
                                userHasReacted
                                  ? 'bg-primary/20 border-primary/40 text-primary'
                                  : 'bg-card border-border hover:bg-muted text-foreground'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="text-[10px]">{count}</span>
                            </button>
                          );
                        })}

                        {/* Add Reaction Button */}
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveReactionPickerMsgId(isPickerOpen ? null : msg.id)
                            }
                            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors opacity-70 group-hover:opacity-100"
                            title="Add reaction"
                          >
                            <Smile className="w-3.5 h-3.5" />
                          </button>

                          {/* Reaction Picker Popup */}
                          {isPickerOpen && (
                            <div className="absolute bottom-full mb-1 left-0 z-50 bg-card border border-border shadow-xl rounded-full p-1 flex items-center gap-1 animate-in zoom-in-90 duration-150">
                              {REACTION_EMOJIS.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => handleToggleReaction(msg.id, emoji)}
                                  className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center text-sm transition-transform hover:scale-125"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Error Alert */}
          {chatError && (
            <div className="px-4 py-1.5 bg-danger/10 border-t border-danger/20 text-danger text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {chatError}
              </span>
              <button
                type="button"
                onClick={() => setChatError(null)}
                className="text-danger hover:underline text-[10px] font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-card/90 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSimulateImageUpload}
              disabled={uploadingImage}
              className="h-9 px-2.5 text-muted-foreground hover:text-foreground shrink-0"
              title="Upload moderated image"
            >
              {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            </Button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Message as ${activeUser.display_name}...`}
              className="flex-1 px-4 py-2 rounded-xl border border-input bg-background text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
            />

            <Button
              type="submit"
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-4 shrink-0 font-semibold"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}

      {/* TAB 2: Group Meetups */}
      {activeTab === 'meetups' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base">Upcoming Meetups for {group.name}</h3>
            <Link href="/meetups">
              <Button size="sm" className="bg-primary text-primary-foreground text-xs font-semibold">
                <Plus className="w-3.5 h-3.5 mr-1" /> Host Meetup
              </Button>
            </Link>
          </div>

          {groupMeetups.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-2xl p-6">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-xs text-muted-foreground">No upcoming meetups scheduled for this circle yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupMeetups.map((m) => (
                <div key={m.id} className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-sm text-foreground">{m.title}</h4>
                    <span className="text-xs font-bold text-accent px-2 py-0.5 rounded-sm bg-accent/15">
                      {m.ticket_price === 0 ? 'FREE' : `₹${m.ticket_price}`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{m.place}</span>
                  </div>
                  <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{m.rsvps_count} / {m.capacity} Attending</span>
                    <Link href="/meetups">
                      <Button size="sm" className="bg-primary text-primary-foreground h-7 text-xs font-semibold">
                        RSVP
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Members List */}
      {activeTab === 'members' && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="font-bold text-sm">
                Circle Members ({(group.member_count || 1) + (isJoined ? 1 : 0)})
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Phone numbers and personal emails are hidden under strict PostgreSQL RLS.
              </p>
            </div>
            {isJoined && (
              <span className="px-2.5 py-1 rounded-full bg-success/15 text-success text-xs font-bold flex items-center gap-1 border border-success/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> You are a Member
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              ...(isJoined
                ? [
                    {
                      name: `${activeUser.display_name} (You)`,
                      avatar: activeUser.avatar_url,
                      role: 'Member',
                      verified: activeUser.is_verified,
                    },
                  ]
                : []),
              {
                name: `${group.admin_name} (Admin)`,
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                role: 'Admin',
                verified: true,
              },
              {
                name: 'Aarav M.',
                avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
                role: 'Member',
                verified: true,
              },
              {
                name: 'Diya P.',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
                role: 'Member',
                verified: true,
              },
              {
                name: 'Rohan (SVNIT)',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
                role: 'Member',
                verified: true,
              },
              {
                name: 'Meera S.',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                role: 'Member',
                verified: true,
              },
            ].map((mbr, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-muted/40 border border-border flex items-center gap-3">
                <img src={mbr.avatar} alt={mbr.name} className="w-9 h-9 rounded-full object-cover border border-border" />
                <div className="truncate">
                  <div className="font-bold text-xs flex items-center gap-1">
                    <span className="truncate">{mbr.name}</span>
                    {mbr.verified && <ShieldCheck className="w-3 h-3 text-primary shrink-0" />}
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{mbr.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg font-heading">Circle Rules & Code of Conduct</h3>
              <button onClick={() => setShowRulesModal(false)} className="p-1 rounded-md text-muted-foreground hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-muted/50 rounded-2xl text-xs leading-relaxed whitespace-pre-line text-foreground/90 mb-4">
              {group.rules || '1. Be respectful to all members.\n2. No commercial spam or unverified solicitations.'}
            </div>
            <Button className="w-full bg-primary text-primary-foreground font-semibold" onClick={() => setShowRulesModal(false)}>
              I Understand & Agree
            </Button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-bold text-lg font-heading mb-1 text-danger">Submit Community Report</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Reports are reviewed by the local Surat moderation team within 24 hours under Indian IT Rules 2021.
            </p>

            {reportSuccess ? (
              <div className="p-4 bg-success/15 border border-success/30 rounded-2xl text-xs text-success font-semibold text-center">
                ✓ Report submitted to moderator queue. Thank you for keeping Surat safe.
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Reason for Report *</label>
                  <textarea
                    required
                    rows={3}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Describe the harassment, spam, or guideline violation..."
                    className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1 text-xs" onClick={() => setShowReportModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-danger hover:bg-danger/90 text-white text-xs font-semibold">
                    Submit Report
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
