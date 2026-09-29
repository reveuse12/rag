'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, CheckCircle2, Crosshair, Loader2, Sparkles, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SelectedLocation {
  name: string;
  area: string;
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  value?: string;
  onSelect: (location: SelectedLocation) => void;
}

const SURAT_HOTSPOTS: { name: string; area: string; lat: number; lng: number }[] = [
  { name: 'The House of Caffeine', area: 'Vesu Main Road, Surat', lat: 21.1442, lng: 72.7712 },
  { name: 'SVNIT Main Gate', area: 'Ichchhanath, Surat', lat: 21.1663, lng: 72.7832 },
  { name: 'Dumas Beach Promenade', area: 'Dumas, Surat', lat: 21.0772, lng: 72.7155 },
  { name: 'VR Mall Surat', area: 'Dumas Road, Magdalla, Surat', lat: 21.1491, lng: 72.7578 },
  { name: 'Piplod Food Street', area: 'Piplod, Surat', lat: 21.1612, lng: 72.7754 },
  { name: 'Tapi Riverfront Walkway', area: 'Nanpura / Athwa, Surat', lat: 21.1925, lng: 72.8089 },
  { name: 'Ghod Dod Road Cafes', area: 'Ghod Dod Road, Athwa, Surat', lat: 21.1764, lng: 72.8021 },
  { name: 'Adajan Botanical Garden', area: 'Adajan, Surat', lat: 21.1982, lng: 72.7915 },
];

