'use client';

import React, { useState } from 'react';
import {
  MapPin,
  ChevronDown,
  Navigation,
  Search,
  Check,
  Globe,
  Sparkles,
  X,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCity } from '@/context/city-context';
import { CityConfig } from '@/lib/cities';

export function CitySwitcher() {
  const {
    currentCity,
    availableCities,
    switchCity,
    detectNearestLocation,
    isDetecting,
    distanceToMetroKm,
  } = useCity();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'india' | 'global'>('all');

  const filteredCities = availableCities.filter((city) => {
    // Filter region
    if (regionFilter === 'india' && city.countryCode !== 'IN') return false;
    if (regionFilter === 'global' && city.countryCode === 'IN') return false;

    // Filter search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        city.name.toLowerCase().includes(q) ||
        city.country.toLowerCase().includes(q) ||
        city.region.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSelect = (slug: string) => {
    switchCity(slug);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      {/* Trigger Button in Header */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 hover:bg-muted border border-border text-foreground transition-all hover:border-primary/40 shadow-2xs group"
        title="Change your active city or auto-detect nearest metro"
      >
        <span className="text-sm leading-none">{currentCity.flag}</span>
        <span className="text-xs font-bold font-heading truncate max-w-[90px] sm:max-w-[130px]">
          {currentCity.name}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-transform" />
      </button>

      {/* Global City Switcher Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card text-card-foreground border border-border rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-heading text-foreground">Select Metro Hub</h3>
                  <p className="text-xs text-muted-foreground">
                    Connect to verified circles, meetups, and local pulse in your nearest metro city.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* GPS Nearest Metro Auto-Detector Banner */}
            <div className="mb-4 p-3 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Compass className={`w-4 h-4 text-primary ${isDetecting ? 'animate-spin' : ''}`} />
                <div className="text-xs">
                  <div className="font-bold text-foreground">Away from a metro city?</div>
                  <div className="text-[11px] text-muted-foreground">
                    We'll auto-calculate and connect you to the closest metro hub.
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={isDetecting}
                onClick={async () => {
                  await detectNearestLocation();
                  setIsOpen(false);
                }}
                className="text-xs h-7.5 font-bold border-primary/40 text-primary hover:bg-primary/10 shrink-0"
              >
                <Navigation className="w-3 h-3 mr-1" />
                {isDetecting ? 'Detecting...' : 'Detect Nearest'}
              </Button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by city, state, or country (e.g. Mumbai, Austin, London)..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-input bg-background text-xs focus:outline-hidden focus:ring-2 focus:ring-primary shadow-2xs"
              />
            </div>

            {/* Region Filters */}
            <div className="flex items-center gap-1.5 mb-3">
              <button
                onClick={() => setRegionFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  regionFilter === 'all'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                All Metros ({availableCities.length})
              </button>
              <button
                onClick={() => setRegionFilter('india')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  regionFilter === 'india'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>🇮🇳</span> India Hubs
              </button>
              <button
                onClick={() => setRegionFilter('global')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  regionFilter === 'global'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>🌍</span> Global Hubs
              </button>
            </div>

            {/* Cities List */}
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
              {filteredCities.map((city) => {
                const isSelected = city.slug === currentCity.slug;
                return (
                  <button
                    key={city.id}
                    onClick={() => handleSelect(city.slug)}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all border ${
                      isSelected
                        ? 'bg-primary/10 border-primary text-foreground shadow-xs'
                        : 'bg-card border-border/70 hover:border-primary/40 hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl leading-none">{city.flag}</span>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>{city.name}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            · {city.region}, {city.country}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {city.subreddits.join(', ')} · Currency: {city.currencySymbol} ({city.currency})
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
