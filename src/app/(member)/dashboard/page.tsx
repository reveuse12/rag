'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Gift,
  Plus,
  Compass,
  MessageSquare,
  Flame,
  Heart,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INITIAL_GROUPS, INITIAL_MEETUPS, INITIAL_SPONSOR_BANNERS, INITIAL_SURAT_TRENDS, CURRENT_USER } from '@/lib/data';
import { CATEGORY_CONFIG } from '@/lib/category-helpers';

export default function DashboardPage() {
  const sponsor = INITIAL_SPONSOR_BANNERS[0];
  const [userName, setUserName] = React.useState(CURRENT_USER.display_name);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user_display_name');
      if (stored) setUserName(stored);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-primary/15 via-primary/5 to-transparent border border-primary/20 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                Surat Community Hub
              </span>
              <span className="text-xs text-muted-foreground">· Verified Resident</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground">
              Welcome back, {userName}!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              You are part of the first 300 founding members in Surat. Explore live meetups, chat with local creators, and share your rough location.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link href="/groups">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm h-10 shadow-xs">
                Explore Circles
              </Button>
            </Link>
            <Link href="/trends">
              <Button variant="outline" className="text-xs sm:text-sm h-10 font-semibold border-border flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                Local Trends
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <Link
          href="/groups"
          className="p-4 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-xs transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div className="font-bold text-sm text-foreground mb-0.5">Circles</div>
          <div className="text-[11px] text-muted-foreground">5 Categories</div>
        </Link>

        <Link
          href="/meetups"
          className="p-4 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-xs transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent-foreground flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5 text-accent" />
          </div>
          <div className="font-bold text-sm text-foreground mb-0.5">Meetups</div>
          <div className="text-[11px] text-muted-foreground">Gatherings</div>
        </Link>

        <Link
          href="/trends"
          className="p-4 rounded-2xl bg-card border border-border hover:border-orange-500/50 hover:shadow-xs transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Flame className="w-5 h-5" />
          </div>
          <div className="font-bold text-sm text-foreground mb-0.5 flex items-center gap-1">
            Trends <span className="text-[9px] bg-rose-500/20 text-rose-600 px-1 py-0.2 rounded font-extrabold">NEW</span>
          </div>
          <div className="text-[11px] text-muted-foreground">Instagram & Reddit</div>
        </Link>

        <Link
          href="/map"
          className="p-4 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-xs transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="font-bold text-sm text-foreground mb-0.5">Live Map</div>
          <div className="text-[11px] text-muted-foreground">Fuzzed Zones</div>
        </Link>

        <Link
          href="/profile"
          className="p-4 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-xs transition-all group col-span-2 sm:col-span-1"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="font-bold text-sm text-foreground mb-0.5">Profile</div>
          <div className="text-[11px] text-muted-foreground">Verified ID</div>
        </Link>
      </div>

      {/* Featured Circles & Next Meetups Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Circles */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-heading">Active Circles in Surat</h2>
            <Link href="/groups" className="text-xs font-semibold text-primary hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {INITIAL_GROUPS.slice(0, 4).map((group) => {
              const cfg = CATEGORY_CONFIG[group.category];
              const Icon = cfg.icon;
              return (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="p-4 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-foreground border border-border"
                        style={{ borderLeftColor: cfg.color, borderLeftWidth: 3 }}
                      >
                        <Icon className="w-3 h-3" style={{ color: cfg.color }} />
                        {group.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{group.member_count} members</span>
                    </div>
                    <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {group.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{group.description}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Admin: {group.admin_name}</span>
                    <span className="text-primary font-semibold flex items-center gap-0.5">
                      Open Chat <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Upcoming Meetup Spotlight & Sponsor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-heading">Next Meetup</h2>
            <Link href="/meetups" className="text-xs font-semibold text-primary hover:underline">
              All Meetups
            </Link>
          </div>

          {INITIAL_MEETUPS[0] && (
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-accent/20 text-accent-foreground">
                  Featured Gathering
                </span>
                <span className="text-xs font-bold text-primary">FREE RSVP</span>
              </div>
              <h3 className="font-bold text-sm text-foreground">{INITIAL_MEETUPS[0].title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">{INITIAL_MEETUPS[0].description}</p>
              <div className="text-xs text-muted-foreground space-y-1 pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {new Date(INITIAL_MEETUPS[0].date_time).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span className="truncate">{INITIAL_MEETUPS[0].place}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  {INITIAL_MEETUPS[0].rsvps_count} / {INITIAL_MEETUPS[0].capacity} Going
                </span>
                <Link href="/meetups">
                  <Button size="sm" className="bg-primary text-primary-foreground text-xs font-semibold h-7">
                    RSVP
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Sponsor card */}
          {sponsor && (
            <div className="p-4 rounded-2xl bg-accent/10 border border-accent/30 space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-accent-foreground tracking-wider">
                <Sparkles className="w-3 h-3 text-accent" />
                <span>Featured Sponsor</span>
              </div>
              <div className="font-bold text-xs text-foreground">{sponsor.title}</div>
              <div className="text-[11px] text-muted-foreground">{sponsor.description}</div>
              <a
                href={sponsor.link_url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-accent-foreground hover:underline inline-block pt-1"
              >
                Claim Partner Offer →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Surat Social Pulse & Trends (Instagram & Reddit) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold font-heading flex items-center gap-2">
              Surat Social Pulse <Flame className="w-5 h-5 text-orange-500" />
            </h2>
            <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-linear-to-r from-pink-500/10 via-purple-500/10 to-orange-500/10 text-primary border border-border">
              Instagram Reels & Reddit r/surat
            </span>
          </div>
          <Link href="/trends" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            Explore All Trends <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INITIAL_SURAT_TRENDS.slice(0, 3).map((trend) => {
            const isInstagram = trend.platform === 'instagram';
            return (
              <div
                key={trend.id}
                className="p-4 rounded-3xl bg-card border border-border hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-2xs ${
                        isInstagram
                          ? 'bg-linear-to-r from-purple-600 via-pink-600 to-rose-500'
                          : 'bg-orange-600'
                      }`}
                    >
                      {isInstagram ? '📸 Instagram' : '💬 ' + (trend.subreddit || 'r/surat')}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{trend.posted_at}</span>
                  </div>

                  <h4 className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {trend.title}
                  </h4>

                  {trend.content && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {trend.content}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                    <Heart className="w-3 h-3 text-rose-500" />
                    <span>{trend.upvotes_count || trend.likes_count}</span>
                    <span className="text-muted-foreground/60">·</span>
                    <MessageSquare className="w-3 h-3" />
                    <span>{trend.comments_count}</span>
                  </div>

                  <a
                    href={trend.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                  >
                    <span>Read</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

