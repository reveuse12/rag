'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  Check,
  Share2,
  Ticket,
  Sparkles,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Meetup, GroupCategory } from '@/types';
import { INITIAL_MEETUPS, INITIAL_GROUPS, CURRENT_USER } from '@/lib/data';
import { CATEGORIES, CATEGORY_CONFIG } from '@/lib/category-helpers';
import type { SelectedLocation } from '@/components/location-picker';

const LocationPicker = dynamic(
  () => import('@/components/location-picker').then((mod) => mod.LocationPicker),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-44 rounded-2xl bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground animate-pulse">
        Loading Surat map picker...
      </div>
    ),
  }
);

export default function MeetupsPage() {
  const [meetups, setMeetups] = useState<Meetup[]>(INITIAL_MEETUPS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [rsvpStates, setRsvpStates] = useState<Record<string, 'going' | 'maybe' | 'none'>>({
    'm-ai-mixer': 'going',
  });

  // Host Meetup Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [place, setPlace] = useState('');
  const [venueCoordinates, setVenueCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [dateTime, setDateTime] = useState('');
  const [groupId, setGroupId] = useState(INITIAL_GROUPS[0].id);
  const [capacity, setCapacity] = useState(30);
  const [ticketPrice, setTicketPrice] = useState(0);

  // Load custom meetups from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cc_surat_meetups');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMeetups(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const saveMeetups = (updated: Meetup[]) => {
    setMeetups(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cc_surat_meetups', JSON.stringify(updated));
    }
  };

  const filteredMeetups = meetups.filter((m) => {
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.place.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleRsvp = (meetupId: string, status: 'going' | 'maybe') => {
    setRsvpStates((prev) => ({
      ...prev,
      [meetupId]: prev[meetupId] === status ? 'none' : status,
    }));
  };

  const handleLocationSelected = (loc: SelectedLocation) => {
    setPlace(`${loc.name} · ${loc.area}`);
    setVenueCoordinates({ lat: loc.lat, lng: loc.lng });
  };

  const handleCreateMeetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!place) {
      alert('Please pick a verified venue on the map.');
      return;
    }

    const group = INITIAL_GROUPS.find((g) => g.id === groupId);
    const creatorName =
      (typeof window !== 'undefined' && localStorage.getItem('user_display_name')) ||
      CURRENT_USER.display_name;

    const newMeetup: Meetup = {
      id: `m-${Date.now()}`,
      title,
      description,
      place,
      date_time: dateTime || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      group_id: groupId,
      group_name: group?.name || 'Surat Circle',
      category: group?.category || 'Custom',
      capacity: Number(capacity),
      rsvps_count: 1,
      ticket_price: Number(ticketPrice),
      created_by: 'a0000000-0000-0000-0000-000000000001',
      creator_name: creatorName,
      created_at: new Date().toISOString(),
    };

    const updated = [newMeetup, ...meetups];
    saveMeetups(updated);
    setRsvpStates((prev) => ({ ...prev, [newMeetup.id]: 'going' }));
    setShowCreateModal(false);

    // Reset
    setTitle('');
    setDescription('');
    setPlace('');
    setVenueCoordinates(null);
    setTicketPrice(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground">
            Surat Meetups & Gatherings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Step offline with verified locals across tech mixers, cycling, treks, and food crawls.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shrink-0 shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Host a Meetup
        </Button>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search meetups by title, venue, or keyword..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-hidden focus:ring-2 focus:ring-primary shadow-2xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            }`}
          >
            All Meetups ({meetups.length})
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

      {/* Meetups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMeetups.map((meetup) => {
          const config = CATEGORY_CONFIG[meetup.category || 'Custom'];
          const CategoryIcon = config.icon;
          const rsvpState = rsvpStates[meetup.id] || 'none';
          const meetupDate = new Date(meetup.date_time);

          return (
            <div
              key={meetup.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all"
            >
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-muted text-foreground border border-border"
                    style={{ borderLeftColor: config.color, borderLeftWidth: 3 }}
                  >
                    <CategoryIcon className="w-3 h-3" style={{ color: config.color }} />
                    {meetup.group_name}
                  </span>

                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-accent/15 text-accent-foreground border border-accent/20">
                    {meetup.ticket_price === 0 ? 'FREE ENTRY' : `₹${meetup.ticket_price}`}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">{meetup.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{meetup.description}</p>
                </div>

                {/* Details grid */}
                <div className="space-y-1.5 pt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>
                      {meetupDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      ·{' '}
                      {meetupDate.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{meetup.place}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Hosted by {meetup.creator_name}</span>
                  </div>
                </div>
              </div>

              {/* RSVP Actions Bar */}
              <div className="pt-4 mt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="font-bold text-foreground">
                    {(meetup.rsvps_count || 0) + (rsvpState === 'going' ? 1 : 0)} / {meetup.capacity} Going
                  </span>
                  <div className="w-28 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (((meetup.rsvps_count || 0) + (rsvpState === 'going' ? 1 : 0)) /
                            meetup.capacity) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={rsvpState === 'going' ? 'default' : 'outline'}
                    onClick={() => handleRsvp(meetup.id, 'going')}
                    className={`h-8 px-3 text-xs font-bold ${
                      rsvpState === 'going'
                        ? 'bg-success hover:bg-success/90 text-white'
                        : 'border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    {rsvpState === 'going' ? "I'm Going" : 'RSVP Going'}
                  </Button>

                  <Button
                    size="sm"
                    variant={rsvpState === 'maybe' ? 'default' : 'outline'}
                    onClick={() => handleRsvp(meetup.id, 'maybe')}
                    className={`h-8 px-2.5 text-xs ${
                      rsvpState === 'maybe'
                        ? 'bg-warning text-white'
                        : 'text-muted-foreground border-border'
                    }`}
                  >
                    Maybe
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Host Meetup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border rounded-3xl p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold font-heading mb-1">Host a Surat Meetup</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Organize a real-world gathering for verified circle members.
            </p>

            <form onSubmit={handleCreateMeetup} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1">Meetup Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Surat AI Founders Mixer, Dumas Morning Ride"
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Associated Circle *</label>
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                >
                  {INITIAL_GROUPS.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Pick Venue from Surat Map *
                </label>
                <LocationPicker onSelect={handleLocationSelected} value={place} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is the agenda? Any requirements for attendees?"
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
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
                  Publish Meetup
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
