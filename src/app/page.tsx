'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Sparkles,
  MapPin,
  MessageSquare,
  Lock,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Radio,
  Clock,
  ChevronDown,
  ChevronUp,
  Check,
  Award,
  Copy,
  AlertCircle,
  Eye,
  EyeOff,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { GroupCategory } from '@/types';
import { INITIAL_GROUPS } from '@/lib/data';
import { CATEGORIES, CATEGORY_CONFIG } from '@/lib/category-helpers';

// Live simulated channels for the Hero Command Center
const HERO_CHANNELS = [
  {
    id: 'tech',
    tag: '#tech-founders-surat',
    name: 'Surat Tech & Startup Circle',
    category: 'Startups & AI',
    activeCount: 48,
    audioLive: true,
    audioTitle: 'Surat Dev Mixer & Demo Day Prep',
    audioSpeakers: ['Prayag B. (Founder)', 'Kavya T.', 'Meet S.'],
    messages: [
      {
        id: 1,
        user: 'Prayag Bagtharia',
        handle: '@prayag',
        badge: 'Admin · Founder',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        text: 'Surat AI Builders Demo Day locked in for Saturday at Vesu cafe! 🚀 24 seats left.',
        time: '2m ago',
        reactions: { '🔥': 14, '🚀': 9, '⚡': 6 },
      },
      {
        id: 2,
        user: 'Kavya Trivedi',
        handle: '@kavya_t',
        badge: 'YC W25 Applicant',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
        text: 'Demoing our local logistics edge engine. Bringing live hardware models!',
        time: '1m ago',
        reactions: { '🙌': 11, '💯': 8 },
      },
      {
        id: 3,
        user: 'Dr. Meet Shah',
        handle: '@meet_svnit',
        badge: 'SVNIT Research',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80',
        text: 'Just reserved 3 developer passes for our Piplod AI lab team.',
        time: 'Just now',
        reactions: { '❤️': 7 },
      },
    ],
  },
  {
    id: 'treks',
    tag: '#weekend-trekkers',
    name: 'Weekend Trekkers & Explorers',
    category: 'Outdoors & Trails',
    activeCount: 36,
    audioLive: false,
    audioTitle: 'Sunrise Dumas Cycling Route Briefing',
    audioSpeakers: ['Aarav M. (Guide)'],
    messages: [
      {
        id: 1,
        user: 'Aarav Mehta',
        handle: '@aarav_treks',
        badge: 'Trail Guide',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        text: 'Sunrise Dumas cycling circuit tomorrow at 5:45 AM. Helmets & hydration mandatory! 🚴‍♂️🌅',
        time: '6m ago',
        reactions: { '🌅': 19, '🚴': 14 },
      },
      {
        id: 2,
        user: 'Tanvi Raval',
        handle: '@tanvi_r',
        badge: 'Member',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
        text: 'Meeting at VR Mall junction. Bringing 3 riders from Adajan side!',
        time: '3m ago',
        reactions: { '✨': 8 },
      },
    ],
  },
  {
    id: 'foodies',
    tag: '#surat-foodies-club',
    name: 'Surat Foodies & Coffee Roasters',
    category: 'Cafes & Dining',
    activeCount: 62,
    audioLive: true,
    audioTitle: 'Hidden Specialty Cafes in Piplod & Vesu',
    audioSpeakers: ['Diya P. (Lead)', 'Rohan K.'],
    messages: [
      {
        id: 1,
        user: 'Diya Patel',
        handle: '@diya_eats',
        badge: 'Curator',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
        text: 'Discovered a micro-roastery tucked away near VIP Road with single-origin pour-overs ☕',
        time: '8m ago',
        reactions: { '☕': 24, '😋': 18 },
      },
      {
        id: 2,
        user: 'Rohan Kotak',
        handle: '@rohan_k',
        badge: 'Member',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
        text: 'Adding it to the official Sunday breakfast meetup RSVP list!',
        time: '2m ago',
        reactions: { '💯': 12 },
      },
    ],
  },
];

