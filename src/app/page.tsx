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
  Users,
  Star,
  ThumbsUp,
  Bookmark,
  Zap,
  Coffee,
  Compass,
  GraduationCap,
  TrendingUp,
  Layers,
  Search,
  Sliders,
  ExternalLink,
  Shield,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { Group, GroupCategory } from '@/types';
import { CATEGORY_CONFIG, CATEGORIES } from '@/lib/category-helpers';

// Curated Mock Groups matching real app circles
const LANDING_GROUPS: Group[] = [
  {
    id: 'g-tech-surat',
    name: 'Surat Tech & Startup Circle',
    description: 'Founders, engineers, and creators in Surat. Monthly tech mixers, demo days, and AI peer learning across Vesu & Piplod.',
    category: 'Custom',
    is_public: true,
    admin_id: 'a0001',
    admin_name: 'Prayag B.',
    cover_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    member_count: 142,
    max_members: 256,
    require_approval: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'g-trekkers',
    name: 'Weekend Trekkers & Explorers',
    description: 'Scenic trails, weekend getaways, waterfalls, and sunrise cycling routes around Surat, Dumas, and Dang forests.',
    category: 'Tourism',
    is_public: true,
    admin_id: 'a0002',
    admin_name: 'Aarav M.',
    cover_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    member_count: 98,
    max_members: 150,
    require_approval: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'g-foodies',
    name: 'Surat Foodies & Cafes Club',
    description: 'Exploring legendary street food spots and aesthetic specialty coffee roasters in Surat from Dumas Road to Vesu.',
    category: 'Party',
    is_public: true,
    admin_id: 'a0003',
    admin_name: 'Diya P.',
    cover_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    member_count: 215,
    max_members: 256,
    require_approval: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'g-svnit',
    name: 'SVNIT & University Alumni Network',
    description: 'Students and alumni from SVNIT and Surat universities networking, sharing job referrals, and building side projects.',
    category: 'University',
    is_public: true,
    admin_id: 'a0004',
    admin_name: 'Rohan K.',
    cover_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    member_count: 176,
    max_members: 500,
    require_approval: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'g-property',
    name: 'Surat Commercial & Living Spaces',
    description: 'Peer discussions on flatmate matching, co-working spaces, rental flats in Vesu/Pal, and verified property insights.',
    category: 'Property',
    is_public: false,
    admin_id: 'a0005',
    admin_name: 'Kavya T.',
    cover_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    member_count: 84,
    max_members: 200,
    require_approval: true,
    created_at: new Date().toISOString(),
  },
];

// Curated Mock Meetups
const LANDING_MEETUPS = [
  {
    id: 'm1',
    group_name: 'Surat Tech & Startup Circle',
    title: 'Surat AI Builders & Founders Mixer #04',
    description: 'Casual networking, local AI startup demos, and lightning talks with Surat founders & engineers.',
    place: 'The Roastery Cafe, VIP Road, Vesu',
    ticket_price: 0,
    rsvps_count: 18,
    capacity: 24,
    date_time: 'Sat, Oct 18 · 5:30 PM',
  },
  {
    id: 'm2',
    group_name: 'Weekend Trekkers & Explorers',
    title: 'Sunrise Dumas Cycling Circuit (22 KM)',
    description: 'Morning ride from VR Mall junction to Dumas beach promenade with breakfast at local stalls.',
    place: 'VR Mall Junction, Dumas Road',
    ticket_price: 0,
    rsvps_count: 14,
    capacity: 20,
    date_time: 'Sun, Oct 19 · 5:45 AM',
  },
];

