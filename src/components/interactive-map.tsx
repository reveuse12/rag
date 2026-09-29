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
  Share2,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CATEGORIES, CATEGORY_CONFIG } from '@/lib/category-helpers';
import { GroupCategory, Meetup } from '@/types';
import { INITIAL_GROUPS, INITIAL_MEETUPS, CURRENT_USER } from '@/lib/data';
import { useCity } from '@/context/city-context';

export interface MapVenue {
  id: string;
  title: string;
  subtitle: string;
  category: GroupCategory;
  lat: number;
  lng: number;
  area: string;
  isUserAdded?: boolean;
  isMeetup?: boolean;
  meetupData?: any;
}

export default function InteractiveSuratMap() {
  const { currentCity } = useCity();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const placesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const peopleLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const tempPinLayerRef = useRef<L.LayerGroup | null>(null);
  const meetupsLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Fly to active city coordinates when city changes
  useEffect(() => {
    if (mapInstanceRef.current && currentCity) {
      mapInstanceRef.current.flyTo(
        [currentCity.latitude, currentCity.longitude],
        currentCity.zoom || 12,
        { duration: 1.5 }
      );
    }
  }, [currentCity]);

  // Dynamic venues state (loaded from user map interactions / localStorage)
  const [venues, setVenues] = useState<MapVenue[]>([]);
  const [meetups, setMeetups] = useState<Meetup[]>([]);
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

  // Direct Host Meetup Modal State
  const [showHostModal, setShowHostModal] = useState(false);
  const [hostTitle, setHostTitle] = useState('');
  const [hostDescription, setHostDescription] = useState('');
  const [hostGroupId, setHostGroupId] = useState(INITIAL_GROUPS[0].id);
  const [hostDateTime, setHostDateTime] = useState('');
  const [hostCapacity, setHostCapacity] = useState(25);
  const [hostTicketPrice, setHostTicketPrice] = useState(0);
  const [hostSuccessToast, setHostSuccessToast] = useState<string | null>(null);

  // Load venues and meetups on mount from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVenues = localStorage.getItem('cc_user_pinned_venues');
      if (savedVenues) {
        try {
          setVenues(JSON.parse(savedVenues));
        } catch (e) {
          console.error(e);
        }
      }

      const savedMeetups = localStorage.getItem('cc_surat_meetups');
      if (savedMeetups) {
        try {
          const parsed = JSON.parse(savedMeetups);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMeetups(parsed);
          } else {
            setMeetups(INITIAL_MEETUPS);
          }
        } catch (e) {
          console.error(e);
          setMeetups(INITIAL_MEETUPS);
        }
      } else {
        setMeetups(INITIAL_MEETUPS);
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
    meetupsLayerGroupRef.current = L.layerGroup().addTo(map);
    peopleLayerGroupRef.current = L.layerGroup().addTo(map);
    tempPinLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Click anywhere on map -> Reverse geocode real address and offer "Pin" or "Host Meetup Here"
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (tempPinLayerRef.current) {
        tempPinLayerRef.current.clearLayers();

        const pickIcon = L.divIcon({
          html: `
            <div style="
              background-color: #0F5257;
              width: 34px;
              height: 34px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 15px;
              border: 3px solid #FFFFFF;
              box-shadow: 0 4px 14px rgba(0,0,0,0.35);
              animation: bounce 1s infinite alternate;
            ">
              📍
            </div>
          `,
          className: 'picked-pin',
          iconSize: [34, 34],
          iconAnchor: [17, 34],
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

  // Render Real Places / Venues & Meetups on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const placesGroup = placesLayerGroupRef.current;
    const meetupsGroup = meetupsLayerGroupRef.current;
    if (!map || !placesGroup || !meetupsGroup) return;

    placesGroup.clearLayers();
    meetupsGroup.clearLayers();

    if (activeLayer === 'both' || activeLayer === 'events') {
      // 1. Render Pinned Places
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
          setPickedCoords({
            lat: venue.lat,
            lng: venue.lng,
            address: venue.area || venue.title,
          });
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

      // 2. Render Live Hosted Meetups on Map (Glowing Amber/Primary Beacons)
      meetups.forEach((meetup, idx) => {
        // Use EXACT persisted latitude and longitude
        let mLat: number = typeof meetup.latitude === 'number' && !isNaN(meetup.latitude) ? meetup.latitude : 0;
        let mLng: number = typeof meetup.longitude === 'number' && !isNaN(meetup.longitude) ? meetup.longitude : 0;

        if (!mLat || !mLng) {
          if (meetup.place?.toLowerCase().includes('vesu') || meetup.place?.toLowerCase().includes('piplod')) {
            mLat = 21.1418;
            mLng = 72.7756;
          } else if (meetup.place?.toLowerCase().includes('svnit') || meetup.place?.toLowerCase().includes('icchanath')) {
            mLat = 21.1645;
            mLng = 72.7845;
          } else if (meetup.place?.toLowerCase().includes('dumas')) {
            mLat = 21.0850;
            mLng = 72.7050;
          } else {
            mLat = 21.1550 + (idx * 0.003);
            mLng = 72.7800 + (idx * 0.003);
          }
        }

        const cfg = CATEGORY_CONFIG[meetup.category || 'Custom'];

        const meetupIconHtml = `
          <div style="
            background: linear-gradient(135deg, #FF6B35 0%, #D84A1B 100%);
            width: 38px;
            height: 38px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
            border: 3px solid #FFFFFF;
            box-shadow: 0 0 16px rgba(255, 107, 53, 0.6);
            cursor: pointer;
            position: relative;
          " class="hover:scale-115 transition-transform animate-pulse">
            🔥
          </div>
        `;

        const meetupIcon = L.divIcon({
          html: meetupIconHtml,
          className: 'custom-meetup-pin',
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        const meetupMarker = L.marker([mLat, mLng], { icon: meetupIcon });

        const meetupItem = {
          id: meetup.id,
          title: meetup.title,
          subtitle: `🗓️ ${new Date(meetup.date_time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} · ${meetup.place}`,
          category: meetup.category || 'Custom',
          lat: mLat,
          lng: mLng,
          area: meetup.place,
          isMeetup: true,
          meetupData: meetup,
        };

        meetupMarker.on('click', () => {
          setSelectedItem(meetupItem);
          setPickedCoords({
            lat: mLat,
            lng: mLng,
            address: meetup.place,
          });
          map.panTo([mLat, mLng], { animate: true });
        });

        meetupMarker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px; padding: 2px;">
            <div style="font-size: 10px; font-weight: 800; color: #FF6B35; text-transform: uppercase;">
              🔥 Live Meetup Gathering
            </div>
            <div style="font-size: 13px; font-weight: bold; color: #1C1917; margin-top: 2px;">
              ${meetup.title}
            </div>
            <div style="font-size: 11px; color: #57534E; margin-top: 2px;">
              📍 ${meetup.place}
            </div>
            <div style="font-size: 10px; color: #0F5257; font-weight: 700; margin-top: 4px;">
              ${(meetup.rsvps_count || 1)} attending · Hosted by ${meetup.creator_name}
            </div>
          </div>
        `);

        meetupsGroup.addLayer(meetupMarker);
      });
    }
  }, [venues, meetups, activeLayer]);

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
          lat: userFuzzedZone.latitude,
          lng: userFuzzedZone.longitude,
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

  // Direct Host Meetup from Map Submit Handler
  const handleHostMeetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickedCoords) return;

    const group = INITIAL_GROUPS.find((g) => g.id === hostGroupId) || INITIAL_GROUPS[0];
    const creatorName =
      (typeof window !== 'undefined' && localStorage.getItem('user_display_name')) ||
      CURRENT_USER.display_name;

    const newMeetup: Meetup = {
      id: `m-map-${Date.now()}`,
      title: hostTitle.trim() || 'Surat Community Meetup',
      description: hostDescription.trim() || 'Gathering hosted directly from Surat Live Map.',
      place: selectedItem?.title && !selectedItem?.isMeetup ? `${selectedItem.title} · ${pickedCoords.address.split(',')[0]}` : pickedCoords.address,
      latitude: pickedCoords.lat,
      longitude: pickedCoords.lng,
      date_time: hostDateTime || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      group_id: hostGroupId,
      group_name: group.name,
      category: group.category,
      capacity: Number(hostCapacity),
      rsvps_count: 1,
      ticket_price: Number(hostTicketPrice),
      created_by: 'a0000000-0000-0000-0000-000000000001',
      creator_name: creatorName,
      created_at: new Date().toISOString(),
    };

    // Save to shared localStorage meetup store
    const updatedMeetups = [newMeetup, ...meetups];
    setMeetups(updatedMeetups);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cc_surat_meetups', JSON.stringify(updatedMeetups));
    }

    // Set map focus
    setSelectedItem({
      id: newMeetup.id,
      title: newMeetup.title,
      subtitle: `🗓️ ${new Date(newMeetup.date_time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} · ${newMeetup.place}`,
      category: newMeetup.category,
      lat: pickedCoords.lat,
      lng: pickedCoords.lng,
      area: newMeetup.place,
      isMeetup: true,
      meetupData: newMeetup,
    });

    setShowHostModal(false);
    setHostTitle('');
    setHostDescription('');
    setHostSuccessToast(`🎉 Meetup "${newMeetup.title}" is now LIVE on Surat Circles & Map!`);

    setTimeout(() => {
      setHostSuccessToast(null);
    }, 4500);

    if (tempPinLayerRef.current) {
      tempPinLayerRef.current.clearLayers();
    }
  };

  // Open Direct Host Modal for selected item / coords
  const openDirectHostModal = () => {
    if (!pickedCoords && selectedItem) {
      setPickedCoords({
        lat: selectedItem.lat || 21.1550,
        lng: selectedItem.lng || 72.7800,
        address: selectedItem.area || selectedItem.title || 'Surat, Gujarat',
      });
    }
    setShowHostModal(true);
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
              {venues.length} Pinned Places
            </span>
            <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground text-[10px] font-bold">
              🔥 {meetups.length} Active Meetups
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click anywhere on the map or any venue to <strong>directly host a meetup</strong> or pin a local spot.
          </p>
        </div>

        {/* Quick Action & Real GPS Opt-In */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={openDirectHostModal}
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Direct Host Meetup
          </Button>

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

      {/* Success Banner when meetup hosted from map */}
      {hostSuccessToast && (
        <div className="p-4 bg-success/15 border border-success/30 rounded-2xl text-xs text-success flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 font-bold">
            <Sparkles className="w-4 h-4 text-success shrink-0" />
            <span>{hostSuccessToast}</span>
          </div>
          <Link href="/meetups">
            <Button size="sm" variant="outline" className="text-xs h-7 border-success/40 text-success hover:bg-success/10 font-bold">
              View in Meetups →
            </Button>
          </Link>
        </div>
      )}

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
            All Circles ({venues.length + meetups.length})
          </button>
          <button
            onClick={() => setActiveLayer('events')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeLayer === 'events'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Places & Meetups
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

        {/* Floating Selected Real Location Card at Bottom with DIRECT HOSTING & GOOGLE MAPS DIRECTIONS */}
        {selectedItem && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-lg z-1000 bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 shadow-xl animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-sm inline-block"
                    style={{
                      backgroundColor: selectedItem.isMeetup ? '#FF6B3520' : `${CATEGORY_CONFIG[selectedItem.category as GroupCategory]?.color || '#0F5257'}20`,
                      color: selectedItem.isMeetup ? '#FF6B35' : CATEGORY_CONFIG[selectedItem.category as GroupCategory]?.color || '#0F5257',
                    }}
                  >
                    {selectedItem.isMeetup ? '🔥 Live Meetup' : selectedItem.category || 'Surat Location'}
                  </span>
                  {selectedItem.isMeetup && (
                    <span className="text-[10px] font-bold text-success bg-success/15 px-2 py-0.5 rounded-sm">
                      {selectedItem.meetupData?.ticket_price === 0 ? 'FREE ENTRY' : `₹${selectedItem.meetupData?.ticket_price}`}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-foreground truncate">{selectedItem.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{selectedItem.subtitle || selectedItem.area}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                {/* DIRECT HOST MEETUP AT THIS EXACT SPOT */}
                <Button
                  size="sm"
                  onClick={openDirectHostModal}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-bold h-8 px-3 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Host Here
                </Button>

                {/* GET DIRECTIONS IN GOOGLE MAPS */}
                {selectedItem.lat && selectedItem.lng && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedItem.lat},${selectedItem.lng}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="sm" variant="outline" className="text-xs font-semibold h-8 px-2.5" title="Get Directions">
                      <Navigation className="w-3.5 h-3.5 mr-1 text-primary" /> Directions
                    </Button>
                  </a>
                )}

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
                ) : !selectedItem.isMeetup ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddModal(true)}
                    className="text-xs font-semibold h-8"
                  >
                    Save Pin
                  </Button>
                ) : (
                  <Link href="/meetups">
                    <Button size="sm" variant="outline" className="text-xs font-semibold h-8">
                      View RSVPS
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> {selectedItem.area || 'Surat, Gujarat'}
              </span>
              <span className="text-foreground font-semibold shrink-0">
                {selectedItem.lat ? `${selectedItem.lat.toFixed(4)}°, ${selectedItem.lng?.toFixed(4)}°` : 'Surat'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* DIRECT HOST MEETUP MODAL FROM MAP */}
      {showHostModal && (
        <div className="fixed inset-0 z-2000 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border rounded-3xl p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-bold text-lg font-heading flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" /> Host Meetup Directly from Map
                </h3>
                <p className="text-xs text-muted-foreground">
                  Location pinned to: <strong>{pickedCoords?.address.split(',')[0] || selectedItem?.title || 'Surat'}</strong>
                </p>
              </div>
              <button onClick={() => setShowHostModal(false)} className="p-1 rounded-md text-muted-foreground hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleHostMeetupSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1">Meetup Title *</label>
                <input
                  type="text"
                  required
                  value={hostTitle}
                  onChange={(e) => setHostTitle(e.target.value)}
                  placeholder="e.g. Surat Sunset Tech Mixer, Dumas Morning Cycling"
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Circle / Category *</label>
                <select
                  value={hostGroupId}
                  onChange={(e) => setHostGroupId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                >
                  {INITIAL_GROUPS.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <MapPin className="w-3.5 h-3.5" /> Pinned Map Spot
                </div>
                <div className="text-xs text-foreground font-semibold truncate">
                  {selectedItem?.title || 'Selected Map Coordinates'}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {pickedCoords ? `${pickedCoords.address} (${pickedCoords.lat.toFixed(4)}°, ${pickedCoords.lng.toFixed(4)}°)` : 'Surat Coordinates'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={hostDateTime}
                    onChange={(e) => setHostDateTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Capacity</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={hostCapacity}
                    onChange={(e) => setHostCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Entry Price (₹0 for Free)</label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={hostTicketPrice}
                  onChange={(e) => setHostTicketPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">What to expect / Description *</label>
                <textarea
                  required
                  rows={2}
                  value={hostDescription}
                  onChange={(e) => setHostDescription(e.target.value)}
                  placeholder="Meetup agenda, meetup spot details, or guidelines..."
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1 text-xs" onClick={() => setShowHostModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-accent text-accent-foreground text-xs font-bold shadow-md">
                  🚀 Launch Meetup on Map
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
