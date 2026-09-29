'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CityConfig, MAJOR_CITIES, DEFAULT_CITY, findNearestMetroCity } from '@/lib/cities';

interface CityContextType {
  currentCity: CityConfig;
  availableCities: CityConfig[];
  switchCity: (citySlug: string) => void;
  detectNearestLocation: () => Promise<void>;
  isDetecting: boolean;
  isAutoDetected: boolean;
  distanceToMetroKm: number | null;
  detectionMessage: string | null;
  clearDetectionMessage: () => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [currentCity, setCurrentCity] = useState<CityConfig>(DEFAULT_CITY);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [distanceToMetroKm, setDistanceToMetroKm] = useState<number | null>(null);
  const [detectionMessage, setDetectionMessage] = useState<string | null>(null);

  // Initialize from localStorage or auto-detect on first visit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSlug = localStorage.getItem('cc_active_city_slug');
      if (savedSlug) {
        const found = MAJOR_CITIES.find((c) => c.slug === savedSlug);
        if (found) {
          setCurrentCity(found);
          return;
        }
      }

      // Check if auto-detection was already done
      const hasChecked = localStorage.getItem('cc_geo_checked');
      if (!hasChecked) {
        detectNearestLocation();
      }
    }
  }, []);

  const detectNearestLocation = async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const { city, distanceKm, isExactCity } = findNearestMetroCity(latitude, longitude);

        setCurrentCity(city);
        setDistanceToMetroKm(distanceKm);
        setIsAutoDetected(true);
        localStorage.setItem('cc_active_city_slug', city.slug);
        localStorage.setItem('cc_geo_checked', 'true');

        if (isExactCity) {
          setDetectionMessage(`📍 Connected to your local hub: ${city.name} ${city.flag}`);
        } else {
          setDetectionMessage(
            `📍 Nearest metro hub detected: ${city.name} ${city.flag} (${distanceKm} km away)`
          );
        }
        setIsDetecting(false);
        setTimeout(() => setDetectionMessage(null), 5000);
      },
      (error) => {
        console.warn('Geolocation permission skipped or denied, defaulting to Surat:', error.message);
        setIsDetecting(false);
        localStorage.setItem('cc_geo_checked', 'true');
      },
      { timeout: 7000, enableHighAccuracy: false }
    );
  };

  const switchCity = (citySlug: string) => {
    const target = MAJOR_CITIES.find((c) => c.slug === citySlug);
    if (target) {
      setCurrentCity(target);
      setIsAutoDetected(false);
      setDistanceToMetroKm(null);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cc_active_city_slug', target.slug);
      }
      setDetectionMessage(`Switched to ${target.name} ${target.flag}`);
      setTimeout(() => setDetectionMessage(null), 3000);
    }
  };

  const clearDetectionMessage = () => setDetectionMessage(null);

  return (
    <CityContext.Provider
      value={{
        currentCity,
        availableCities: MAJOR_CITIES,
        switchCity,
        detectNearestLocation,
        isDetecting,
        isAutoDetected,
        distanceToMetroKm,
        detectionMessage,
        clearDetectionMessage,
      }}
    >
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
}
