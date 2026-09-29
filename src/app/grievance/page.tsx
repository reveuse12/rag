import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, Phone, Clock, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GrievanceOfficerPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to CityCircle
        </Link>

        <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading">
                Grievance Redressal Mechanism
              </h1>
              <p className="text-xs text-muted-foreground">
                In compliance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021
              </p>
            </div>
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-foreground/90">
            <div className="p-4 bg-muted/60 rounded-2xl border border-border">
              <h2 className="font-bold text-base text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Appointed Resident Grievance Officer
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <div className="font-semibold text-foreground">Prayag Bagtharia</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Designation:</span>
                  <div className="font-semibold text-foreground">Grievance & Compliance Lead</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <div className="font-semibold text-primary">grievance@citycircle.app</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Jurisdiction / City:</span>
                  <div className="font-semibold text-foreground">Surat, Gujarat, India</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-base mb-2">Service Level Agreements (SLAs)</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground list-disc list-inside">
                <li>
                  <strong className="text-foreground">Acknowledgement:</strong> Every user report or grievance will be acknowledged within <strong>24 hours</strong> of receipt.
                </li>
                <li>
                  <strong className="text-foreground">Redressal SLA:</strong> Disposed of within <strong>15 days</strong> from receipt of complaint.
                </li>
                <li>
                  <strong className="text-foreground">High-Priority Content (Rule 3(2)(b)):</strong> Complaints regarding non-consensual imagery, impersonation, or explicit violations are acted upon and removed within <strong>24 hours</strong>.
                </li>
              </ul>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-bold text-base mb-3">How to Submit a Report</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Users can use in-app report buttons on any group, message, or member profile, or email our grievance desk directly with relevant evidence (screenshots, user display names, timestamps).
              </p>
              <div className="flex gap-3">
                <a href="mailto:grievance@citycircle.app?subject=Grievance%20Report%20-%20CityCircle">
                  <Button className="bg-primary text-primary-foreground text-xs font-semibold">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Grievance Officer
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
