# Deployment Guide

## Recommended Production Stack

- App hosting: Vercel
- Database/Auth: Supabase
- Version control: GitHub

## 1. Create Supabase Project

1. Create a Supabase project.
2. Copy values into `.env.local`.
3. Run SQL migrations from `supabase/migrations` in order.
4. Configure Auth redirect URLs from [auth.md](auth.md).

## 2. Verify Locally

```bash
npm.cmd install
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd run dev -- --hostname 127.0.0.1
```

Open:

```text
http://127.0.0.1:3000
```

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Initial Fithub SaaS build"
git branch -M main
git remote add origin your-github-repo-url
git push -u origin main
```

## 4. Deploy on Vercel

1. Import the GitHub repository in Vercel.
2. Framework should auto-detect as Next.js.
3. Add all production environment variables.
4. Deploy.

## 5. Production Environment Variables

Set these in Vercel Project Settings > Environment Variables:

```env
APP_NAME=Fithub
APP_ENV=production
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
DATABASE_URL=
DIRECT_URL=
CURRENCY_CODE=INR
EXPIRY_SOON_DAYS=7
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=120
```

## 6. Supabase Auth Production URLs

Add:

```text
https://your-vercel-domain.vercel.app/auth/callback
```

If using a custom domain, also add:

```text
https://your-custom-domain.com/auth/callback
```

## 7. Production Checklist

- Supabase RLS enabled on all business tables
- Production env vars configured in Vercel
- Local `.env.local` not committed
- Supabase Auth redirect URLs configured
- Build passes on Vercel
- Signup/login tested
- First gym onboarding tested
- Plans, members, payments, attendance tested
- Analytics page tested with sample records
- Custom domain and SSL configured if needed
