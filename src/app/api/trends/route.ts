import { NextResponse } from 'next/server';
import { MAJOR_CITIES, DEFAULT_CITY } from '@/lib/cities';
import { SocialTrend } from '@/types';
import { rateLimiter } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

function formatRelativeTime(createdUtc?: number): string {
  if (!createdUtc) return 'Recently';
  const now = Math.floor(Date.now() / 1000);
  const diffSec = Math.max(0, now - createdUtc);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}

// Global server-side cache and inflight request deduplication to prevent DB & upstream API overload
interface CacheEntry {
  data: SocialTrend[];
  expiresAt: number;
}

const globalCache = globalThis as unknown as {
  __TRENDS_CACHE__?: Map<string, CacheEntry>;
  __TRENDS_INFLIGHT__?: Map<string, Promise<SocialTrend[]>>;
};

if (!globalCache.__TRENDS_CACHE__) {
  globalCache.__TRENDS_CACHE__ = new Map();
}
if (!globalCache.__TRENDS_INFLIGHT__) {
  globalCache.__TRENDS_INFLIGHT__ = new Map();
}

const CACHE_TTL_MS = 120 * 1000; // 2 minutes server-side TTL

async function fetchSubredditTrends(
  subreddit: string,
  endpoint: 'hot' | 'new',
  citySlug: string,
  cityName: string
): Promise<SocialTrend[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(`https://www.reddit.com/r/${subreddit}/${endpoint}.json?limit=15`, {
      signal: controller.signal,
      headers: {
        'User-Agent': `CityCircle-LivePulse/2.0 (by /u/CityCircleApp)`,
        Accept: 'application/json',
      },
      next: { revalidate: 120 },
    });

    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();

    const redditPosts: SocialTrend[] = (data?.data?.children || [])
      .filter((child: any) => !child.data.stickied && child.data.title)
      .map((child: any) => {
        const d = child.data;
        let inferredCategory: SocialTrend['category'] = 'Civic & Infrastructure';
        const lowerTitle = (d.title + ' ' + (d.selftext || '')).toLowerCase();

        if (
          lowerTitle.includes('food') ||
          lowerTitle.includes('cafe') ||
          lowerTitle.includes('restaurant') ||
          lowerTitle.includes('coffee') ||
          lowerTitle.includes('eat') ||
          lowerTitle.includes('locho') ||
          lowerTitle.includes('dish')
        ) {
          inferredCategory = 'Food & Cafes';
        } else if (
          lowerTitle.includes('tech') ||
          lowerTitle.includes('startup') ||
          lowerTitle.includes('hiring') ||
          lowerTitle.includes('coding') ||
          lowerTitle.includes('ai') ||
          lowerTitle.includes('developer') ||
          lowerTitle.includes('job')
        ) {
          inferredCategory = 'Tech & Startups';
        } else if (
          lowerTitle.includes('night') ||
          lowerTitle.includes('party') ||
          lowerTitle.includes('event') ||
          lowerTitle.includes('club') ||
          lowerTitle.includes('music') ||
          lowerTitle.includes('concert')
        ) {
          inferredCategory = 'Events & Nightlife';
        } else if (
          lowerTitle.includes('visit') ||
          lowerTitle.includes('place') ||
          lowerTitle.includes('travel') ||
          lowerTitle.includes('hidden') ||
          lowerTitle.includes('weekend') ||
          lowerTitle.includes('beach') ||
          lowerTitle.includes('explore')
        ) {
          inferredCategory = 'Culture & Gems';
        }

        let imageUrl: string | undefined = undefined;
        if (
          d.url &&
          (d.url.endsWith('.jpg') ||
            d.url.endsWith('.jpeg') ||
            d.url.endsWith('.png') ||
            d.url.endsWith('.webp') ||
            d.post_hint === 'image')
        ) {
          imageUrl = d.url;
        } else if (
          d.thumbnail &&
          d.thumbnail.startsWith('http') &&
          !d.thumbnail.includes('default') &&
          !d.thumbnail.includes('self')
        ) {
          imageUrl = d.thumbnail;
        }

        return {
          id: `reddit-${citySlug}-${d.id}`,
          platform: 'reddit' as const,
          title: d.title,
          content: d.selftext ? d.selftext.slice(0, 320) + (d.selftext.length > 320 ? '...' : '') : undefined,
          author_name: `u/${d.author}`,
          author_handle: `u/${d.author}`,
          author_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          source_url: `https://reddit.com${d.permalink}`,
          image_url: imageUrl,
          subreddit: d.subreddit_name_prefixed || `r/${subreddit}`,
          category: inferredCategory,
          likes_count: d.score || 1,
          upvotes_count: d.score || 1,
          comments_count: d.num_comments || 0,
          posted_at: formatRelativeTime(d.created_utc),
          neighborhood: `${cityName} Metro`,
        };
      });

    return redditPosts;
  } catch (err) {
    clearTimeout(timeoutId);
    return [];
  }
}

