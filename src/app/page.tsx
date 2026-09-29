'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Sparkles,
  MapPin,
  Users,
  MessageSquare,
  Lock,
  ArrowRight,
  Gift,
  CheckCircle2,
  Calendar,
  Building,
  Compass,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { INITIAL_GROUPS, INITIAL_MEETUPS } from '@/lib/data';
import { CATEGORY_CONFIG } from '@/lib/category-helpers';

export default function LandingPage() {
  const [promoCode, setPromoCode] = useState('');
  const [promoValid, setPromoValid] = useState<boolean | null>(null);

  const handleValidateCode = (e: React.FormEvent) => {
    e.preventDefault();
    const validCodes = ['FOUNDER2026', 'SURATVIP', 'CITYCIRCLE100', 'EARLYACCESS'];
    if (validCodes.includes(promoCode.trim().toUpperCase())) {
      setPromoValid(true);
    } else {
      setPromoValid(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      <PWAInstallPrompt />

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-card/85 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-md shadow-primary/20">
              C
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-foreground font-heading">
                  CityCircle
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-accent/20 text-accent-foreground rounded-full border border-accent/30">
                  Surat
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="font-medium text-sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 shadow-sm">
                Join Surat
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 border-b border-border/60 bg-linear-to-b from-primary/5 via-transparent to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          {/* Founding Member Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-xs sm:text-sm font-semibold text-accent-foreground mb-6 shadow-xs animate-bounce duration-1000">
            <Gift className="w-4 h-4 text-accent" />
            <span>Founding Member Free Pass: First 300–400 signups join free</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground font-heading leading-tight mb-6">
            Real Surat Communities. <br />
            <span className="text-primary underline decoration-accent decoration-wavy decoration-3 underline-offset-8">
              Verified & Real-World.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Join vetted interest circles in Surat (Tech, Treks, Foodies, Campus & Property). 
            Chat safely with moderated media, and turn group vibes into real-world meetups.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <Link href="/auth/signup" className="w-full sm:w-auto flex-1">
              <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base h-12 shadow-md">
                Get Started — ₹250
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/groups" className="w-full sm:w-auto flex-1">
              <Button variant="outline" size="lg" className="w-full h-12 text-base font-semibold border-border">
                Explore Groups
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Phone Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-primary" />
              <span>Zero Contact Exposure</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              <span>300–500m Fuzzed Map</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Seed Communities Spotlight */}
      <section className="py-14 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
              Live Seed Communities in Surat
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading">
              Find Your Circle in the Diamond City
            </h2>
          </div>
          <Link href="/groups" className="text-sm font-semibold text-primary hover:underline mt-2 md:mt-0 flex items-center gap-1">
            View all 5 categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_GROUPS.slice(0, 3).map((group) => {
            const config = CATEGORY_CONFIG[group.category];
            const Icon = config.icon;
            return (
              <div
                key={group.id}
                className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all flex flex-col"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={group.cover_url}
                    alt={group.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-xs bg-card/90 backdrop-blur-xs text-foreground border border-border"
                      style={{ borderLeftColor: config.color, borderLeftWidth: 3 }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                      {group.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-xs font-semibold text-muted-foreground border border-border">
                    {group.member_count} members
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      {group.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {group.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Admin: {group.admin_name}</span>
                    <Link href={`/groups/${group.id}`}>
                      <Button size="sm" variant="outline" className="h-8 text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground">
                        View Circle
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Meetups Preview */}
      <section className="py-12 px-4 sm:px-6 bg-muted/40 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
              <Calendar className="w-3.5 h-3.5" />
              Real-World Meetups
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading">
              Step Offline with Verified Locals
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Every group translates online chats into well-organized real-world events across Surat venues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INITIAL_MEETUPS.slice(0, 2).map((meetup) => (
              <div
                key={meetup.id}
                className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold text-primary px-2.5 py-1 rounded-md bg-primary/10">
                      {meetup.group_name}
                    </span>
                    <span className="text-xs font-bold text-accent">
                      {meetup.ticket_price === 0 ? 'FREE RSVP' : `₹${meetup.ticket_price}`}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{meetup.title}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{meetup.description}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/60">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">{meetup.place}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">
                      {meetup.rsvps_count} / {meetup.capacity} Going
                    </span>
                    <Link href="/meetups">
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold">
                        RSVP Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust, Safety & Fuzzed Location Section */}
      <section className="py-14 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-3">
            Privacy First. Verified by Design.
          </h2>
          <p className="text-sm text-muted-foreground">
            Built for local trust without compromising your personal safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-2">Display Name & Avatar Only</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your phone number and email are locked behind PostgreSQL Row-Level Security. Other members only see your chosen display name and interest tags.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="w-12 h-12 rounded-xl bg-accent/15 text-accent-foreground flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-base font-bold mb-2">300–500m Server Fuzzing</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Opt-in rough location map is fuzzed before database storage and auto-expires after 3 hours. Includes an instant one-tap panic button.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="w-12 h-12 rounded-xl bg-danger/10 text-danger flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-2">Moderated Media & 24h SLA</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Images are pre-moderated before appearing in chat. Dedicated local moderator handles community reports under Indian IT Rules 2021.
            </p>
          </div>
        </div>
      </section>

      {/* Founding Member Code Redemption Card */}
      <section className="py-10 px-4 sm:px-6 max-w-xl mx-auto w-full">
        <div className="p-6 sm:p-8 rounded-3xl bg-card border-2 border-accent/40 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">
            Founding Pass
          </div>

          <h3 className="text-xl font-bold mb-2 font-heading">Have a Founding Member Code?</h3>
          <p className="text-xs text-muted-foreground mb-4">
            First 300–400 verified Surat members join with ₹0 fee using special partner invite codes.
          </p>

          <form onSubmit={handleValidateCode} className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value);
                setPromoValid(null);
              }}
              placeholder="e.g. FOUNDER2026 or SURATVIP"
              className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-sm uppercase tracking-wider focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" className="bg-primary text-primary-foreground font-semibold px-4">
              Verify
            </Button>
          </form>

          {promoValid === true && (
            <div className="mt-3 p-3 bg-success/15 border border-success/30 rounded-xl text-xs text-success font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Code Valid! You unlock ₹0 founding member access. Click Join Now below.</span>
            </div>
          )}
          {promoValid === false && (
            <div className="mt-3 p-3 bg-danger/15 border border-danger/30 rounded-xl text-xs text-danger font-medium">
              Invalid or expired code. Try <span className="font-mono font-bold">FOUNDER2026</span> or proceed with standard ₹250 joining fee.
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/auth/signup">
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-11">
                Claim Membership & Join
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Intent-First FAQ Section (AEO & AI Search Optimized) */}
      <section className="py-14 px-4 sm:px-6 max-w-4xl mx-auto w-full border-t border-border/60">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Frequently Asked Questions</span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading mt-1 mb-2">
            Everything You Need to Know About CityCircle Surat
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Direct, definitive answers to help members and answer engines understand our local community.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-card border border-border">
            <h3 className="text-sm sm:text-base font-bold text-foreground mb-1.5">
              What is CityCircle Surat?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              CityCircle Surat is the verified, hyper-local community platform connecting residents across tech startups, weekend trekking, food explorations, and university alumni in Surat, Gujarat. It combines real-time group chat with interactive Google Maps venue discovery and offline event RSVPs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border">
            <h3 className="text-sm sm:text-base font-bold text-foreground mb-1.5">
              How do I find and join tech & startup meetups in Surat?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Join the <strong className="text-foreground">Surat Tech & Startup Circle</strong> on CityCircle to connect with founders, engineers, and creators. The circle hosts monthly developer mixers, demo days, and AI hack sessions in Vesu and Piplod with 1-click RSVP.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border">
            <h3 className="text-sm sm:text-base font-bold text-foreground mb-1.5">
              How does CityCircle protect my location and privacy?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              CityCircle enforces server-side location fuzzing. Your exact GPS point is never saved; instead, coordinates are blurred to a 300–500m radius and automatically purged from the database after 3 hours. You can revoke location sharing anytime using the instant panic button.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border">
            <h3 className="text-sm sm:text-base font-bold text-foreground mb-1.5">
              How are community discussions and images moderated?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              All image uploads undergo automated moderation verification before public display. In compliance with India’s Information Technology Rules 2021, members can flag objectionable content for review by our dedicated Chief Grievance Officer within a 24-hour SLA.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border">
            <h3 className="text-sm sm:text-base font-bold text-foreground mb-1.5">
              How can I host my own meetup or circle in Surat?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Any verified member can create an event by clicking &quot;Host Meetup&quot;, picking an exact venue on the interactive Google Map, specifying attendee capacity, and setting free or ticketed pricing with Razorpay integration.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-card/50 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">CityCircle Surat</span>
            <span>· Version 0.5 (2026)</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/grievance" className="hover:text-primary transition-colors underline">
              Grievance Officer (IT Rules 2021)
            </Link>
            <a href="/llms.txt" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors font-mono text-[11px]">
              llms.txt (AI Context)
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
