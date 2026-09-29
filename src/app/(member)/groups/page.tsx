'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Group, GroupCategory } from '@/types';
import { INITIAL_GROUPS, INITIAL_SPONSOR_BANNERS } from '@/lib/data';
import { CATEGORIES, CATEGORY_CONFIG } from '@/lib/category-helpers';

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>([
    'g-tech-surat',
    'g-trekkers',
    'g-foodies',
  ]);

  // Form State for creating a group
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GroupCategory>('Custom');
  const [isPublic, setIsPublic] = useState(true);
  const [rules, setRules] = useState('');
  const [coverUrl, setCoverUrl] = useState(
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'
  );

  const filteredGroups = groups.filter((group) => {
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleJoinToggle = (e: React.MouseEvent, groupId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (joinedGroupIds.includes(groupId)) {
      setJoinedGroupIds(joinedGroupIds.filter((id) => id !== groupId));
    } else {
      setJoinedGroupIds([...joinedGroupIds, groupId]);
    }
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
      admin_name: 'Prayag B.',
      cover_url: coverUrl,
      rules: rules || '1. Be respectful and constructive.\n2. No spam.',
      member_count: 1,
      created_at: new Date().toISOString(),
    };

    setGroups([newGroup, ...groups]);
    setJoinedGroupIds([...joinedGroupIds, newGroup.id]);
    setShowCreateModal(false);
    // Reset fields
    setName('');
    setDescription('');
    setRules('');
  };

  const sponsorBanner = INITIAL_SPONSOR_BANNERS.find((b) => b.placement === 'global' || b.placement === 'group');

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground">
            Surat Community Circles
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Join interest-based circles, chat in real-time, and attend verified meetups.
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
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Category Pin Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs bg-card/95 text-foreground border border-border backdrop-blur-xs"
                        style={{ borderLeftColor: config.color, borderLeftWidth: 3 }}
                      >
                        <Icon className="w-3 h-3" style={{ color: config.color }} />
                        {group.category}
                      </span>
                    </div>

                    {/* Public / Private Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 text-white backdrop-blur-xs">
                        {group.is_public ? (
                          <>
                            <Globe className="w-2.5 h-2.5" /> Public
                          </>
                        ) : (
                          <>
                            <Lock className="w-2.5 h-2.5" /> Request to Join
                          </>
                        )}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="flex items-center gap-1 text-[11px] font-medium">
                        <Users className="w-3.5 h-3.5" />
                        {group.member_count} members
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-base text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {group.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {group.description}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-2 flex items-center justify-between border-t border-border/50">
                  <span className="text-[11px] text-muted-foreground">Admin: {group.admin_name}</span>
                  <Button
                    size="sm"
                    variant={isMember ? 'outline' : 'default'}
                    onClick={(e) => handleJoinToggle(e, group.id)}
                    className={`h-7 px-3 text-xs font-semibold ${
                      isMember
                        ? 'border-success/40 text-success hover:bg-success/10'
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    }`}
                  >
                    {isMember ? (
                      <>
                        <Check className="w-3 h-3 mr-1" /> Joined
                      </>
                    ) : group.is_public ? (
                      'Join Circle'
                    ) : (
                      'Request'
                    )}
                  </Button>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold font-heading mb-1">Create a Surat Circle</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Create an interest circle for verified members in Surat.
            </p>

            <form onSubmit={handleCreateGroup} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1">Circle Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Surat AI Founders, Weekend Cyclists"
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Category *</label>
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
                            : 'bg-background border-border text-muted-foreground'
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
                <label className="block font-semibold mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this circle about? Who should join?"
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Community Rules (Optional)</label>
                <textarea
                  rows={2}
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  placeholder="1. Be respectful&#10;2. No spam"
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/60 border border-border">
                <div>
                  <div className="font-semibold text-xs text-foreground">Public Circle</div>
                  <div className="text-[11px] text-muted-foreground">
                    {isPublic
                      ? 'Anyone in Surat can join instantly'
                      : 'Requires admin approval before joining chat'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
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
                <Button type="submit" className="flex-1 bg-primary text-primary-foreground text-xs font-semibold">
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
