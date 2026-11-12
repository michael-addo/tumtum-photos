# Vercel Deployment Checklist for TUMTUM PHOTOS

## Overview
This checklist guides you through the complete deployment process for TUMTUM PHOTOS to Vercel with Supabase integration.

## Prerequisites

### 1. Project Preparation ✅
- [x] Database migrations applied (3/3)
- [x] Admin user created and promoted
- [x] RLS policies fixed
- [x] Gallery metadata seeded
- [x] Environment variables configured (`.env.local`)
- [x] TypeScript build passes
- [x] Next.js build passes

### 2. Environment Setup
- [ ] **Supabase Dashboard Login**
  - Visit: https://supabase.com/dashboard/project/lqtkypfzmxwzfugvkvph
  - Log in to your account
  - Access **TUMTUMPHOTOS_1.0** project

- [ ] **Email Authentication Configuration**
  - Navigate: Authentication → Providers
  - Enable **Email** provider
  - Add redirect URLs:
    - `http://localhost:3000/admin` (local)
    - `https://tumtum-photos.vercel.app/admin` (production)
  - Disable **"Enable email confirmations"**
  - Save changes

- [ ] **Vercel Account Setup**
  - Visit: https://vercel.com
  - Sign up/log in
  - Create new project
  - Select **Next.js** framework
  - Connect Git repository

### 3. Vercel Configuration
- [ ] **Environment Variables**
  - Go to **Settings** → **Environment Variables**
  - Add these variables:
    ```
    NEXT_PUBLIC_SUPABASE_URL=https://lqtkypfzmxwzfugvkvph.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your anon key)
    SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your service role key)
    ```

- [ ] **Domain Configuration**
  - Add custom domain if desired
  - Configure SSL certificates
  - Set up preview deployments (optional)

## Deployment Process

### Step 1: Local Testing
- [ ] Run `npm run build` ✅ (verified)
- [ ] Test admin login flow
- [ ] Verify gallery access
- [ ] Test enquiry submission

### Step 2: Vercel Deployment
- [ ] **Deploy to Vercel**
  ```bash
  npm run deploy
  ```
  - Or use Vercel Dashboard
  - Monitor deployment logs
  - Wait for build completion

### Step 3: Post-Deployment Verification
- [ ] **Check Site Access**
  - Visit your Vercel URL
  - Test admin login page (`/admin`)
  - Verify gallery page (`/gallery`)
  - Test enquiry form (`/enquiry`)

- [ ] **Test Admin Access**
  - Use credentials: `michaeladdo2015@gmail.com` / `TumtumPhotos2024!`
  - Check admin dashboard functionality
  - Verify session management

- [ ] **Verify Supabase Integration**
  - Test database queries
  - Check storage bucket access
  - Verify RLS policies

## Storage Setup

### Step 1: Gallery Images ✅
- [x] Database records created (4 images)
- [ ] **Upload Photos to Supabase Storage**
  - Go to **Storage** in Supabase Dashboard
  - Access `gallery-public` bucket
  - Upload graduation photos:
    - `solo/portrait-01.jpg`
    - `solo/portrait-02.jpg`
    - `duo/duo-01.jpg`
    - `location/location-01.jpg`
  - Note: Use same paths as in `gallery_images` records

### Step 2: Update Image Metadata (if paths change)
- [ ] If you use different file paths:
  ```sql
  UPDATE public.gallery_images 
  SET path = 'new-path.jpg', 
      storage_bucket_id = 'gallery-public'
  WHERE id IN ('portrait-01', 'portrait-02', 'duo-01', 'location-01');
  ```

## Environment Variables

### Required Variables ✅
```env
NEXT_PUBLIC_SUPABASE_URL=https://lqtkypfzmxwzfugvkvph.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your actual key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your actual key)
```

### Optional Variables
```env
# SMTP for email notifications (if needed)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Admin Access

### Credentials ✅
- **Email:** `michaeladdo2015@gmail.com`
- **Password:** `TumtumPhotos2024!`
- **User ID:** `5d2cb3b6-ea68-457f-a0a6-d543ee6c52d7`

### First-Time Setup
1. Access `/admin` page
2. Enter email to receive magic link
3. Check email and click magic link
4. Admin dashboard should load with all enquiries

## Troubleshooting

### Common Issues

#### **"Invalid API key" errors**
- Check `.env.local` variables
- Verify Supabase keys are correct
- Ensure migrations are applied in Supabase Dashboard

#### **Admin access denied**
- Verify user is promoted to admin role in `user_profiles`
- Check that `user_profiles` record exists with role='admin'
- Ensure email auth is enabled in Supabase Dashboard

#### **Deployment failures**
- Clean build cache: `rm -rf .next`
- Check Vercel logs for build errors
- Verify all dependencies are installed

#### **Gallery not loading**
- Check Supabase Storage bucket access
- Verify `gallery_images` records exist
- Ensure paths match uploaded files

### Debugging Commands

```bash
# Check environment variables
cat .env.local

# Clean build cache
rm -rf .next

# Run build
npm run build

# Test deployment
npm run deploy

# Check Vercel logs
npx vercel logs
```

## Post-Deployment Monitoring

### Vercel Analytics
1. Go to your Vercel project
2. Monitor **Analytics** tab
3. Check:
   - Response times
   - Error rates
   - Traffic sources

### Supabase Monitoring
1. Go to Supabase Dashboard
2. Monitor **Database** section
3. Check:
   - Query performance
   - Row Level Security
   - Storage usage

### Health Checks
- Your app has `/api/health` endpoint
- Admin dashboard has session timeout
- Enquiry form has rate limiting

## Rollback Plan

If you need to rollback:

```bash
# Deploy previous version
npx vercel deploy --prod --prebuilt

# Or use Vercel Dashboard
# Go to Deployments → Select previous version → Redeploy
```

## Final Checklist Before Launch

- [ ] Email auth configured in Supabase Dashboard
- [ ] All environment variables set in Vercel
- [ ] Gallery photos uploaded to storage
- [ ] Image paths updated if needed
- [ ] Admin access tested and working
- [ ] Mobile responsive design verified
- [ ] Error pages functional
- [ ] SEO metadata set
- [ ] Analytics configured (optional)
- [ ] Backup strategy defined

---

## Support

If you encounter issues:
1. Check Vercel logs for deployment errors
2. Verify environment variables in both Vercel and local
3. Test Supabase connection manually
4. Review this checklist for missing steps
5. Contact support if issues persist

---

**Last Updated:** $(date +%Y-%m-%d)
**Project:** TUMTUM PHOTOS
**Environment:** Vercel Production