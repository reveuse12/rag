'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  ShieldCheck,
  Gift,
  GraduationCap,
  MapPin,
  Mail,
  Lock,
  Calendar,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CURRENT_USER } from '@/lib/data';

const AVAILABLE_TAGS = [
  'Tech', 'Startups', 'Food & Dining', 'Fitness', 'Photography',
  'Parties', 'Travel', 'Sports', 'Music', 'Art', 'Gaming', 'Books',
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(CURRENT_USER);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(user.interest_tags);
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('user_display_name');
      const storedEmail = localStorage.getItem('user_email');
      const storedAvatar = localStorage.getItem('user_avatar');
      if (storedName) {
        setUser((prev) => ({
          ...prev,
          display_name: storedName,
          email: storedEmail || prev.email,
          avatar_url: storedAvatar || prev.avatar_url,
        }));
      }
    }
  }, []);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      if (selectedTags.length > 3) {
        setSelectedTags(selectedTags.filter((t) => t !== tag));
      }
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSaveTags = () => {
    setUser({ ...user, interest_tags: selectedTags });
    setIsEditingTags(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSignOut = () => {
    document.cookie = 'auth_token=; path=/; max-age=0';
    document.cookie = 'user_email=; path=/; max-age=0';
    localStorage.removeItem('user_email');
    localStorage.removeItem('auth_token');
    router.push('/');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground">
          Member Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Manage your verified identity, privacy controls, and community badges.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative">
            <img
              src={user.avatar_url}
              alt={user.display_name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-primary/30 shadow-md"
            />
            {user.is_verified && (
              <span
                title="Verified Phone & Identity"
                className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-primary text-primary-foreground shadow-sm"
              >
                <ShieldCheck className="w-5 h-5" />
              </span>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-bold font-heading">{user.display_name}</h2>
              {user.is_verified && (
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" /> {user.city}, India
              </span>
              <span>·</span>
              <span>Member since {new Date(user.created_at).toLocaleDateString()}</span>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              {user.is_founding_member && (
                <span className="px-3 py-1 rounded-full bg-accent/20 text-accent-foreground border border-accent/40 text-xs font-bold flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-accent" /> Founding Member (#248 of 400)
                </span>
              )}
              {user.college_email_badge && (
                <span className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> SVNIT Alumni Badge
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-4 bg-muted/60 border border-border rounded-2xl flex items-center gap-3 text-xs text-muted-foreground">
          <Lock className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong className="text-foreground">Privacy Protection:</strong> Other members only see your display name and avatar. Your phone number and email are encrypted and never exposed in the UI or API.
          </span>
        </div>

        {/* Interest Tags */}
        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">Interest Tags (3–5 tags)</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingTags(!isEditingTags)}
              className="text-xs text-primary hover:bg-primary/10 h-7"
            >
              <Edit2 className="w-3 h-3 mr-1" />
              {isEditingTags ? 'Cancel' : 'Edit Tags'}
            </Button>
          </div>

          {isEditingTags ? (
            <div className="space-y-3 p-4 bg-muted/40 rounded-2xl border border-border">
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-card text-muted-foreground border border-border hover:text-foreground'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  {selectedTags.length}/5 selected (minimum 3)
                </span>
                <Button size="sm" onClick={handleSaveTags} className="bg-primary text-primary-foreground text-xs font-semibold">
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.interest_tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {savedSuccess && (
            <div className="text-xs text-success font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Interest tags updated successfully!
            </div>
          )}
        </div>

        {/* Membership & Payment Status */}
        <div className="pt-4 border-t border-border space-y-3">
          <h3 className="font-bold text-sm text-foreground">Membership & Verification</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
              <div className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Joining Fee Status</div>
              <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-accent" />
                <span>₹0 — Founding Member Pass</span>
              </div>
              <div className="text-[11px] text-muted-foreground">Code redeemed: SURATVIP</div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
              <div className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Community Role</div>
              <div className="text-sm font-bold text-foreground capitalize">{user.role} (Admin Access)</div>
              <div className="text-[11px] text-muted-foreground">City: Surat, Gujarat</div>
            </div>
          </div>
        </div>

        {/* Quick Links & Sign Out */}
        <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs">
            <Link href="/grievance" className="text-muted-foreground hover:text-primary underline">
              Grievance Officer (IT Rules 2021)
            </Link>
            <Link href="/admin" className="text-muted-foreground hover:text-primary">
              Admin & Moderation Portal
            </Link>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="text-xs text-danger hover:bg-danger/10 border-danger/30 font-semibold"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
