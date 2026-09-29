-- Clean up all demo user references and corrupted direct auth.users insert
DELETE FROM public.group_members WHERE user_id = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM public.meetups WHERE created_by = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM public.groups WHERE admin_id = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM public.users WHERE id = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM auth.users WHERE id = 'a0000000-0000-0000-0000-000000000001' OR email = 'demo@citycircle.com';
