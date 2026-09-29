'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Users,
  Shield,
  Lock,
  Globe,
  Sparkles,
  ExternalLink,
  Info,
  Check,
  Clock,
  ShieldCheck,
  MessageSquare,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Group, GroupCategory } from '@/types';
import { INITIAL_GROUPS, INITIAL_SPONSOR_BANNERS } from '@/lib/data';
import { CATEGORIES, CATEGORY_CONFIG } from '@/lib/category-helpers';
import { useCity } from '@/context/city-context';

export default function GroupsPage() {
  const { currentCity } = useCity();
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>([]);
  const [requestedGroupIds, setRequestedGroupIds] = useState<string[]>([]);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Form State for creating a group with WhatsApp-style limits
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GroupCategory>('Custom');
  const [isPublic, setIsPublic] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [maxMembers, setMaxMembers] = useState<number>(256);
  const [onlyAdminsMessage, setOnlyAdminsMessage] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [rules, setRules] = useState('');
  const [coverUrl, setCoverUrl] = useState(
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'
  );

  // Load persistent groups, joined states, and requests
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedJoined = localStorage.getItem('cc_joined_groups');
      if (storedJoined) {
        try {
          setJoinedGroupIds(JSON.parse(storedJoined));
        } catch (e) {
          console.error(e);
        }
      }

      const storedReq = localStorage.getItem('cc_requested_groups');
      if (storedReq) {
        try {
          setRequestedGroupIds(JSON.parse(storedReq));
        } catch (e) {
          console.error(e);
        }
      }

      // Merge any custom stored groups
      const storedCustomGroups = localStorage.getItem('cc_custom_groups');
      if (storedCustomGroups) {
        try {
          const parsed: Group[] = JSON.parse(storedCustomGroups);
          setGroups((prev) => {
            const existingIds = new Set(prev.map((g) => g.id));
            const newOnes = parsed.filter((g) => !existingIds.has(g.id));
            return [...newOnes, ...prev];
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const filteredGroups = groups.filter((group) => {
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleJoinAction = (e: React.MouseEvent, group: Group) => {
    e.preventDefault();
    e.stopPropagation();

    const isMember = joinedGroupIds.includes(group.id);
    const isRequested = requestedGroupIds.includes(group.id);

    // If already a member, leave
    if (isMember) {
      const updated = joinedGroupIds.filter((id) => id !== group.id);
      setJoinedGroupIds(updated);
      localStorage.setItem('cc_joined_groups', JSON.stringify(updated));
      setNotificationMsg(`Left ${group.name}`);
      setTimeout(() => setNotificationMsg(null), 3000);
      return;
    }

    // Check capacity limit
    const memberCount = group.member_count ?? 0;
    const cap = group.max_members || 256;
    if (memberCount >= cap) {
      setNotificationMsg(`This circle has reached its maximum limit (${cap} members).`);
      setTimeout(() => setNotificationMsg(null), 3500);
      return;
    }

    // If requires admin approval (WhatsApp "Approve New Participants")
    if (group.require_approval || !group.is_public) {
      if (isRequested) {
        // Cancel request
        const updatedReq = requestedGroupIds.filter((id) => id !== group.id);
        setRequestedGroupIds(updatedReq);
        localStorage.setItem('cc_requested_groups', JSON.stringify(updatedReq));
        setNotificationMsg(`Cancelled join request for ${group.name}`);
      } else {
        // Send request
        const updatedReq = [...requestedGroupIds, group.id];
        setRequestedGroupIds(updatedReq);
        localStorage.setItem('cc_requested_groups', JSON.stringify(updatedReq));
        setNotificationMsg(`Request sent to admins of ${group.name}`);
      }
      setTimeout(() => setNotificationMsg(null), 3000);
      return;
    }

    // Direct Join
    const updated = [...joinedGroupIds, group.id];
    setJoinedGroupIds(updated);
    localStorage.setItem('cc_joined_groups', JSON.stringify(updated));
    setNotificationMsg(`Joined ${group.name}! Welcome aboard.`);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const newGroup: Group = {
      id: `g-${Date.now()}`,
      name,
      description,
      category,
      is_public: isPublic,
      admin_id: 'a0000000-0000-0000-0000-000000000001',
      admin_name: 'Prayag B. (You)',
      cover_url: coverUrl,
      rules: rules || '1. Be respectful and constructive.\n2. No spam.\n3. Verified Surat members only.',
      member_count: 1,
      max_members: maxMembers,
      require_approval: requireApproval || !isPublic,
      only_admins_message: onlyAdminsMessage,
      verified_only: verifiedOnly,
      invite_code: `surat-${Math.random().toString(36).substring(2, 8)}`,
      invite_link_enabled: true,
      created_at: new Date().toISOString(),
    };

    const updatedGroups = [newGroup, ...groups];
    setGroups(updatedGroups);

    // Save custom created groups
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cc_custom_groups');
      const customList = stored ? JSON.parse(stored) : [];
      localStorage.setItem('cc_custom_groups', JSON.stringify([newGroup, ...customList]));
    }

    // Auto join as admin
    const newJoined = [...joinedGroupIds, newGroup.id];
    setJoinedGroupIds(newJoined);
    localStorage.setItem('cc_joined_groups', JSON.stringify(newJoined));

    setShowCreateModal(false);
    setNotificationMsg(`Circle "${newGroup.name}" created with ${maxMembers} member limit!`);
    setTimeout(() => setNotificationMsg(null), 4000);

    // Reset fields
    setName('');
    setDescription('');
    setRules('');
    setMaxMembers(256);
    setRequireApproval(false);
    setOnlyAdminsMessage(false);
    setVerifiedOnly(false);
  };

  const sponsorBanner = INITIAL_SPONSOR_BANNERS.find((b) => b.placement === 'global' || b.placement === 'group');

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground">
              {currentCity.name} Community Circles
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              WhatsApp-Controlled
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Join interest-based circles, chat in real-time, or create protected groups with member limits & admin approval in {currentCity.name}.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shrink-0 shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Circle
        </Button>
      </div>

      {/* Sponsored Banner Slot */}
      {sponsorBanner && (
        <div className="p-4 rounded-2xl bg-card border border-accent/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={sponsorBanner.image_url}
              alt={sponsorBanner.sponsor_name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-border shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-accent/20 text-accent-foreground border border-accent/30">
                  Sponsored
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {sponsorBanner.sponsor_name}
                </span>
              </div>
              <h4 className="text-sm font-bold text-foreground">{sponsorBanner.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-1">{sponsorBanner.description}</p>
            </div>
          </div>
          <a href={sponsorBanner.link_url} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
            <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs font-semibold border-accent/50 text-accent-foreground hover:bg-accent/10">
              Claim Offer <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </Button>
          </a>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search circles by name, keywords, or topics..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-hidden focus:ring-2 focus:ring-primary shadow-2xs"
          />
        </div>

        {/* Category Pills with Icons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            }`}
          >
            All Circles ({groups.length})
          </button>
          {CATEGORIES.map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            const Icon = config.icon;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? 'inherit' : config.color }} />
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl p-6">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-foreground mb-1">No Circles Found</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Try adjusting your search query or create a new circle in this category.
          </p>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            Create First Circle
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((group) => {
            const config = CATEGORY_CONFIG[group.category];
            const Icon = config.icon;
            const isMember = joinedGroupIds.includes(group.id);
            const isRequested = requestedGroupIds.includes(group.id);
            const count = group.member_count ?? 0;
            const maxCap = group.max_members || 256;
            const isFull = count >= maxCap;
            const fillPercentage = Math.min(100, Math.round((count / maxCap) * 100));

            return (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={group.cover_url}
                      alt={group.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Category Pin Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs bg-card/95 text-foreground border border-border backdrop-blur-xs"
                        style={{ borderLeftColor: config.color, borderLeftWidth: 3 }}
                      >
                        <Icon className="w-3 h-3" style={{ color: config.color }} />
                        {group.category}
                      </span>
                    </div>

                    {/* WhatsApp-Style Badges */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {group.require_approval ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/80 text-white backdrop-blur-xs shadow-xs">
                          <Lock className="w-2.5 h-2.5" /> Approval Req
                        </span>
                      ) : group.is_public ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 text-white backdrop-blur-xs">
                          <Globe className="w-2.5 h-2.5" /> Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 text-white backdrop-blur-xs">
                          <Lock className="w-2.5 h-2.5" /> Private
                        </span>
                      )}

                      {group.only_admins_message && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-primary/80 text-primary-foreground backdrop-blur-xs">
                          Admins Chat
                        </span>
                      )}
                    </div>

                    {/* Capacity Indicator Banner */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="flex items-center gap-1 text-[11px] font-semibold">
                        <Users className="w-3.5 h-3.5" />
                        {count} / {maxCap} members
                      </span>
                      {isFull ? (
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-destructive text-destructive-foreground">
                          Capacity Full
                        </span>
                      ) : (
                        <span className="text-[10px] text-white/80 font-medium">
                          {maxCap - count} spots left
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Member Capacity Progress Line */}
                  <div className="w-full bg-muted h-1 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        fillPercentage >= 90
                          ? 'bg-destructive'
                          : fillPercentage >= 70
                          ? 'bg-amber-500'
                          : 'bg-primary'
                      }`}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {group.name}
                      </h3>
                      {group.verified_only && (
                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0 border border-emerald-500/20">
                          <ShieldCheck className="w-2.5 h-2.5 mr-0.5" /> Verified Only
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {group.description}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-2 flex items-center justify-between border-t border-border/50 bg-muted/20">
                  <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                    Admin: {group.admin_name}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={isMember ? 'outline' : isRequested ? 'secondary' : 'default'}
                      disabled={isFull && !isMember}
                      onClick={(e) => handleJoinAction(e, group)}
                      className={`h-7 px-3 text-xs font-semibold shadow-2xs ${
                        isMember
                          ? 'border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10'
                          : isRequested
                          ? 'bg-amber-500/15 text-amber-700 border border-amber-500/30 hover:bg-amber-500/25'
                          : isFull
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      }`}
                    >
                      {isMember ? (
                        <>
                          <Check className="w-3 h-3 mr-1" /> Joined
                        </>
                      ) : isRequested ? (
                        <>
                          <Clock className="w-3 h-3 mr-1 text-amber-600 animate-spin" /> Requested
                        </>
                      ) : isFull ? (
                        'Full (Waitlist)'
                      ) : group.require_approval ? (
                        'Request to Join'
                      ) : (
                        'Join Circle'
                      )}
                    </Button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* WhatsApp-Style Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card text-card-foreground border border-border rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold font-heading text-foreground">Create Surat Circle</h2>
                  <p className="text-[11px] text-muted-foreground">Configure WhatsApp-style controls and member limits.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4 text-xs sm:text-sm mt-3">
              <div>
                <label className="block font-semibold mb-1 text-foreground">Circle Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Surat AI Founders, Weekend Cyclists"
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary shadow-2xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground">Category *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const cfg = CATEGORY_CONFIG[cat];
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`flex items-center gap-1.5 p-2 rounded-xl border text-xs font-semibold text-left transition-all ${
                          category === cat
                            ? 'bg-primary/10 border-primary text-primary shadow-xs'
                            : 'bg-background border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this circle about? Who should join?"
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary shadow-2xs"
                />
              </div>

              {/* WhatsApp Member Capacity Limit */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-bold text-xs text-foreground">Max Participant Limit</span>
                  </div>
                  <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                    {maxMembers} Members
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {[50, 100, 256, 512, 1024].map((limit) => (
                    <button
                      key={limit}
                      type="button"
                      onClick={() => setMaxMembers(limit)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                        maxMembers === limit
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-background text-muted-foreground border-border hover:border-primary/40'
                      }`}
                    >
                      {limit}
                      {limit === 256 && <span className="block text-[8px] font-normal opacity-80">WhatsApp</span>}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Circle automatically closes to new joins once capacity is reached.
                </p>
              </div>

              {/* WhatsApp Admin Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border shadow-2xs">
                  <div>
                    <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      Approve New Participants (WhatsApp Style)
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Admins must approve requests before anyone enters the group chat.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={requireApproval}
                    onChange={(e) => setRequireApproval(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border shadow-2xs">
                  <div>
                    <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-primary" />
                      Send Messages: Only Admins
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Restrict discussions to admins only (announcements channel).
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={onlyAdminsMessage}
                    onChange={(e) => setOnlyAdminsMessage(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border shadow-2xs">
                  <div>
                    <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Surat Verified Residents Only
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Only users with verified Surat address badges can join.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground">Community Rules (Optional)</label>
                <textarea
                  rows={2}
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  placeholder="1. Be respectful&#10;2. No spam or promotions"
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary shadow-2xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary text-primary-foreground text-xs font-semibold shadow-xs">
                  Create Circle
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

