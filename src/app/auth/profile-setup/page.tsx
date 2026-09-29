'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Check, Sparkles, Lock, ArrowRight, Camera, Upload, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const INTEREST_TAGS = [
  'Parties', 'Travel', 'Food & Dining', 'Sports', 'Music',
  'Tech', 'Art', 'Photography', 'Fitness', 'Gaming',
  'Movies', 'Books', 'Networking', 'Startups', 'Real Estate'
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      setError('You must be 18 or older to join CityCircle');
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
          avatar_url: avatarUrl || undefined,
          interest_tags: selectedTags,
          founding_code: foundingCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete profile');
      }

      const emailLower = email.trim().toLowerCase();
      const isAdmin = emailLower === 'prayag129787@gmail.com' || emailLower === 'prayagbagtharia@gmail.com';
      const role = isAdmin ? 'admin' : 'member';

      // Set cookies for Edge Middleware
      document.cookie = `auth_token=session_${data.user_id || Date.now()}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user_email=${emailLower}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user_role=${role}; path=/; max-age=86400; SameSite=Lax`;

      localStorage.setItem('user_email', emailLower);
      localStorage.setItem('user_id', data.user_id || '');
      localStorage.setItem('user_display_name', displayName.trim());
      if (avatarUrl) {
        localStorage.setItem('user_avatar', avatarUrl);
      }
      localStorage.setItem('user_role', role);
      localStorage.removeItem('founding_code');

      window.location.href = '/dashboard';
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
            <span className="font-extrabold text-base tracking-tight font-heading">CityCircle</span>
          </div>

          <h1 className="text-2xl font-bold mb-1 font-heading">Complete Your Profile</h1>
          <p className="text-xs text-muted-foreground mb-6">
            Upload your photo and choose your public identity. Other members will only see this display name and your tags.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
            {/* Direct Profile Photo Upload (No Presets, No URL Input) */}
            <div className="space-y-2">
              <label className="block font-semibold text-foreground">Profile Photo (Optional)</label>
              
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleImageUpload}
                className="hidden"
              />

              <div className="flex items-center gap-4 p-3.5 bg-muted/40 rounded-2xl border border-border">
                <div className="relative group shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Uploaded Avatar"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-primary shadow-xs ring-2 ring-primary/20"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
                      <User className="w-8 h-8 opacity-40" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                    title="Change image"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 px-3"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1" />
                      {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                    </Button>

                    {avatarUrl && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleRemoveImage}
                        className="text-danger hover:bg-danger/10 text-xs h-8 px-2.5"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    PNG, JPG, or WebP up to 5MB.
                  </p>
                </div>
              </div>
            </div>

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
                This is what people in your city see (keeps your real contact info private).
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
