-- Helper functions for RLS (Security Definer avoids recursive RLS evaluation)
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = _group_id
    AND user_id = _user_id
    AND status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_admin(_group_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.groups
    WHERE id = _group_id
    AND admin_id = _user_id
  );
$$;

-- RLS Policies for groups
DROP POLICY IF EXISTS "Anyone can view public groups" ON public.groups;
DROP POLICY IF EXISTS "Group members can view their groups" ON public.groups;
DROP POLICY IF EXISTS "Anyone can view public groups or members can view private" ON public.groups;
CREATE POLICY "Anyone can view public groups or members can view private" ON public.groups
  FOR SELECT USING (
    is_public = true 
    OR admin_id = auth.uid() 
    OR is_group_member(id, auth.uid())
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
    OR is_group_admin(group_id, auth.uid())
    OR is_group_member(group_id, auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_members.group_id
      AND g.is_public = true
    )
  );

DROP POLICY IF EXISTS "Users can request to join groups" ON public.group_members;
CREATE POLICY "Users can request to join groups" ON public.group_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Group admins can approve/reject members" ON public.group_members;
CREATE POLICY "Group admins can approve/reject members" ON public.group_members
  FOR UPDATE USING (is_group_admin(group_id, auth.uid()));

-- RLS Policies for meetups
DROP POLICY IF EXISTS "Anyone can view public meetups" ON public.meetups;
DROP POLICY IF EXISTS "Group members can view their meetups" ON public.meetups;
DROP POLICY IF EXISTS "Anyone can view public group meetups or members view private" ON public.meetups;
CREATE POLICY "Anyone can view public group meetups or members view private" ON public.meetups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = meetups.group_id
      AND g.is_public = true
    )
    OR is_group_member(group_id, auth.uid())
  );

DROP POLICY IF EXISTS "Group members can create meetups" ON public.meetups;
CREATE POLICY "Group members can create meetups" ON public.meetups
  FOR INSERT WITH CHECK (
    is_group_member(group_id, auth.uid())
    AND auth.uid() = created_by
  );

-- RLS Policies for RSVPs
DROP POLICY IF EXISTS "Users can manage their own RSVPs" ON public.rsvps;
CREATE POLICY "Users can manage their own RSVPs" ON public.rsvps
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view meetup RSVPs" ON public.rsvps;
CREATE POLICY "Users can view meetup RSVPs" ON public.rsvps
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.meetups m
      JOIN public.groups g ON g.id = m.group_id
      WHERE m.id = rsvps.meetup_id
      AND (g.is_public = true OR is_group_member(g.id, auth.uid()))
    )
  );
