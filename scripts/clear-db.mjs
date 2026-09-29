import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const SUPER_ADMIN_EMAILS = [
  'prayag129787@gmail.com',
  'prayagbagtharia@gmail.com',
];

async function clearDatabase() {
  console.log('🚀 Starting DB cleanup (preserving Super Admin only)...');

  // 1. Check Auth Users
  console.log('\n--- 1. Auth Users ---');
  const { data: { users }, error: listUsersError } = await supabase.auth.admin.listUsers();
  if (listUsersError) {
    console.error('Error listing auth users:', listUsersError);
  } else {
    console.log(`Found ${users.length} auth user(s).`);
    let superAdminUser = null;

    for (const u of users) {
      const email = u.email?.toLowerCase();
      if (SUPER_ADMIN_EMAILS.includes(email)) {
        console.log(`✅ Preserving Super Admin Auth User: ${u.email} (${u.id})`);
        superAdminUser = u;
      } else {
        console.log(`🗑️ Deleting Non-Super Admin Auth User: ${u.email} (${u.id})`);
        const { error: delError } = await supabase.auth.admin.deleteUser(u.id);
        if (delError) {
          console.error(`Failed to delete user ${u.id}:`, delError);
        } else {
          console.log(`Deleted user ${u.email}`);
        }
      }
    }
  }

  // 2. Clear Messages
  console.log('\n--- 2. Clearing Messages ---');
  try {
    const { error: msgErr, count: msgCount } = await supabase
      .from('messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (msgErr) console.log('Notice deleting messages:', msgErr.message);
    else console.log('Messages table cleaned.');
  } catch (e) {
    console.log('Messages cleanup skipped:', e.message);
  }

  // 3. Clear RSVPs
  console.log('\n--- 3. Clearing RSVPs ---');
  try {
    const { error: rsvpErr } = await supabase
      .from('rsvps')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (rsvpErr) console.log('Notice deleting RSVPs:', rsvpErr.message);
    else console.log('RSVPs table cleaned.');
  } catch (e) {
    console.log('RSVPs cleanup skipped:', e.message);
  }

  // 4. Clear Reports
  console.log('\n--- 4. Clearing Reports ---');
  try {
    const { error: repErr } = await supabase
      .from('reports')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (repErr) console.log('Notice deleting reports:', repErr.message);
    else console.log('Reports table cleaned.');
  } catch (e) {
    console.log('Reports cleanup skipped:', e.message);
  }

  // 5. Clear Location Data
  console.log('\n--- 5. Clearing Location Data ---');
  try {
    const { error: locErr } = await supabase
      .from('location_data')
      .delete()
      .neq('user_id', '00000000-0000-0000-0000-000000000000');
    if (locErr) console.log('Notice deleting location data:', locErr.message);
    else console.log('Location data table cleaned.');
  } catch (e) {
    console.log('Location data cleanup skipped:', e.message);
  }

  // 6. Clean Public Users (preserve Super Admin only)
  console.log('\n--- 6. Public Users Table ---');
  try {
    const { data: publicUsers, error: pubUserErr } = await supabase.from('users').select('*');
    if (pubUserErr) {
      console.log('Notice fetching public users:', pubUserErr.message);
    } else {
      console.log(`Found ${publicUsers?.length || 0} public users.`);
      for (const pu of publicUsers || []) {
        const email = pu.email?.toLowerCase();
        if (SUPER_ADMIN_EMAILS.includes(email)) {
          console.log(`✅ Keeping Super Admin Profile: ${pu.email} (${pu.id})`);
          // Ensure role is admin
          await supabase.from('users').update({ role: 'admin', is_verified: true }).eq('id', pu.id);
        } else {
          console.log(`🗑️ Deleting Public User: ${pu.email || pu.display_name} (${pu.id})`);
          await supabase.from('users').delete().eq('id', pu.id);
        }
      }
    }
  } catch (e) {
    console.log('Public users cleanup notice:', e.message);
  }

  // 7. Group Members Table (Remove non-superadmin memberships)
  console.log('\n--- 7. Group Members Table ---');
  try {
    const { data: members, error: memErr } = await supabase.from('group_members').select('*');
    if (memErr) {
      console.log('Notice fetching group members:', memErr.message);
    } else {
      console.log(`Found ${members?.length || 0} group member rows.`);
      for (const m of members || []) {
        if (m.role !== 'admin') {
          console.log(`🗑️ Removing group member: ${m.user_id} in ${m.group_id}`);
          await supabase.from('group_members').delete().eq('id', m.id);
        }
      }
    }
  } catch (e) {
    console.log('Group members cleanup notice:', e.message);
  }

  // 8. Reset Founding Codes
  console.log('\n--- 8. Resetting Founding Codes ---');
  try {
    const { error: codeErr } = await supabase
      .from('founding_codes')
      .update({ is_used: false, used_by: null, used_at: null })
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (codeErr) console.log('Notice resetting founding codes:', codeErr.message);
    else console.log('Founding codes unclaimed and reset.');
  } catch (e) {
    console.log('Founding codes reset notice:', e.message);
  }

  console.log('\n✨ Database purge completed successfully. Only Super Admin preserved.');
}

clearDatabase().catch(console.error);