export function LocationPicker({ value, onSelect }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(() => {
    if (!value) return null;
    const match = SURAT_HOTSPOTS.find((h) => h.name.toLowerCase() === value.toLowerCase() || value.includes(h.name));
    return match || { name: value, area: 'Surat, Gujarat', lat: 21.1702, lng: 72.8311 };
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = selectedLocation?.lat || 21.1600;
    const initialLng = selectedLocation?.lng || 72.7800;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    const tileUrl = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

    L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps',
    }).addTo(map);

    mapInstanceRef.current = map;

    // Custom Teal Pin Icon
    const createPinIcon = (label?: string) =>
      L.divIcon({
        html: `
          <div style="
            background: linear-gradient(135deg, #0F5257 0%, #0B3C40 100%);
            width: 34px;
            height: 34px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2.5px solid #FFFFFF;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          ">
            <span style="transform: rotate(45deg); font-size: 15px;">📍</span>
          </div>
        `,
        className: 'picked-venue-marker',
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });

    if (selectedLocation) {
      markerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng], {
        icon: createPinIcon(),
      }).addTo(map);
    }

    // Map Click Listener -> Reverse Geocode
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon: createPinIcon() }).addTo(map);
      }

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await res.json();
        const road = data.address?.road || data.address?.suburb || data.address?.neighbourhood || 'Surat';
        const placeTitle = data.display_name?.split(',')[0] || `Point near ${road}`;
        const areaDesc = data.display_name || `${road}, Surat, Gujarat`;

        const newLoc: SelectedLocation = {
          name: placeTitle,
          area: areaDesc,
          lat: Number(lat.toFixed(5)),
          lng: Number(lng.toFixed(5)),
        };

        setSelectedLocation(newLoc);
        onSelect(newLoc);
      } catch (err) {
        const fallbackLoc: SelectedLocation = {
          name: `Spot at ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
          area: 'Surat, Gujarat',
          lat: Number(lat.toFixed(5)),
          lng: Number(lng.toFixed(5)),
        };
        setSelectedLocation(fallbackLoc);
        onSelect(fallbackLoc);
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Preset Select
  const handleSelectPreset = (spot: { name: string; area: string; lat: number; lng: number }) => {
    setSelectedLocation(spot);
    onSelect(spot);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([spot.lat, spot.lng], 15, { duration: 1 });
      if (markerRef.current) {
        markerRef.current.setLatLng([spot.lat, spot.lng]);
      } else {
        const customIcon = L.divIcon({
          html: `
            <div style="
              background: #0F5257;
              width: 32px;
              height: 32px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2.5px solid #FFFFFF;
              box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            ">
              <span style="transform: rotate(45deg); font-size: 14px;">📍</span>
            </div>
          `,
          className: 'preset-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });
        markerRef.current = L.marker([spot.lat, spot.lng], { icon: customIcon }).addTo(
          mapInstanceRef.current
        );
      }
    }
  };

  // Search Address via OpenStreetMap Nominatim
  const handleSearch = async (e: React.FormEvent) => {
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
        const name = topResult.display_name.split(',')[0];
        const area = topResult.display_name;

        const searchedLoc: SelectedLocation = {
          name,
          area,
          lat: Number(lat.toFixed(5)),
          lng: Number(lng.toFixed(5)),
        };

        setSelectedLocation(searchedLoc);
        onSelect(searchedLoc);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          }
        }
      } else {
        alert('Location not found in Surat. Try another street name or landmark.');
      }
    } catch (err) {
      console.error('Search location error:', err);
    } finally {
      setSearching(false);
    }
  };

  // Browser GPS detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          const placeName = data.display_name?.split(',')[0] || 'My Current GPS Spot';

          const gpsLoc: SelectedLocation = {
            name: placeName,
            area: data.display_name || `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            lat: Number(lat.toFixed(5)),
            lng: Number(lng.toFixed(5)),
          };

          setSelectedLocation(gpsLoc);
          onSelect(gpsLoc);

          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng]);
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        alert('Could not retrieve GPS location. Please allow permission.');
        setLocating(false);
      }
    );
  };

  return (
    <div className="space-y-3">
      {/* Selected Location Card */}
      {selectedLocation ? (
        <div className="p-3 bg-primary/10 border-2 border-primary/30 rounded-2xl flex items-start justify-between gap-3 shadow-2xs animate-in fade-in">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
              <span className="truncate">Selected Venue: {selectedLocation.name}</span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate pl-5">
              {selectedLocation.area}
            </p>
            <div className="text-[10px] text-muted-foreground pl-5 font-mono">
              Coordinates: {selectedLocation.lat}°, {selectedLocation.lng}°
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
            Map Pinned
          </span>
        </div>
      ) : (
        <div className="p-3 bg-warning/10 border border-warning/30 rounded-2xl text-xs text-warning font-medium flex items-center gap-2">
          <MapPin className="w-4 h-4 shrink-0 text-warning" />
          <span>Pick a verified meetup venue from the map or presets below (required).</span>
        </div>
      )}

      {/* Search Input on Map */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e);
              }
            }}
            placeholder="Search Surat landmark, cafe, or road (e.g. Vesu, VR Mall, Dumas)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-input bg-card focus:outline-hidden focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleSearch}
          disabled={searching}
          className="bg-primary text-primary-foreground text-xs font-semibold h-8 px-3 shrink-0"
        >
          {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Find on Map'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleDetectGPS}
          disabled={locating}
          className="h-8 px-2.5 text-xs border-border shrink-0"
          title="Use GPS Location"
        >
          {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />}
        </Button>
      </div>

      {/* Quick Surat Presets */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-accent" />
          <span>Popular Surat Venues (1-Tap Pin):</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {SURAT_HOTSPOTS.map((spot) => {
            const isSelected = selectedLocation?.name === spot.name;
            return (
              <button
                key={spot.name}
                type="button"
                onClick={() => handleSelectPreset(spot)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-muted/70 text-foreground border-border hover:border-primary/40 hover:bg-card'
                }`}
              >
                📍 {spot.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Leaflet Map Box */}
      <div className="relative rounded-2xl overflow-hidden border border-border shadow-xs">
        <div ref={mapContainerRef} className="w-full h-44 sm:h-52 bg-muted" />
        <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-lg bg-card/90 backdrop-blur-xs border border-border text-[10px] text-muted-foreground flex items-center justify-between pointer-events-none">
          <span>👉 Click anywhere on map to drop custom pin</span>
          <span className="font-semibold text-primary">Google Maps</span>
        </div>
      </div>
    </div>
  );
}
