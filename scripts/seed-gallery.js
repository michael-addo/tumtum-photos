const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials.');
  process.exit(1);
}

const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Sample gallery images — replace with your real photos
const BUCKET = 'gallery-public';

const SAMPLE_IMAGES = [
  {
    id: 'portrait-01',
    collection_slug: 'solo',
    storage_bucket_id: BUCKET,
    path: 'solo/portrait-01.jpg',
    alt_text: 'Soft window light graduation portrait',
    caption: 'Graduation portrait in studio',
    width: 1600,
    height: 1067,
    featured: true,
    sort_order: 1,
  },
  {
    id: 'portrait-02',
    collection_slug: 'solo',
    storage_bucket_id: BUCKET,
    path: 'solo/portrait-02.jpg',
    alt_text: 'Dramatic lighting cap and gown photo',
    caption: 'Cap and gown photo',
    width: 1600,
    height: 1067,
    featured: false,
    sort_order: 2,
  },
  {
    id: 'duo-01',
    collection_slug: 'duo',
    storage_bucket_id: BUCKET,
    path: 'duo/duo-01.jpg',
    alt_text: 'Graduation with a partner',
    caption: 'Graduations with a partner',
    width: 1600,
    height: 1067,
    featured: true,
    sort_order: 1,
  },
  {
    id: 'location-01',
    collection_slug: 'location',
    storage_bucket_id: BUCKET,
    path: 'location/location-01.jpg',
    alt_text: 'Outdoor graduation photography',
    caption: 'Outdoor graduation photography',
    width: 1600,
    height: 1067,
    featured: true,
    sort_order: 1,
  },
];

async function main() {
  // Check existing images
  const { data: existing, error: checkErr } = await client
    .from('gallery_images')
    .select('id');

  if (checkErr) {
    console.error('Check failed:', checkErr.message);
    process.exit(1);
  }

  if (existing && existing.length > 0) {
    console.log(`Gallery already has ${existing.length} images. Skipping seed.`);
    return;
  }

  // Insert gallery image records
  const { data, error: insertErr } = await client
    .from('gallery_images')
    .insert(SAMPLE_IMAGES)
    .select();

  if (insertErr) {
    console.error('Insert failed:', insertErr.message);
    process.exit(1);
  }

  console.log(`✅ Inserted ${data.length} gallery image records:`);
  data.forEach(img => console.log(`  - ${img.id} (${img.collection_slug})`));

  console.log('\n⚠️  Note: These are metadata records only.');
  console.log('   Upload actual photos to the gallery-public bucket at those paths.');
  console.log('   Example: supabase/storage/v1/object/gallery-public/solo/portrait-01.jpg');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});