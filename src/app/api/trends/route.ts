import { NextResponse } from 'next/server';
import { INITIAL_SURAT_TRENDS } from '@/lib/data';
import { MAJOR_CITIES, DEFAULT_CITY } from '@/lib/cities';
import { SocialTrend } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const citySlug = searchParams.get('city') || 'surat';
  const platform = searchParams.get('platform');
  const category = searchParams.get('category');
  const query = searchParams.get('q');

  const cityConfig = MAJOR_CITIES.find((c) => c.slug === citySlug) || DEFAULT_CITY;
  const primarySubreddit = cityConfig.subreddits[0]?.replace('r/', '') || 'surat';

  let trends: SocialTrend[] = [...INITIAL_SURAT_TRENDS];

  // Try fetching live hot posts for the specific city's subreddit (with 2.5s timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`https://www.reddit.com/r/${primarySubreddit}/hot.json?limit=12`, {
      signal: controller.signal,
      headers: {
        'User-Agent': `CityCircle-${cityConfig.name}/1.0`,
      },
      next: { revalidate: 300 }, // 5 min cache
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const redditPosts: SocialTrend[] = (data?.data?.children || [])
        .filter((child: any) => !child.data.stickied && child.data.title)
        .slice(0, 8)
        .map((child: any) => {
          const d = child.data;
          let inferredCategory: SocialTrend['category'] = 'Civic & Infrastructure';
          const lowerTitle = (d.title + ' ' + (d.selftext || '')).toLowerCase();
          if (
            lowerTitle.includes('food') ||
            lowerTitle.includes('cafe') ||
            lowerTitle.includes('restaurant') ||
            lowerTitle.includes('coffee') ||
            lowerTitle.includes('eat')
          ) {
            inferredCategory = 'Food & Cafes';
          } else if (
            lowerTitle.includes('tech') ||
            lowerTitle.includes('startup') ||
            lowerTitle.includes('hiring') ||
            lowerTitle.includes('coding') ||
            lowerTitle.includes('ai')
          ) {
            inferredCategory = 'Tech & Startups';
          } else if (
            lowerTitle.includes('night') ||
            lowerTitle.includes('party') ||
            lowerTitle.includes('event') ||
            lowerTitle.includes('club') ||
            lowerTitle.includes('music')
          ) {
            inferredCategory = 'Events & Nightlife';
          } else if (
            lowerTitle.includes('visit') ||
            lowerTitle.includes('place') ||
            lowerTitle.includes('travel') ||
            lowerTitle.includes('hidden') ||
            lowerTitle.includes('weekend')
          ) {
            inferredCategory = 'Culture & Gems';
          }

          return {
            id: `reddit-${cityConfig.slug}-${d.id}`,
            platform: 'reddit' as const,
            title: d.title,
            content: d.selftext ? d.selftext.slice(0, 300) + (d.selftext.length > 300 ? '...' : '') : undefined,
            author_name: `u/${d.author}`,
            author_handle: `u/${d.author}`,
            author_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            source_url: `https://reddit.com${d.permalink}`,
            subreddit: d.subreddit_name_prefixed || `r/${primarySubreddit}`,
            category: inferredCategory,
            likes_count: d.score || 15,
            upvotes_count: d.score || 15,
            comments_count: d.num_comments || 0,
            posted_at: 'Recent on r/' + primarySubreddit,
            neighborhood: `${cityConfig.name} Community`,
          };
        });

      if (redditPosts.length > 0) {
        if (citySlug === 'surat') {
          // Merge with Surat initial curated set
          const existingIds = new Set(trends.map((t) => t.id));
          const newPosts = redditPosts.filter((rp) => !existingIds.has(rp.id));
          trends = [...newPosts, ...trends];
        } else {
          // Replace with the targeted city's live reddit discussions
          trends = redditPosts;
        }
      }
    }
  } catch (err) {
    // Graceful fallback
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
    city: cityConfig,
    trends,
    total: trends.length,
    timestamp: new Date().toISOString(),
  });
}
