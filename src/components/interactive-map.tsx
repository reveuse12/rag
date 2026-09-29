'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Users,
  Shield,
  ShieldAlert,
  Clock,
  Layers,
  Sparkles,
  Compass,
  Building,
  GraduationCap,
  AlertOctagon,
  Eye,
  EyeOff,
  Navigation,
  Check,
  Calendar,
  Search,
  Crosshair,
  Plus,
  Loader2,
  X,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CATEGORIES, CATEGORY_CONFIG } from '@/lib/category-helpers';
import { GroupCategory } from '@/types';

export interface MapVenue {
  id: string;
  title: string;
  subtitle: string;
  category: GroupCategory;
  lat: number;
  lng: number;
  area: string;
  isUserAdded?: boolean;
}

export default function InteractiveSuratMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const placesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const peopleLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const tempPinLayerRef = useRef<L.LayerGroup | null>(null);

  // Dynamic venues state (loaded from user map interactions / localStorage)
  const [venues, setVenues] = useState<MapVenue[]>([]);
  const [activeLayer, setActiveLayer] = useState<'both' | 'events' | 'people'>('both');
  const [peopleOptIn, setPeopleOptIn] = useState(false);
  const [panicActivated, setPanicActivated] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [remainingTime, setRemainingTime] = useState('02:59:45');
  const [userFuzzedZone, setUserFuzzedZone] = useState<any>(null);
  const [locating, setLocating] = useState(false);

  // Real Place Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  // Add Venue Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueCategory, setNewVenueCategory] = useState<GroupCategory>('Custom');
  const [newVenueDesc, setNewVenueDesc] = useState('');
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number; address: string } | null>(null);

  // Load venues on mount from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cc_user_pinned_venues');
      if (saved) {
        try {
          setVenues(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Save venues to localStorage when updated
  const saveVenues = (updatedVenues: MapVenue[]) => {
    setVenues(updatedVenues);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cc_user_pinned_venues', JSON.stringify(updatedVenues));
    }
  };

  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const GOOGLE_TILE_URLS = {
    roadmap: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    satellite: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    terrain: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
  };

  // Initialize Leaflet Map with Google Maps
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Surat
    const map = L.map(mapContainerRef.current, {
      center: [21.1550, 72.7800],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    // Default to Google Maps Roadmap
    const tileLayer = L.tileLayer(
      GOOGLE_TILE_URLS.roadmap,
      {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps',
      }
    ).addTo(map);

    tileLayerRef.current = tileLayer;
    placesLayerGroupRef.current = L.layerGroup().addTo(map);
    peopleLayerGroupRef.current = L.layerGroup().addTo(map);
    tempPinLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Click anywhere on map -> Reverse geocode real address and offer "Pin This Location"
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (tempPinLayerRef.current) {
        tempPinLayerRef.current.clearLayers();

        const pickIcon = L.divIcon({
          html: `
            <div style="
              background-color: #0F5257;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 14px;
              border: 3px solid #FFFFFF;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            ">
              📍
            </div>
          `,
          className: 'picked-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        const marker = L.marker([lat, lng], { icon: pickIcon }).addTo(tempPinLayerRef.current);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          const placeName = data.display_name?.split(',')[0] || 'Selected Spot';
          const roadArea = data.address?.suburb || data.address?.neighbourhood || data.address?.road || 'Surat';

          const pointInfo = {
            id: `temp-${Date.now()}`,
            title: placeName,
            subtitle: `${roadArea} (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
            category: 'Custom' as GroupCategory,
            area: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            lat,
            lng,
          };

          setSelectedItem(pointInfo);
          setPickedCoords({
            lat,
            lng,
            address: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          });
          setNewVenueName(placeName);
        } catch (err) {
          const pointInfo = {
            id: `temp-${Date.now()}`,
            title: `Pin at ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
            subtitle: 'Real Coordinates on Map',
            category: 'Custom' as GroupCategory,
            area: 'Surat, Gujarat',
            lat,
            lng,
          };
          setSelectedItem(pointInfo);
          setPickedCoords({
            lat,
            lng,
            address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          });
        }
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Google Maps type change (Roadmap / Satellite / Terrain)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const newLayer = L.tileLayer(GOOGLE_TILE_URLS[mapType], {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps',
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  }, [mapType]);

  // Render Real Places / Venues on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const placesGroup = placesLayerGroupRef.current;
    if (!map || !placesGroup) return;

    placesGroup.clearLayers();

    if (activeLayer === 'both' || activeLayer === 'events') {
      venues.forEach((venue) => {
        const cfg = CATEGORY_CONFIG[venue.category] || CATEGORY_CONFIG['Custom'];

        const iconHtml = `
          <div style="
            background-color: ${cfg.color};
            width: 34px;
            height: 34px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 13px;
            border: 2.5px solid #FFFFFF;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            cursor: pointer;
            transition: transform 0.2s ease;
          " class="hover:scale-110">
            📍
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-cat-pin',
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker([venue.lat, venue.lng], { icon: customIcon });

        marker.on('click', () => {
          setSelectedItem(venue);
          map.panTo([venue.lat, venue.lng], { animate: true });
        });

        marker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 170px; padding: 2px;">
            <div style="font-size: 10px; font-weight: 800; color: ${cfg.color}; text-transform: uppercase;">
              ${venue.category} Circle
            </div>
            <div style="font-size: 13px; font-weight: bold; color: #1C1917; margin-top: 2px;">
              ${venue.title}
            </div>
            <div style="font-size: 11px; color: #57534E; margin-top: 2px;">
              ${venue.area}
            </div>
          </div>
        `);

        placesGroup.addLayer(marker);
      });
    }
  }, [venues, activeLayer]);

  // Render People Layer (Live GPS Fuzzed Circles Only - No Fake Seed Data)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const peopleGroup = peopleLayerGroupRef.current;
    if (!map || !peopleGroup) return;

    peopleGroup.clearLayers();

    if ((activeLayer === 'both' || activeLayer === 'people') && peopleOptIn && userFuzzedZone) {
      // Real GPS Fuzzed circle of the active user
      const circle = L.circle([userFuzzedZone.latitude, userFuzzedZone.longitude], {
        radius: userFuzzedZone.accuracy_meters || 400,
        color: '#0F5257',
        weight: 2,
        fillColor: '#0F5257',
        fillOpacity: 0.25,
        dashArray: '4, 6',
      });

      circle.on('click', () => {
        setSelectedItem({
          title: `Your Active Rough Location Zone`,
          subtitle: `Fuzzed ~${userFuzzedZone.accuracy_meters || 400}m for privacy`,
          category: 'Custom' as GroupCategory,
          area: 'Surat (Real GPS Differential Privacy)',
        });
      });

      circle.bindPopup(`
        <div style="font-family: sans-serif; padding: 2px;">
          <div style="font-size: 10px; font-weight: bold; color: #0F5257;">
            🛡️ Your Rough Privacy Zone
          </div>
          <div style="font-size: 12px; font-weight: bold; color: #1C1917;">
            Real GPS Location Active
          </div>
          <div style="font-size: 10px; color: #57534E; margin-top: 2px;">
            ~${userFuzzedZone.accuracy_meters || 400}m fuzzed radius (auto-expires in 3h)
          </div>
        </div>
      `);

      peopleGroup.addLayer(circle);
    }
  }, [activeLayer, peopleOptIn, userFuzzedZone]);

  // Real Browser Geolocation Trigger
  const handleRealLocationDetection = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          const res = await fetch('/api/location/fuzz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude, opt_in: true }),
          });
          const data = await res.json();
          if (data.fuzzed_data) {
            setUserFuzzedZone(data.fuzzed_data);
            setPeopleOptIn(true);
            setPanicActivated(false);

            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([data.fuzzed_data.latitude, data.fuzzed_data.longitude], 14, {
                duration: 1.5,
              });
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        alert('Could not access device location. Please enable location permissions.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Real Place Search with OpenStreetMap Nominatim
  const handleSearchPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const q = searchQuery.toLowerCase().includes('surat')
        ? searchQuery.trim()
        : `${searchQuery.trim()}, Surat, Gujarat`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const topResult = data[0];
        const lat = parseFloat(topResult.lat);
        const lng = parseFloat(topResult.lon);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
        }

        const pointInfo = {
          id: `search-${Date.now()}`,
          title: topResult.display_name.split(',')[0],
          subtitle: `Found via OpenStreetMap`,
          category: 'Custom' as GroupCategory,
          area: topResult.display_name,
          lat,
          lng,
        };

        setSelectedItem(pointInfo);
        setPickedCoords({
          lat,
          lng,
          address: topResult.display_name,
        });
        setNewVenueName(topResult.display_name.split(',')[0]);
      } else {
        alert('Location not found in Surat. Try another street name or landmark.');
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  // Save new venue pin onto map
  const handleSaveNewVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickedCoords) return;

    const newVenue: MapVenue = {
      id: `venue-${Date.now()}`,
      title: newVenueName.trim() || 'Community Venue',
      subtitle: newVenueDesc.trim() || pickedCoords.address.split(',')[0],
      category: newVenueCategory,
      lat: pickedCoords.lat,
      lng: pickedCoords.lng,
      area: pickedCoords.address,
      isUserAdded: true,
    };

    const updated = [newVenue, ...venues];
    saveVenues(updated);
    setShowAddModal(false);
    setSelectedItem(newVenue);

    // Clear temp pin
    if (tempPinLayerRef.current) {
      tempPinLayerRef.current.clearLayers();
    }
  };

  // Delete user-added venue
  const handleDeleteVenue = (venueId: string) => {
    const updated = venues.filter((v) => v.id !== venueId);
    saveVenues(updated);
    setSelectedItem(null);
  };

  // Panic button action
  const handlePanicButton = () => {
    setPanicActivated(true);
    setPeopleOptIn(false);
    setUserFuzzedZone(null);
  };

  const jumpToRegion = (lat: number, lng: number, zoom: number = 14) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1 });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border rounded-2xl p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-heading">Surat Live Map</h1>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
              {venues.length} Pinned Locations
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click anywhere on the map or search to pin real places in Surat.
          </p>
        </div>

        {/* Real GPS Opt-In & Panic Actions */}
        <div className="flex items-center gap-2">
          {peopleOptIn ? (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-semibold">GPS Active: ~400m Fuzzed</span>
                <span className="text-[10px] opacity-80">({remainingTime})</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPeopleOptIn(false)}
                className="h-8 text-xs font-semibold"
              >
                <EyeOff className="w-3.5 h-3.5 mr-1" /> Stop Sharing
              </Button>
              <Button
                size="sm"
                onClick={handlePanicButton}
                className="bg-danger hover:bg-danger/90 text-white h-8 px-3 text-xs font-bold shadow-xs animate-pulse"
                title="Immediately stops location and alerts safety team"
              >
                <AlertOctagon className="w-3.5 h-3.5 mr-1" /> Panic Button
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={handleRealLocationDetection}
              disabled={locating}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
            >
              {locating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Detecting Real GPS...
                </>
              ) : (
                <>
                  <Crosshair className="w-3.5 h-3.5 mr-1.5" /> Share My Real Rough Location
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {panicActivated && (
        <div className="p-4 bg-danger/15 border border-danger/30 rounded-2xl text-xs text-danger flex items-start justify-between gap-3 animate-in fade-in">
          <div>
            <div className="font-bold flex items-center gap-1.5 text-sm mb-1">
              <ShieldAlert className="w-4 h-4" /> Panic Safety Action Triggered
            </div>
            <p>
              Your location sharing was immediately terminated and purged. Surat emergency helpline (112) is available. A moderation alert ticket has been recorded.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPanicActivated(false)}
            className="shrink-0 text-xs border-danger/40 text-danger hover:bg-danger/10"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Real Place Search Bar */}
      <form onSubmit={handleSearchPlace} className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any real Surat address or landmark (e.g. VR Mall, SVNIT, Dumas Beach)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary shadow-2xs"
          />
        </div>
        <Button type="submit" disabled={searching} className="bg-primary text-primary-foreground text-xs font-semibold px-4">
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find on Map'}
        </Button>
      </form>

      {/* Surat Region Quick Jump Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-muted-foreground font-semibold shrink-0">Quick jump:</span>
        <button
          onClick={() => jumpToRegion(21.1450, 72.7780, 14)}
          className="px-3 py-1 rounded-xl bg-card border border-border hover:border-primary/50 text-foreground font-medium shrink-0 shadow-2xs"
        >
          📍 Vesu & Piplod
        </button>
        <button
          onClick={() => jumpToRegion(21.1645, 72.7845, 14)}
          className="px-3 py-1 rounded-xl bg-card border border-border hover:border-primary/50 text-foreground font-medium shrink-0 shadow-2xs"
        >
          🎓 SVNIT Campus
        </button>
        <button
          onClick={() => jumpToRegion(21.0850, 72.7050, 13)}
          className="px-3 py-1 rounded-xl bg-card border border-border hover:border-primary/50 text-foreground font-medium shrink-0 shadow-2xs"
        >
          🌊 Dumas Beach
        </button>
        <button
          onClick={() => jumpToRegion(21.1702, 72.8311, 13)}
          className="px-3 py-1 rounded-xl bg-card border border-border hover:border-primary/50 text-foreground font-medium shrink-0 shadow-2xs"
        >
          🏙️ Surat Central (Tapi)
        </button>
      </div>

      {/* Main Map Viewport */}
      <div className="relative w-full h-[500px] sm:h-[580px] rounded-3xl overflow-hidden border border-border bg-card shadow-sm">
        {/* Real Leaflet Map DOM Node */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Top Layer Switcher */}
        <div className="absolute top-3 left-3 z-1000 flex items-center gap-1 p-1 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-md text-xs">
          <button
            onClick={() => setActiveLayer('both')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeLayer === 'both'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Layers
          </button>
          <button
            onClick={() => setActiveLayer('events')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeLayer === 'events'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pinned Places ({venues.length})
          </button>
          <button
            onClick={() => setActiveLayer('people')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeLayer === 'people'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            People Layer
          </button>
        </div>

        {/* Floating Google Maps Style Switcher on Top Right */}
        <div className="absolute top-3 right-3 z-1000 hidden sm:flex items-center gap-1 p-1 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-md text-xs">
          <button
            onClick={() => setMapType('roadmap')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mapType === 'roadmap'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🗺️ Google Roadmap
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mapType === 'satellite'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🛰️ Satellite
          </button>
          <button
            onClick={() => setMapType('terrain')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mapType === 'terrain'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ⛰️ Terrain
          </button>
        </div>

        {/* Hint overlay if no venues are pinned yet */}
        {venues.length === 0 && !selectedItem && (
          <div className="absolute top-14 left-3 z-1000 bg-card/95 backdrop-blur-md border border-border rounded-xl px-3 py-2 text-xs text-muted-foreground shadow-md max-w-xs">
            👉 <strong>Click anywhere on the map</strong> or search above to drop a pin and save a place in Surat.
          </div>
        )}

        {/* Floating Selected Real Location Card at Bottom */}
        {selectedItem && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-1000 bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 shadow-xl animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-sm mb-1 inline-block"
                  style={{
                    backgroundColor: `${CATEGORY_CONFIG[selectedItem.category as GroupCategory]?.color || '#0F5257'}20`,
                    color: CATEGORY_CONFIG[selectedItem.category as GroupCategory]?.color || '#0F5257',
                  }}
                >
                  {selectedItem.category || 'Surat Real Place'}
                </span>
                <h4 className="font-bold text-sm text-foreground">{selectedItem.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{selectedItem.subtitle || selectedItem.area}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {selectedItem.isUserAdded ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteVenue(selectedItem.id)}
                    className="text-danger hover:bg-danger/10 h-8 px-2 text-xs"
                    title="Remove Pin"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-8"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Save Pin
                  </Button>
                )}
                <Link href="/meetups">
                  <Button size="sm" variant="outline" className="text-xs font-semibold h-8">
                    Host Meetup
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> {selectedItem.area}
              </span>
              <span className="text-foreground font-semibold shrink-0">Surat</span>
            </div>
          </div>
        )}
      </div>

      {/* Pin Location Modal */}
      {showAddModal && pickedCoords && (
        <div className="fixed inset-0 z-2000 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg font-heading">Pin Location to Surat Circles</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-md text-muted-foreground hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewVenue} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Place / Landmark Name *</label>
                <input
                  type="text"
                  required
                  value={newVenueName}
                  onChange={(e) => setNewVenueName(e.target.value)}
                  placeholder="e.g. Nomad Coffee Co, SVNIT Circle"
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Category *</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => {
                    const cfg = CATEGORY_CONFIG[cat];
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewVenueCategory(cat)}
                        className={`flex items-center gap-1.5 p-2 rounded-xl border text-xs font-semibold text-left transition-all ${
                          newVenueCategory === cat
                            ? 'bg-primary/10 border-primary text-primary'
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
                <label className="block font-semibold mb-1">Notes / Description (Optional)</label>
                <input
                  type="text"
                  value={newVenueDesc}
                  onChange={(e) => setNewVenueDesc(e.target.value)}
                  placeholder="e.g. Good for evening tech meetups and wifi"
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background"
                />
              </div>

              <div className="p-3 bg-muted/40 rounded-xl text-[11px] text-muted-foreground">
                <strong>Real Coordinates:</strong> {pickedCoords.lat.toFixed(4)}° N, {pickedCoords.lng.toFixed(4)}° E
                <div className="truncate mt-0.5">{pickedCoords.address}</div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1 text-xs" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary text-primary-foreground text-xs font-semibold">
                  Save Pin to Map
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safety & Fuzzing Info Banner */}
      <div className="p-4 bg-muted/40 border border-border rounded-2xl flex items-start gap-3 text-xs text-muted-foreground">
        <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <strong className="text-foreground">Differential Privacy Guarantee:</strong> When enabling rough location, your real browser GPS coordinates are fuzzed by 300–500m on the server before anything is stored. Exact coordinates are never shared with other users.
        </div>
      </div>
    </div>
  );
}
