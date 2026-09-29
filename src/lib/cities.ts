export interface CityConfig {
  id: string;
  name: string;
  slug: string;
  country: string;
  countryCode: string;
  flag: string;
  latitude: number;
  longitude: number;
  zoom: number;
  isMetro: boolean;
  region: string;
  subreddits: string[];
  hashtags: string[];
  currency: string;
  currencySymbol: string;
  timezone: string;
  landmarks: string[];
}

export const MAJOR_CITIES: CityConfig[] = [
  // --- India Metro Hubs ---
  {
    id: 'city-surat',
    name: 'Surat',
    slug: 'surat',
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    latitude: 21.1702,
    longitude: 72.8311,
    zoom: 12,
    isMetro: true,
    region: 'Gujarat',
    subreddits: ['r/surat', 'r/gujarat'],
    hashtags: ['#surat', '#suratfood', '#suratcity', '#vesu', '#dumas'],
    currency: 'INR',
    currencySymbol: '₹',
    timezone: 'Asia/Kolkata',
    landmarks: ['Dumas Beach', 'SVNIT Piplod', 'Surat Diamond Bourse', 'VR Mall Vesu'],
  },
  {
    id: 'city-mumbai',
    name: 'Mumbai',
    slug: 'mumbai',
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    latitude: 19.0760,
    longitude: 72.8777,
    zoom: 12,
    isMetro: true,
    region: 'Maharashtra',
    subreddits: ['r/mumbai', 'r/maharashtra'],
    hashtags: ['#mumbai', '#mumbaifoodie', '#bandra', '#marine_drive', '#bombay'],
    currency: 'INR',
    currencySymbol: '₹',
    timezone: 'Asia/Kolkata',
    landmarks: ['Marine Drive', 'Bandra Bandstand', 'BKC Tech Park', 'Juhu Beach'],
  },
  {
    id: 'city-bengaluru',
    name: 'Bengaluru',
    slug: 'bengaluru',
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    latitude: 12.9716,
    longitude: 77.5946,
    zoom: 12,
    isMetro: true,
    region: 'Karnataka',
    subreddits: ['r/bangalore', 'r/karnataka'],
    hashtags: ['#bangalore', '#bengaluru', '#indiranagar', '#koramangala', '#peakbengaluru'],
    currency: 'INR',
    currencySymbol: '₹',
    timezone: 'Asia/Kolkata',
    landmarks: ['Indiranagar 100ft Rd', 'Koramangala 4th Block', 'Cubbon Park', 'HSR Layout'],
  },
  {
    id: 'city-delhi',
    name: 'Delhi NCR',
    slug: 'delhi-ncr',
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    latitude: 28.6139,
    longitude: 77.2090,
    zoom: 11,
    isMetro: true,
    region: 'National Capital Region',
    subreddits: ['r/delhi', 'r/ncr'],
    hashtags: ['#delhi', '#delhincr', '#cyberhub', '#hauzkhas', '#connaughtplace'],
    currency: 'INR',
    currencySymbol: '₹',
    timezone: 'Asia/Kolkata',
    landmarks: ['Cyber Hub Gurugram', 'Connaught Place', 'Hauz Khas Village', 'Noida Sector 62'],
  },
  {
    id: 'city-hyderabad',
    name: 'Hyderabad',
    slug: 'hyderabad',
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    latitude: 17.3850,
    longitude: 78.4867,
    zoom: 12,
    isMetro: true,
    region: 'Telangana',
    subreddits: ['r/hyderabad', 'r/telangana'],
    hashtags: ['#hyderabad', '#hitec_city', '#jubileehills', '#gachibowli', '#charminar'],
    currency: 'INR',
    currencySymbol: '₹',
    timezone: 'Asia/Kolkata',
    landmarks: ['HITEC City', 'Jubilee Hills Checkpost', 'Gachibowli Stadium', 'Durgam Cheruvu'],
  },
  {
    id: 'city-pune',
    name: 'Pune',
    slug: 'pune',
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    latitude: 18.5204,
    longitude: 73.8567,
    zoom: 12,
    isMetro: true,
    region: 'Maharashtra',
    subreddits: ['r/pune', 'r/maharashtra'],
    hashtags: ['#pune', '#punekar', '#koregaonpark', '#hinjawadi', '#baner'],
    currency: 'INR',
    currencySymbol: '₹',
    timezone: 'Asia/Kolkata',
    landmarks: ['Koregaon Park', 'FC Road', 'Baner High Street', 'Hinjawadi Phase 1'],
  },
  {
    id: 'city-ahmedabad',
    name: 'Ahmedabad',
    slug: 'ahmedabad',
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    latitude: 23.0225,
    longitude: 72.5714,
    zoom: 12,
    isMetro: true,
    region: 'Gujarat',
    subreddits: ['r/ahmedabad', 'r/gujarat'],
    hashtags: ['#ahmedabad', '#sabarmati', '#sg_highway', '#bodakdev', '#sindhubhavan'],
    currency: 'INR',
    currencySymbol: '₹',
    timezone: 'Asia/Kolkata',
    landmarks: ['Sindhu Bhavan Road', 'Sabarmati Riverfront', 'Vastrapur Lake', 'SG Highway'],
  },
  {
    id: 'city-chennai',
    name: 'Chennai',
    slug: 'chennai',
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    latitude: 13.0827,
    longitude: 80.2707,
    zoom: 12,
    isMetro: true,
    region: 'Tamil Nadu',
    subreddits: ['r/chennai', 'r/tamilnadu'],
    hashtags: ['#chennai', '#besantnagar', '#omr', '#marinabeach', '#ecr'],
    currency: 'INR',
    currencySymbol: '₹',
    timezone: 'Asia/Kolkata',
    landmarks: ['Marina Beach', 'Besant Nagar Elliot Beach', 'OMR Tech Corridor', 'Nungambakkam'],
  },
  {
    id: 'city-kolkata',
    name: 'Kolkata',
    slug: 'kolkata',
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    latitude: 22.5726,
    longitude: 88.3639,
    zoom: 12,
    isMetro: true,
    region: 'West Bengal',
    subreddits: ['r/kolkata', 'r/westbengal'],
    hashtags: ['#kolkata', '#parkstreet', '#saltlake', '#newtown', '#calcutta'],
    currency: 'INR',
    currencySymbol: '₹',
    timezone: 'Asia/Kolkata',
    landmarks: ['Park Street', 'Salt Lake Sector V', 'Victoria Memorial', 'New Town Eco Park'],
  },

  // --- Global Tech & Metro Hubs ---
  {
    id: 'city-san-francisco',
    name: 'San Francisco Bay Area',
    slug: 'san-francisco',
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    latitude: 37.7749,
    longitude: -122.4194,
    zoom: 12,
    isMetro: true,
    region: 'California',
    subreddits: ['r/sanfrancisco', 'r/bayarea'],
    hashtags: ['#sanfrancisco', '#bayarea', '#soma', '#missiondistrict', '#siliconvalley'],
    currency: 'USD',
    currencySymbol: '$',
    timezone: 'America/Los_Angeles',
    landmarks: ['Ferry Building', 'Dolores Park', 'SOMA Tech Hub', 'Golden Gate Park'],
  },
  {
    id: 'city-new-york',
    name: 'New York City',
    slug: 'new-york',
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    latitude: 40.7128,
    longitude: -74.0060,
    zoom: 12,
    isMetro: true,
    region: 'New York',
    subreddits: ['r/nyc', 'r/newyorkcity'],
    hashtags: ['#nyc', '#manhattan', '#brooklyn', '#williamsburg', '#soho'],
    currency: 'USD',
    currencySymbol: '$',
    timezone: 'America/New_York',
    landmarks: ['Washington Square Park', 'Williamsburg Waterfront', 'SoHo', 'Central Park'],
  },
  {
    id: 'city-london',
    name: 'London',
    slug: 'london',
    country: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    latitude: 51.5074,
    longitude: -0.1278,
    zoom: 12,
    isMetro: true,
    region: 'Greater London',
    subreddits: ['r/london', 'r/unitedkingdom'],
    hashtags: ['#london', '#shoreditch', '#soho', '#canarywharf', '#londonlife'],
    currency: 'GBP',
    currencySymbol: '£',
    timezone: 'Europe/London',
    landmarks: ['Shoreditch High St', 'Canary Wharf', 'Soho Square', 'Hyde Park'],
  },
  {
    id: 'city-singapore',
    name: 'Singapore',
    slug: 'singapore',
    country: 'Singapore',
    countryCode: 'SG',
    flag: '🇸🇬',
    latitude: 1.3521,
    longitude: 103.8198,
    zoom: 12,
    isMetro: true,
    region: 'Singapore',
    subreddits: ['r/singapore'],
    hashtags: ['#singapore', '#marinabay', '#orchard', '#tanjongpagar', '#sgfoodie'],
    currency: 'SGD',
    currencySymbol: 'S$',
    timezone: 'Asia/Singapore',
    landmarks: ['Marina Bay Sands', 'Tanjong Pagar', 'Orchard Road', 'Clarke Quay'],
  },
  {
    id: 'city-dubai',
    name: 'Dubai',
    slug: 'dubai',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    flag: '🇦🇪',
    latitude: 25.2048,
    longitude: 55.2708,
    zoom: 12,
    isMetro: true,
    region: 'Dubai',
    subreddits: ['r/dubai', 'r/uae'],
    hashtags: ['#dubai', '#downtowndubai', '#difc', '#dubaimarina', '#dubaitech'],
    currency: 'AED',
    currencySymbol: 'AED',
    timezone: 'Asia/Dubai',
    landmarks: ['DIFC Gate', 'Dubai Marina Walk', 'Downtown Boulevard', 'Kite Beach'],
  },
  {
    id: 'city-berlin',
    name: 'Berlin',
    slug: 'berlin',
    country: 'Germany',
    countryCode: 'DE',
    flag: '🇩🇪',
    latitude: 52.5200,
    longitude: 13.4050,
    zoom: 12,
    isMetro: true,
    region: 'Berlin',
    subreddits: ['r/berlin', 'r/germany'],
    hashtags: ['#berlin', '#mitte', '#kreuzberg', '#prenzlauerberg', '#berlintech'],
    currency: 'EUR',
    currencySymbol: '€',
    timezone: 'Europe/Berlin',
    landmarks: ['Mitte Rosenthaler Platz', 'Kreuzberg Canal', 'Tempelhofer Feld', 'Alexanderplatz'],
  },
  {
    id: 'city-tokyo',
    name: 'Tokyo',
    slug: 'tokyo',
    country: 'Japan',
    countryCode: 'JP',
    flag: '🇯🇵',
    latitude: 35.6762,
    longitude: 139.6503,
    zoom: 12,
    isMetro: true,
    region: 'Kanto',
    subreddits: ['r/tokyo', 'r/japan'],
    hashtags: ['#tokyo', '#shibuya', '#shinjuku', '#roppongi', '#tokyotech'],
    currency: 'JPY',
    currencySymbol: '¥',
    timezone: 'Asia/Tokyo',
    landmarks: ['Shibuya Crossing', 'Shinjuku Gyoen', 'Roppongi Hills', 'Akihabara'],
  },
  {
    id: 'city-sydney',
    name: 'Sydney',
    slug: 'sydney',
    country: 'Australia',
    countryCode: 'AU',
    flag: '🇦🇺',
    latitude: -33.8688,
    longitude: 151.2093,
    zoom: 12,
    isMetro: true,
    region: 'New South Wales',
    subreddits: ['r/sydney', 'r/australia'],
    hashtags: ['#sydney', '#bondi', '#surryhills', '#circularquay', '#sydneytech'],
    currency: 'AUD',
    currencySymbol: 'A$',
    timezone: 'Australia/Sydney',
    landmarks: ['Surry Hills', 'Bondi Beach Promenade', 'Circular Quay', 'Barangaroo'],
  },
  {
    id: 'city-austin',
    name: 'Austin',
    slug: 'austin',
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    latitude: 30.2672,
    longitude: -97.7431,
    zoom: 12,
    isMetro: true,
    region: 'Texas',
    subreddits: ['r/austin', 'r/texas'],
    hashtags: ['#austin', '#atx', '#eastaustin', '#southcongress', '#austintech'],
    currency: 'USD',
    currencySymbol: '$',
    timezone: 'America/Chicago',
    landmarks: ['South Congress Ave', 'East Austin 6th St', 'Zilker Park', 'Rainey Street'],
  },
  {
    id: 'city-toronto',
    name: 'Toronto',
    slug: 'toronto',
    country: 'Canada',
    countryCode: 'CA',
    flag: '🇨🇦',
    latitude: 43.6532,
    longitude: -79.3832,
    zoom: 12,
    isMetro: true,
    region: 'Ontario',
    subreddits: ['r/toronto', 'r/ontario'],
    hashtags: ['#toronto', '#the6ix', '#queenwest', '#kingwest', '#torontotech'],
    currency: 'CAD',
    currencySymbol: 'C$',
    timezone: 'America/Toronto',
    landmarks: ['Queen Street West', 'King West Entertainment District', 'Harbourfront', 'High Park'],
  },
];

export const DEFAULT_CITY = MAJOR_CITIES[0]; // Surat default

/**
 * Calculates distance in kilometers between two coordinates using the Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds the nearest metro city for any given latitude & longitude.
 * If user is away from a metro city, returns the closest metro hub with distance info.
 */
export function findNearestMetroCity(
  userLat: number,
  userLng: number
): { city: CityConfig; distanceKm: number; isExactCity: boolean } {
  let nearestCity = MAJOR_CITIES[0];
  let minDistance = Infinity;

  for (const city of MAJOR_CITIES) {
    const dist = calculateDistanceKm(userLat, userLng, city.latitude, city.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearestCity = city;
    }
  }

  return {
    city: nearestCity,
    distanceKm: Math.round(minDistance),
    isExactCity: minDistance <= 40, // Within 40km is considered direct metro city resident
  };
}
