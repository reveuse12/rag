'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  Calendar,
  MapPin,
  MessageSquare,
  User,
  ShieldCheck,
  Sparkles,
  LogOut,
  SlidersHorizontal,
  Bell,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavProps {
  user?: {
    display_name?: string;
    avatar_url?: string;
    is_verified?: boolean;
    is_founding_member?: boolean;
    role?: string;
  } | null;
}

export function AppNavigation({ user }: NavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState(user);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('user_display_name');
      const storedAvatar = localStorage.getItem('user_avatar');
      if (storedName) {
        setCurrentUser({
          display_name: storedName,
          avatar_url: storedAvatar || user?.avatar_url,
          is_verified: true,
          is_founding_member: true,
          role: 'member',
        });
      } else if (user) {
        setCurrentUser(user);
      }
    }
  }, [user]);

  const handleSignOut = () => {
    document.cookie = 'auth_token=; path=/; max-age=0';
    document.cookie = 'user_email=; path=/; max-age=0';
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_display_name');
    localStorage.removeItem('user_avatar');
    localStorage.removeItem('auth_token');
    router.push('/');
  };

  const navItems = [
    { label: 'Groups', href: '/groups', icon: Users },
    { label: 'Meetups', href: '/meetups', icon: Calendar },
    { label: 'Trends', href: '/trends', icon: Flame },
    { label: 'Live Map', href: '/map', icon: MapPin },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-card/85 backdrop-blur-md border-b border-border transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/groups" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-lg shadow-sm shadow-primary/20 group-hover:scale-105 transition-transform">
                C
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-foreground font-heading">
                    CityCircle
                  </span>
                  <span className="px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider bg-accent/20 text-accent-foreground rounded-sm border border-accent/30">
                    Surat
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 ml-2 text-xs font-medium rounded-lg border border-border ${
                pathname?.startsWith('/admin')
                  ? 'bg-primary/10 text-primary border-primary/30 font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Admin
            </Link>
          </nav>

          {/* User Status / Action bar */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link href="/profile" className="flex items-center gap-2 group">
                  <div className="relative">
                    <img
                      src={
                        currentUser.avatar_url ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={currentUser.display_name || 'Member'}
                      className="w-8 h-8 rounded-full object-cover border border-border group-hover:ring-2 ring-primary/40 transition-all"
                    />
                    {currentUser.is_verified && (
                      <span
                        title="Verified Member"
                        className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5"
                      >
                        <ShieldCheck className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline text-foreground">
                    {currentUser.display_name || 'Member'}
                  </span>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-danger h-8 w-8 p-0"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm">
                    Join Surat
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border pb-safe">
        <div className="grid grid-cols-5 h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className={`p-1 rounded-full ${isActive ? 'bg-primary/10' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
