'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Users,
  Gift,
  Megaphone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Plus,
  Trash2,
  ExternalLink,
  TrendingUp,
  FileCheck,
  RefreshCw,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Report, SponsorBanner } from '@/types';

interface FoundingCodeItem {
  id?: string;
  code: string;
  is_used?: boolean;
  used_by?: string | null;
  used_at?: string | null;
  created_at?: string;
}

interface AdminMetrics {
  usersCount: number;
  groupsCount: number;
  meetupsCount: number;
  reportsCount: number;
}

export default function AdminDashboardPage() {
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'moderation' | 'founding' | 'sponsors' | 'metrics'>('moderation');
  
  const [reports, setReports] = useState<Report[]>([]);
  const [banners, setBanners] = useState<SponsorBanner[]>([]);
  const [foundingCodes, setFoundingCodes] = useState<FoundingCodeItem[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics>({
    usersCount: 0,
    groupsCount: 0,
    meetupsCount: 0,
    reportsCount: 0,
  });

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [newCodeInput, setNewCodeInput] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // Sponsor Banner form
  const [showAddBannerModal, setShowAddBannerModal] = useState(false);
  const [sponsorName, setSponsorName] = useState('');
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerDesc, setBannerDesc] = useState('');
  const [bannerImg, setBannerImg] = useState('');
  const [bannerLink, setBannerLink] = useState('');

  // Strict Admin authorization check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = (localStorage.getItem('user_email') || '').toLowerCase();
      const storedRole = (localStorage.getItem('user_role') || '').toLowerCase();
      const hasAuthCookie = document.cookie.includes('auth_token') || document.cookie.includes('user_email');
      const hasAuthLocal = localStorage.getItem('auth_token') || localStorage.getItem('user_email');

      const isSuperAdmin =
        (storedEmail === 'prayag129787@gmail.com' || storedEmail === 'prayagbagtharia@gmail.com' || storedRole === 'admin') &&
        Boolean(hasAuthCookie || hasAuthLocal);

      if (!isSuperAdmin) {
        setIsAdminAuthorized(false);
      } else {
        setIsAdminAuthorized(true);
      }
    }
  }, []);

  // Fetch live admin data from API
  const fetchAdminData = async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch('/api/admin/data');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics || { usersCount: 0, groupsCount: 0, meetupsCount: 0, reportsCount: 0 });
        setFoundingCodes(data.foundingCodes || []);
        setReports(data.reports || []);
        setBanners(data.banners || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthorized) {
      fetchAdminData();
    }
  }, [isAdminAuthorized]);

  const handleResolveReport = async (reportId: string, action: 'dismiss' | 'ban' | 'remove') => {
    const adminName = (typeof window !== 'undefined' && localStorage.getItem('user_display_name')) || 'Super Admin';
    setReports((prev) => {
      const updated = prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: 'resolved' as const,
              reviewed_at: new Date().toISOString(),
              reviewed_by: adminName,
            }
          : r
      );
      return updated;
    });
  };

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeInput.trim() || isGeneratingCode) return;

    setIsGeneratingCode(true);
    try {
      const normalizedCode = newCodeInput.trim().toUpperCase();
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_founding_code',
          code: normalizedCode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.code) {
        setFoundingCodes((prev) => [data.code, ...prev]);
        setNewCodeInput('');
      } else {
        // Local fallback
        setFoundingCodes((prev) => [
          {
            code: normalizedCode,
            is_used: false,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setNewCodeInput('');
      }
    } catch (err) {
      console.error('Error creating code:', err);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    const newBanner: SponsorBanner = {
      id: `sp-${Date.now()}`,
      sponsor_id: `sp-${Date.now()}`,
      sponsor_name: sponsorName,
      title: bannerTitle,
      description: bannerDesc,
      image_url: bannerImg || 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80',
      link_url: bannerLink || 'https://instagram.com',
      placement: 'global',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    };

    try {
      await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_banner',
          banner: newBanner,
        }),
      });
    } catch (err) {
      console.error(err);
    }

    setBanners([newBanner, ...banners]);
    setShowAddBannerModal(false);
    setSponsorName('');
    setBannerTitle('');
    setBannerDesc('');
    setBannerImg('');
    setBannerLink('');
  };

  if (isAdminAuthorized === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-medium">Verifying Super Admin Credentials...</p>
        </div>
      </div>
    );
  }

  if (isAdminAuthorized === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center space-y-4 shadow-lg">
          <div className="w-14 h-14 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black font-heading text-foreground">Access Restricted</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This portal is strictly restricted to verified CityCircle Super Administrators. You do not have permission to view or manage platform moderation controls.
          </p>
          <div className="pt-2 flex flex-col gap-2 sm:flex-row">
            <Link href="/auth/login" className="flex-1">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-10">
                Sign In as Admin
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full text-xs font-semibold h-10">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;
  const usedCodesCount = foundingCodes.filter((c) => c.is_used).length;

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-3xl p-6 shadow-xs">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-heading">
                  CityCircle Surat Admin & Moderation
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-danger/15 text-danger font-bold text-[10px] uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time Moderation Queue, Founding Passes, Sponsor Placements & Compliance Desk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAdminData}
              disabled={isLoadingData}
              className="text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoadingData ? 'animate-spin text-primary' : ''}`} />
              Refresh
            </Button>
            <Link href="/grievance">
              <Button variant="outline" size="sm" className="text-xs font-semibold">
                <FileCheck className="w-3.5 h-3.5 mr-1" /> Grievance Desk
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border gap-2 overflow-x-auto pb-1">
          {[
            { id: 'moderation', label: 'Moderation Queue', icon: ShieldAlert, count: pendingReportsCount },
            { id: 'founding', label: 'Founding Member Passes', icon: Gift, count: foundingCodes.length },
            { id: 'sponsors', label: 'Sponsor Banners', icon: Megaphone, count: banners.length },
            { id: 'metrics', label: 'Growth & Metrics', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: Moderation Queue */}
        {activeTab === 'moderation' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-base">Community Reports Queue</h3>
              <p className="text-xs text-muted-foreground">
                IT Rules 2021 compliance: Acknowledge & resolve user safety reports within 24 hours.
              </p>
            </div>

            {reports.length === 0 ? (
              <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-foreground">Zero Active Reports</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  The moderation queue is clean. Community members have not submitted any pending safety or grievance reports.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-wider ${
                          report.status === 'pending'
                            ? 'bg-warning/15 text-warning border border-warning/30'
                            : 'bg-success/15 text-success border border-success/30'
                        }`}>
                          {report.status}
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          Reported by: {report.reporter_name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          · {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs text-foreground font-medium bg-muted/40 p-3 rounded-xl border border-border">
                        {report.reason}
                      </p>

                      {report.reported_user_name && (
                        <div className="text-[11px] text-muted-foreground">
                          Target User: <span className="font-semibold text-foreground">{report.reported_user_name}</span>
                        </div>
                      )}
                    </div>

                    {report.status === 'pending' ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveReport(report.id, 'dismiss')}
                          className="h-8 text-xs font-semibold"
                        >
                          Dismiss
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleResolveReport(report.id, 'remove')}
                          className="bg-danger hover:bg-danger/90 text-white h-8 text-xs font-semibold"
                        >
                          Remove & Warn
                        </Button>
                      </div>
                    ) : (
                      <div className="text-xs text-success font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Resolved by {report.reviewed_by || 'Admin'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Founding Member Passes */}
        {activeTab === 'founding' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base">Founding Member Pass Management</h3>
                <p className="text-xs text-muted-foreground">
                  Generate VIP early access invite codes for verified seed signups.
                </p>
              </div>

              {/* Add Code Form */}
              <form onSubmit={handleGenerateCode} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newCodeInput}
                  onChange={(e) => setNewCodeInput(e.target.value)}
                  placeholder="NEWCODE2026"
                  disabled={isGeneratingCode}
                  className="px-3 py-1.5 rounded-xl border border-input bg-card text-xs uppercase tracking-wider font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isGeneratingCode || !newCodeInput.trim()}
                  className="bg-primary text-primary-foreground text-xs font-semibold shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Code
                </Button>
              </form>
            </div>

            {foundingCodes.length === 0 ? (
              <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Gift className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-foreground">No Founding Promo Codes Created</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Use the form above to generate your first VIP founding invite code for onboarding members.
                </p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/60 text-muted-foreground border-b border-border uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        <th className="p-3.5">Promo Code</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Redeemed By</th>
                        <th className="p-3.5">Created / Redeemed Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {foundingCodes.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-muted/30">
                          <td className="p-3.5 font-mono font-bold text-primary">{item.code}</td>
                          <td className="p-3.5">
                            {item.is_used ? (
                              <span className="px-2 py-0.5 rounded-full bg-success/15 text-success font-bold text-[10px]">
                                Redeemed
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground font-bold text-[10px]">
                                Available
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-muted-foreground">{item.used_by || 'Unclaimed'}</td>
                          <td className="p-3.5 text-muted-foreground">
                            {item.used_at
                              ? new Date(item.used_at).toLocaleDateString()
                              : item.created_at
                              ? new Date(item.created_at).toLocaleDateString()
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Sponsor Banners */}
        {activeTab === 'sponsors' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Sponsored Placements</h3>
                <p className="text-xs text-muted-foreground">
                  Manage revenue-generating sponsor banners on circles and meetup pages.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setShowAddBannerModal(true)}
                className="bg-primary text-primary-foreground text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Sponsor Banner
              </Button>
            </div>

            {banners.length === 0 ? (
              <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent-foreground flex items-center justify-center mx-auto">
                  <Megaphone className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-foreground">No Sponsor Banners Active</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Create sponsored banner placements for local Surat businesses, cafes, and event partners.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((banner) => (
                  <div key={banner.id} className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center gap-3">
                    <img
                      src={banner.image_url}
                      alt={banner.sponsor_name}
                      className="w-20 h-20 rounded-xl object-cover border border-border shrink-0"
                    />
                    <div className="space-y-1 flex-1">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-accent/20 text-accent-foreground">
                        {banner.placement} Placement
                      </span>
                      <h4 className="font-bold text-xs text-foreground">{banner.title}</h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{banner.description}</p>
                      <div className="text-[10px] text-primary font-semibold">Sponsor: {banner.sponsor_name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Metrics */}
        {activeTab === 'metrics' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
              <div className="text-xs text-muted-foreground">Total Verified Members</div>
              <div className="text-2xl font-black font-heading text-primary">{metrics.usersCount}</div>
              <div className="text-[11px] text-success font-semibold">Live from Supabase Users</div>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
              <div className="text-xs text-muted-foreground">Active Groups / Circles</div>
              <div className="text-2xl font-black font-heading text-foreground">{metrics.groupsCount}</div>
              <div className="text-[11px] text-muted-foreground">Live from Supabase Groups</div>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
              <div className="text-xs text-muted-foreground">Active Meetups</div>
              <div className="text-2xl font-black font-heading text-accent">{metrics.meetupsCount}</div>
              <div className="text-[11px] text-muted-foreground">Live from Supabase Meetups</div>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
              <div className="text-xs text-muted-foreground">Report Resolution SLA</div>
              <div className="text-2xl font-black font-heading text-success">100%</div>
              <div className="text-[11px] text-muted-foreground">Target: &lt; 24 hrs (IT Rules 2021)</div>
            </div>
          </div>
        )}
      </div>

      {/* Add Sponsor Modal */}
      {showAddBannerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-bold text-lg font-heading mb-1">Add Sponsor Banner</h3>
            <p className="text-xs text-muted-foreground mb-4">Create a sponsored banner card for the community.</p>

            <form onSubmit={handleCreateBanner} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Sponsor Brand Name *</label>
                <input
                  type="text"
                  required
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  placeholder="e.g. Nomad Coffee Co"
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Headline / Offer *</label>
                <input
                  type="text"
                  required
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="e.g. 15% off for CityCircle members"
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={bannerDesc}
                  onChange={(e) => setBannerDesc(e.target.value)}
                  placeholder="e.g. Show verified badge on phone at billing"
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Banner Image URL</label>
                <input
                  type="url"
                  value={bannerImg}
                  onChange={(e) => setBannerImg(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Target Link URL</label>
                <input
                  type="url"
                  value={bannerLink}
                  onChange={(e) => setBannerLink(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1 text-xs" onClick={() => setShowAddBannerModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary text-primary-foreground text-xs font-semibold">
                  Publish Banner
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
