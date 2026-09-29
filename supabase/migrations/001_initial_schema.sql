-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  interest_tags TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  city TEXT NOT NULL DEFAULT 'Surat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Groups table
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Party', 'Tourism', 'Property', 'University', 'Custom')),
  is_public BOOLEAN DEFAULT true,
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rules TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Group members table
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(group_id, user_id)
);

-- Meetups table
CREATE TABLE IF NOT EXISTS public.meetups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  place TEXT NOT NULL,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  capacity INTEGER NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RSVPs table
CREATE TABLE IF NOT EXISTS public.rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meetup_id UUID NOT NULL REFERENCES public.meetups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(meetup_id, user_id)
);

-- Sponsors table
CREATE TABLE IF NOT EXISTS public.sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Sponsor banners table
CREATE TABLE IF NOT EXISTS public.sponsor_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_id UUID NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
  placement TEXT NOT NULL CHECK (placement IN ('group', 'event')),
  target_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reported_message_id TEXT,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Location data table (fuzzy, opt-in, auto-expiring)
CREATE TABLE IF NOT EXISTS public.location_data (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  accuracy INTEGER NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Founding member codes
CREATE TABLE IF NOT EXISTS public.founding_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT false,
  used_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_groups_category ON public.groups(category);
CREATE INDEX IF NOT EXISTS idx_groups_admin ON public.groups(admin_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_status ON public.group_members(status);
CREATE INDEX IF NOT EXISTS idx_meetups_group ON public.meetups(group_id);
CREATE INDEX IF NOT EXISTS idx_meetups_date ON public.meetups(date_time);
CREATE INDEX IF NOT EXISTS idx_rsvps_meetup ON public.rsvps(meetup_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_user ON public.rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_location_expires ON public.location_data(expires_at);

-- PostGIS index for location queries
CREATE INDEX IF NOT EXISTS idx_location_coords ON public.location_data USING GIST (ST_Point(longitude, latitude));

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founding_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public can view basic user info" ON public.users;
CREATE POLICY "Public can view basic user info" ON public.users
  FOR SELECT USING (
    true
  );

-- RLS Policies for groups
DROP POLICY IF EXISTS "Anyone can view public groups" ON public.groups;
CREATE POLICY "Anyone can view public groups" ON public.groups
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Group members can view their groups" ON public.groups;
CREATE POLICY "Group members can view their groups" ON public.groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = groups.id
      AND gm.user_id = auth.uid()
      AND gm.status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Admins can create groups" ON public.groups;
CREATE POLICY "Admins can create groups" ON public.groups
  FOR INSERT WITH CHECK (auth.uid() = admin_id);

DROP POLICY IF EXISTS "Group admins can update their groups" ON public.groups;
CREATE POLICY "Group admins can update their groups" ON public.groups
  FOR UPDATE USING (auth.uid() = admin_id);

-- RLS Policies for group members
DROP POLICY IF EXISTS "Users can view group membership" ON public.group_members;
CREATE POLICY "Users can view group membership" ON public.group_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Users can request to join groups" ON public.group_members;
CREATE POLICY "Users can request to join groups" ON public.group_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Group admins can approve/reject members" ON public.group_members;
CREATE POLICY "Group admins can approve/reject members" ON public.group_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_members.group_id
      AND g.admin_id = auth.uid()
    )
  );

-- RLS Policies for meetups
DROP POLICY IF EXISTS "Anyone can view public meetups" ON public.meetups;
CREATE POLICY "Anyone can view public meetups" ON public.meetups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = meetups.group_id
      AND g.is_public = true
    )
  );

DROP POLICY IF EXISTS "Group members can view their meetups" ON public.meetups;
CREATE POLICY "Group members can view their meetups" ON public.meetups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = meetups.group_id
      AND gm.user_id = auth.uid()
      AND gm.status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Group members can create meetups" ON public.meetups;
CREATE POLICY "Group members can create meetups" ON public.meetups
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = meetups.group_id
      AND gm.user_id = auth.uid()
      AND gm.status = 'approved'
    )
    AND auth.uid() = created_by
  );

-- RLS Policies for RSVPs
DROP POLICY IF EXISTS "Users can manage their own RSVPs" ON public.rsvps;
CREATE POLICY "Users can manage their own RSVPs" ON public.rsvps
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view meetup RSVPs" ON public.rsvps;
CREATE POLICY "Users can view meetup RSVPs" ON public.rsvps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = rsvps.meetup_id
      AND gm.user_id = auth.uid()
      AND gm.status = 'approved'
    )
  );

-- RLS Policies for sponsors (admin only)
DROP POLICY IF EXISTS "Only admins can manage sponsors" ON public.sponsors;
CREATE POLICY "Only admins can manage sponsors" ON public.sponsors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.is_verified = true
    )
  );

-- RLS Policies for sponsor banners (admin only)
DROP POLICY IF EXISTS "Only admins can manage sponsor banners" ON public.sponsor_banners;
CREATE POLICY "Only admins can manage sponsor banners" ON public.sponsor_banners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.is_verified = true
    )
  );

-- RLS Policies for reports
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their own reports" ON public.reports;
CREATE POLICY "Users can view their own reports" ON public.reports
  FOR SELECT USING (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
CREATE POLICY "Admins can view all reports" ON public.reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.is_verified = true
    )
  );

DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
CREATE POLICY "Admins can update reports" ON public.reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.is_verified = true
    )
  );

-- RLS Policies for location data
DROP POLICY IF EXISTS "Users can manage their own location" ON public.location_data;
CREATE POLICY "Users can manage their own location" ON public.location_data
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Opted-in users can view fuzzy locations" ON public.location_data;
CREATE POLICY "Opted-in users can view fuzzy locations" ON public.location_data
  FOR SELECT USING (
    user_id != auth.uid()
    AND expires_at > NOW()
  );

-- RLS Policies for founding codes (admin only)
DROP POLICY IF EXISTS "Only admins can manage founding codes" ON public.founding_codes;
CREATE POLICY "Only admins can manage founding codes" ON public.founding_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.is_verified = true
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_groups_updated_at ON public.groups;
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
