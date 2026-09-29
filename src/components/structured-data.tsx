import React from 'react';

export function StructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rag-local.vercel.app';

  // 1. Organization & Community Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    name: 'CityCircle Surat',
    alternateName: ['CityCircle', 'CityCircle Community'],
    url: baseUrl,
    logo: `${baseUrl}/favicon.ico`,
    description:
      'CityCircle Surat is the verified, hyper-local community platform connecting builders, tech founders, outdoor trekkers, foodies, and university alumni across Surat, Gujarat.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Surat',
      addressRegion: 'Gujarat',
      postalCode: '395007',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 21.1702,
      longitude: 72.8311,
    },
    founder: {
      '@type': 'Person',
      name: 'Prayag Bagtharia',
    },
    areaServed: {
      '@type': 'City',
      name: 'Surat',
    },
    knowsAbout: [
      'Tech Startups in Surat',
      'Weekend Trekking Gujarat',
      'Surat Food Culture & Cafes',
      'SVNIT Alumni Network',
      'Community Meetups and Events',
    ],
  };

  // 2. WebSite Schema with Sitelinks Searchbox
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CityCircle Surat',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/groups?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  // 3. FAQPage Schema for direct AI answer engine extraction (AEO)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is CityCircle Surat?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'CityCircle Surat is a verified, hyper-local community platform connecting residents across tech startups, weekend trekking, food explorations, and alumni networks in Surat, Gujarat with real-time group chat and Google Maps venue discovery.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I join tech and startup meetups in Surat?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can join the Surat Tech & Startup Circle on CityCircle Surat to participate in monthly developer mixers, AI demo days, and founder discussions hosted at venues across Vesu and Piplod.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does CityCircle protect user location and privacy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'CityCircle implements server-side location fuzzing. Coordinates are intentionally blurred to a 300-500m radius and automatically purged from the database after 3 hours. Exact GPS points are never stored.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does CityCircle comply with Indian IT Rules 2021?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'CityCircle features automated media moderation, a 1-click user report system, and a designated Chief Compliance and Grievance Officer with 24-hour grievance acknowledgment and a 15-day resolution SLA.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
