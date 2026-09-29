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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { INITIAL_GROUPS } from '@/lib/data';
import { CATEGORY_CONFIG } from '@/lib/category-helpers';

// Simulated Live Hero Chat Data
const HERO_CHATS = {
  tech: {
    channel: '#tech-founders-surat',
    activeCount: 42,
    badge: 'Tech & AI',
    messages: [
      { id: 1, user: 'Prayag B.', role: 'Admin', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', text: 'Hosting the AI builders mixer this Saturday at Vesu cafe! 🚀', time: '2m ago', reactions: { '🔥': 8, '👏': 5 } },
      { id: 2, user: 'Kavya T.', role: 'Founder', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80', text: 'Count me in! Demoing our local logistics API.', time: '1m ago', reactions: { '🚀': 6 } },
      { id: 3, user: 'Dr. Meet S.', role: 'SVNIT Alum', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80', text: 'Just RSVP’d. Bringing 2 engineers from our Piplod lab.', time: 'Just now', reactions: { '❤️': 4 } },
    ],
  },
  treks: {
    channel: '#weekend-trekkers',
    activeCount: 31,
    badge: 'Outdoors & Treks',
    messages: [
      { id: 1, user: 'Aarav M.', role: 'Lead Guide', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', text: 'Sunrise Dumas cycling circuit tomorrow at 5:45 AM 🚴‍♂️ 🌅', time: '5m ago', reactions: { '🌅': 12, '🚴': 9 } },
      { id: 2, user: 'Tanvi R.', role: 'Member', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', text: 'Meeting spot confirmed at VR Mall junction. Helmets ready!', time: '3m ago', reactions: { '🙌': 7 } },
    ],
  },
  foodies: {
    channel: '#surat-foodies-club',
    activeCount: 56,
    badge: 'Food & Cafes',
    messages: [
      { id: 1, user: 'Diya P.', role: 'Food Lead', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80', text: 'Found a hidden artisanal coffee roaster near VIP Road ☕✨', time: '8m ago', reactions: { '☕': 15, '😋': 11 } },
      { id: 2, user: 'Rohan K.', role: 'Member', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', text: 'Adding it to the Sunday breakfast meetup itinerary!', time: '2m ago', reactions: { '💯': 8 } },
    ],
  },
};

// Radar Hotspots in Surat
const RADAR_PINS = [
  { id: 'vesu', name: 'Vesu Innovation Hub', x: '68%', y: '62%', active: 28, category: 'Tech & Cafes' },
  { id: 'piplod', name: 'Piplod Cultural Walk', x: '42%', y: '48%', active: 19, category: 'Meetups' },
  { id: 'dumas', name: 'Dumas Sunrise Trail', x: '24%', y: '78%', active: 14, category: 'Outdoors' },
  { id: 'svnit', name: 'SVNIT Campus Node', x: '52%', y: '36%', active: 34, category: 'Alumni' },
  { id: 'adajan', name: 'Adajan Creators Hub', x: '35%', y: '25%', active: 16, category: 'Living' },
];

export default function LandingPage() {
  // Hero Interactive States
  const [heroTab, setHeroTab] = useState<'chat' | 'radar'>('chat');
  const [activeChannel, setActiveChannel] = useState<'tech' | 'treks' | 'foodies'>('tech');
  const [fuzzRadius, setFuzzRadius] = useState<number>(300);
  const [activePin, setActivePin] = useState<string | null>('vesu');
  const [chatReactions, setChatReactions] = useState<{ [key: string]: number }>({ 'tech-1': 8, 'tech-2': 6, 'tech-3': 4 });

  // Bento Interactive States
  const [bentoCategory, setBentoCategory] = useState<string>('Custom');
  const [privacyDemoMode, setPrivacyDemoMode] = useState<'stored' | 'raw'>('stored');
  const [rsvpClaimed, setRsvpClaimed] = useState<boolean>(false);
  const [rsvpCount, setRsvpCount] = useState<number>(14);

  // Promo Code Validation State
  const [promoCode, setPromoCode] = useState('');
  const [promoValid, setPromoValid] = useState<boolean | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // FAQ Accordion State
  const [faqCategory, setFaqCategory] = useState<string>('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleValidateCode = (e: React.FormEvent) => {
    e.preventDefault();
    const validCodes = ['FOUNDER2026', 'SURATVIP', 'CITYCIRCLE100', 'EARLYACCESS'];
    if (validCodes.includes(promoCode.trim().toUpperCase())) {
      setPromoValid(true);
    } else {
      setPromoValid(false);
    }
  };

  const handleCopyCode = (code: string) => {
    setPromoCode(code);
    setCopiedCode(code);
    const validCodes = ['FOUNDER2026', 'SURATVIP', 'CITYCIRCLE100', 'EARLYACCESS'];
    if (validCodes.includes(code)) {
      setPromoValid(true);
    }
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleReactionClick = (key: string) => {
    setChatReactions((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1,
    }));
  };

  const selectedGroup = INITIAL_GROUPS.find((g) => g.category === bentoCategory) || INITIAL_GROUPS[0];
  const groupConfig = CATEGORY_CONFIG[selectedGroup.category];
  const GroupIcon = groupConfig.icon;

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

  const filteredFaqs = faqCategory === 'all' ? faqs : faqs.filter((f) => f.category === faqCategory);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary relative overflow-x-hidden">
      <PWAInstallPrompt />

      {/* Ambient Radial Background Mesh (Stripe-inspired) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[640px] bg-radial-glow pointer-events-none -z-10 opacity-80" />
      <div className="absolute top-20 inset-x-0 h-96 bg-dot-pattern pointer-events-none -z-10 opacity-30" />

      {/* Floating Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/70 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-black text-lg shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                C
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-foreground font-heading">
                  CityCircle
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent-foreground rounded-full border border-accent/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Surat
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <a href="#circles" className="hover:text-foreground transition-colors">
              Circles
            </a>
            <a href="#meetups" className="hover:text-foreground transition-colors">
              Meetups
            </a>
            <a href="#privacy" className="hover:text-foreground transition-colors">
              Privacy Engine
            </a>
            <a href="#founding-pass" className="hover:text-foreground transition-colors flex items-center gap-1 text-accent-foreground font-bold">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              Founding Pass
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="font-semibold text-xs h-9 px-3.5 hover:bg-muted/80">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9 px-4 shadow-sm shadow-primary/20 hover:scale-[1.02] transition-transform">
                Join Surat
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-10">
          {/* Live Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-xs font-semibold text-accent-foreground mb-6 shadow-xs backdrop-blur-md animate-float-subtle">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span>Founding Member Pass: 318 / 400 Claimed · ₹0 Free Access</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-70" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground font-heading leading-[1.12] mb-6">
            Real Surat Communities. <br />
            <span className="bg-linear-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
              Verified & Real-World.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Join curated interest circles in Surat for tech founders, weekend trekkers, specialty foodies, and university alumni. 
            Chat safely with zero contact exposure and convert conversations into real-world offline meetups.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-8">
            <Link href="/auth/signup" className="w-full sm:w-auto flex-1">
              <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-sm h-12 shadow-md shadow-accent/20 hover:scale-[1.02] transition-transform">
                Join Founding Cohort
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#interactive-preview" className="w-full sm:w-auto flex-1">
              <Button variant="outline" size="lg" className="w-full h-12 text-sm font-semibold border-border bg-card/60 backdrop-blur-xs hover:bg-card">
                Try Live Interactive Demo
              </Button>
            </a>
          </div>

          {/* Trust Pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>100% Phone Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-primary shrink-0" />
              <span>Zero Contact Exposure</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span>300–500m Fuzzed Map</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>IT Rules 2021 Compliant</span>
            </div>
          </div>
        </div>

        {/* HERO INTERACTIVE DOCK (Alive App Showcase) */}
        <div id="interactive-preview" className="mt-8 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden transition-all">
          {/* Mock Window Top Bar */}
          <div className="px-4 py-3 bg-muted/50 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-danger/80" />
                <span className="w-3 h-3 rounded-full bg-warning/80" />
                <span className="w-3 h-3 rounded-full bg-success/80" />
              </div>
              <span className="text-[11px] font-mono text-muted-foreground ml-2 hidden sm:inline">
                citycircle-surat.local/live-hub
              </span>
            </div>

            {/* Interactive Mode Switcher */}
            <div className="flex items-center p-0.5 rounded-xl bg-background border border-border/80 text-xs font-semibold">
              <button
                onClick={() => setHeroTab('chat')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  heroTab === 'chat'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Live Chat Stream</span>
              </button>
              <button
                onClick={() => setHeroTab('radar')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  heroTab === 'radar'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Surat Radar Map</span>
              </button>
            </div>
          </div>

          {/* Interactive Window Body */}
          <div className="p-4 sm:p-6 min-h-[380px]">
            {heroTab === 'chat' ? (
              <div>
                {/* Channel Selector Pills */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
                  {(['tech', 'treks', 'foodies'] as const).map((key) => {
                    const c = HERO_CHATS[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveChannel(key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                          activeChannel === key
                            ? 'bg-primary/15 text-primary border border-primary/30'
                            : 'bg-muted/40 text-muted-foreground border border-transparent hover:bg-muted'
                        }`}
                      >
                        <span>{c.channel}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        <span className="text-[10px] font-normal opacity-80">{c.activeCount} online</span>
                      </button>
                    );
                  })}
                </div>

                {/* Simulated Live Messages */}
                <div className="space-y-3.5 max-w-2xl mx-auto">
                  {HERO_CHATS[activeChannel].messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-start gap-3 hover:border-primary/30 transition-all"
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
                            <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {msg.role}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed mb-2.5">
                          {msg.text}
                        </p>

                        {/* Interactive Reactions */}
                        <div className="flex items-center gap-2">
                          {Object.entries(msg.reactions).map(([emoji, count]) => {
                            const reactionKey = `${activeChannel}-${msg.id}`;
                            const currentCount = chatReactions[reactionKey] ?? count;
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleReactionClick(reactionKey)}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary text-[11px] font-semibold text-muted-foreground border border-border/60 transition-all active:scale-95"
                              >
                                <span>{emoji}</span>
                                <span>{currentCount}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:0.4s]" />
                    </span>
                    <span className="text-[11px]">3 members typing in Surat...</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Radar Map Simulation */
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-primary animate-pulse" />
                      <span>Surat Hyper-Local Proximity Radar</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Simulated fuzzed density map. No real coordinates are exposed.
                    </p>
                  </div>

                  {/* Fuzz Radius Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Fuzz Radius:</span>
                    <div className="flex p-0.5 rounded-lg bg-muted border border-border text-xs">
                      <button
                        onClick={() => setFuzzRadius(300)}
                        className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                          fuzzRadius === 300 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        300m (Venue)
                      </button>
                      <button
                        onClick={() => setFuzzRadius(500)}
                        className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                          fuzzRadius === 500 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        500m (District)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated Radar Visual Area */}
                <div className="relative h-64 sm:h-72 w-full rounded-2xl bg-card border border-border/80 overflow-hidden flex items-center justify-center">
                  {/* Radar Concentric Circles */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-32 h-32 rounded-full border border-primary animate-pulse-radar" />
                    <div className="w-56 h-56 rounded-full border border-primary/60" />
                    <div className="w-80 h-80 rounded-full border border-primary/30" />
                    <div className="w-full h-full border border-primary/20" />
                  </div>

                  {/* Hotspot Pins */}
                  {RADAR_PINS.map((pin) => {
                    const isSelected = activePin === pin.id;
                    return (
                      <button
                        key={pin.id}
                        onClick={() => setActivePin(pin.id)}
                        style={{ top: pin.y, left: pin.x }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group transition-all"
                      >
                        <div className="relative flex items-center justify-center">
                          <span
                            className={`absolute rounded-full bg-primary/20 transition-all ${
                              isSelected ? 'w-10 h-10 animate-ping opacity-60' : 'w-6 h-6'
                            }`}
                          />
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-md ${
                              isSelected
                                ? 'bg-accent text-accent-foreground scale-125 ring-4 ring-accent/30'
                                : 'bg-primary text-primary-foreground group-hover:scale-110'
                            }`}
                          >
                            {pin.active}
                          </div>
                        </div>

                        {/* Tooltip */}
                        <div
                          className={`absolute top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-card/95 border border-border text-[11px] whitespace-nowrap shadow-lg transition-all z-20 ${
                            isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                          }`}
                        >
                          <div className="font-bold text-foreground">{pin.name}</div>
                          <div className="text-[10px] text-muted-foreground">{pin.category} · {pin.active} active now</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* LIVE ACTIVITY MARQUEE TICKER */}
      <div className="w-full bg-muted/40 border-y border-border py-3 overflow-hidden">
        <div className="animate-marquee items-center gap-8 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>⚡ Surat Tech Circle created &quot;AI Builders Mixer&quot; at Vesu</span>
          </div>
          <span className="text-border">/</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>100% Phone Verification & Indian IT Rules 2021 Compliant</span>
          </div>
          <span className="text-border">/</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span>🚴 Dumas Sunrise Ride organized by Weekend Trekkers (14 RSVPs)</span>
          </div>
          <span className="text-border">/</span>
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span>PostgreSQL Row-Level Security: Zero Contact Leakage</span>
          </div>
          <span className="text-border">/</span>
          <div className="flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-accent" />
            <span>🎓 34 SVNIT Alumni joined this week</span>
          </div>
          <span className="text-border">/</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>☕ Surat Foodies added 3 specialty cafe meetups in Piplod</span>
          </div>
          <span className="text-border">/</span>
        </div>
      </div>

      {/* INTERACTIVE BENTO GRID (Stripe / YC Style) */}
      <section id="circles" className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
            Hyper-Local Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-3">
            Designed for Real Communities. Built for Safety.
          </h2>
          <p className="text-sm text-muted-foreground">
            Explore how CityCircle combines high-trust verification, granular privacy controls, and offline meetups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* BENTO CARD 1: Interactive Circle Explorer (Span 7) */}
          <div className="md:col-span-7 rounded-3xl bg-card border border-border p-6 sm:p-8 flex flex-col justify-between hover:border-primary/40 hover:shadow-xl transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  1. Live Circle Discovery
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  5 Categories Active
                </span>
              </div>

              {/* Category Pills */}
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
                          ? 'bg-primary text-primary-foreground shadow-xs scale-105'
                          : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{g.category}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Group Showcase */}
              <div className="rounded-2xl border border-border overflow-hidden bg-background/50">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={selectedGroup.cover_url}
                    alt={selectedGroup.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-card/90 backdrop-blur-md shadow-xs"
                      style={{ borderLeftColor: groupConfig.color, borderLeftWidth: 3 }}
                    >
                      <GroupIcon className="w-3.5 h-3.5" style={{ color: groupConfig.color }} />
                      {selectedGroup.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-bold text-foreground">
                    {selectedGroup.member_count} / {selectedGroup.max_members} members
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-base sm:text-lg font-bold mb-1.5">{selectedGroup.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                    {selectedGroup.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-border/70 text-xs">
                    <span className="text-muted-foreground">Admin: <strong className="text-foreground">{selectedGroup.admin_name}</strong></span>
                    <Link href={`/groups/${selectedGroup.id}`}>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-8 px-3.5">
                        Preview Circle
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BENTO CARD 2: Interactive Fuzzed Location Sandbox (Span 5) */}
          <div id="privacy" className="md:col-span-5 rounded-3xl bg-card border border-border p-6 sm:p-8 flex flex-col justify-between hover:border-primary/40 hover:shadow-xl transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  2. Privacy Sandbox
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                  Zero Contact Leak
                </span>
              </div>

              <h3 className="text-xl font-bold font-heading mb-2">
                PostgreSQL Fuzzed Vectors
              </h3>
              <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                Your real phone number and exact latitude/longitude coordinates are never exposed to other members.
              </p>

              {/* Interactive Privacy Toggle */}
              <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-3 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Simulation View:</span>
                  <div className="flex p-0.5 rounded-lg bg-background border border-border text-[11px] font-bold">
                    <button
                      onClick={() => setPrivacyDemoMode('stored')}
                      className={`px-2 py-1 rounded transition-all ${
                        privacyDemoMode === 'stored' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      Safe Stored (What Others See)
                    </button>
                    <button
                      onClick={() => setPrivacyDemoMode('raw')}
                      className={`px-2 py-1 rounded transition-all ${
                        privacyDemoMode === 'raw' ? 'bg-danger text-white' : 'text-muted-foreground'
                      }`}
                    >
                      Raw Device
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-background border border-border text-xs space-y-2">
                  {privacyDemoMode === 'stored' ? (
                    <>
                      <div className="flex items-center justify-between text-success">
                        <span className="flex items-center gap-1.5 font-bold">
                          <EyeOff className="w-3.5 h-3.5" /> Phone & Email
                        </span>
                        <span className="font-mono text-[11px]">LOCKED (Postgres RLS)</span>
                      </div>
                      <div className="flex items-center justify-between text-primary">
                        <span className="flex items-center gap-1.5 font-bold">
                          <MapPin className="w-3.5 h-3.5" /> GPS Location
                        </span>
                        <span className="font-mono text-[11px]">Fuzzed ~420m (Vesu)</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Identity Display</span>
                        <span className="font-medium text-foreground">Avatar + &apos;Tech Founder&apos;</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-danger font-medium">
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" /> Raw GPS
                        </span>
                        <span className="font-mono text-[11px]">21.1442° N, 72.7719° E</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        ⚠️ Raw coordinates are auto-scrambled before insertion into database tables.
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t border-border/70">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Auto-purged after 3 hours + Instant 1-tap panic button</span>
            </div>
          </div>

          {/* BENTO CARD 3: Interactive Meetup Pass / Ticket Builder (Span 6) */}
          <div id="meetups" className="md:col-span-6 rounded-3xl bg-card border border-border p-6 sm:p-8 flex flex-col justify-between hover:border-primary/40 hover:shadow-xl transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  3. Offline Real-World Passes
                </span>
                <span className="text-xs font-bold text-accent">
                  1-Click RSVP
                </span>
              </div>

              <h3 className="text-xl font-bold font-heading mb-2">
                Convert Chats into Real-World Events
              </h3>
              <p className="text-xs text-muted-foreground mb-6">
                Host or RSVP to mixers, outdoor hikes, demo days, and coffee meetups across Surat venues.
              </p>

              {/* Holographic Ticket Demo */}
              <div className="p-5 rounded-2xl bg-linear-to-br from-card via-muted/30 to-card border-2 border-dashed border-border relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-primary px-2.5 py-0.5 rounded-md bg-primary/10">
                    Surat Tech & Startup Circle
                  </span>
                  <span className="text-xs font-black text-accent">FREE RSVP</span>
                </div>

                <h4 className="text-base font-bold mb-1 text-foreground">
                  Surat AI & Founder Mixer #04
                </h4>
                <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>Saturday, Oct 18 · 5:30 PM IST</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>The Roastery Cafe, VIP Road, Vesu</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="text-xs font-semibold">
                    <span className="text-foreground">{rsvpCount}</span> / 20 Registered
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!rsvpClaimed) {
                        setRsvpClaimed(true);
                        setRsvpCount((c) => c + 1);
                      }
                    }}
                    className={`text-xs font-bold h-9 transition-all ${
                      rsvpClaimed
                        ? 'bg-success text-white'
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    }`}
                  >
                    {rsvpClaimed ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> RSVP Confirmed!
                      </span>
                    ) : (
                      'Simulate 1-Click RSVP'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* BENTO CARD 4: Indian IT Rules 2021 & Moderated Media (Span 6) */}
          <div className="md:col-span-6 rounded-3xl bg-card border border-border p-6 sm:p-8 flex flex-col justify-between hover:border-primary/40 hover:shadow-xl transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  4. Safety & Indian IT Rules 2021
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent-foreground">
                  24h Grievance SLA
                </span>
              </div>

              <h3 className="text-xl font-bold font-heading mb-2">
                Pre-Moderated Media & Verified Hosts
              </h3>
              <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                Zero tolerance for harassment or illicit content. Images undergo automated verification before chat rendering.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold mb-1">Pre-Screened Uploads</div>
                  <div className="text-[11px] text-muted-foreground">Automated pipeline verifies media prior to broadcast.</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                  <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent-foreground flex items-center justify-center mb-2">
                    <Clock className="w-4 h-4 text-accent" />
                  </div>
                  <div className="text-xs font-bold mb-1">24h Grievance SLA</div>
                  <div className="text-[11px] text-muted-foreground">Resident Grievance Officer in Surat reviews all flags.</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border text-xs">
              <Link href="/grievance" className="text-primary font-semibold hover:underline flex items-center gap-1">
                View Grievance Officer Details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDING MEMBER PASS CARD (Holographic VIP Style) */}
      <section id="founding-pass" className="py-12 px-4 sm:px-6 max-w-3xl mx-auto w-full">
        <div className="p-6 sm:p-10 rounded-3xl bg-linear-to-br from-card via-background to-card border-2 border-accent/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl shadow-xs flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VIP Founding Pass</span>
          </div>

          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black font-heading mb-2">
              Have a Founding Member Code?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed">
              First 300–400 verified Surat members join with 100% waived fee (₹0 instead of ₹250). 
              Tap one of the active test codes below to auto-verify:
            </p>

            {/* Quick-tap test codes */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-muted-foreground">Available Codes:</span>
              {['FOUNDER2026', 'SURATVIP', 'CITYCIRCLE100'].map((code) => (
                <button
                  key={code}
                  onClick={() => handleCopyCode(code)}
                  className="px-2.5 py-1 rounded-lg bg-accent/15 hover:bg-accent/25 text-accent-foreground text-xs font-mono font-bold border border-accent/30 transition-all flex items-center gap-1"
                >
                  <span>{code}</span>
                  {copiedCode === code ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3 opacity-60" />}
                </button>
              ))}
            </div>

            <form onSubmit={handleValidateCode} className="flex gap-2 mb-4">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value);
                  setPromoValid(null);
                }}
                placeholder="e.g. FOUNDER2026 or SURATVIP"
                className="flex-1 px-4 py-3 rounded-xl border border-input bg-background text-sm uppercase tracking-wider font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-primary shadow-inner"
              />
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 h-12 shadow-sm">
                Verify
              </Button>
            </form>

            {promoValid === true && (
              <div className="p-3.5 bg-success/15 border border-success/30 rounded-xl text-xs text-success font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Valid Code! VIP ₹0 Founding Pass unlocked. Ready to register!</span>
              </div>
            )}
            {promoValid === false && (
              <div className="p-3.5 bg-danger/15 border border-danger/30 rounded-xl text-xs text-danger font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Invalid code. Try tapping <code className="font-mono underline cursor-pointer" onClick={() => handleCopyCode('FOUNDER2026')}>FOUNDER2026</code> above or proceed with standard registration.</span>
              </div>
            )}

            <div className="mt-6">
              <Link href="/auth/signup">
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base h-12 shadow-md shadow-accent/20">
                  Claim VIP Membership & Join Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY VOICES (Surat Locals) */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-border/70">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
            Surat Community Voices
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading">
            What Surat Locals Say About CityCircle
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-foreground/90 italic leading-relaxed mb-4">
              &quot;Met our AI startup co-founder right at the Vesu Dev Mixer organized via CityCircle. No spam, just real builders.&quot;
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-border">
              <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                KB
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Kavya B.</div>
                <div className="text-[11px] text-muted-foreground">Founder, Surat Tech Circle</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-foreground/90 italic leading-relaxed mb-4">
              &quot;The 300-500m location fuzzing gives peace of mind. Great to find weekend sunrise cyclists to Dumas without sharing private phone numbers.&quot;
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-border">
              <div className="w-9 h-9 rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center font-bold text-xs">
                AM
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Aarav M.</div>
                <div className="text-[11px] text-muted-foreground">Weekend Trekkers Lead</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-foreground/90 italic leading-relaxed mb-4">
              &quot;SVNIT college verification badge makes networking super credible. Finally a local network that replaces noisy WhatsApp groups.&quot;
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-border">
              <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                MS
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Dr. Meet S.</div>
                <div className="text-[11px] text-muted-foreground">SVNIT Alum & Research Lead</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE INTENT-FIRST FAQ (AEO & AI Search Optimized) */}
      <section id="faq" className="py-16 px-4 sm:px-6 max-w-4xl mx-auto w-full border-t border-border/70">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Frequently Asked Questions</span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading mt-1 mb-2">
            Everything You Need to Know About CityCircle Surat
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Clear, verifiable answers for members, creators, and AI answer engines.
          </p>
        </div>

        {/* FAQ Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'general', label: 'General' },
            { id: 'privacy', label: 'Privacy & GPS' },
            { id: 'meetups', label: 'Meetups' },
            { id: 'safety', label: 'Moderation' },
            { id: 'membership', label: 'VIP Pass' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFaqCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                faqCategory === tab.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-card border border-border overflow-hidden transition-all hover:border-primary/30"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-foreground"
                >
                  <span>{faq.q}</span>
                  <span className="p-1 rounded-lg bg-muted/60 text-muted-foreground shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 animate-in fade-in">
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
            <Link href="/admin" className="hover:text-primary transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
