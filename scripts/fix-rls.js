const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials.');
  process.exit(1);
}

const SQL = `
drop policy if exists "Admins can view all profiles" on public.user_profiles;
drop policy if exists "Admins can view enquiries" on public.enquiries;
drop policy if exists "Admins can delete enquiries" on public.enquiries;
drop policy if exists "Admins can manage collections" on public.gallery_collections;
drop policy if exists "Admins can manage gallery images" on public.gallery_images;

create policy "Admins can view all profiles" on public.user_profiles
  for select using (public.is_admin(auth.uid()));

create policy "Admins can view enquiries" on public.enquiries
  for select using (public.is_admin(auth.uid()));

create policy "Admins can delete enquiries" on public.enquiries
  for delete using (public.is_admin(auth.uid()));

create policy "Admins can manage collections" on public.gallery_collections
  for all using (public.is_admin(auth.uid()));

create policy "Admins can manage gallery images" on public.gallery_images
  for all using (public.is_admin(auth.uid()));
`;

async function main() {
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql: SQL }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('RLS fix failed:', res.status, text);
    process.exit(1);
  }

  console.log('✅ RLS policies fixed successfully');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});