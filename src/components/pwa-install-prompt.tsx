'use client';

import React, { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check if already in standalone / PWA mode
    const isPWA =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isPWA);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for BeforeInstallPrompt event (Chrome/Android)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (isStandalone || dismissed) return null;

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <div className="bg-primary/10 border-b border-primary/20 px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-full bg-primary text-primary-foreground">
            <Download className="w-3.5 h-3.5" />
          </span>
          <div>
            <span className="font-semibold text-primary">Install CityCircle</span>
            <span className="text-muted-foreground hidden sm:inline"> — Enable instant notifications & faster access</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleInstallClick}
            className="h-7 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md shadow-xs"
          >
            Add to Home Screen
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-muted-foreground hover:text-foreground rounded"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">Install on iPhone / iPad</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Required for real-time push notifications in iOS 16.4+
                </p>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm my-4">
              <div className="flex items-start gap-3 p-3 bg-muted/60 rounded-xl">
                <div className="p-2 rounded-lg bg-background text-primary">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Step 1: Tap Share</div>
                  <div className="text-xs text-muted-foreground">
                    Tap the Share button at the bottom of Safari
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/60 rounded-xl">
                <div className="p-2 rounded-lg bg-background text-primary">
                  <PlusSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Step 2: Add to Home Screen</div>
                  <div className="text-xs text-muted-foreground">
                    Scroll down and select <span className="font-medium">"Add to Home Screen"</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              className="w-full mt-2 bg-primary text-primary-foreground font-semibold"
              onClick={() => setShowIOSModal(false)}
            >
              Got It
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
