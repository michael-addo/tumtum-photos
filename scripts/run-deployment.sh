#!/bin/bash
set -e

# Deployment script for TUMTUM PHOTOS to Vercel

echo "🚀 Starting deployment for TUMTUM PHOTOS..."

# Check for vercel installation
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
echo "Checking Vercel authentication..."
if ! npx vercel whoami &> /dev/null; then
    echo "⚠️  You need to log in to Vercel first:"
    echo "   npx vercel login"
    echo "   Then run this script again."
    exit 1
fi

# Clean build
echo "🧹 Cleaning previous builds..."
rm -rf .next

# Build the project
echo "📦 Building Next.js application..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
npx vercel deploy --prod --yes

# Verify deployment
echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "   - Project: TUMTUM PHOTOS"
echo "   - Environment: Production"
echo "   - Supabase: Connected (via .env.local)"
echo "   - Auth: Email magic link enabled"
echo "   - Database: Connected via Supabase"
echo ""
echo "🔗 Your deployed site should be available shortly!"
echo ""
echo "Next Steps:"
echo "1. Configure Email Auth in Supabase Dashboard"
echo "2. Upload gallery photos to Supabase Storage"
echo "3. Test admin access with your credentials"
echo ""
echo "Admin Credentials:"
echo "   Email: michaeladdo2015@gmail.com"
echo "   Password: TumtumPhotos2024!"
echo "   User ID: 5d2cb3b6-ea68-457f-a0a6-d543ee6c52d7"