export async function GET(request: Request) {
  // Rate limiting protection: 60 requests per minute per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anon';
  const limitCheck = rateLimiter.check(`trends_${ip}`, 60, 60000);
  if (!limitCheck.success) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const citySlug = searchParams.get('city') || 'surat';
  const platform = searchParams.get('platform');
  const category = searchParams.get('category');
  const query = searchParams.get('q');
  const sortBy = searchParams.get('sort') || 'hot';

  const cityConfig = MAJOR_CITIES.find((c) => c.slug === citySlug) || DEFAULT_CITY;
  const primarySubreddit = cityConfig.subreddits[0]?.replace('r/', '') || 'surat';
  const cacheKey = `${citySlug}_${sortBy}`;

  // 1. Check in-memory cache
  const cached = globalCache.__TRENDS_CACHE__?.get(cacheKey);
  let trends: SocialTrend[] = [];

  if (cached && cached.expiresAt > Date.now()) {
    trends = cached.data;
  } else {
    // 2. Request deduplication / single-flight coalescing
    let inflightPromise = globalCache.__TRENDS_INFLIGHT__?.get(cacheKey);

    if (!inflightPromise) {
      inflightPromise = (async () => {
        const endpoint = sortBy === 'new' ? 'new' : 'hot';
        const liveRedditPosts = await fetchSubredditTrends(
          primarySubreddit,
          endpoint,
          cityConfig.slug,
          cityConfig.name
        );

        const merged: SocialTrend[] = liveRedditPosts.length > 0 ? liveRedditPosts : [];

        // Store in cache
        globalCache.__TRENDS_CACHE__?.set(cacheKey, {
          data: merged,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });

        globalCache.__TRENDS_INFLIGHT__?.delete(cacheKey);
        return merged;
      })();

      globalCache.__TRENDS_INFLIGHT__?.set(cacheKey, inflightPromise);
    }

    trends = await inflightPromise;
  }

  // Filter by platform
  let filtered = trends;
  if (platform && platform !== 'all') {
    filtered = filtered.filter((t) => t.platform === platform);
  }

  // Filter by category
  if (category && category !== 'all') {
    filtered = filtered.filter((t) => t.category === category);
  }

  // Filter by query
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.content && t.content.toLowerCase().includes(q)) ||
        (t.hashtags && t.hashtags.some((h) => h.toLowerCase().includes(q))) ||
        (t.neighborhood && t.neighborhood.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (sortBy === 'top') {
    filtered = [...filtered].sort((a, b) => (b.upvotes_count || b.likes_count) - (a.upvotes_count || a.likes_count));
  } else if (sortBy === 'comments') {
    filtered = [...filtered].sort((a, b) => b.comments_count - a.comments_count);
  }

  return NextResponse.json(
    {
      city: cityConfig,
      trends: filtered,
      total: filtered.length,
      timestamp: new Date().toISOString(),
      cached: Boolean(cached && cached.expiresAt > Date.now()),
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
      },
    }
  );
}
