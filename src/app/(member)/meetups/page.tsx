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
  X,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Meetup, Group, GroupCategory } from '@/types';
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
  const [selectedPassMeetup, setSelectedPassMeetup] = useState<Meetup | null>(null);
  const [rsvpStates, setRsvpStates] = useState<Record<string, 'going' | 'maybe' | 'none'>>({});

  // Host Meetup Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [place, setPlace] = useState('');
  const [venueCoordinates, setVenueCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [dateTime, setDateTime] = useState('');
  const [availableGroups, setAvailableGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [groupId, setGroupId] = useState(INITIAL_GROUPS[0]?.id || 'g-general');
  const [capacity, setCapacity] = useState(30);
  const [ticketPrice, setTicketPrice] = useState(0);

  // Load custom meetups, groups, and RSVPs from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCustomGroups = localStorage.getItem('cc_custom_groups');
      if (storedCustomGroups) {
        try {
          const parsedGroups = JSON.parse(storedCustomGroups);
          if (Array.isArray(parsedGroups) && parsedGroups.length > 0) {
            setAvailableGroups(parsedGroups);
            setGroupId(parsedGroups[0].id);
          }
        } catch (e) {
          console.error(e);
        }
      }
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

      const storedRsvps = localStorage.getItem('cc_meetup_rsvps');
      if (storedRsvps) {
        try {
          setRsvpStates(JSON.parse(storedRsvps));
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
    const currentStatus = rsvpStates[meetupId] || 'none';
    const nextStatus: 'going' | 'maybe' | 'none' = currentStatus === status ? 'none' : status;

    const newStates: Record<string, 'going' | 'maybe' | 'none'> = {
      ...rsvpStates,
      [meetupId]: nextStatus,
    };
    setRsvpStates(newStates);

    if (typeof window !== 'undefined') {
      localStorage.setItem('cc_meetup_rsvps', JSON.stringify(newStates));
    }

    // Update real RSVP count on meetup
    const updated = meetups.map((m) => {
      if (m.id === meetupId) {
        let diff = 0;
        if (currentStatus !== 'going' && nextStatus === 'going') diff = 1;
        if (currentStatus === 'going' && nextStatus !== 'going') diff = -1;
        return { ...m, rsvps_count: Math.max(0, (m.rsvps_count || 0) + diff) };
      }
      return m;
    });
    saveMeetups(updated);
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

    const group = availableGroups.find((g) => g.id === groupId);
    const creatorName =
      (typeof window !== 'undefined' && localStorage.getItem('user_display_name')) ||
      CURRENT_USER.display_name;

    const newMeetup: Meetup = {
      id: `m-${Date.now()}`,
      title,
      description,
      place,
      latitude: venueCoordinates?.lat || 21.1550,
      longitude: venueCoordinates?.lng || 72.7800,
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
          const endDate = new Date(meetupDate.getTime() + 2 * 60 * 60 * 1000);

          // Google Calendar Format: YYYYMMDDTHHmmssZ
          const startISO = meetupDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
          const endISO = endDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
          const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
            meetup.title
          )}&dates=${startISO}/${endISO}&details=${encodeURIComponent(
            meetup.description + '\n\nOrganized on CityCircle: https://citycircle-app.vercel.app'
          )}&location=${encodeURIComponent(meetup.place + ', Surat, Gujarat')}`;

          const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
            `🔥 Hey! Check out this meetup in Surat:\n*${meetup.title}*\n📍 ${meetup.place}\n🗓️ ${meetupDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at ${meetupDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n\nRSVP with me here: https://citycircle-app.vercel.app/meetups`
          )}`;

          const gMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            meetup.place + ', Surat, Gujarat'
          )}`;

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

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black px-2.5 py-1 rounded-md bg-accent/15 text-accent-foreground border border-accent/20">
                      {meetup.ticket_price === 0 ? 'FREE ENTRY' : `₹${meetup.ticket_price}`}
                    </span>
                  </div>
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

                {/* Quick Action Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50 text-[11px]">
                  <a
                    href={gCalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-foreground border border-border transition-colors font-medium"
                    title="Add to Google Calendar"
                  >
                    <CalendarIcon className="w-3 h-3 text-primary" /> Add to Calendar
                  </a>
                  <a
                    href={gMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-foreground border border-border transition-colors font-medium"
                    title="Get Directions in Google Maps"
                  >
                    <MapPin className="w-3 h-3 text-primary" /> Directions
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-colors font-semibold"
                    title="Share with Friends on WhatsApp"
                  >
                    <Share2 className="w-3 h-3" /> WhatsApp
                  </a>
                </div>
              </div>

              {/* RSVP Actions Bar & Digital Pass */}
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
                  {rsvpState === 'going' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedPassMeetup(meetup)}
                      className="h-8 px-2.5 text-xs font-bold border-primary/40 text-primary hover:bg-primary/10"
                    >
                      <Ticket className="w-3.5 h-3.5 mr-1" /> View Pass
                    </Button>
                  )}

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
                  {availableGroups.length > 0 ? (
                    availableGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.category})
                      </option>
                    ))
                  ) : (
                    <option value="g-general">General Surat Community Circle</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Pick Venue from Surat Map *
                </label>
                <LocationPicker onSelect={handleLocationSelected} value={place} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-xs">Date & Time *</label>
                  <DateTimePicker
                    value={dateTime}
                    onChange={setDateTime}
                    placeholder="Pick meetup date & time..."
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-xs">Max Capacity</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-xs sm:text-sm font-semibold shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary"
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

      {/* Digital QR Ticket Pass Modal */}
      {selectedPassMeetup && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Ticket Header */}
            <div className="bg-linear-to-r from-primary to-accent p-6 text-white text-center relative">
              <button
                onClick={() => setSelectedPassMeetup(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-extrabold uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3" /> Official Surat Circle Pass
              </div>
              <h3 className="font-extrabold text-lg leading-tight">{selectedPassMeetup.title}</h3>
              <p className="text-xs opacity-90 mt-1">{selectedPassMeetup.place}</p>
            </div>

            {/* Ticket Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Attendee Info */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Attendee</div>
                  <div className="font-bold text-sm text-foreground flex items-center gap-1.5 mt-0.5">
                    {(typeof window !== 'undefined' && localStorage.getItem('user_display_name')) || CURRENT_USER.display_name}
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Pass ID</div>
                  <div className="font-mono font-bold text-xs text-foreground mt-0.5">
                    SURAT-{selectedPassMeetup.id.slice(-6).toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Time & Circle */}
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-border">
                <div>
                  <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Date & Time</div>
                  <div className="font-semibold text-foreground mt-0.5">
                    {new Date(selectedPassMeetup.date_time).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    ·{' '}
                    {new Date(selectedPassMeetup.date_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Circle Category</div>
                  <div className="font-semibold text-foreground mt-0.5">{selectedPassMeetup.category || 'Custom'}</div>
                </div>
              </div>

              {/* QR Code Simulation Graphic */}
              <div className="bg-white p-4 rounded-2xl border border-zinc-200 flex flex-col items-center justify-center text-center shadow-xs">
                <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer corner squares */}
                  <rect x="5" y="5" width="26" height="26" rx="4" fill="#0F5257" />
                  <rect x="9" y="9" width="18" height="18" rx="2" fill="white" />
                  <rect x="13" y="13" width="10" height="10" rx="1" fill="#0F5257" />

                  <rect x="69" y="5" width="26" height="26" rx="4" fill="#0F5257" />
                  <rect x="73" y="9" width="18" height="18" rx="2" fill="white" />
                  <rect x="77" y="13" width="10" height="10" rx="1" fill="#0F5257" />

                  <rect x="5" y="69" width="26" height="26" rx="4" fill="#0F5257" />
                  <rect x="9" y="73" width="18" height="18" rx="2" fill="white" />
                  <rect x="13" y="77" width="10" height="10" rx="1" fill="#0F5257" />

                  {/* QR Data Matrix Patterns */}
                  <rect x="36" y="8" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="46" y="8" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="56" y="8" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="36" y="18" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="46" y="24" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="8" y="36" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="18" y="36" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="28" y="36" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="38" y="36" width="8" height="8" rx="2" fill="#FF6B35" />
                  <rect x="50" y="36" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="60" y="36" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="72" y="36" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="84" y="36" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="36" y="48" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="46" y="48" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="56" y="48" width="8" height="8" rx="2" fill="#0F5257" />
                  <rect x="68" y="48" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="80" y="48" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="36" y="60" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="48" y="60" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="60" y="60" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="72" y="60" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="36" y="72" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="48" y="72" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="60" y="72" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="72" y="72" width="8" height="8" rx="2" fill="#FF6B35" />
                  <rect x="84" y="72" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="36" y="84" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="48" y="84" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="60" y="84" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="72" y="84" width="6" height="6" rx="1" fill="#1C1917" />
                  <rect x="84" y="84" width="6" height="6" rx="1" fill="#1C1917" />
                </svg>
                <span className="text-[10px] text-zinc-500 font-semibold mt-2">
                  Scan at entrance with Surat Circle Host
                </span>
              </div>

              {/* Dismiss / Save */}
              <Button
                onClick={() => setSelectedPassMeetup(null)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
