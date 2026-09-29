export type GroupCategory = 'Party' | 'Tourism' | 'Property' | 'University' | 'Custom';

export interface User {
  id: string;
  email: string;
  phone?: string;
  display_name: string;
  avatar_url?: string;
  interest_tags: string[];
  is_verified: boolean;
  is_founding_member?: boolean;
  college_email_badge?: boolean;
  role: 'member' | 'moderator' | 'admin';
  city: string;
  created_at: string;
  updated_at?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  category: GroupCategory;
  is_public: boolean;
  admin_id: string;
  admin_name?: string;
  avatar_url?: string;
  cover_url?: string;
  rules?: string;
  member_count?: number;
  max_members?: number; // WhatsApp style cap: 50, 100, 256, 512, 1024
  require_approval?: boolean; // WhatsApp "Approve New Participants"
  only_admins_message?: boolean; // WhatsApp "Send Messages: Admins Only"
  invite_code?: string; // WhatsApp style invite code
  invite_link_enabled?: boolean;
  verified_only?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  role: 'admin' | 'member';
  status: 'pending' | 'approved' | 'rejected';
  joined_at: string;
}

export interface Meetup {
  id: string;
  title: string;
  description: string;
  place: string;
  latitude?: number;
  longitude?: number;
  date_time: string;
  group_id: string;
  group_name?: string;
  category?: GroupCategory;
  capacity: number;
  rsvps_count?: number;
  ticket_price?: number; // ₹0 or fee
  created_by: string;
  creator_name?: string;
  created_at: string;
}

export interface RSVP {
  id: string;
  meetup_id: string;
  user_id: string;
  user_display_name?: string;
  user_avatar?: string;
  status: 'going' | 'maybe' | 'not_going';
  created_at: string;
}

export interface Sponsor {
  id: string;
  name: string;
  tagline?: string;
  logo_url?: string;
  website_url?: string;
  created_at: string;
}

export interface SponsorBanner {
  id: string;
  sponsor_id: string;
  sponsor_name?: string;
  placement: 'group' | 'event' | 'global';
  target_id?: string;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reporter_name?: string;
  reported_user_id?: string;
  reported_user_name?: string;
  reported_message_id?: string;
  reported_item_type?: 'user' | 'message' | 'group' | 'meetup';
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface LocationData {
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  expires_at: string;
  created_at?: string;
}

export interface FoundingCode {
  id: string;
  code: string;
  is_used: boolean;
  used_by?: string;
  used_at?: string;
  created_at: string;
}

export interface MediaUpload {
  id: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_by: string;
  created_at: string;
}

export type TrendPlatform = 'reddit' | 'instagram';
export type TrendCategory =
  | 'Food & Cafes'
  | 'Tech & Startups'
  | 'Events & Nightlife'
  | 'Civic & Infrastructure'
  | 'Culture & Gems';

export interface SocialTrend {
  id: string;
  platform: TrendPlatform;
  title: string;
  content?: string;
  author_name: string;
  author_handle: string;
  author_avatar: string;
  source_url: string;
  image_url?: string;
  video_url?: string;
  subreddit?: string; // e.g. "r/surat", "r/gujarat"
  hashtags?: string[];
  category: TrendCategory;
  likes_count: number;
  comments_count: number;
  upvotes_count?: number;
  posted_at: string;
  is_verified_creator?: boolean;
  neighborhood?: string; // e.g. "Vesu", "Piplod", "Adajan", "Dumas Road"
  aspect_ratio?: 'square' | 'portrait' | 'landscape';
}

