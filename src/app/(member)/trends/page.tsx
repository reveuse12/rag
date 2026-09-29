'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Flame,
  Search,
  MessageSquare,
  Heart,
  Share2,
  Bookmark,
  ExternalLink,
  Sparkles,
  TrendingUp,
  MapPin,
  Check,
  Plus,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Eye,
  Send,
  Layers,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SocialTrend, TrendCategory, TrendPlatform } from '@/types';
import { INITIAL_SURAT_TRENDS, INITIAL_SPONSOR_BANNERS } from '@/lib/data';

const TREND_CATEGORIES: { label: string; value: string; emoji: string }[] = [
  { label: 'All Topics', value: 'all', emoji: '🌟' },
  { label: 'Food & Cafes', value: 'Food & Cafes', emoji: '🍜' },
  { label: 'Tech & Startups', value: 'Tech & Startups', emoji: '🚀' },
  { label: 'Events & Nightlife', value: 'Events & Nightlife', emoji: '🌙' },
  { label: 'Civic & Infrastructure', value: 'Civic & Infrastructure', emoji: '🏗️' },
  { label: 'Culture & Gems', value: 'Culture & Gems', emoji: '💎' },
];

export default function TrendsPage() {
  const [trends, setTrends] = useState<SocialTrend[]>(INITIAL_SURAT_TRENDS);
  const [loading, setLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'instagram' | 'reddit' | 'bookmarked'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive user state
  const [likedTrendIds, setLikedTrendIds] = useState<string[]>([]);
  const [bookmarkedTrendIds, setBookmarkedTrendIds] = useState<string[]>([]);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Submit Modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitPlatform, setSubmitPlatform] = useState<TrendPlatform>('instagram');
  const [submitTitle, setSubmitTitle] = useState('');
  const [submitUrl, setSubmitUrl] = useState('');
  const [submitCategory, setSubmitCategory] = useState<TrendCategory>('Food & Cafes');
  const [submitNeighborhood, setSubmitNeighborhood] = useState('');
  const [submitContent, setSubmitContent] = useState('');

  // Load from localStorage & fetch live /api/trends
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLikes = localStorage.getItem('cc_trend_likes');
      if (savedLikes) {
        try {
          setLikedTrendIds(JSON.parse(savedLikes));
        } catch (e) {
          console.error(e);
        }
      }
      const savedBookmarks = localStorage.getItem('cc_trend_bookmarks');
      if (savedBookmarks) {
        try {
          setBookmarkedTrendIds(JSON.parse(savedBookmarks));
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Fetch dynamic trends
    fetchLiveTrends();
  }, []);

  const fetchLiveTrends = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trends');
      if (res.ok) {
        const data = await res.json();
        if (data.trends && Array.isArray(data.trends)) {
          setTrends(data.trends);
        }
      }
    } catch (err) {
      console.warn('Using local fallback trends', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (trendId: string, initialCount: number) => {
    const isLiked = likedTrendIds.includes(trendId);
    let newLikes: string[];
    const currentCount = reactionCounts[trendId] ?? initialCount;

    if (isLiked) {
      newLikes = likedTrendIds.filter((id) => id !== trendId);
      setReactionCounts((prev) => ({ ...prev, [trendId]: currentCount - 1 }));
    } else {
      newLikes = [...likedTrendIds, trendId];
      setReactionCounts((prev) => ({ ...prev, [trendId]: currentCount + 1 }));
    }
    setLikedTrendIds(newLikes);
    localStorage.setItem('cc_trend_likes', JSON.stringify(newLikes));
  };

  const handleBookmark = (trendId: string) => {
    const isBookmarked = bookmarkedTrendIds.includes(trendId);
    let newBookmarks: string[];
    if (isBookmarked) {
      newBookmarks = bookmarkedTrendIds.filter((id) => id !== trendId);
      setToastMsg('Removed from bookmarks');
    } else {
      newBookmarks = [...bookmarkedTrendIds, trendId];
      setToastMsg('Saved to your bookmarks! ⭐');
    }
    setBookmarkedTrendIds(newBookmarks);
    localStorage.setItem('cc_trend_bookmarks', JSON.stringify(newBookmarks));
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleShareToWhatsApp = (trend: SocialTrend) => {
    const text = `🔥 Check out this trending Surat post on CityCircle: "${trend.title}"\n\nRead more: ${trend.source_url}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSubmitTrend = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrend: SocialTrend = {
      id: `trend-user-${Date.now()}`,
      platform: submitPlatform,
      title: submitTitle,
      content: submitContent,
      author_name: submitPlatform === 'instagram' ? 'Surat Resident' : 'u/surat_citizen',
      author_handle: submitPlatform === 'instagram' ? '@surat_creator' : 'u/surat_citizen',
      author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      source_url: submitUrl || 'https://instagram.com/surat',
      subreddit: submitPlatform === 'reddit' ? 'r/surat' : undefined,
      category: submitCategory,
      likes_count: 1,
      comments_count: 0,
      posted_at: 'Just now by you',
      neighborhood: submitNeighborhood || 'Surat City',
      is_verified_creator: true,
    };

    setTrends([newTrend, ...trends]);
    setShowSubmitModal(false);
    setToastMsg('🎉 Trend submitted to Surat Local Pulse!');
    setTimeout(() => setToastMsg(null), 4000);

    // Reset
    setSubmitTitle('');
    setSubmitUrl('');
    setSubmitContent('');
    setSubmitNeighborhood('');
  };

  // Filter trends
  const filteredTrends = trends.filter((trend) => {
    // Platform filter
    if (selectedPlatform === 'bookmarked') {
      if (!bookmarkedTrendIds.includes(trend.id)) return false;
    } else if (selectedPlatform !== 'all') {
      if (trend.platform !== selectedPlatform) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && trend.category !== selectedCategory) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = trend.title.toLowerCase().includes(q);
      const matchContent = trend.content?.toLowerCase().includes(q);
      const matchTags = trend.hashtags?.some((h) => h.toLowerCase().includes(q));
      const matchNeighborhood = trend.neighborhood?.toLowerCase().includes(q);
      return matchTitle || matchContent || matchTags || matchNeighborhood;
    }

    return true;
  });

  const sponsorBanner = INITIAL_SPONSOR_BANNERS[0];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-purple-900/30 via-primary/10 to-orange-500/10 border border-border p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-linear-to-r from-pink-500 to-rose-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                📸 Instagram Reels
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                💬 Reddit r/surat
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground flex items-center gap-2">
              Surat Social Pulse & Trends <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Curated viral reels, hidden cafe discoveries, civic debates, and top Reddit discussions from across Surat neighborhoods.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              onClick={fetchLiveTrends}
              variant="outline"
              disabled={loading}
              className="text-xs h-9 border-border bg-card hover:bg-muted"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Feed
            </Button>
            <Button
              onClick={() => setShowSubmitModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9 shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Submit Trend
            </Button>
          </div>
        </div>
      </div>

      {/* Platform Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border">
          <button
            onClick={() => setSelectedPlatform('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedPlatform === 'all'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🔥 All Trends ({trends.length})
          </button>
          <button
            onClick={() => setSelectedPlatform('instagram')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedPlatform === 'instagram'
                ? 'bg-linear-to-r from-purple-600 via-pink-600 to-rose-500 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>📸</span> Instagram Reels
          </button>
          <button
            onClick={() => setSelectedPlatform('reddit')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedPlatform === 'reddit'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>💬</span> Reddit (r/surat)
          </button>
          <button
            onClick={() => setSelectedPlatform('bookmarked')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedPlatform === 'bookmarked'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>⭐</span> Saved ({bookmarkedTrendIds.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts, cafes, #locho..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-input bg-card text-xs focus:outline-hidden focus:ring-2 focus:ring-primary shadow-2xs"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TREND_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Trends Grid */}
      {filteredTrends.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-3xl p-6">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <h3 className="text-base font-bold text-foreground mb-1">No Trends Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
            No active posts match your filter. Try changing your search query or submit a trending Surat post!
          </p>
          <Button size="sm" onClick={() => setShowSubmitModal(true)}>
            Submit Local Trend
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTrends.map((trend) => {
            const isInstagram = trend.platform === 'instagram';
            const isLiked = likedTrendIds.includes(trend.id);
            const isBookmarked = bookmarkedTrendIds.includes(trend.id);
            const currentLikes = reactionCounts[trend.id] ?? (trend.upvotes_count || trend.likes_count);

            return (
              <div
                key={trend.id}
                className="group rounded-3xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Media Header if Instagram with Image */}
                  {isInstagram && trend.image_url ? (
                    <div className="relative h-48 overflow-hidden bg-muted">
                      <img
                        src={trend.image_url}
                        alt={trend.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Instagram Pill Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider bg-linear-to-r from-purple-600 via-pink-600 to-rose-500 text-white shadow-md">
                          📸 Instagram
                        </span>
                        {trend.neighborhood && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs border border-white/10">
                            <MapPin className="w-2.5 h-2.5 text-accent" />
                            {trend.neighborhood}
                          </span>
                        )}
                      </div>

                      {/* Category Tag */}
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-card/90 text-foreground backdrop-blur-xs border border-border">
                          {trend.category}
                        </span>
                      </div>

                      {/* Bottom Caption on Image */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={trend.author_avatar}
                            alt={trend.author_name}
                            className="w-5 h-5 rounded-full object-cover border border-white/40"
                          />
                          <span className="text-xs font-bold truncate max-w-[140px] drop-shadow-xs">
                            {trend.author_handle}
                          </span>
                        </div>
                        <span className="text-[10px] text-white/80">{trend.posted_at}</span>
                      </div>
                    </div>
                  ) : (
                    /* Reddit Header Card */
                    <div className="p-4 pb-2 border-b border-border/40 bg-orange-500/5">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-600 text-white shadow-xs">
                            💬 {trend.subreddit || 'r/surat'}
                          </span>
                          {trend.neighborhood && (
                            <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5 text-primary" />
                              {trend.neighborhood}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border">
                          {trend.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{trend.author_name}</span>
                        <span>·</span>
                        <span className="text-[11px]">{trend.posted_at}</span>
                      </div>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-4 space-y-2.5">
                    <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                      {trend.title}
                    </h3>

                    {trend.content && (
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {trend.content}
                      </p>
                    )}

                    {/* Hashtags if available */}
                    {trend.hashtags && trend.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {trend.hashtags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Engagement Actions */}
                <div className="px-4 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    {/* Upvote / Like */}
                    <button
                      onClick={() => handleLike(trend.id, trend.upvotes_count || trend.likes_count)}
                      className={`flex items-center gap-1 font-semibold transition-colors ${
                        isLiked
                          ? 'text-rose-600 font-bold'
                          : 'hover:text-rose-600'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{currentLikes}</span>
                    </button>

                    {/* Comments count */}
                    <span className="flex items-center gap-1 font-medium">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{trend.comments_count}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Bookmark */}
                    <button
                      onClick={() => handleBookmark(trend.id)}
                      className={`p-1.5 rounded-lg border border-border/60 hover:bg-muted transition-colors ${
                        isBookmarked ? 'text-amber-500 bg-amber-500/10 border-amber-500/30' : 'text-muted-foreground'
                      }`}
                      title="Save to bookmarks"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>

                    {/* WhatsApp Share */}
                    <button
                      onClick={() => handleShareToWhatsApp(trend)}
                      className="p-1.5 rounded-lg border border-border/60 text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                      title="Share to WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Original Source Link */}
                    <a
                      href={trend.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-bold text-[11px] transition-colors"
                    >
                      <span>View</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Trend Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card text-card-foreground border border-border rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-600 flex items-center justify-center font-bold">
                  🔥
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold font-heading text-foreground">Submit a Surat Trend</h2>
                  <p className="text-[11px] text-muted-foreground">Share viral Instagram reels, local food spots, or Reddit threads.</p>
                </div>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitTrend} className="space-y-4 text-xs sm:text-sm mt-4">
              {/* Platform Selector */}
              <div>
                <label className="block font-semibold mb-1 text-foreground">Platform *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSubmitPlatform('instagram')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      submitPlatform === 'instagram'
                        ? 'bg-linear-to-r from-purple-600 via-pink-600 to-rose-500 text-white border-transparent shadow-xs'
                        : 'bg-background border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>📸</span> Instagram Reel / Post
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmitPlatform('reddit')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      submitPlatform === 'reddit'
                        ? 'bg-orange-600 text-white border-transparent shadow-xs'
                        : 'bg-background border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>💬</span> Reddit (r/surat)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground">Post Title / Reel Caption *</label>
                <input
                  type="text"
                  required
                  value={submitTitle}
                  onChange={(e) => setSubmitTitle(e.target.value)}
                  placeholder="e.g. Best cold coco debate in Pal, or SVNIT Drone Shots"
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary shadow-2xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground">Original Link / URL *</label>
                <input
                  type="url"
                  required
                  value={submitUrl}
                  onChange={(e) => setSubmitUrl(e.target.value)}
                  placeholder="https://instagram.com/reel/... or https://reddit.com/r/surat/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">Category *</label>
                  <select
                    value={submitCategory}
                    onChange={(e) => setSubmitCategory(e.target.value as TrendCategory)}
                    className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary text-xs shadow-2xs"
                  >
                    <option value="Food & Cafes">🍜 Food & Cafes</option>
                    <option value="Tech & Startups">🚀 Tech & Startups</option>
                    <option value="Events & Nightlife">🌙 Events & Nightlife</option>
                    <option value="Civic & Infrastructure">🏗️ Civic & Infrastructure</option>
                    <option value="Culture & Gems">💎 Culture & Gems</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">Neighborhood</label>
                  <input
                    type="text"
                    value={submitNeighborhood}
                    onChange={(e) => setSubmitNeighborhood(e.target.value)}
                    placeholder="e.g. Vesu, Piplod, Adajan"
                    className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary text-xs shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground">Quick Summary / Why it's trending (Optional)</label>
                <textarea
                  rows={2}
                  value={submitContent}
                  onChange={(e) => setSubmitContent(e.target.value)}
                  placeholder="Share details on why Surat residents should check this out..."
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary shadow-2xs text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => setShowSubmitModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary text-primary-foreground text-xs font-semibold shadow-xs">
                  Submit to Pulse
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