// Channels for Live Hero Feed View
const HERO_FEED_DATA = [
  {
    id: 'tech',
    tag: '#surat-tech-founders',
    name: 'Surat Tech & Startup Circle',
    category: 'Startups & AI',
    activeCount: 48,
    capStatus: '142 / 256 members · Admin approval active',
    posts: [
      {
        id: 1,
        author: 'Prayag Bagtharia',
        role: 'Circle Host · Admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        content: 'Surat AI Builders Demo Day locked in for Saturday at Vesu. 24 seats reserved on the interactive map, 6 spots remaining.',
        timestamp: '2m ago',
        metrics: { upvotes: 24, bookmarks: 11 },
      },
      {
        id: 2,
        author: 'Kavya Trivedi',
        role: 'Founder · YC Applicant',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
        content: 'Demoing our edge logistics engine. Excited to connect with local Surat angels and engineering leads.',
        timestamp: '5m ago',
        metrics: { upvotes: 18, bookmarks: 7 },
      },
    ],
  },
  {
    id: 'treks',
    tag: '#weekend-trekkers',
    name: 'Weekend Trekkers & Cycling',
    category: 'Outdoors & Trails',
    activeCount: 36,
    capStatus: '98 / 150 members · Open circle',
    posts: [
      {
        id: 1,
        author: 'Aarav Mehta',
        role: 'Lead Guide',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        content: 'Sunrise Dumas cycling circuit tomorrow at 5:45 AM. Helmets mandatory, meeting point at VR Mall junction.',
        timestamp: '8m ago',
        metrics: { upvotes: 32, bookmarks: 14 },
      },
    ],
  },
  {
    id: 'foodies',
    tag: '#surat-foodies-club',
    name: 'Surat Specialty Coffee & Foodies',
    category: 'Cafes & Dining',
    activeCount: 64,
    capStatus: '215 / 256 members · Near capacity',
    posts: [
      {
        id: 1,
        author: 'Diya Patel',
        role: 'Food Curator',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
        content: 'Discovered a hidden micro-roastery near VIP Road with single-origin pour-overs. Pinned on the city map for Sunday.',
        timestamp: '12m ago',
        metrics: { upvotes: 41, bookmarks: 19 },
      },
    ],
  },
];

// Surat Real Trends (from r/surat & local social pulse)
const REAL_TRENDS_DATA = [
  {
    id: 't1',
    source: 'r/surat',
    category: 'Food & Cafes',
    title: 'Top 5 specialty coffee roasters with work-friendly setups in Vesu & Piplod',
    upvotes: 84,
    comments: 29,
    snippet: 'Detailed breakdown comparing bean origins, WiFi speeds, and seating options across VIP Road cafes.',
    time: '3 hours ago',
  },
  {
    id: 't2',
    source: 'r/surat',
    category: 'Civic & Transit',
    title: 'Surat Metro Phase 1 station updates around Athwa Lines and Diamond Bourse',
    upvotes: 112,
    comments: 43,
    snippet: 'Discussion on commercial connectivity between Dream City station and Adajan route.',
    time: '5 hours ago',
  },
  {
    id: 't3',
    source: 'r/surat',
    category: 'Tech & Startups',
    title: 'Growing AI and SaaS builder meetups happening in Surat this quarter',
    upvotes: 67,
    comments: 18,
    snippet: 'Community thread connecting engineers and founders looking for local side-project partners.',
    time: '1 day ago',
  },
];

// Surat Geographic Hotspots for Radar Matrix
const RADAR_NODES = [
  { id: 'vesu', name: 'Vesu Innovation Hub', coords: '21.144° N, 72.771° E', x: 68, y: 64, active: 38, note: 'AI Mixers & Coworking', trend: 'Meetups active' },
  { id: 'piplod', name: 'Piplod Cultural Strip', coords: '21.168° N, 72.788° E', x: 44, y: 46, active: 24, note: 'Specialty Coffee & Mixers', trend: 'Cafe pins' },
  { id: 'svnit', name: 'SVNIT University Node', coords: '21.163° N, 72.784° E', x: 54, y: 34, active: 46, note: 'Alumni & Tech Labs', trend: 'Verified only' },
  { id: 'dumas', name: 'Dumas Sunrise Trail', coords: '21.092° N, 72.712° E', x: 22, y: 82, active: 18, note: 'Weekend Cycling & Treks', trend: '5:45 AM ride' },
  { id: 'adajan', name: 'Adajan Creators Node', coords: '21.196° N, 72.798° E', x: 36, y: 22, active: 21, note: 'Founders & Designers', trend: 'Circle active' },
];

