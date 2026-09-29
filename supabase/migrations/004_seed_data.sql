-- Enable required extensions in extensions schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;

DO $$
DECLARE
  demo_user_id UUID := 'a0000000-0000-0000-0000-000000000001';
  group1_id UUID := 'b0000000-0000-0000-0000-000000000001';
  group2_id UUID := 'b0000000-0000-0000-0000-000000000002';
  group3_id UUID := 'b0000000-0000-0000-0000-000000000003';
  group4_id UUID := 'b0000000-0000-0000-0000-000000000004';
BEGIN
  -- Insert seed user into auth.users if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = demo_user_id) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      demo_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'prayag129787@gmail.com',
      extensions.crypt('Password123!', extensions.gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"display_name":"Prayag Bagtharia"}',
      NOW(),
      NOW()
    );
  END IF;

  -- Insert into public.users
  INSERT INTO public.users (
    id,
    email,
    display_name,
    avatar_url,
    interest_tags,
    is_verified,
    city
  ) VALUES (
    demo_user_id,
    'prayag129787@gmail.com',
    'Prayag Bagtharia',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    ARRAY['Tech', 'Startups', 'Food & Dining', 'Fitness', 'Photography'],
    true,
    'Surat'
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    interest_tags = EXCLUDED.interest_tags,
    is_verified = true;

  -- Insert founding codes
  INSERT INTO public.founding_codes (code, is_used)
  VALUES 
    ('FOUNDER2026', false),
    ('SURATVIP', false),
    ('CITYCIRCLE100', false),
    ('EARLYACCESS', false)
  ON CONFLICT (code) DO NOTHING;

  -- Insert sample groups
  INSERT INTO public.groups (
    id,
    name,
    description,
    category,
    is_public,
    admin_id,
    rules
  ) VALUES 
    (
      group1_id,
      'Surat Tech & Startup Circle',
      'Connect with founders, engineers, and creators in Surat. We host monthly tech mixers, demo days, and peer learning sessions.',
      'Custom',
      true,
      demo_user_id,
      '1. Be respectful\n2. No spam\n3. Share knowledge openly'
    ),
    (
      group2_id,
      'Weekend Trekkers & Explorers',
      'Discover scenic trails, weekend getaways, waterfalls, and outdoor adventures around Gujarat and Maharashtra.',
      'Tourism',
      true,
      demo_user_id,
      '1. Safety first\n2. Leave no trace\n3. Stay with the group'
    ),
    (
      group3_id,
      'Surat Foodies & Cafes Club',
      'Exploring the vibrant street food and aesthetic cafes in Surat, from Dumas Road to Vesu.',
      'Party',
      true,
      demo_user_id,
      '1. Food lovers only\n2. Share honest recommendations'
    ),
    (
      group4_id,
      'SVNIT & University Alumni Network',
      'Students and alumni from SVNIT and Surat universities networking, mentoring, and collaborating on projects.',
      'University',
      true,
      demo_user_id,
      '1. Professional discussions\n2. Mentorship encouraged'
    )
  ON CONFLICT (id) DO NOTHING;

  -- Add demo user as group member / admin
  INSERT INTO public.group_members (group_id, user_id, role, status)
  VALUES 
    (group1_id, demo_user_id, 'admin', 'approved'),
    (group2_id, demo_user_id, 'admin', 'approved'),
    (group3_id, demo_user_id, 'admin', 'approved'),
    (group4_id, demo_user_id, 'admin', 'approved')
  ON CONFLICT (group_id, user_id) DO NOTHING;

  -- Insert sample meetups
  INSERT INTO public.meetups (
    title,
    description,
    place,
    date_time,
    group_id,
    capacity,
    created_by
  ) VALUES 
    (
      'Surat AI & Fullstack Developers Mixer',
      'Casual evening meetup discussing Next.js 16, Supabase, LLMs, and local startups.',
      'The House of Caffeine, Vesu, Surat',
      NOW() + INTERVAL '3 days 4 hours',
      group1_id,
      30,
      demo_user_id
    ),
    (
      'Sunrise Cycling & Breakfast at Dumas Beach',
      'Morning cycle ride starting from SVNIT circle to Dumas Beach followed by local chai & snacks.',
      'SVNIT Main Gate, Surat',
      NOW() + INTERVAL '6 days 1 hour',
      group2_id,
      20,
      demo_user_id
    );

END $$;
