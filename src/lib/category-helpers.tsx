import React from 'react';
import { GroupCategory } from '@/types';
import { Sparkles, Compass, Building, GraduationCap, Users, LucideProps } from 'lucide-react';

export const CATEGORY_CONFIG: Record<
  GroupCategory,
  {
    label: string;
    color: string;
    bgLight: string;
    border: string;
    icon: React.ComponentType<LucideProps>;
    description: string;
  }
> = {
  Party: {
    label: 'Party & Nightlife',
    color: '#DB2777',
    bgLight: 'bg-pink-500/10 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30',
    border: 'border-pink-500/30',
    icon: Sparkles,
    description: 'Weekend parties, cafe hops, mixers, and nightlife events',
  },
  Tourism: {
    label: 'Tourism & Trips',
    color: '#0284C7',
    bgLight: 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30',
    border: 'border-sky-500/30',
    icon: Compass,
    description: 'Weekend treks, Dumas beach rides, road trips, and heritage walks',
  },
  Property: {
    label: 'Property & Rentals',
    color: '#B45309',
    bgLight: 'bg-amber-600/10 dark:bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-600/30',
    border: 'border-amber-600/30',
    icon: Building,
    description: 'Flatmates, sublets, office spaces, and local real-estate insights in Surat',
  },
  University: {
    label: 'University & Alumni',
    color: '#4F46E5',
    bgLight: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    border: 'border-indigo-500/30',
    icon: GraduationCap,
    description: 'SVNIT, VNSGU, AU, and student clubs for study, projects, and careers',
  },
  Custom: {
    label: 'Custom / Tech & Startups',
    color: '#475569',
    bgLight: 'bg-slate-500/10 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30',
    border: 'border-slate-500/30',
    icon: Users,
    description: 'Founders, developers, designers, creators, and hobbyists',
  },
};

export const CATEGORIES: GroupCategory[] = ['Party', 'Tourism', 'Property', 'University', 'Custom'];
