'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Check, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const INTEREST_TAGS = [
  'Parties', 'Travel', 'Food & Dining', 'Sports', 'Music',
  'Tech', 'Art', 'Photography', 'Fitness', 'Gaming',
  'Movies', 'Books', 'Networking', 'Startups', 'Real Estate'
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isEighteenPlus, setIsEighteenPlus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (selectedTags.length < 3) {
      setError('Please select at least 3 interest tags (max 5)');
      setLoading(false);
      return;
    }

    if (!isEighteenPlus) {
      setError('You must be 18 or older to join CityCircle Surat');
      setLoading(false);
      return;
    }

    try {
      const email = localStorage.getItem('user_email') || 'member@citycircle.com';
      const foundingCode = localStorage.getItem('founding_code');

      const response = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          display_name: displayName,
          password: password || undefined,
          interest_tags: selectedTags,
          founding_code: foundingCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete profile');
      }

      localStorage.removeItem('auth_token');
      localStorage.removeItem('founding_code');

      router.push('/groups');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-card text-card-foreground rounded-3xl p-6 sm:p-8 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-sm">
              C
            </div>
            <span className="font-extrabold text-base tracking-tight font-heading">CityCircle Surat</span>
          </div>

          <h1 className="text-2xl font-bold mb-1 font-heading">Complete Your Profile</h1>
          <p className="text-xs text-muted-foreground mb-6">
            Choose your public identity. Other members will only see this display name and your interest tags.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
            <div>
              <label htmlFor="displayName" className="block font-semibold mb-1">
                Display Name *
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                minLength={2}
                maxLength={30}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                placeholder="e.g. Prayag B. or NeonExplorer"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                This is what people in Surat see (keeps your real contact info private).
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block font-semibold mb-1">
                Password *
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                placeholder="Choose a password (min 6 characters)"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Interest Tags * ({selectedTags.length}/5 selected, minimum 3)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      disabled={!isSelected && selectedTags.length >= 5}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
                      } ${
                        !isSelected && selectedTags.length >= 5 ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 18+ Gate */}
            <div className="p-3.5 bg-muted/60 border border-border rounded-2xl flex items-start gap-3">
              <input
                type="checkbox"
                id="eighteenPlus"
                checked={isEighteenPlus}
                onChange={(e) => setIsEighteenPlus(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-primary cursor-pointer shrink-0 rounded"
              />
              <label htmlFor="eighteenPlus" className="text-xs text-foreground cursor-pointer">
                <strong>18+ Gate Confirmation:</strong> I confirm that I am 18 years of age or older and agree to adhere to CityCircle community standards.
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 shadow-sm"
              disabled={loading}
            >
              {loading ? 'Creating Profile...' : 'Complete Profile & Enter'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
