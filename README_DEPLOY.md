Deploy to Vercel
================

Quick steps to deploy this Next.js app to Vercel.

1) Create a Git repository and push

```bash
git init
git add .
git commit -m "Initial commit"
# create a GitHub repo and push (example)
git remote add origin git@github.com:<your-org-or-user>/BarberCRM.git
git push -u origin main
```

2) Using Vercel Dashboard (recommended)
- Go to https://vercel.com → Import Project → select your GitHub repo.
- In Project Settings → Environment Variables add keys used by the app:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (only if you need server-side calls; keep secret)
  - Any other DB/secret env vars you use (e.g., `DATABASE_URL`).
- Set Build Command: `npm run build` and Output Directory: leave blank (Next.js on Vercel uses builder).
- Deploy.

3) Using Vercel CLI (from your machine)

Install & login:
```bash
npm i -g vercel
vercel login
```

Deploy (production):
```bash
vercel --prod
# or non-interactive with token
VERCEL_TOKEN=ey... vercel --prod --token $VERCEL_TOKEN
```

4) Notes
- Ensure env vars are configured in Vercel for both `Preview` and `Production` as needed.
- If you use Service Role keys, never commit them to the repo.
- After deploy, open the assigned domain and test login flow.