// Surat Geographic Hotspots for Radar
const RADAR_NODES = [
  { id: 'vesu', name: 'Vesu Tech Hub', coords: '21.144° N, 72.771° E', x: 68, y: 64, active: 38, note: 'AI Mixers & Coworking', trend: '+14% this wk' },
  { id: 'piplod', name: 'Piplod Cultural Strip', coords: '21.168° N, 72.788° E', x: 44, y: 46, active: 24, note: 'Specialty Coffee & Mixers', trend: 'High density' },
  { id: 'svnit', name: 'SVNIT University Node', coords: '21.163° N, 72.784° E', x: 54, y: 34, active: 46, note: 'Alumni & Tech Labs', trend: 'Verified only' },
  { id: 'dumas', name: 'Dumas Sunrise Trail', coords: '21.092° N, 72.712° E', x: 22, y: 82, active: 18, note: 'Weekend Cycling & Treks', trend: '5:45 AM peak' },
  { id: 'adajan', name: 'Adajan Creators Node', coords: '21.196° N, 72.798° E', x: 36, y: 22, active: 21, note: 'Founders & Designers', trend: '+8% this wk' },
];

export default function LandingPage() {
  // Hero Interactive States
  const [activeTab, setActiveTab] = useState<'stream' | 'radar' | 'ticket'>('stream');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('tech');
  const [fuzzRadius, setFuzzRadius] = useState<number>(300);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('vesu');
  const [reactions, setReactions] = useState<{ [key: string]: number }>({
    'tech-1-🔥': 14,
    'tech-1-🚀': 9,
    'tech-2-🙌': 11,
    'treks-1-🌅': 19,
    'foodies-1-☕': 24,
  });

  // Interactive Bento & Card States
  const [bentoCategory, setBentoCategory] = useState<string>('Custom');
  const [privacyMode, setPrivacyMode] = useState<'shielded' | 'raw'>('shielded');
  const [rsvpCount, setRsvpCount] = useState<number>(18);
  const [isRsvpd, setIsRsvpd] = useState<boolean>(false);

  // VIP Promo Pass State
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoStatus, setPromoStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // FAQ State
  const [activeFaqCategory, setActiveFaqCategory] = useState<string>('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleReactionClick = (key: string) => {
    setReactions((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1,
    }));
  };

  const handleApplyCode = (code: string) => {
    setPromoCode(code);
    setCopiedCode(code);
    const validCodes = ['FOUNDER2026', 'SURATVIP', 'CITYCIRCLE100', 'EARLYACCESS'];
    if (validCodes.includes(code.toUpperCase().trim())) {
      setPromoStatus('valid');
    } else {
      setPromoStatus('invalid');
    }
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleValidateInput = (e: React.FormEvent) => {
    e.preventDefault();
    const validCodes = ['FOUNDER2026', 'SURATVIP', 'CITYCIRCLE100', 'EARLYACCESS'];
    if (validCodes.includes(promoCode.toUpperCase().trim())) {
      setPromoStatus('valid');
    } else {
      setPromoStatus('invalid');
    }
  };

  const currentChannel = HERO_CHANNELS.find((c) => c.id === selectedChannelId) || HERO_CHANNELS[0];
  const currentNode = RADAR_NODES.find((n) => n.id === selectedNodeId) || RADAR_NODES[0];
  const activeBentoGroup = INITIAL_GROUPS.find((g) => g.category === bentoCategory) || {
    id: 'preview',
    name: `${bentoCategory} Circle Surat`,
    description: 'Hyper-local circle connecting verified Surat members.',
    category: bentoCategory as GroupCategory,
    member_count: 1,
    max_members: 256,
    cover_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    rules: 'Respect community members',
    is_public: true,
    admin_name: 'Prayag B.',
    created_at: new Date().toISOString(),
  };
  const bentoConfig = CATEGORY_CONFIG[activeBentoGroup.category as GroupCategory] || CATEGORY_CONFIG.Custom;
  const BentoIcon = bentoConfig.icon;

  const faqs = [
    {
      q: 'What is CityCircle Surat?',
      category: 'general',
      a: 'CityCircle Surat is the verified, hyper-local community platform connecting residents across tech startups, weekend trekking, food explorations, and university alumni in Surat, Gujarat. It combines real-time group chat with interactive venue discovery and offline event RSVPs.',
    },
    {
      q: 'How does CityCircle protect my location and privacy?',
      category: 'privacy',
      a: 'CityCircle enforces server-side location fuzzing. Your exact GPS point is never saved; instead, coordinates are blurred to a 300–500m radius and automatically purged from the database after 3 hours. You can revoke location sharing anytime using the instant panic button.',
    },
    {
      q: 'Are phone numbers and email addresses kept confidential?',
      category: 'privacy',
      a: 'Yes. Your phone number and email are locked behind strict PostgreSQL Row-Level Security (RLS) policies. Other circle members only ever see your chosen display name, avatar, and optional interest tags.',
    },
    {
      q: 'How do I find and join tech & startup meetups in Surat?',
      category: 'meetups',
      a: 'Join the Surat Tech & Startup Circle on CityCircle to connect with founders, engineers, and creators. The circle hosts monthly developer mixers, demo days, and AI hack sessions in Vesu and Piplod with 1-click RSVP.',
    },
    {
      q: 'How are community discussions and images moderated?',
      category: 'safety',
      a: 'All image uploads undergo automated moderation verification before public display. In compliance with India’s Information Technology Rules 2021, members can flag objectionable content for review by our dedicated Chief Grievance Officer within a 24-hour SLA.',
    },
    {
      q: 'What is the Founding Member Free Pass?',
      category: 'membership',
      a: 'The first 300–400 verified Surat members join with a 100% waived joining fee (₹0 instead of standard ₹250) using partner invite codes like FOUNDER2026 or SURATVIP.',
    },
  ];

  const filteredFaqs = activeFaqCategory === 'all' ? faqs : faqs.filter((f) => f.category === activeFaqCategory);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary relative overflow-x-hidden font-sans app-hero-mesh">
      <PWAInstallPrompt />

      {/* Warm Ambient Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-glow-breathe" />
        <div className="absolute top-[10%] right-[15%] w-[420px] h-[420px] rounded-full bg-accent/10 blur-[110px] animate-glow-breathe [animation-delay:3s]" />
      </div>

      {/* NAVIGATION BAR */}
      <header className="sticky top-0 z-50 px-4 sm:px-6 pt-4 pb-2">
        <nav className="max-w-6xl mx-auto h-16 rounded-2xl app-glass-card px-4 sm:px-6 flex items-center justify-between transition-all">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-lg shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              C
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-foreground font-heading">
                CityCircle
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-accent/20 text-accent-foreground rounded-full border border-accent/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Surat
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-muted-foreground">
            <a href="#hero-command" className="hover:text-foreground transition-colors">
              Command Deck
            </a>
            <a href="#guilds" className="hover:text-foreground transition-colors">
              Guilds
            </a>
            <a href="#privacy-vault" className="hover:text-foreground transition-colors">
              Privacy Vault
            </a>
            <a href="#founding-pass" className="hover:text-accent-foreground transition-colors flex items-center gap-1 text-accent font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Founding Pass
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-muted-foreground hover:text-foreground h-9 px-3.5">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold h-9 px-4 rounded-xl shadow-md shadow-primary/20 hover:scale-[1.02] transition-transform">
                Join Surat Cohort
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Eyebrow Chip */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full app-pill text-xs font-semibold text-foreground mb-8 border border-border shadow-xs animate-float-smooth">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-muted-foreground">Founding Member Pass:</span>
            <span className="font-bold text-primary">318 / 400 Claimed</span>
            <span className="text-border">·</span>
            <span className="text-accent font-bold">₹0 Free</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground font-heading leading-[1.12] mb-6">
            Real Surat Communities. <br />
            <span className="text-primary underline decoration-accent decoration-wavy decoration-3 underline-offset-8">
              Verified & Real-World.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
            The private local network for tech founders, weekend trekkers, specialty coffee foodies, and university alumni in Surat. 
            Zero contact exposure, 300–500m fuzzed maps, and offline meetups that actually happen.
          </p>

          {/* Dual Magnetic Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-10">
            <Link href="/auth/signup" className="w-full sm:w-auto flex-1">
              <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-black text-sm h-12 rounded-2xl shadow-md shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all">
                <span>Claim Free Pass</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#hero-command" className="w-full sm:w-auto flex-1">
              <Button variant="outline" size="lg" className="w-full h-12 rounded-2xl border-border bg-card/80 text-foreground font-semibold text-sm hover:bg-card transition-all">
                Explore Command Deck
              </Button>
            </a>
          </div>

          {/* Micro Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Phone Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-primary" />
              <span>PostgreSQL RLS Protected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              <span>300–500m Fuzzed GPS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Indian IT Rules 2021</span>
            </div>
          </div>
        </div>

        {/* HERO COMMAND CENTER (Interactive Living Console) */}
        <div
          id="hero-command"
          className="rounded-3xl app-glass-card overflow-hidden border border-border shadow-xl relative transition-all"
        >
          {/* Console Header Bar */}
          <div className="px-4 sm:px-6 py-3.5 bg-muted/60 border-b border-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-danger/80" />
                <span className="w-3 h-3 rounded-full bg-warning/80" />
                <span className="w-3 h-3 rounded-full bg-success/80" />
              </div>
              <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                citycircle://surat.hub/live-console
              </span>
            </div>

            {/* Interactive Console Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-background border border-border text-xs font-semibold">
              <button
                onClick={() => setActiveTab('stream')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'stream'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Live Feed</span>
              </button>
              <button
                onClick={() => setActiveTab('radar')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'radar'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Surat Radar</span>
              </button>
              <button
                onClick={() => setActiveTab('ticket')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'ticket'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Event Pass</span>
              </button>
            </div>
          </div>

          {/* Console Body */}
          <div className="p-4 sm:p-7 min-h-[400px] bg-card">
            {/* VIEW 1: LIVE FEED & AUDIO HOPS */}
            {activeTab === 'stream' && (
              <div>
                {/* Channel Selector Chips */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
                  {HERO_CHANNELS.map((ch) => {
                    const isSelected = selectedChannelId === ch.id;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => setSelectedChannelId(ch.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                          isSelected
                            ? 'bg-primary/15 text-primary border border-primary/30 shadow-xs'
                            : 'bg-muted/40 text-muted-foreground border border-transparent hover:bg-muted'
                        }`}
                      >
                        <span>{ch.tag}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        <span className="text-[10px] font-mono opacity-80">{ch.activeCount} online</span>
                      </button>
                    );
                  })}
                </div>

                {/* Live Audio Room Banner if Active */}
                {currentChannel.audioLive && (
                  <div className="mb-5 p-3.5 rounded-2xl bg-secondary/70 border border-primary/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 animate-pulse">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.2 rounded-full border border-primary/20">
                            Live Voice Room
                          </span>
                          <span className="text-xs font-bold text-foreground">{currentChannel.audioTitle}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Speakers: {currentChannel.audioSpeakers.join(' · ')}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-primary px-3 py-1 rounded-xl bg-primary/10 border border-primary/20 hidden sm:inline">
                      18 Listening
                    </span>
                  </div>
                )}

                {/* Simulated Message Cards */}
                <div className="space-y-3.5 max-w-2xl mx-auto">
                  {currentChannel.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 transition-all flex items-start gap-3.5"
                    >
                      <img
                        src={msg.avatar}
                        alt={msg.user}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-border"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">{msg.user}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">{msg.handle}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {msg.badge}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed mb-3">
                          {msg.text}
                        </p>

                        {/* Interactive Reaction Buttons */}
                        <div className="flex items-center gap-2">
                          {Object.entries(msg.reactions).map(([emoji, count]) => {
                            const reactionKey = `${currentChannel.id}-${msg.id}-${emoji}`;
                            const currentCount = reactions[reactionKey] ?? count;
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleReactionClick(reactionKey)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary text-xs font-semibold text-muted-foreground border border-border transition-all active:scale-95"
                              >
                                <span>{emoji}</span>
                                <span className="font-mono text-[11px]">{currentCount}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Pulse */}
                  <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                    </span>
                    <span className="text-[11px]">3 verified members active in this circle...</span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: SURAT RADAR & DENSITY MATRIX */}
            {activeTab === 'radar' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <div>
                    <div className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Radio className="w-4 h-4 text-primary animate-pulse" />
                      <span>Surat Proximity Matrix & Active Beacons</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Live anonymized density heatmap. Exact GPS is never stored.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Fuzzing Halo:</span>
                    <div className="flex p-0.5 rounded-xl bg-muted border border-border text-xs">
                      <button
                        onClick={() => setFuzzRadius(300)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all ${
                          fuzzRadius === 300 ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
                        }`}
                      >
                        300m (Venue)
                      </button>
                      <button
                        onClick={() => setFuzzRadius(500)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all ${
                          fuzzRadius === 500 ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
                        }`}
                      >
                        500m (Neighborhood)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Radar Grid Canvas */}
                <div className="relative h-72 sm:h-80 w-full rounded-2xl bg-secondary/40 border border-border overflow-hidden flex items-center justify-center">
                  {/* Glowing Radar Concentric Rings */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-36 h-36 rounded-full border border-primary animate-pulse-radar" />
                    <div className="w-64 h-64 rounded-full border border-primary/60" />
                    <div className="w-96 h-96 rounded-full border border-primary/30" />
                    <div className="w-full h-full border border-primary/20" />
                  </div>

                  {/* Stylized Tapi River SVG Graphic */}
                  <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 0 160 Q 250 80 500 180 T 1000 120" fill="none" stroke="#0F5257" strokeWidth="12" />
                    <path d="M 0 160 Q 250 80 500 180 T 1000 120" fill="none" stroke="#0F5257" strokeWidth="2" strokeDasharray="6 6" />
                  </svg>

                  {/* Hotspot Beacons */}
                  {RADAR_NODES.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    return (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        style={{ top: `${node.y}%`, left: `${node.x}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group transition-all z-10"
                      >
                        <div className="relative flex items-center justify-center">
                          {/* Fuzz Radius Visual Aura */}
                          <span
                            className={`absolute rounded-full border border-primary/30 bg-primary/10 transition-all ${
                              isSelected
                                ? fuzzRadius === 500 ? 'w-24 h-24 scale-125' : 'w-16 h-16 scale-110'
                                : 'w-10 h-10 opacity-40 group-hover:opacity-80'
                            }`}
                          />
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                              isSelected
                                ? 'bg-accent text-accent-foreground scale-125 ring-4 ring-accent/30'
                                : 'bg-primary text-primary-foreground group-hover:scale-110'
                            }`}
                          >
                            {node.active}
                          </div>
                        </div>

                        {/* Interactive Tooltip Card */}
                        <div
                          className={`absolute top-9 left-1/2 -translate-x-1/2 px-3 py-2 rounded-xl bg-card border border-border text-xs whitespace-nowrap shadow-xl transition-all z-20 ${
                            isSelected
                              ? 'opacity-100 scale-100'
                              : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                          }`}
                        >
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span>{node.name}</span>
                          </div>
                          <div className="text-[10px] text-primary font-semibold mt-0.5">{node.note} · {node.active} active now</div>
                          <div className="text-[9px] font-mono text-muted-foreground">{node.coords} ({node.trend})</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 3: EVENT PASS MOCKUP */}
            {activeTab === 'ticket' && (
              <div className="max-w-xl mx-auto py-2">
                <div className="p-6 rounded-3xl bg-secondary/50 border-2 border-dashed border-border relative overflow-hidden holographic-gold shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                      Surat Tech & Startup Circle
                    </span>
                    <span className="text-xs font-black text-accent bg-accent/15 px-3 py-1 rounded-full border border-accent/30">
                      VIP PASS · ₹0 FREE
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-foreground font-heading mb-2">
                    Surat AI & Founder Mixer #04
                  </h3>
                  <div className="space-y-1.5 text-xs text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>Saturday, Oct 18 · 5:30 PM – 8:30 PM IST</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>The Roastery Cafe, VIP Road, Vesu, Surat</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-foreground">
                        <span className="text-primary font-bold">{rsvpCount}</span> / 24 Seats Filled
                      </div>
                      <div className="text-[10px] text-muted-foreground">Coffee & Demo Slots Included</div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => {
                        if (!isRsvpd) {
                          setIsRsvpd(true);
                          setRsvpCount((c) => c + 1);
                        }
                      }}
                      className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all ${
                        isRsvpd
                          ? 'bg-success text-white shadow-xs'
                          : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      }`}
                    >
                      {isRsvpd ? '✓ RSVP Confirmed!' : 'Simulate 1-Click RSVP'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MARQUEE TICKER */}
      <div className="w-full bg-muted/50 border-y border-border py-3.5 overflow-hidden">
        <div className="animate-marquee items-center gap-8 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-foreground">⚡ Surat Tech Circle hosted AI Mixer at Vesu</span>
          </div>
          <span className="text-border">/</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-foreground">100% Phone Verified & Indian IT Rules 2021 Compliant</span>
          </div>
          <span className="text-border">/</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-foreground">🚴 Dumas Sunrise Ride organized with 14 RSVPs</span>
          </div>
          <span className="text-border">/</span>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-foreground">PostgreSQL Row-Level Security: Zero Contact Leak</span>
          </div>
          <span className="text-border">/</span>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-accent" />
            <span className="text-foreground">🎓 34 SVNIT Alumni joined this week</span>
          </div>
          <span className="text-border">/</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-foreground">☕ Surat Foodies discovered new artisanal roasters in Piplod</span>
          </div>
          <span className="text-border">/</span>
        </div>
      </div>

      {/* BENTO GRID */}
      <section id="guilds" className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
            Architecture of Trust
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground tracking-tight mb-3">
            Designed for Real Communities. Built for Total Safety.
          </h2>
          <p className="text-sm text-muted-foreground">
            A verified platform built to eliminate spam WhatsApp groups and replace them with focused local interest circles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* BENTO 1: Interactive Circle Discovery (Span 7) */}
          <div className="md:col-span-7 rounded-3xl app-glass-card app-glass-card-hover p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  1. Live Circle Discovery
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  5 Categories Active
                </span>
              </div>

              {/* Guild Selector Chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORIES.map((cat) => {
                  const cfg = CATEGORY_CONFIG[cat];
                  const Icon = cfg.icon;
                  const isSelected = bentoCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setBentoCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-xs scale-105'
                          : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>

              {/* Featured Circle Card */}
              <div className="rounded-2xl border border-border overflow-hidden bg-background">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={activeBentoGroup.cover_url}
                    alt={activeBentoGroup.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-card/90 backdrop-blur-md text-foreground border border-border">
                      <BentoIcon className="w-3.5 h-3.5" style={{ color: bentoConfig.color }} />
                      {activeBentoGroup.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-bold text-foreground border border-border">
                    {activeBentoGroup.member_count} / {activeBentoGroup.max_members} members
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-1.5">{activeBentoGroup.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                    {activeBentoGroup.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
                    <span className="text-muted-foreground">Host: <strong className="text-foreground">{activeBentoGroup.admin_name}</strong></span>
                    <Link href={`/groups/${activeBentoGroup.id}`}>
                      <Button size="sm" variant="outline" className="text-xs font-bold h-8 px-3.5 hover:bg-primary hover:text-primary-foreground">
                        Preview Circle
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BENTO 2: Privacy Vault (Span 5) */}
          <div id="privacy-vault" className="md:col-span-5 rounded-3xl app-glass-card app-glass-card-hover p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  2. Privacy Vault
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-bold border border-primary/20">
                  Postgres RLS Locked
                </span>
              </div>

              <h3 className="text-xl font-bold font-heading text-foreground mb-2">
                Server-Side GPS Fuzzing
              </h3>
              <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                Raw coordinates and phone numbers are isolated and never broadcasted to peers.
              </p>

              {/* Interactive Privacy Simulation Switcher */}
              <div className="p-4 rounded-2xl bg-muted/60 border border-border space-y-3 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Data Exposure View:</span>
                  <div className="flex p-0.5 rounded-lg bg-card border border-border text-[11px] font-bold">
                    <button
                      onClick={() => setPrivacyMode('shielded')}
                      className={`px-2.5 py-1 rounded transition-all ${
                        privacyMode === 'shielded' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
                      }`}
                    >
                      Shielded Peer View
                    </button>
                    <button
                      onClick={() => setPrivacyMode('raw')}
                      className={`px-2.5 py-1 rounded transition-all ${
                        privacyMode === 'raw' ? 'bg-danger text-white' : 'text-muted-foreground'
                      }`}
                    >
                      Raw Device
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-border text-xs space-y-2.5">
                  {privacyMode === 'shielded' ? (
                    <>
                      <div className="flex items-center justify-between text-primary">
                        <span className="flex items-center gap-1.5 font-bold">
                          <EyeOff className="w-3.5 h-3.5" /> Phone Number & Email
                        </span>
                        <span className="font-mono text-[11px] text-success font-bold">PROTECTED (RLS)</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1.5 font-medium text-foreground">
                          <MapPin className="w-3.5 h-3.5 text-primary" /> GPS Coordinates
                        </span>
                        <span className="font-mono text-[11px] text-primary font-semibold">Fuzzed ~420m (Vesu)</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-danger font-medium">
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" /> Raw GPS Coordinates
                        </span>
                        <span className="font-mono text-[11px]">21.1442° N, 72.7719° E</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        ⚠️ Raw coordinates are auto-scrambled before database insertion.
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t border-border">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Auto-purged after 3 hours + Instant 1-tap panic button</span>
            </div>
          </div>

          {/* BENTO 3: Holographic Pass VIP Generator (Span 6) */}
          <div id="founding-pass" className="md:col-span-6 rounded-3xl app-glass-card app-glass-card-hover p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  3. VIP Founding Pass
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  First 400 Members
                </span>
              </div>

              <h3 className="text-xl font-bold font-heading text-foreground mb-2">
                Unlock ₹0 Free Founding Access
              </h3>
              <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                Click one of our partner codes to auto-validate and claim your lifetime founding pass:
              </p>

              {/* Quick Code Buttons */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {['FOUNDER2026', 'SURATVIP', 'CITYCIRCLE100'].map((code) => (
                  <button
                    key={code}
                    onClick={() => handleApplyCode(code)}
                    className="px-3 py-1.5 rounded-xl bg-accent/15 hover:bg-accent/25 text-accent-foreground text-xs font-mono font-bold border border-accent/30 transition-all flex items-center gap-1.5"
                  >
                    <span>{code}</span>
                    {copiedCode === code ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3 opacity-60" />}
                  </button>
                ))}
              </div>

              <form onSubmit={handleValidateInput} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setPromoStatus('idle');
                  }}
                  placeholder="Enter Code (e.g. FOUNDER2026)"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-card text-foreground font-mono font-bold text-xs uppercase tracking-wider focus:outline-hidden focus:ring-2 focus:ring-primary transition-all"
                />
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-5 rounded-xl shadow-xs"
                >
                  Verify
                </Button>
              </form>

              {promoStatus === 'valid' && (
                <div className="p-3 bg-success/15 border border-success/30 rounded-xl text-xs text-success font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Valid Code! VIP ₹0 Founding Pass unlocked.</span>
                </div>
              )}
              {promoStatus === 'invalid' && (
                <div className="p-3 bg-danger/15 border border-danger/30 rounded-xl text-xs text-danger font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Invalid code. Tap FOUNDER2026 above to test.</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <Link href="/auth/signup">
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-black text-xs h-10 rounded-xl shadow-md shadow-accent/20 transition-all">
                  Claim Membership & Register
                </Button>
              </Link>
            </div>
          </div>

          {/* BENTO 4: Safety & Moderation (Span 6) */}
          <div className="md:col-span-6 rounded-3xl app-glass-card app-glass-card-hover p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  4. Indian IT Rules 2021
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  24h Grievance SLA
                </span>
              </div>

              <h3 className="text-xl font-bold font-heading text-foreground mb-2">
                Pre-Moderated Media & Verified Community
              </h3>
              <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                Dedicated local moderation in Surat ensures civil discussions with rapid grievance resolution.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3.5 rounded-2xl bg-muted/50 border border-border">
                  <ShieldCheck className="w-5 h-5 text-primary mb-2" />
                  <div className="text-xs font-bold text-foreground mb-1">Pre-Screened Uploads</div>
                  <div className="text-[11px] text-muted-foreground">Automated media screening pipeline.</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/50 border border-border">
                  <Clock className="w-5 h-5 text-accent mb-2" />
                  <div className="text-xs font-bold text-foreground mb-1">24h Grievance SLA</div>
                  <div className="text-[11px] text-muted-foreground">Surat Grievance Officer reviews all flags.</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
              <Link href="/grievance" className="text-primary font-semibold hover:underline flex items-center gap-1">
                View Grievance Officer Details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SURAT LOCAL VOICES */}
      <section className="py-16 md:py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-border">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
            Surat Community Voices
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
            What Surat Locals Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl app-glass-card flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-foreground/90 italic leading-relaxed mb-6">
              &quot;Met our AI startup co-founder at the Vesu Dev Mixer through CityCircle. Clean, verified, and zero spam.&quot;
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                KB
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Kavya B.</div>
                <div className="text-[11px] text-muted-foreground">Founder, Surat Tech Circle</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl app-glass-card flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-foreground/90 italic leading-relaxed mb-6">
              &quot;The 300–500m location fuzzing gives complete peace of mind. Great for sunrise Dumas cycling squads.&quot;
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <div className="w-9 h-9 rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center font-bold text-xs">
                PS
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Pratik S.</div>
                <div className="text-[11px] text-muted-foreground">Lead, Surat Cycling Club</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl app-glass-card flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-foreground/90 italic leading-relaxed mb-6">
              &quot;SVNIT college alumni badge makes professional networking credible without noisy WhatsApp clutter.&quot;
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                MS
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Dr. Meet S.</div>
                <div className="text-[11px] text-muted-foreground">SVNIT Alum & Researcher</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AEO INTERACTIVE FAQ */}
      <section id="faq" className="py-16 md:py-20 px-4 sm:px-6 max-w-4xl mx-auto w-full border-t border-border">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Frequently Asked Questions</span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground mt-1 mb-3">
            Everything You Need to Know
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Definitive answers for members and search engines.
          </p>
        </div>

        {/* FAQ Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'general', label: 'General' },
            { id: 'privacy', label: 'Privacy & GPS' },
            { id: 'meetups', label: 'Meetups' },
            { id: 'safety', label: 'Safety & IT Rules' },
            { id: 'membership', label: 'VIP Pass' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFaqCategory(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFaqCategory === tab.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Accordion Items */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl app-glass-card overflow-hidden transition-all hover:border-primary/40"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-foreground"
                >
                  <span>{faq.q}</span>
                  <span className="p-1 rounded-lg bg-muted text-muted-foreground shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-border bg-card/60 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <span className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-xs">
                C
              </span>
              <span>CityCircle Surat</span>
            </div>
            <span className="hidden sm:inline">·</span>
            <span>Hyper-Local Verified Community Platform (v0.5.0)</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="/grievance" className="hover:text-primary transition-colors underline">
              Grievance Officer (IT Rules 2021)
            </Link>
            <a
              href="/llms.txt"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors font-mono text-[11px] px-2 py-0.5 rounded bg-muted border border-border"
            >
              llms.txt (AI Knowledge)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
