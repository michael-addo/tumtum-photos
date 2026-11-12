const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = process.argv[2] || 'michaeladdo2015@gmail.com';
const password = process.argv[3] || 'TumtumPhotos2024!';
const displayName = process.argv[4] || 'Michael Addo';

async function main() {
  // 1. Create the user
  const { data: user, error: createError } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });

  if (createError) {
    console.error('Failed to create user:', createError.message);
    process.exit(1);
  }

  console.log('User created:', user.user.id);

  // 2. Promote to admin via the stored function
  const { error: promoteError } = client.rpc('promote_to_admin', {
    user_uuid: user.user.id,
  });

  if (promoteError) {
    console.error('Failed to promote user:', promoteError.message);
    process.exit(1);
  }

  console.log('User promoted to admin successfully.');
  console.log('\nAdmin account ready:');
  console.log('  Email:', email);
  console.log('  Password:', password);
  console.log('  User ID:', user.user.id);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});