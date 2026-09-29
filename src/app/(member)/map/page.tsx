'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const InteractiveCityMap = dynamic(
  () => import('@/components/interactive-map'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] rounded-3xl bg-card border border-border flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
        <div className="font-bold text-sm text-foreground">Loading Live City Map...</div>
        <div className="text-xs text-muted-foreground mt-1">
          Rendering geographic tiles & PostGIS layer
        </div>
      </div>
    ),
  }
);

export default function MapPage() {
  return <InteractiveCityMap />;
}

