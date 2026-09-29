'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Flame,
  Volume2,
  Activity,
  Layers,
  Compass,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { INITIAL_GROUPS } from '@/lib/data';
import { CATEGORY_CONFIG } from '@/lib/category-helpers';

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
        text: 'Surat AI Builders Demo Day locked in for Saturday at Vesu! 🚀 24 seats left.',
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

  // Mouse Spotlight Tracking for Awwwards-grade luxury glow
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
  const activeBentoGroup = INITIAL_GROUPS.find((g) => g.category === bentoCategory) || INITIAL_GROUPS[0];
  const bentoConfig = CATEGORY_CONFIG[activeBentoGroup.category];
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
    <div
      ref={containerRef}
      className="min-h-screen bg-[#070A0C] text-[#F3F4F6] selection:bg-teal-400/20 selection:text-teal-300 relative overflow-x-hidden font-sans dark-grid-bg"
    >
      <PWAInstallPrompt />

      {/* Floating Ambient Aura Glows (Awwwards SOTA Atmosphere) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[700px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[550px] h-[550px] rounded-full bg-teal-500/12 blur-[140px] animate-glow-breathe" />
        <div className="absolute top-[10%] right-[15%] w-[480px] h-[480px] rounded-full bg-amber-500/8 blur-[130px] animate-glow-breathe [animation-delay:3s]" />
      </div>

      {/* NAVIGATION BAR */}
      <header className="sticky top-0 z-50 px-4 sm:px-6 pt-4 pb-2">
        <nav className="max-w-6xl mx-auto h-14 rounded-2xl glass-panel px-4 sm:px-6 flex items-center justify-between transition-all">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-[#070A0C] font-black text-base shadow-[0_0_20px_rgba(45,212,191,0.4)] group-hover:scale-105 transition-transform">
              C
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-white font-heading">
                CityCircle
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-400/10 text-teal-300 rounded-full border border-teal-400/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                Surat
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-neutral-400">
            <a href="#hero-command" className="hover:text-white transition-colors">
              Command Deck
            </a>
            <a href="#guilds" className="hover:text-white transition-colors">
              Guilds
            </a>
            <a href="#privacy-vault" className="hover:text-white transition-colors">
              Privacy Vault
            </a>
            <a href="#founding-pass" className="hover:text-amber-300 transition-colors flex items-center gap-1 text-amber-400 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Founding Pass
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <button className="text-xs font-semibold text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
                Sign In
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="text-xs font-bold bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 text-[#070A0C] px-4 py-2 rounded-xl shadow-[0_0_25px_rgba(45,212,191,0.35)] hover:scale-105 transition-all active:scale-95">
                Join Surat Cohort
              </button>
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Eyebrow Chip */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-semibold text-neutral-300 mb-8 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] animate-float-smooth">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
            </span>
            <span className="text-neutral-400">Founding Member Pass:</span>
            <span className="font-bold text-teal-300">318 / 400 Claimed</span>
            <span className="text-neutral-500">·</span>
            <span className="text-amber-300 font-bold">₹0 Free</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-[-0.04em] text-white font-heading leading-[1.08] mb-6">
            Real Surat Communities. <br />
            <span className="text-gradient-primary">
              Verified & Real-World.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
            The private local network for tech founders, weekend trekkers, specialty coffee foodies, and university alumni in Surat. 
            Zero phone leaks, 300–500m fuzzed maps, and offline meetups that actually happen.
          </p>

          {/* Dual Magnetic Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-10">
            <Link href="/auth/signup" className="w-full sm:w-auto flex-1">
              <button className="w-full bg-gradient-to-r from-teal-400 via-teal-300 to-teal-400 text-[#070A0C] font-black text-sm h-12 px-6 rounded-2xl shadow-[0_0_35px_rgba(45,212,191,0.45)] hover:shadow-[0_0_50px_rgba(45,212,191,0.6)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                <span>Claim Free Pass</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <a href="#hero-command" className="w-full sm:w-auto flex-1">
              <button className="w-full h-12 glass-panel hover:bg-white/10 text-white font-semibold text-sm px-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2">
                <span>Explore Command Deck</span>
              </button>
            </a>
          </div>

          {/* Micro Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-neutral-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Phone Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-teal-400" />
              <span>PostgreSQL RLS Protected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>300–500m Fuzzed GPS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Indian IT Rules 2021</span>
            </div>
          </div>
        </div>

        {/* HERO COMMAND CENTER (Interactive Living Console) */}
        <div
          id="hero-command"
          className="rounded-3xl glass-panel overflow-hidden border border-white/10 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.8)] relative transition-all"
        >
          {/* Console Header Bar */}
          <div className="px-4 sm:px-6 py-3.5 bg-[#0B1013]/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-teal-500/80" />
              </div>
              <span className="text-xs font-mono text-neutral-400 hidden sm:inline">
                citycircle://surat.hub/live-console
              </span>
            </div>

            {/* Interactive Console Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('stream')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'stream'
                    ? 'bg-gradient-to-r from-teal-400 to-teal-500 text-black font-bold shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Live Feed</span>
              </button>
              <button
                onClick={() => setActiveTab('radar')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'radar'
                    ? 'bg-gradient-to-r from-teal-400 to-teal-500 text-black font-bold shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Surat Radar</span>
              </button>
              <button
                onClick={() => setActiveTab('ticket')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'ticket'
                    ? 'bg-gradient-to-r from-teal-400 to-teal-500 text-black font-bold shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Event Ticket</span>
              </button>
            </div>
          </div>

          {/* Console Body */}
          <div className="p-4 sm:p-7 min-h-[420px] bg-[#070A0C]/90">
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
                            ? 'bg-teal-400/15 text-teal-300 border border-teal-400/40 shadow-[0_0_15px_rgba(45,212,191,0.2)]'
                            : 'bg-white/5 text-neutral-400 border border-white/5 hover:bg-white/10 hover:text-neutral-200'
                        }`}
                      >
                        <span>{ch.tag}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                        <span className="text-[10px] font-mono text-neutral-400">{ch.activeCount} online</span>
                      </button>
                    );
                  })}
                </div>

                {/* Live Audio Room Banner if Active */}
                {currentChannel.audioLive && (
                  <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-teal-950/60 via-[#0B1416] to-[#070A0C] border border-teal-500/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center shrink-0 animate-pulse">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-400/10 px-2 py-0.2 rounded-full border border-teal-400/20">
                            Live Voice Room
                          </span>
                          <span className="text-xs font-bold text-white">{currentChannel.audioTitle}</span>
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          Speakers: {currentChannel.audioSpeakers.join(' · ')}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-teal-300 px-3 py-1 rounded-xl bg-teal-400/10 border border-teal-400/20 hidden sm:inline">
                      18 Listening
                    </span>
                  </div>
                )}

                {/* Simulated Message Cards */}
                <div className="space-y-3.5 max-w-2xl mx-auto">
                  {currentChannel.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-4 rounded-2xl bg-[#0B1013]/90 border border-white/8 hover:border-teal-500/30 transition-all flex items-start gap-3.5 shadow-sm"
                    >
                      <img
                        src={msg.avatar}
                        alt={msg.user}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 ring-1 ring-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{msg.user}</span>
                            <span className="text-[10px] font-mono text-neutral-400">{msg.handle}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-teal-400/10 text-teal-300 border border-teal-400/20">
                              {msg.badge}
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-500">{msg.time}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-3">
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
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-teal-400/15 hover:text-teal-300 text-xs font-semibold text-neutral-300 border border-white/8 hover:border-teal-400/30 transition-all active:scale-95"
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
                  <div className="flex items-center gap-2 px-2 py-1 text-xs text-neutral-400">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]" />
                    </span>
                    <span className="text-[11px]">3 verified members active in this circle...</span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: SURAT RADAR & DENSITY MATRIX */}
            {activeTab === 'radar' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/8">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <Radio className="w-4 h-4 text-teal-400 animate-pulse" />
                      <span>Surat Proximity Matrix & Active Beacons</span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Live anonymized density heatmap. Exact GPS is never stored.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-400">Fuzzing Halo:</span>
                    <div className="flex p-0.5 rounded-xl bg-black/50 border border-white/10 text-xs">
                      <button
                        onClick={() => setFuzzRadius(300)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all ${
                          fuzzRadius === 300 ? 'bg-teal-400 text-black shadow-xs' : 'text-neutral-400'
                        }`}
                      >
                        300m (Venue)
                      </button>
                      <button
                        onClick={() => setFuzzRadius(500)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all ${
                          fuzzRadius === 500 ? 'bg-teal-400 text-black shadow-xs' : 'text-neutral-400'
                        }`}
                      >
                        500m (Neighborhood)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Radar Grid Canvas */}
                <div className="relative h-72 sm:h-80 w-full rounded-2xl bg-[#05080A] border border-white/10 overflow-hidden flex items-center justify-center">
                  {/* Glowing Radar Concentric Rings */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                    <div className="w-36 h-36 rounded-full border border-teal-400 animate-pulse-radar" />
                    <div className="w-64 h-64 rounded-full border border-teal-400/60" />
                    <div className="w-96 h-96 rounded-full border border-teal-400/30" />
                    <div className="w-full h-full border border-teal-400/20" />
                  </div>

                  {/* Stylized Tapi River SVG Graphic */}
                  <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 0 160 Q 250 80 500 180 T 1000 120" fill="none" stroke="#2DD4BF" strokeWidth="12" />
                    <path d="M 0 160 Q 250 80 500 180 T 1000 120" fill="none" stroke="#A5F3FC" strokeWidth="2" strokeDasharray="6 6" />
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
                            className={`absolute rounded-full border border-teal-400/30 bg-teal-400/10 transition-all ${
                              isSelected
                                ? fuzzRadius === 500 ? 'w-24 h-24 scale-125' : 'w-16 h-16 scale-110'
                                : 'w-10 h-10 opacity-40 group-hover:opacity-80'
                            }`}
                          />
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-lg ${
                              isSelected
                                ? 'bg-amber-400 text-black scale-125 ring-4 ring-amber-400/30 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
                                : 'bg-teal-400 text-black group-hover:scale-110 shadow-[0_0_15px_rgba(45,212,191,0.5)]'
                            }`}
                          >
                            {node.active}
                          </div>
                        </div>

                        {/* Interactive Tooltip Card */}
                        <div
                          className={`absolute top-9 left-1/2 -translate-x-1/2 px-3 py-2 rounded-xl bg-[#0B1013]/95 border border-teal-400/40 text-xs whitespace-nowrap shadow-2xl transition-all z-20 ${
                            isSelected
                              ? 'opacity-100 scale-100'
                              : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                          }`}
                        >
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                            <span>{node.name}</span>
                          </div>
                          <div className="text-[10px] text-teal-300 mt-0.5">{node.note} · {node.active} active now</div>
                          <div className="text-[9px] font-mono text-neutral-400">{node.coords} ({node.trend})</div>
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
                <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0E1518] via-[#090D0F] to-[#0E1518] border-2 border-teal-400/30 relative overflow-hidden holographic-sheen shadow-[0_0_40px_rgba(45,212,191,0.15)]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-teal-300 bg-teal-400/10 px-3 py-1 rounded-full border border-teal-400/20">
                      Surat Tech & Startup Circle
                    </span>
                    <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                      VIP PASS · ₹0 FREE
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white font-heading mb-2">
                    Surat AI & Founder Mixer #04
                  </h3>
                  <div className="space-y-1.5 text-xs text-neutral-300 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-400" />
                      <span>Saturday, Oct 18 · 5:30 PM – 8:30 PM IST</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-teal-400" />
                      <span>The Roastery Cafe, VIP Road, Vesu, Surat</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">
                        <span className="text-teal-300 font-bold">{rsvpCount}</span> / 24 Seats Filled
                      </div>
                      <div className="text-[10px] text-neutral-400">Coffee & Demo Slots Included</div>
                    </div>

                    <button
                      onClick={() => {
                        if (!isRsvpd) {
                          setIsRsvpd(true);
                          setRsvpCount((c) => c + 1);
                        }
                      }}
                      className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all ${
                        isRsvpd
                          ? 'bg-teal-400 text-black shadow-[0_0_20px_rgba(45,212,191,0.5)]'
                          : 'bg-white text-black hover:bg-neutral-200'
                      }`}
                    >
                      {isRsvpd ? '✓ RSVP Confirmed!' : 'Simulate 1-Click RSVP'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* OBSIDIAN MARQUEE TICKER */}
      <div className="w-full bg-[#05080A] border-y border-white/8 py-3.5 overflow-hidden">
        <div className="animate-marquee items-center gap-8 text-xs font-semibold text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-neutral-200">⚡ Surat Tech Circle hosted AI Mixer at Vesu</span>
          </div>
          <span className="text-white/10">/</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span className="text-neutral-200">100% Phone Verified & Indian IT Rules 2021 Compliant</span>
          </div>
          <span className="text-white/10">/</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-neutral-200">🚴 Dumas Sunrise Ride organized with 14 RSVPs</span>
          </div>
          <span className="text-white/10">/</span>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-400" />
            <span className="text-neutral-200">PostgreSQL Row-Level Security: Zero Contact Leak</span>
          </div>
          <span className="text-white/10">/</span>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-neutral-200">🎓 34 SVNIT Alumni joined this week</span>
          </div>
          <span className="text-white/10">/</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-neutral-200">☕ Surat Foodies discovered new artisanal roasters in Piplod</span>
          </div>
          <span className="text-white/10">/</span>
        </div>
      </div>

      {/* AWWWARDS BENTO GRID */}
      <section id="guilds" className="py-20 md:py-28 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2">
            Architecture of Trust
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-heading text-white tracking-tight mb-4">
            Designed for Real Communities. Built for Total Safety.
          </h2>
          <p className="text-sm text-neutral-400">
            A high-craft platform built to eliminate spam WhatsApp groups and replace them with verified local interest circles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* BENTO 1: Interactive Circle Discovery (Span 7) */}
          <div className="md:col-span-7 rounded-3xl glass-panel glass-panel-hover p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  1. Live Circle Discovery
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  5 Guilds Active
                </span>
              </div>

              {/* Guild Selector Chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                {INITIAL_GROUPS.map((g) => {
                  const cfg = CATEGORY_CONFIG[g.category];
                  const Icon = cfg.icon;
                  const isSelected = bentoCategory === g.category;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setBentoCategory(g.category)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-teal-400 text-black shadow-[0_0_15px_rgba(45,212,191,0.4)] scale-105'
                          : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{g.category}</span>
                    </button>
                  );
                })}
              </div>

              {/* Featured Circle Card */}
              <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#070A0C]/90">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={activeBentoGroup.cover_url}
                    alt={activeBentoGroup.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black/80 backdrop-blur-md text-white border border-white/10">
                      <BentoIcon className="w-3.5 h-3.5" style={{ color: bentoConfig.color }} />
                      {activeBentoGroup.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-bold text-white border border-white/10">
                    {activeBentoGroup.member_count} / {activeBentoGroup.max_members} members
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">{activeBentoGroup.name}</h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 mb-4 leading-relaxed">
                    {activeBentoGroup.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                    <span className="text-neutral-400">Host: <strong className="text-white">{activeBentoGroup.admin_name}</strong></span>
                    <Link href={`/groups/${activeBentoGroup.id}`}>
                      <button className="bg-white/10 hover:bg-teal-400 hover:text-black text-white text-xs font-bold px-3.5 py-1.5 rounded-xl border border-white/10 hover:border-transparent transition-all flex items-center gap-1">
                        Preview Circle
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BENTO 2: Privacy Vault (Span 5) */}
          <div id="privacy-vault" className="md:col-span-5 rounded-3xl glass-panel glass-panel-hover p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  2. Privacy Vault
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-400/10 text-teal-300 font-bold border border-teal-400/20">
                  Postgres RLS Locked
                </span>
              </div>

              <h3 className="text-xl font-bold font-heading text-white mb-2">
                Server-Side GPS Fuzzing
              </h3>
              <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                Raw coordinates and phone numbers are isolated and never broadcasted to peers.
              </p>

              {/* Interactive Privacy Simulation Switcher */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-300">Data Exposure View:</span>
                  <div className="flex p-0.5 rounded-lg bg-black/60 border border-white/10 text-[11px] font-bold">
                    <button
                      onClick={() => setPrivacyMode('shielded')}
                      className={`px-2.5 py-1 rounded transition-all ${
                        privacyMode === 'shielded' ? 'bg-teal-400 text-black shadow-xs' : 'text-neutral-400'
                      }`}
                    >
                      Shielded Peer View
                    </button>
                    <button
                      onClick={() => setPrivacyMode('raw')}
                      className={`px-2.5 py-1 rounded transition-all ${
                        privacyMode === 'raw' ? 'bg-rose-500 text-white' : 'text-neutral-400'
                      }`}
                    >
                      Raw Device
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#070A0C] border border-white/10 text-xs space-y-2.5">
                  {privacyMode === 'shielded' ? (
                    <>
                      <div className="flex items-center justify-between text-teal-400">
                        <span className="flex items-center gap-1.5 font-bold">
                          <EyeOff className="w-3.5 h-3.5" /> Phone Number & Email
                        </span>
                        <span className="font-mono text-[11px]">PROTECTED (RLS)</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-300">
                        <span className="flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-teal-400" /> GPS Coordinates
                        </span>
                        <span className="font-mono text-[11px] text-teal-300">Fuzzed ~420m (Vesu)</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-rose-400 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" /> Raw GPS Coordinates
                        </span>
                        <span className="font-mono text-[11px]">21.1442° N, 72.7719° E</span>
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        ⚠️ Raw coordinates are auto-scrambled before database insertion.
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-400 pt-4 border-t border-white/10">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Auto-purged after 3 hours + Instant 1-tap panic button</span>
            </div>
          </div>

          {/* BENTO 3: Holographic Pass VIP Generator (Span 6) */}
          <div id="founding-pass" className="md:col-span-6 rounded-3xl glass-panel glass-panel-hover p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  3. VIP Founding Pass
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  First 400 Members
                </span>
              </div>

              <h3 className="text-xl font-bold font-heading text-white mb-2">
                Unlock ₹0 Free Founding Access
              </h3>
              <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
                Click one of our partner codes to auto-validate and claim your lifetime founding badge:
              </p>

              {/* Quick Code Buttons */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {['FOUNDER2026', 'SURATVIP', 'CITYCIRCLE100'].map((code) => (
                  <button
                    key={code}
                    onClick={() => handleApplyCode(code)}
                    className="px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-xs font-mono font-bold border border-amber-400/30 transition-all flex items-center gap-1.5"
                  >
                    <span>{code}</span>
                    {copiedCode === code ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3 opacity-60" />}
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
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white font-mono font-bold text-xs uppercase tracking-wider focus:outline-hidden focus:border-teal-400 transition-all"
                />
                <button
                  type="submit"
                  className="bg-white hover:bg-neutral-200 text-black font-bold text-xs px-5 rounded-xl transition-all"
                >
                  Verify
                </button>
              </form>

              {promoStatus === 'valid' && (
                <div className="p-3 bg-teal-400/15 border border-teal-400/30 rounded-xl text-xs text-teal-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Valid Code! VIP ₹0 Founding Pass unlocked.</span>
                </div>
              )}
              {promoStatus === 'invalid' && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Invalid code. Tap FOUNDER2026 above to test.</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10">
              <Link href="/auth/signup">
                <button className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-xs h-10 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all">
                  Claim Membership & Register
                </button>
              </Link>
            </div>
          </div>

          {/* BENTO 4: Safety & Moderation (Span 6) */}
          <div className="md:col-span-6 rounded-3xl glass-panel glass-panel-hover p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  4. Indian IT Rules 2021
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  24h Grievance SLA
                </span>
              </div>

              <h3 className="text-xl font-bold font-heading text-white mb-2">
                Pre-Moderated Media & Verified Community
              </h3>
              <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                Dedicated local moderation in Surat ensures civil discussions with rapid grievance resolution.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <ShieldCheck className="w-5 h-5 text-teal-400 mb-2" />
                  <div className="text-xs font-bold text-white mb-1">Pre-Screened Uploads</div>
                  <div className="text-[11px] text-neutral-400">Automated media screening pipeline.</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <Clock className="w-5 h-5 text-amber-400 mb-2" />
                  <div className="text-xs font-bold text-white mb-1">24h Grievance SLA</div>
                  <div className="text-[11px] text-neutral-400">Surat Grievance Officer reviews all flags.</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <Link href="/grievance" className="text-teal-300 font-semibold hover:underline flex items-center gap-1">
                View Grievance Officer Details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SURAT LOCAL VOICES */}
      <section className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-white/8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2">
            Surat Community Voices
          </div>
          <h2 className="text-2xl sm:text-4xl font-black font-heading text-white">
            What Surat Locals Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl glass-panel flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-neutral-300 italic leading-relaxed mb-6">
              &quot;Met our AI startup co-founder at the Vesu Dev Mixer through CityCircle. Clean, verified, and zero spam.&quot;
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <div className="w-9 h-9 rounded-full bg-teal-400/20 text-teal-300 flex items-center justify-center font-bold text-xs">
                KB
              </div>
              <div>
                <div className="text-xs font-bold text-white">Kavya B.</div>
                <div className="text-[11px] text-neutral-400">Founder, Surat Tech Circle</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-panel flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-neutral-300 italic leading-relaxed mb-6">
              &quot;The 300–500m location fuzzing gives complete peace of mind. Great for sunrise Dumas cycling squads.&quot;
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <div className="w-9 h-9 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                AM
              </div>
              <div>
                <div className="text-xs font-bold text-white">Aarav M.</div>
                <div className="text-[11px] text-neutral-400">Lead, Weekend Trekkers</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-panel flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-neutral-300 italic leading-relaxed mb-6">
              &quot;SVNIT college alumni badge makes professional networking credible without noisy WhatsApp clutter.&quot;
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <div className="w-9 h-9 rounded-full bg-teal-400/20 text-teal-300 flex items-center justify-center font-bold text-xs">
                MS
              </div>
              <div>
                <div className="text-xs font-bold text-white">Dr. Meet S.</div>
                <div className="text-[11px] text-neutral-400">SVNIT Alum & Researcher</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AEO INTERACTIVE FAQ */}
      <section id="faq" className="py-16 md:py-24 px-4 sm:px-6 max-w-4xl mx-auto w-full border-t border-white/8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Frequently Asked Questions</span>
          <h2 className="text-2xl sm:text-4xl font-black font-heading text-white mt-1 mb-3">
            Everything You Need to Know
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
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
                  ? 'bg-teal-400 text-black shadow-md'
                  : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
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
                className="rounded-2xl glass-panel overflow-hidden transition-all hover:border-teal-500/30"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white"
                >
                  <span>{faq.q}</span>
                  <span className="p-1 rounded-lg bg-white/5 text-neutral-400 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-teal-400" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-white/8">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-white/8 bg-[#05080A] py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-400">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2 font-bold text-white">
              <span className="w-6 h-6 rounded-lg bg-teal-400 text-black flex items-center justify-center font-black text-xs">
                C
              </span>
              <span>CityCircle Surat</span>
            </div>
            <span className="hidden sm:inline text-neutral-600">·</span>
            <span>Hyper-Local Verified Community Platform (v0.5.0)</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="/grievance" className="hover:text-teal-300 transition-colors underline">
              Grievance Officer (IT Rules 2021)
            </Link>
            <a
              href="/llms.txt"
              target="_blank"
              rel="noreferrer"
              className="hover:text-teal-300 transition-colors font-mono text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/10"
            >
              llms.txt (AI Knowledge)
            </a>
            <Link href="/admin" className="hover:text-teal-300 transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
