import { NextResponse } from 'next/server';
import { INITIAL_SURAT_TRENDS } from '@/lib/data';
import { SocialTrend } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform');
  const category = searchParams.get('category');
  const query = searchParams.get('q');

  let trends: SocialTrend[] = [...INITIAL_SURAT_TRENDS];

  // Try fetching live r/surat hot posts if possible (with 2.5s timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch('https://www.reddit.com/r/surat/hot.json?limit=10', {
      signal: controller.signal,
      headers: {
        'User-Agent': 'CityCircle-Surat/1.0',
      },
      next: { revalidate: 300 }, // 5 min cache
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const redditPosts: SocialTrend[] = (data?.data?.children || [])
        .filter((child: any) => !child.data.stickied && child.data.title)
        .slice(0, 5)
        .map((child: any) => {
          const d = child.data;
          let inferredCategory: SocialTrend['category'] = 'Civic & Infrastructure';
          const lowerTitle = (d.title + ' ' + (d.selftext || '')).toLowerCase();
          if (lowerTitle.includes('food') || lowerTitle.includes('locho') || lowerTitle.includes('cafe') || lowerTitle.includes('restaurant')) {
            inferredCategory = 'Food & Cafes';
          } else if (lowerTitle.includes('tech') || lowerTitle.includes('startup') || lowerTitle.includes('svnit') || lowerTitle.includes('coding')) {
            inferredCategory = 'Tech & Startups';
          } else if (lowerTitle.includes('night') || lowerTitle.includes('party') || lowerTitle.includes('event') || lowerTitle.includes('club')) {
            inferredCategory = 'Events & Nightlife';
          } else if (lowerTitle.includes('visit') || lowerTitle.includes('place') || lowerTitle.includes('travel') || lowerTitle.includes('beach')) {
            inferredCategory = 'Culture & Gems';
          }

          return {
            id: `reddit-live-${d.id}`,
            platform: 'reddit' as const,
            title: d.title,
            content: d.selftext ? d.selftext.slice(0, 280) + (d.selftext.length > 280 ? '...' : '') : undefined,
            author_name: `u/${d.author}`,
            author_handle: `u/${d.author}`,
            author_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            source_url: `https://reddit.com${d.permalink}`,
            subreddit: d.subreddit_name_prefixed || 'r/surat',
            category: inferredCategory,
            likes_count: d.score || 10,
            upvotes_count: d.score || 10,
            comments_count: d.num_comments || 0,
            posted_at: 'Recent on r/surat',
            neighborhood: 'Surat Community',
          };
        });

      if (redditPosts.length > 0) {
        // Interleave live reddit posts with existing curated dataset
        const existingIds = new Set(trends.map((t) => t.id));
        const newPosts = redditPosts.filter((rp) => !existingIds.has(rp.id));
        trends = [...newPosts, ...trends];
      }
    }
  } catch (err) {
    // Graceful fallback to rich curated mock data if Reddit API is unreachable or blocked
  }

  // Filter by platform
  if (platform && platform !== 'all') {
    trends = trends.filter((t) => t.platform === platform);
  }

  // Filter by category
  if (category && category !== 'all') {
    trends = trends.filter((t) => t.category === category);
  }

  // Filter by query
  if (query) {
    const q = query.toLowerCase();
    trends = trends.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.content && t.content.toLowerCase().includes(q)) ||
        (t.hashtags && t.hashtags.some((h) => h.toLowerCase().includes(q))) ||
        (t.neighborhood && t.neighborhood.toLowerCase().includes(q))
    );
  }

  return NextResponse.json({
    trends,
    total: trends.length,
    timestamp: new Date().toISOString(),
  });
}
