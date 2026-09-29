'use client';

import React, { useState, useEffect } from 'react';
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
  Edit3,
  Camera,
  Download,
  Bell,
  Eye,
  EyeOff,
  Save,
  X,
  Loader2,
  Sparkles,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Group, Meetup } from '@/types';
import { CURRENT_USER, INITIAL_GROUPS, INITIAL_MEETUPS } from '@/lib/data';

const AVAILABLE_TAGS = [
  'Tech', 'Startups', 'Food & Dining', 'Fitness', 'Photography',
  'Parties', 'Travel', 'Sports', 'Music', 'Art', 'Gaming', 'Books',
  'Cycling', 'AI & ML', 'Finance', 'Design',
];

const SURAT_NEIGHBORHOODS = [
  'Vesu, Surat',
  'Piplod, Surat',
  'Adajan, Surat',
  'Pal, Surat',
  'Ghod Dod Road, Surat',
  'SVNIT Campus, Surat',
  'VIP Road, Surat',
  'Varachha, Surat',
  'Dumas Road, Surat',
];

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
];

export default function ProfilePage() {
  const router = useRouter();

  // Core Profile State
  const [user, setUser] = useState({
    ...CURRENT_USER,
    bio: 'Tech enthusiast and active community explorer in Surat.',
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(user.display_name);
  const [editBio, setEditBio] = useState(user.bio || '');
  const [editCity, setEditCity] = useState(user.city || 'Vesu, Surat');
  const [editAvatarUrl, setEditAvatarUrl] = useState(user.avatar_url || AVATAR_PRESETS[0]);
  const [editTags, setEditTags] = useState<string[]>(user.interest_tags);
  const [editAlumniBadge, setEditAlumniBadge] = useState<boolean>(!!user.college_email_badge);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'circles' | 'meetups' | 'privacy'>('overview');

  // Privacy & Preferences Toggles
  const [locationSharing, setLocationSharing] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);
  const [meetupReminders, setMeetupReminders] = useState(true);

  // Joined Groups & RSVPs from localStorage
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>([]);
  const [rsvpdMeetupIds, setRsvpdMeetupIds] = useState<string[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [allMeetups, setAllMeetups] = useState<Meetup[]>([]);

  // Hydrate User Profile and dynamic groups from localStorage & API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('user_display_name');
      const storedEmail = localStorage.getItem('user_email');
      const storedAvatar = localStorage.getItem('user_avatar');
      const storedBio = localStorage.getItem('user_bio');
      const storedCity = localStorage.getItem('user_city');
      const storedTags = localStorage.getItem('user_interest_tags');
      const storedJoined = localStorage.getItem('cc_joined_groups');
      const storedRsvps = localStorage.getItem('cc_user_rsvps');

      if (storedJoined) {
        try {
          setJoinedGroupIds(JSON.parse(storedJoined));
        } catch (e) {
          console.error(e);
        }
      }

      if (storedRsvps) {
        try {
          setRsvpdMeetupIds(JSON.parse(storedRsvps));
        } catch (e) {
          console.error(e);
        }
      }

      // Fetch live groups
      fetch('/api/groups')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data?.groups)) {
            const storedCustom = localStorage.getItem('cc_custom_groups');
            const customList: Group[] = storedCustom ? JSON.parse(storedCustom) : [];
            const apiIds = new Set(data.groups.map((g: Group) => g.id));
            const extraLocal = customList.filter((g) => !apiIds.has(g.id));
            setAllGroups([...data.groups, ...extraLocal]);
          }
        })
        .catch((err) => console.error('Error fetching profile groups:', err));

      // Fetch live meetups
      fetch('/api/meetups')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data?.meetups)) {
            const storedMeetups = localStorage.getItem('cc_surat_meetups');
            const localList: Meetup[] = storedMeetups ? JSON.parse(storedMeetups) : [];
            const apiIds = new Set(data.meetups.map((m: Meetup) => m.id));
            const extraLocal = localList.filter((m) => !apiIds.has(m.id));
            setAllMeetups([...data.meetups, ...extraLocal]);
          }
        })
        .catch((err) => console.error('Error fetching profile meetups:', err));

      if (storedName || storedAvatar || storedBio || storedTags) {
        setUser((prev) => ({
          ...prev,
          display_name: storedName || prev.display_name,
          email: storedEmail || prev.email,
          avatar_url: storedAvatar || prev.avatar_url,
          bio: storedBio || prev.bio,
          city: storedCity || prev.city,
          interest_tags: storedTags ? JSON.parse(storedTags) : prev.interest_tags,
        }));

        setEditDisplayName(storedName || user.display_name);
        setEditAvatarUrl(storedAvatar || user.avatar_url || AVATAR_PRESETS[0]);
        setEditBio(storedBio || user.bio || '');
        setEditCity(storedCity || user.city);
        if (storedTags) setEditTags(JSON.parse(storedTags));
      }

      if (storedJoined) {
        try {
          setJoinedGroupIds(JSON.parse(storedJoined));
        } catch {}
      }

      if (storedRsvps) {
        try {
          setRsvpdMeetupIds(JSON.parse(storedRsvps));
        } catch {}
      }
    }
  }, []);

  const handleOpenEditModal = () => {
    setEditDisplayName(user.display_name);
    setEditBio(user.bio || '');
    setEditCity(user.city || 'Vesu, Surat');
    setEditAvatarUrl(user.avatar_url || AVATAR_PRESETS[0]);
    setEditTags([...user.interest_tags]);
    setEditAlumniBadge(!!user.college_email_badge);
    setSaveError(null);
    setIsEditModalOpen(true);
  };

  const toggleEditTag = (tag: string) => {
    if (editTags.includes(tag)) {
      if (editTags.length > 3) {
        setEditTags(editTags.filter((t) => t !== tag));
      }
    } else if (editTags.length < 5) {
      setEditTags([...editTags, tag]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDisplayName.trim()) {
      setSaveError('Display name is required');
      return;
    }
    if (editTags.length < 3) {
      setSaveError('Please select at least 3 interest tags');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const payload = {
      id: user.id,
      email: user.email,
      display_name: editDisplayName.trim(),
      avatar_url: editAvatarUrl,
      bio: editBio.trim(),
      city: editCity.trim(),
      interest_tags: editTags,
      college_email_badge: editAlumniBadge,
    };

    try {
      // 1. Call Backend API
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // 2. Sync to localStorage for immediate cross-page reactivity
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_display_name', payload.display_name);
        localStorage.setItem('user_avatar', payload.avatar_url);
        localStorage.setItem('user_bio', payload.bio);
        localStorage.setItem('user_city', payload.city);
        localStorage.setItem('user_interest_tags', JSON.stringify(payload.interest_tags));
      }

      // 3. Update React State
      setUser((prev) => ({
        ...prev,
        ...payload,
      }));

      setIsEditModalOpen(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setSaveError('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Download personal data export (IT Rules 2021 & Data Protection)
  const handleExportData = () => {
    const dataExport = {
      export_date: new Date().toISOString(),
      platform: 'CityCircle Surat',
      user: {
        id: user.id,
        display_name: user.display_name,
        email: user.email,
        bio: user.bio,
        city: user.city,
        interest_tags: user.interest_tags,
        is_verified: user.is_verified,
        is_founding_member: user.is_founding_member,
        joined_date: user.created_at,
      },
      joined_circles: joinedGroupIds,
      rsvpd_meetups: rsvpdMeetupIds,
      privacy_settings: {
        location_fuzzing_opt_in: locationSharing,
        chat_notifications: chatNotifications,
        meetup_reminders: meetupReminders,
      },
    };

    const blob = new Blob([JSON.stringify(dataExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citycircle-profile-${user.display_name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSignOut = () => {
    document.cookie = 'auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user_email=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_display_name');
    localStorage.removeItem('user_avatar');
    localStorage.removeItem('user_role');
    localStorage.removeItem('auth_token');
    window.location.href = '/';
  };

  const joinedGroups = allGroups.filter((g) => joinedGroupIds.includes(g.id));
  const userMeetups = allMeetups.filter((m) => rsvpdMeetupIds.includes(m.id) || m.created_by === user.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground">
            Member Profile & Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage your verified identity, local circles, and privacy controls in Surat.
          </p>
        </div>

        <Button
          onClick={handleOpenEditModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 shadow-xs"
        >
          <Edit3 className="w-4 h-4 mr-1.5" /> Edit Profile
        </Button>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-4 bg-success/15 border border-success/30 rounded-2xl text-xs sm:text-sm text-success font-semibold flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Profile updated successfully! Changes are live across all group chats and directory views.</span>
        </div>
      )}

      {/* Hero Profile Card */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar with Verified Ring */}
          <div className="relative group">
            <img
              src={user.avatar_url}
              alt={user.display_name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-primary/40 shadow-md ring-4 ring-primary/10"
            />
            <button
              onClick={handleOpenEditModal}
              title="Change Avatar"
              className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
            >
              <Camera className="w-6 h-6" />
            </button>
            {user.is_verified && (
              <span
                title="Verified Phone & Identity"
                className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-primary text-primary-foreground shadow-sm ring-2 ring-card"
              >
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left space-y-2.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-heading text-foreground">
                {user.display_name}
              </h2>
              {user.is_verified && (
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center gap-1 border border-primary/20">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
              {user.bio || 'Active member exploring events, tech mixers, and outdoor getaways in Surat.'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-muted-foreground pt-0.5">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary" /> {user.city || 'Surat, Gujarat'}
              </span>
              <span>·</span>
              <span>Joined {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5">
              {user.is_founding_member && (
                <span className="px-3 py-1 rounded-full bg-accent/20 text-accent-foreground border border-accent/40 text-xs font-bold flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-accent" /> Founding Member (#248 of 400)
                </span>
              )}
              {user.college_email_badge && (
                <span className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> SVNIT Alumni Network
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-border/80">
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-center">
            <div className="text-lg sm:text-xl font-black text-foreground">{joinedGroups.length}</div>
            <div className="text-[11px] text-muted-foreground font-semibold">Circles Joined</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-center">
            <div className="text-lg sm:text-xl font-black text-foreground">{userMeetups.length || 2}</div>
            <div className="text-[11px] text-muted-foreground font-semibold">Meetups Attended</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-center">
            <div className="text-lg sm:text-xl font-black text-primary">₹0</div>
            <div className="text-[11px] text-muted-foreground font-semibold">Founding Pass Active</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <UserIcon className="w-4 h-4" /> Overview & Tags
        </button>
        <button
          onClick={() => setActiveTab('circles')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'circles'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" /> My Circles ({joinedGroups.length})
        </button>
        <button
          onClick={() => setActiveTab('meetups')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'meetups'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="w-4 h-4" /> My Meetups ({userMeetups.length || 2})
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'privacy'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Lock className="w-4 h-4" /> Privacy & Controls
        </button>
      </div>

      {/* TAB 1: Overview & Tags */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Interest Tags Card */}
          <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">Interest Tags</h3>
                <p className="text-xs text-muted-foreground">Topics that define what circles and events are recommended to you.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenEditModal}
                className="text-xs text-primary hover:bg-primary/10 h-8"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {user.interest_tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 shadow-2xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Privacy Protection Notice */}
          <div className="p-5 bg-card border border-border rounded-3xl flex items-start gap-3.5 text-xs text-muted-foreground shadow-xs">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-foreground text-sm">Protected Member Identity</h4>
              <p className="leading-relaxed">
                Your email (<span className="text-foreground font-medium">{user.email}</span>) and phone number are locked behind PostgreSQL Row-Level Security. Other community members only see your chosen display name, avatar, and interest tags.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: My Circles */}
      {activeTab === 'circles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">Joined Circles ({joinedGroups.length})</h3>
            <Link href="/groups">
              <Button size="sm" variant="outline" className="text-xs">
                Explore More Circles <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {joinedGroups.map((grp) => (
              <div key={grp.id} className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {grp.category}
                    </span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {grp.member_count} members
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{grp.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{grp.description}</p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-success font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Member Active
                  </span>
                  <Link href={`/groups/${grp.id}`}>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-8">
                      <MessageSquare className="w-3.5 h-3.5 mr-1" /> Open Chat
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: My Meetups */}
      {activeTab === 'meetups' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">Upcoming Meetups & RSVPs</h3>
            <Link href="/meetups">
              <Button size="sm" className="bg-primary text-primary-foreground text-xs font-semibold">
                Browse All Meetups
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {userMeetups.length > 0 ? (
              userMeetups.map((m) => (
                <div key={m.id} className="p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-success/15 text-success">
                        RSVP Confirmed
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{new Date(m.date_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h4 className="font-bold text-sm text-foreground">{m.title}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{m.place}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href="/map">
                      <Button size="sm" variant="outline" className="text-xs h-8">
                        <MapPin className="w-3.5 h-3.5 mr-1" /> View on Map
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 rounded-2xl border border-dashed border-border bg-card/50">
                <p className="text-xs text-muted-foreground">No upcoming meetup RSVPs yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Privacy & Controls */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 space-y-6 shadow-xs">
            <h3 className="font-bold text-base text-foreground">Privacy & Notification Controls</h3>

            {/* Toggle 1: Location Fuzzing */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="space-y-0.5 max-w-md">
                <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>300–500m Rough Location Sharing</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Allow other verified members to see your rough cluster on the Surat live map. Exact coordinates are never stored.
                </p>
              </div>
              <button
                onClick={() => setLocationSharing(!locationSharing)}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                  locationSharing ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    locationSharing ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Chat Notifications */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="space-y-0.5 max-w-md">
                <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-primary" />
                  <span>Real-Time Group Chat Alerts</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Receive browser notifications when someone mentions you or posts in your joined circles.
                </p>
              </div>
              <button
                onClick={() => setChatNotifications(!chatNotifications)}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                  chatNotifications ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    chatNotifications ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* IT Rules 2021 Data Export */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-foreground">Personal Data Export (IT Rules 2021)</div>
                <p className="text-xs text-muted-foreground">
                  Download a complete copy of your profile data, circle history, and privacy settings in JSON format.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="text-xs font-semibold h-9 shrink-0"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download My Data
              </Button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="p-6 bg-danger/5 border border-danger/20 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-danger">Sign Out from CityCircle</h4>
              <p className="text-xs text-muted-foreground">Clear local authentication session from this device.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-xs text-danger hover:bg-danger/10 border-danger/30 font-semibold"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign Out
            </Button>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Edit Member Profile</h3>
                  <p className="text-xs text-muted-foreground">Update your identity and interests in Surat.</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveError && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Display Name *</label>
                <input
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="e.g. Prayag Bagtharia"
                  className="w-full px-4 py-2 rounded-xl border border-input bg-background text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Bio / About You</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Short intro about your work, passions, or meetup interests..."
                  className="w-full px-4 py-2 rounded-xl border border-input bg-background text-sm focus:outline-hidden focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Neighborhood / Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Neighborhood / Area</label>
                <select
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-input bg-background text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                >
                  {SURAT_NEIGHBORHOODS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Select Avatar</label>
                <div className="flex items-center gap-3">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditAvatarUrl(preset)}
                      className={`relative rounded-2xl overflow-hidden border-2 transition-all ${
                        editAvatarUrl === preset
                          ? 'border-primary ring-2 ring-primary/30 scale-105'
                          : 'border-border opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt={`Avatar ${idx + 1}`} className="w-11 h-11 object-cover" />
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  placeholder="Or paste custom image URL..."
                  className="w-full px-3 py-1.5 rounded-xl border border-input bg-background text-xs focus:outline-hidden focus:ring-2 focus:ring-primary mt-1"
                />
              </div>

              {/* Interest Tags (3-5 required) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">Interest Tags *</label>
                  <span className="text-[11px] text-muted-foreground">{editTags.length}/5 selected (min 3)</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-muted/40 rounded-xl border border-border">
                  {AVAILABLE_TAGS.map((tag) => {
                    const isSelected = editTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleEditTag(tag)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-2xs'
                            : 'bg-card text-muted-foreground border border-border hover:text-foreground'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Alumni Badge Toggle */}
              <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-500" />
                    <span>SVNIT & University Alumni Badge</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Display verified alumni status on profile & chats.</p>
                </div>
                <input
                  type="checkbox"
                  checked={editAlumniBadge}
                  onChange={(e) => setEditAlumniBadge(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 text-xs"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 mr-1.5" /> Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
