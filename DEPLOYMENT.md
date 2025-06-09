# Vercel Deployment Guide for SPYTRK

## Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository connected (mauinewyork/spytrk)

## Environment Variables
You need to set these environment variables in Vercel:
- `ALPACA_API_KEY` - Your Alpaca API key
- `ALPACA_API_SECRET` - Your Alpaca API secret

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository (mauinewyork/spytrk)
4. Configure project:
   - Framework Preset: Vite
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables:
   - Click "Environment Variables"
   - Add `ALPACA_API_KEY` and `ALPACA_API_SECRET`
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

## Post-Deployment
- Vercel Analytics will automatically be enabled
- The API routes in `/api` will be deployed as serverless functions
- Your app will be available at your Vercel domain

## Features Included
- ✅ React app with Vite
- ✅ Vaporwave-inspired design
- ✅ Company names column
- ✅ Vercel Analytics integration
- ✅ Serverless API functions
- ✅ Auto-refresh every 5 minutes
- ✅ Responsive design