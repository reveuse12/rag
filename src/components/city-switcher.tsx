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
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCity } from '@/context/city-context';
import { CityConfig } from '@/lib/cities';

export function CitySwitcher() {
  const {
    currentCity,
    availableCities,
    switchCity,
    detectNearestLocation,
    isDetecting,
  } = useCity();

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'india' | 'global'>('all');

  const filteredCities = availableCities.filter((city) => {
    if (regionFilter === 'india' && city.countryCode !== 'IN') return false;
    if (regionFilter === 'global' && city.countryCode === 'IN') return false;

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
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground font-semibold shadow-xs hover:border-primary/50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
          title="Switch Active Metro City Hub"
        >
          <span className="text-base leading-none">{currentCity.flag}</span>
          <span className="text-xs font-black font-heading tracking-tight text-foreground truncate max-w-[100px] sm:max-w-[140px]">
            {currentCity.name}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground transition-transform" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col p-6 rounded-3xl">
        <DialogHeader className="pb-2 text-left">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Globe className="w-4 h-4" />
            </div>
            <DialogTitle className="text-xl">Select Metro City Hub</DialogTitle>
          </div>
          <DialogDescription>
            Connect to local circles, offline meetups, and real-time community pulse in your nearest metro.
          </DialogDescription>
        </DialogHeader>

        {/* GPS Nearest Metro Auto-Detector Banner */}
        <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Compass className={`w-4 h-4 text-primary shrink-0 ${isDetecting ? 'animate-spin' : ''}`} />
            <div className="text-xs">
              <div className="font-bold text-foreground">Away from a metro city?</div>
              <div className="text-[11px] text-muted-foreground">
                Auto-calculate and connect to your nearest metro hub.
              </div>
            </div>
          </div>
          <Button
            size="xs"
            variant="outline"
            disabled={isDetecting}
            onClick={async () => {
              await detectNearestLocation();
              setOpen(false);
            }}
            className="border-primary/40 text-primary hover:bg-primary/10 font-bold shrink-0 shadow-2xs"
          >
            <Navigation className="w-3 h-3 mr-1" />
            {isDetecting ? 'Detecting...' : 'Detect Nearest'}
          </Button>
        </div>

        {/* Search Input using ShadCN Input */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city, state, or country (e.g. Mumbai, Austin, London)..."
            className="pl-9 text-xs"
          />
        </div>

        {/* Region Filters using ShadCN Badges / Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="xs"
            variant={regionFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setRegionFilter('all')}
            className="font-bold text-xs"
          >
            All Metros ({availableCities.length})
          </Button>
          <Button
            size="xs"
            variant={regionFilter === 'india' ? 'default' : 'outline'}
            onClick={() => setRegionFilter('india')}
            className="font-bold text-xs flex items-center gap-1"
          >
            <span>🇮🇳</span> India Hubs
          </Button>
          <Button
            size="xs"
            variant={regionFilter === 'global' ? 'default' : 'outline'}
            onClick={() => setRegionFilter('global')}
            className="font-bold text-xs flex items-center gap-1"
          >
            <span>🌍</span> Global Hubs
          </Button>
        </div>

        {/* Cities List */}
        <div className="overflow-y-auto space-y-1.5 pr-1 flex-1 min-h-[220px]">
          {filteredCities.map((city) => {
            const isSelected = city.slug === currentCity.slug;
            return (
              <button
                key={city.id}
                type="button"
                onClick={() => handleSelect(city.slug)}
                className={`w-full p-3 rounded-2xl text-left flex items-center justify-between transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-primary/10 border-primary text-foreground shadow-xs'
                    : 'bg-card border-border/70 hover:border-primary/40 hover:bg-muted/50 text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl leading-none">{city.flag}</span>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                      <span>{city.name}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        · {city.region}, {city.country}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {city.subreddits.join(', ')} · Currency: {city.currencySymbol} ({city.currency})
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <Badge variant="default" className="h-6 w-6 p-0 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
