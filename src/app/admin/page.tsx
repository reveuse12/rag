'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INITIAL_REPORTS, INITIAL_SPONSOR_BANNERS, CURRENT_USER } from '@/lib/data';
import { Report, SponsorBanner } from '@/types';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'moderation' | 'founding' | 'sponsors' | 'metrics'>('moderation');
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [banners, setBanners] = useState<SponsorBanner[]>(INITIAL_SPONSOR_BANNERS);

  // Founding Code generator state
  const [foundingCodes, setFoundingCodes] = useState([
    { code: 'FOUNDER2026', used: false, user: 'Unclaimed (Active VIP)', date: '-' },
    { code: 'SURATVIP', used: false, user: 'Unclaimed (Active VIP)', date: '-' },
    { code: 'CITYCIRCLE100', used: false, user: 'Unclaimed (Active VIP)', date: '-' },
    { code: 'EARLYACCESS', used: false, user: 'Unclaimed (Active VIP)', date: '-' },
  ]);
  const [newCodeInput, setNewCodeInput] = useState('');

  // Sponsor Banner form
  const [showAddBannerModal, setShowAddBannerModal] = useState(false);
  const [sponsorName, setSponsorName] = useState('');
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerDesc, setBannerDesc] = useState('');
  const [bannerImg, setBannerImg] = useState('');
  const [bannerLink, setBannerLink] = useState('');

  const handleResolveReport = (reportId: string, action: 'dismiss' | 'ban' | 'remove') => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: 'resolved' as const,
              reviewed_at: new Date().toISOString(),
              reviewed_by: CURRENT_USER.display_name,
            }
          : r
      )
    );
  };

  const handleGenerateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeInput.trim()) return;
    setFoundingCodes([
      {
        code: newCodeInput.trim().toUpperCase(),
        used: false,
        user: '-',
        date: '-',
      },
      ...foundingCodes,
    ]);
    setNewCodeInput('');
  };

  const handleCreateBanner = (e: React.FormEvent) => {
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
    setBanners([newBanner, ...banners]);
    setShowAddBannerModal(false);
    setSponsorName('');
    setBannerTitle('');
    setBannerDesc('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-3xl p-6 shadow-xs">
          <div className="flex items-center gap-3">
            <Link href="/groups" className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-heading">
                  CityCircle Surat Admin & Moderation
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-danger/15 text-danger font-bold text-[10px] uppercase tracking-wider">
                  Role: Admin
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Moderation Queue, Founding Passes, Sponsor Placements & Compliance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
            { id: 'moderation', label: 'Moderation Queue', icon: ShieldAlert, count: reports.filter(r => r.status === 'pending').length },
            { id: 'founding', label: 'Founding Member Passes', icon: Gift, count: '248/400' },
            { id: 'sponsors', label: 'Sponsor Banners', icon: Megaphone, count: banners.length },
            { id: 'metrics', label: 'Growth & SLAs', icon: TrendingUp },
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Community Reports Queue</h3>
                <p className="text-xs text-muted-foreground">
                  IT Rules 2021 compliance: Acknowledge & resolve user safety reports within 24 hours.
                </p>
              </div>
            </div>

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
                      <CheckCircle2 className="w-4 h-4" /> Resolved by {report.reviewed_by}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Founding Member Passes */}
        {activeTab === 'founding' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base">Founding Member Pass Management</h3>
                <p className="text-xs text-muted-foreground">
                  First 300–400 verified seed signups join free. Current quota: <strong>248 used / 400 cap</strong>.
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
                  className="px-3 py-1.5 rounded-xl border border-input bg-card text-xs uppercase tracking-wider font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
                <Button type="submit" size="sm" className="bg-primary text-primary-foreground text-xs font-semibold shrink-0">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Code
                </Button>
              </form>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/60 text-muted-foreground border-b border-border uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="p-3.5">Promo Code</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Redeemed By</th>
                      <th className="p-3.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {foundingCodes.map((item, idx) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        <td className="p-3.5 font-mono font-bold text-primary">{item.code}</td>
                        <td className="p-3.5">
                          {item.used ? (
                            <span className="px-2 py-0.5 rounded-full bg-success/15 text-success font-bold text-[10px]">
                              Redeemed
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground font-bold text-[10px]">
                              Available
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-muted-foreground">{item.user}</td>
                        <td className="p-3.5 text-muted-foreground">{item.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
          </div>
        )}

        {/* TAB 4: Metrics */}
        {activeTab === 'metrics' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
              <div className="text-xs text-muted-foreground">Verified Members in Surat</div>
              <div className="text-2xl font-black font-heading text-primary">342</div>
              <div className="text-[11px] text-success font-semibold">↑ 18% this week</div>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
              <div className="text-xs text-muted-foreground">Real-world Meetups Hosted</div>
              <div className="text-2xl font-black font-heading text-accent">14</div>
              <div className="text-[11px] text-muted-foreground">58% RSVP attendance rate</div>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
              <div className="text-xs text-muted-foreground">Avg Report Resolution SLA</div>
              <div className="text-2xl font-black font-heading text-success">3.4 hrs</div>
              <div className="text-[11px] text-muted-foreground">Target: &lt; 24 hrs (IT Rules 2021)</div>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
              <div className="text-xs text-muted-foreground">Committed Local Sponsors</div>
              <div className="text-2xl font-black font-heading text-foreground">3 Brands</div>
              <div className="text-[11px] text-muted-foreground">Cafes, Coworking & Events</div>
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