export default function LandingPage() {
  // Hero Interactive States
  const [heroView, setHeroView] = useState<'feed' | 'map' | 'trends'>('feed');
  const [activeChannelId, setActiveChannelId] = useState<string>('tech');
  const [fuzzRadius, setFuzzRadius] = useState<number>(400);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('vesu');
  const [postUpvotes, setPostUpvotes] = useState<{ [key: string]: number }>({
    'tech-1': 24,
    'tech-2': 18,
    'treks-1': 32,
    'foodies-1': 41,
  });

  // Bento Interactive States
  const [bentoCategory, setBentoCategory] = useState<GroupCategory>('Custom');
  const [privacyMode, setPrivacyMode] = useState<'shielded' | 'raw'>('shielded');

  // VIP Promo Pass State
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoStatus, setPromoStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // FAQ State
  const [activeFaqCategory, setActiveFaqCategory] = useState<string>('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleUpvote = (key: string) => {
    setPostUpvotes((prev) => ({
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('founding_code', code.toUpperCase().trim());
      }
    } else {
      setPromoStatus('invalid');
    }
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleValidateInput = (e: React.FormEvent) => {
    e.preventDefault();
    const validCodes = ['FOUNDER2026', 'SURATVIP', 'CITYCIRCLE100', 'EARLYACCESS'];
    const formatted = promoCode.toUpperCase().trim();
    if (validCodes.includes(formatted)) {
      setPromoStatus('valid');
      if (typeof window !== 'undefined') {
        localStorage.setItem('founding_code', formatted);
      }
    } else {
      setPromoStatus('invalid');
    }
  };

  const activeChannel = HERO_FEED_DATA.find((c) => c.id === activeChannelId) || HERO_FEED_DATA[0];
  const activeBentoGroup = LANDING_GROUPS.find((g) => g.category === bentoCategory) || LANDING_GROUPS[0];
  const bentoConfig = CATEGORY_CONFIG[bentoCategory];
  const BentoIcon = bentoConfig.icon;

  const faqs = [
    {
      q: 'What makes CityCircle different from WhatsApp or Telegram groups?',
      category: 'general',
      a: 'WhatsApp and Telegram groups quickly become noisy and spam-filled because they lack structure. CityCircle introduces hard member caps (50, 100, 256), host approval queues for new members, and announcement-only toggles. It also connects directly to an interactive map to host offline meetups.',
    },
    {
      q: 'How does the interactive map and spatial jitter protect my home privacy?',
      category: 'privacy',
      a: 'When you drop a meetup or share your presence, CityCircle applies server-side spatial jitter (400m–1km radius). Your exact building GPS is never written to the database; only a broad neighborhood zone (like Vesu or Piplod) is rendered. Location entries automatically expire after 3 hours, with an instant 1-tap Panic Button to purge data immediately.',
    },
    {
      q: 'Are my phone number and email visible to other members?',
      category: 'privacy',
      a: 'No. Your phone number and email are locked behind PostgreSQL Row-Level Security (RLS). Other members only ever see your chosen display name, avatar, verified resident badges, and interest tags.',
    },
    {
      q: 'What is the City Trends feed (r/surat & Instagram sync)?',
      category: 'trends',
      a: 'To solve the cold-start problem of empty feeds, CityCircle automatically synchronizes top local discussions, food spots, metro updates, and city news from Reddit (r/surat) and local sources, giving you live city context on day one.',
    },
    {
      q: 'How do I host a meetup or start a circle in Surat?',
      category: 'meetups',
      a: 'Any verified member can click any point on the interactive map to drop an event pin, select a venue (e.g. coffee shop or cycling trail), set capacity limits, and start accepting 1-click RSVPs from circle members.',
    },
    {
      q: 'How are discussions and media uploads moderated?',
      category: 'safety',
      a: 'All uploaded media undergoes automated verification before broadcast. Under India’s Information Technology Rules 2021, members can flag inappropriate content for review by our dedicated Chief Grievance Officer in Surat within a 24-hour SLA.',
    },
  ];

  const filteredFaqs = activeFaqCategory === 'all' ? faqs : faqs.filter((f) => f.category === activeFaqCategory);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary relative overflow-x-hidden font-sans app-hero-mesh">
      <PWAInstallPrompt />

      {/* Warm Ambient Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[620px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[520px] h-[520px] rounded-full bg-primary/10 blur-[120px] animate-glow-breathe" />
        <div className="absolute top-[10%] right-[15%] w-[440px] h-[440px] rounded-full bg-accent/10 blur-[110px] animate-glow-breathe [animation-delay:3s]" />
      </div>

      {/* FLOATING PILL NAVBAR */}
      <header className="sticky top-0 z-50 px-4 sm:px-6 pt-4 pb-2 animate-reveal-down">
        <nav className="max-w-5xl mx-auto h-16 rounded-full app-glass-card px-5 sm:px-7 flex items-center justify-between shadow-sm transition-all">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-lg shadow-sm shadow-primary/20 group-hover:scale-105 transition-transform">
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
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <a href="#hero-viewport" className="hover:text-foreground transition-colors">
              Platform
            </a>
            <a href="#circles" className="hover:text-foreground transition-colors">
              Circles
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
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
          <div className="flex items-center gap-2.5">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-muted-foreground hover:text-foreground h-9 px-3 rounded-full">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold h-9 px-4 rounded-full shadow-sm shadow-primary/20 hover:scale-[1.02] transition-transform">
                Join Surat Cohort
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full app-pill text-xs font-semibold text-foreground mb-6 border border-border shadow-xs animate-reveal-up [animation-delay:100ms] opacity-0 [animation-fill-mode:forwards]">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-muted-foreground">Surat Founding Cohort:</span>
            <span className="font-bold text-primary">318 / 400 Spots Claimed</span>
            <span className="text-border">·</span>
            <span className="text-accent font-bold">Free Lifetime Access</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[-0.035em] text-foreground font-heading leading-[1.1] mb-6 animate-reveal-up [animation-delay:220ms] opacity-0 [animation-fill-mode:forwards]">
            The Anti-Spam Local Network <br />
            <span className="text-primary underline decoration-accent decoration-wavy decoration-3 underline-offset-8">
              Built for Surat.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 font-normal leading-relaxed animate-reveal-up [animation-delay:340ms] opacity-0 [animation-fill-mode:forwards]">
            Curated interest circles with WhatsApp-style participant caps (50–256) and host approvals. 
            Pin offline meetups on a privacy-fuzzed city map, explore live r/surat discussions, and connect with verified locals without ever leaking your phone number.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-8 animate-reveal-up [animation-delay:460ms] opacity-0 [animation-fill-mode:forwards]">
            <Link href="/auth/signup" className="w-full sm:w-auto flex-1">
              <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-black text-sm h-12 rounded-full shadow-md shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all">
                <span>Join Surat Cohort</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#hero-viewport" className="w-full sm:w-auto flex-1">
              <Button variant="outline" size="lg" className="w-full h-12 rounded-full border-border bg-card/90 text-foreground font-semibold text-sm hover:bg-card transition-all">
                Explore Platform Demo
              </Button>
            </a>
          </div>

          {/* Social Proof Avatar Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-muted-foreground animate-reveal-up [animation-delay:580ms] opacity-0 [animation-fill-mode:forwards]">
            <div className="flex -space-x-2">
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-background object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Member" />
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-background object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80" alt="Member" />
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-background object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="Member" />
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-background object-cover" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80" alt="Member" />
            </div>
            <div className="flex items-center gap-1">
              <div className="flex text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="font-semibold text-foreground ml-1">4.9/5 satisfaction</span>
              <span>from 340+ verified Surat locals</span>
            </div>
          </div>
        </div>

        {/* HERO INTERACTIVE APP VIEWPORT (Accurate to Real App Features) */}
        <div
          id="hero-viewport"
          className="rounded-3xl app-glass-card overflow-hidden border border-border shadow-xl relative transition-all animate-reveal-scale [animation-delay:680ms] opacity-0 [animation-fill-mode:forwards]"
        >
          {/* Viewport Top Bar */}
          <div className="px-5 py-3.5 bg-muted/60 border-b border-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-danger/80" />
                <span className="w-3 h-3 rounded-full bg-warning/80" />
                <span className="w-3 h-3 rounded-full bg-success/80" />
              </div>
              <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                citycircle-surat.vercel.app/dashboard
              </span>
            </div>

            {/* Interactive View Selector (Feed, Map, Trends) */}
            <div className="flex items-center p-1 rounded-xl bg-background border border-border text-xs font-semibold">
              <button
                onClick={() => setHeroView('feed')}
                className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  heroView === 'feed'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Circles & Feed</span>
              </button>
              <button
                onClick={() => setHeroView('map')}
                className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  heroView === 'map'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>City Map & Meetups</span>
              </button>
              <button
                onClick={() => setHeroView('trends')}
                className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  heroView === 'trends'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>r/surat Trends</span>
              </button>
            </div>
          </div>

          {/* Viewport Body */}
          <div className="p-4 sm:p-7 min-h-[420px] bg-card">
            {/* VIEW 1: CIRCLES FEED WITH WHATSAPP-STYLE CONTROLS */}
            {heroView === 'feed' && (
              <div>
                {/* Channel Selector Chips */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
                  {HERO_FEED_DATA.map((ch) => {
                    const isSelected = activeChannelId === ch.id;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => setActiveChannelId(ch.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                          isSelected
                            ? 'bg-primary/15 text-primary border border-primary/30 shadow-xs'
                            : 'bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted'
                        }`}
                      >
                        <span>{ch.tag}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        <span className="text-[10px] font-mono opacity-80">{ch.activeCount} online</span>
                      </button>
                    );
                  })}
                </div>

                {/* WhatsApp-Style Capacity & Approval Notice Bar */}
                <div className="mb-5 p-3 rounded-xl bg-muted/60 border border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span>Circle Status: <strong className="text-foreground">{activeChannel.capStatus}</strong></span>
                  </div>
                  <span className="text-[11px] font-mono text-primary font-bold px-2 py-0.5 rounded bg-primary/10">
                    No Phone Leak
                  </span>
                </div>

                {/* Simulated Feed Posts */}
                <div className="space-y-3.5 max-w-2xl mx-auto">
                  {activeChannel.posts.map((post) => {
                    const postKey = `${activeChannel.id}-${post.id}`;
                    const upvoteCount = postUpvotes[postKey] ?? post.metrics.upvotes;
                    return (
                      <div
                        key={post.id}
                        className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 transition-all flex items-start gap-3.5"
                      >
                        <img
                          src={post.avatar}
                          alt={post.author}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-border"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground">{post.author}</span>
                              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20">
                                {post.role}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{post.timestamp}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed mb-3">
                            {post.content}
                          </p>

                          {/* Upvotes & Bookmarks */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpvote(postKey)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary text-xs font-semibold text-muted-foreground border border-border transition-all active:scale-95"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span className="font-mono text-[11px]">{upvoteCount}</span>
                            </button>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/30 text-xs font-semibold text-muted-foreground border border-border/50">
                              <Bookmark className="w-3.5 h-3.5" />
                              <span className="font-mono text-[11px]">{post.metrics.bookmarks}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                    </span>
                    <span className="text-[11px]">3 verified members active in this circle</span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: INTERACTIVE CITY MAP & SPATIAL JITTER */}
            {heroView === 'map' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <div>
                    <div className="text-sm font-bold text-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>Interactive Surat City Map & Meetup Pins</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click any pin to view meetup details. Spatial jitter protects exact home addresses.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Spatial Jitter:</span>
                    <div className="flex p-0.5 rounded-xl bg-muted border border-border text-xs">
                      <button
                        onClick={() => setFuzzRadius(400)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all ${
                          fuzzRadius === 400 ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
                        }`}
                      >
                        400m (Venue)
                      </button>
                      <button
                        onClick={() => setFuzzRadius(800)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all ${
                          fuzzRadius === 800 ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
                        }`}
                      >
                        800m (District)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Map Grid Canvas with SVG Tapi River */}
                <div className="relative h-72 sm:h-80 w-full rounded-2xl bg-secondary/40 border border-border overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-36 h-36 rounded-full border border-primary animate-pulse-radar" />
                    <div className="w-64 h-64 rounded-full border border-primary/60" />
                    <div className="w-96 h-96 rounded-full border border-primary/30" />
                  </div>

                  <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 0 160 Q 250 80 500 180 T 1000 120" fill="none" stroke="#0F5257" strokeWidth="12" />
                    <path d="M 0 160 Q 250 80 500 180 T 1000 120" fill="none" stroke="#0F5257" strokeWidth="2" strokeDasharray="6 6" />
                  </svg>

                  {/* Hotspot Pins */}
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
                          <span
                            className={`absolute rounded-full border border-primary/30 bg-primary/10 transition-all ${
                              isSelected
                                ? fuzzRadius === 800 ? 'w-24 h-24 scale-125' : 'w-16 h-16 scale-110'
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

                        {/* Tooltip Card */}
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

            {/* VIEW 3: REDDIT r/surat REAL CITY TRENDS */}
            {heroView === 'trends' && (
              <div className="space-y-3.5 py-1">
                <div className="flex items-center justify-between pb-2 border-b border-border text-xs">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="font-bold text-foreground">Live r/surat Community Discussions</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">Auto-synced from Reddit</span>
                </div>

                <div className="space-y-3">
                  {REAL_TRENDS_DATA.map((trend) => (
                    <div
                      key={trend.id}
                      className="p-4 rounded-2xl bg-secondary/40 border border-border hover:border-primary/40 hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            {trend.source}
                          </span>
                          <span className="text-xs font-semibold text-muted-foreground">{trend.category}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{trend.time}</span>
                      </div>
                      <h4 className="text-sm font-bold text-foreground mb-1">{trend.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2.5">{trend.snippet}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                          <ThumbsUp className="w-3.5 h-3.5 text-primary" /> {trend.upvotes} upvotes
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" /> {trend.comments} comments
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CONTINUOUS MARQUEE TICKER (Clean Vector Icons) */}
      <div className="w-full bg-muted/50 border-y border-border py-3.5 overflow-hidden">
        <div className="animate-marquee items-center gap-8 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-foreground">Surat Tech Circle hosted AI Builders Mixer at Vesu</span>
          </div>
          <span className="text-border">/</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span className="text-foreground">100% Phone Verified & Indian IT Rules 2021 Compliant</span>
          </div>
          <span className="text-border">/</span>
          <div className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-accent" />
            <span className="text-foreground">Dumas Sunrise Ride organized with 14 RSVPs</span>
          </div>
          <span className="text-border">/</span>
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span className="text-foreground">PostgreSQL Row-Level Security: Zero Contact Leak</span>
          </div>
          <span className="text-border">/</span>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-3.5 h-3.5 text-accent" />
            <span className="text-foreground">34 SVNIT Alumni joined this week</span>
          </div>
          <span className="text-border">/</span>
          <div className="flex items-center gap-2">
            <Coffee className="w-3.5 h-3.5 text-primary" />
            <span className="text-foreground">Surat Foodies discovered new artisanal roasters in Piplod</span>
          </div>
          <span className="text-border">/</span>
        </div>
      </div>

      {/* BENTO GRID ("Architecture of Trust") */}
      <section id="circles" className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto w-full">
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

              {/* Circle Selector Chips */}
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
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-foreground">{activeBentoGroup.name}</h3>
                    {activeBentoGroup.require_approval && (
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                        Approval Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                    {activeBentoGroup.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
                    <span className="text-muted-foreground">Host: <strong className="text-foreground">{activeBentoGroup.admin_name}</strong></span>
                    <Link href={`/groups`}>
                      <Button size="sm" variant="outline" className="text-xs font-bold h-8 px-3.5 hover:bg-primary hover:text-primary-foreground">
                        Explore Circles
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
                Spatial Jitter & Zero Phone Leaks
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
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-danger shrink-0" />
                        <span>Raw coordinates are auto-scrambled before database insertion.</span>
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
                Unlock Founding Member Status
              </h3>
              <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                Click one of our partner codes to auto-validate and claim your lifetime verified founding badge:
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
                  <span>Valid Code! Founding Pass unlocked for registration.</span>
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

      {/* HOW IT WORKS (3 SIMPLE STEPS) */}
      <section id="how-it-works" className="py-16 md:py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-border">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
            Simple Workflow
          </div>
          <h2 className="text-3xl font-bold font-heading text-foreground tracking-tight mb-3">
            How CityCircle Works
          </h2>
          <p className="text-sm text-muted-foreground">
            Get started in under 60 seconds with email verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 sm:p-7 rounded-3xl app-glass-card space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-black text-base">
              1
            </div>
            <h3 className="text-base font-bold text-foreground">Verify & Choose Neighborhood</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Verify your residency with a secure 6-digit OTP and pick your primary neighborhood zone (Vesu, Piplod, Adajan, Pal, etc.).
            </p>
          </div>

          <div className="p-6 sm:p-7 rounded-3xl app-glass-card space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-accent/20 text-accent-foreground flex items-center justify-center font-black text-base">
              2
            </div>
            <h3 className="text-base font-bold text-foreground">Join Capped Circles or Host Meetups</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Enter focused interest circles with hard participant caps (50–256) or drop a pin on the live city map to organize coffee and cycling gatherings.
            </p>
          </div>

          <div className="p-6 sm:p-7 rounded-3xl app-glass-card space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-black text-base">
              3
            </div>
            <h3 className="text-base font-bold text-foreground">Connect Without Contact Leaks</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Chat in real time with peers, RSVP to offline events, and stay updated with r/surat trends while your phone number and exact GPS remain private.
            </p>
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
              &quot;The 400m spatial jitter gives complete peace of mind. Great for sunrise Dumas cycling squads without sharing phone numbers.&quot;
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <div className="w-9 h-9 rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center font-bold text-xs">
                AM
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Aarav M.</div>
                <div className="text-[11px] text-muted-foreground">Lead, Weekend Trekkers</div>
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
            { id: 'trends', label: 'r/surat Trends' },
            { id: 'meetups', label: 'Meetups' },
            { id: 'safety', label: 'Safety & IT Rules' },
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
            <Link href="/groups" className="hover:text-primary transition-colors">
              Circles
            </Link>
            <Link href="/map" className="hover:text-primary transition-colors">
              Live Map
            </Link>
            <Link href="/trends" className="hover:text-primary transition-colors">
              Trends
            </Link>
            <Link href="/grievance" className="hover:text-primary transition-colors underline">
              Grievance Officer (IT Rules 2021)
            </Link>
            <a
              href="/llms.txt"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors font-mono text-[11px] px-2 py-0.5 rounded bg-muted border border-border"
            >
              llms.txt
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
