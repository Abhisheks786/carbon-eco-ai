# EcoTrack AI — Full Refactor & Fix Handoff Prompt

You are working on **EcoTrack AI**, a carbon footprint awareness platform (Next.js frontend + Express/Prisma backend). The app is running locally but has critical bugs and needs a production-quality UI/UX overhaul before a hackathon demo.

**Project path:** `ecotrack-ai-complete/`

---

## Priority Order (Updated)

> **The login 404 error is now the highest-priority bug** — not PostgreSQL or Redis.
>
> The frontend is running, the backend is running, but the login page is calling an endpoint that either doesn't exist, isn't reachable, or is returning a misleading 404.

Fix authentication end-to-end before tackling infrastructure (PostgreSQL migration, Redis caching) or cosmetic polish.

---

## Pre-Investigation Notes (Route Audit)

Before starting, verify the actual runtime behavior — do not assume a route mismatch without testing:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

Also search the backend for:

```js
router.post('/login'
router.post('/signin'
router.post('/auth/login'
app.post('/api/auth/login'
```

### Current codebase findings

| Layer | Path / Config | Notes |
|-------|---------------|-------|
| Frontend API client | `frontend/lib/api.ts` | `baseURL = process.env.NEXT_PUBLIC_API_URL \|\| 'http://localhost:5000'` |
| Frontend login call | `api.post('/api/auth/login', ...)` | Resolves to `http://localhost:5000/api/auth/login` |
| Active backend entry | `backend/package.json` → `src/server.js` | `app.use('/api/auth', authRoutes)` |
| Auth route mount | `backend/src/routes/authRoutes.js` | `router.post('/login', ...)` → full path `/api/auth/login` |
| Legacy monolith | `backend/server.js` (root) | Also defines `app.post('/api/auth/login', ...)` — do NOT run both |
| Env | `frontend/.env.local` | `NEXT_PUBLIC_API_URL=http://localhost:5000` |
| Next.js proxy | None | No `next.config.js` rewrites — frontend calls backend directly |

**Route paths appear to match.** The 404 may instead be caused by:

1. **Wrong server process running** — e.g. an old `backend-server.js` or `backend/server.js` instead of `backend/src/server.js`
2. **Backend not listening on port 5000** — check `PORT` in `backend/.env`
3. **User-not-found 404** — `authController.login` returns `404 { error: 'User not found' }` when email isn't in DB (axios surfaces this as "Request failed with status code 404")
4. **Broken auth flow** — login page calls backend API directly but does NOT sign in via Firebase for email/password (Google login uses Firebase; email/password does not)
5. **CORS or network** — less likely if both are localhost

**Fix strategy:** Confirm which process is running, test the endpoint with curl, then audit the full auth flow (Firebase → backend → JWT/session → protected routes).

---

## Known Structural Issues

### Duplicate `<html>` / `<body>` tags

`frontend/app/layout.tsx` is marked `'use client'` and renders `<html>` and `<body>` directly. This is an anti-pattern in Next.js App Router and can cause hydration errors and duplicate document elements.

**Fix:** Split into a Server Component root layout (html/body) and a Client Component provider wrapper.

### Dual backend codebases

There are three backend entry points with overlapping routes:

- `backend/src/server.js` (canonical — used by `npm run dev`)
- `backend/server.js` (legacy monolith)
- `backend-server.js` (root-level duplicate)

Consolidate to one entry point. Remove or archive duplicates.

### Auth architecture mismatch

- **Google login:** Firebase `signInWithPopup` → redirect to dashboard (no backend sync)
- **Email/password login:** Direct `apiClient.login()` → backend lookup only (no Firebase auth)
- **Backend middleware:** Mock auth in some files, Firebase JWT verification in others

Unify into a single, documented auth flow.

---

## Additional Issues Found During Testing

### Current Login Page Problems

1. **Login request returns:**
   - HTTP 404 Not Found
   - Error banner displays "Request failed with status code 404"
   - Investigate frontend API routes and backend endpoints.
   - Verify axios/fetch base URLs.
   - Verify environment variables.
   - Verify Next.js API proxy configuration.
   - Verify backend routes actually exist.
   - Fix all authentication endpoint mismatches.

2. **Authentication Audit**
   - Verify login endpoint.
   - Verify signup endpoint.
   - Verify Google authentication.
   - Verify JWT handling.
   - Verify Firebase authentication integration.
   - Verify backend authentication middleware.
   - Generate a complete authentication flow diagram.
   - Create missing backend routes if necessary.

3. **Error Handling Improvements**

   Current error display looks unprofessional.

   Replace with:
   - Toast notifications
   - Animated alerts
   - User-friendly messages
   - Retry suggestions
   - Proper loading states
   - Skeleton loaders
   - Success animations

4. **Login Page Redesign**

   **Current Issues:**
   - Generic form layout
   - Weak visual hierarchy
   - Looks like a template
   - Inputs feel oversized
   - No premium feel
   - Weak branding

   **Redesign Requirements:**
   - Premium SaaS design
   - Glassmorphism
   - Subtle gradients
   - Animated background particles
   - Better typography
   - Better spacing system
   - Smooth Framer Motion animations
   - Eco-themed but modern
   - Mobile-first responsive design
   - WCAG accessibility compliance

   **Inspiration:** Linear, Vercel, Stripe, Clerk, Supabase, Arc Browser

5. **CSS Upgrade**

   Remove any template-looking styles.

   Use:
   - Tailwind best practices
   - CSS variables
   - Design tokens
   - Modern shadows
   - Modern border system
   - Consistent spacing scale
   - Smooth hover states
   - GPU-accelerated animations

6. **Deliverables**
   - Fix all 404 authentication issues
   - Fix duplicate body/html issue
   - Audit entire project structure
   - Refactor layout architecture
   - Refactor authentication architecture
   - Redesign login page
   - Redesign dashboard
   - Produce production-ready code
   - Explain every change made
   - List performance improvements
   - List accessibility improvements
   - List security improvements
   - Ensure the final result is hackathon-demo ready and visually impressive.

---

## Tech Stack Reference

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router), React, Tailwind CSS, Firebase Auth |
| Backend | Express.js, Prisma ORM, Firebase Admin SDK |
| Database | SQLite (local) / PostgreSQL (documented for prod) |
| Cache | Redis (optional, graceful fallback) |

---

## How to Run

```bash
# Backend
cd backend
npm install
npx prisma generate
npm run dev          # starts src/server.js on port 5000

# Frontend
cd frontend
npm install
npm run dev          # starts Next.js on port 3000
```

---

## Expected Output from You

1. **Diagnosis first** — confirm root cause of the 404 with curl/network tab evidence
2. **Fix auth** — working email/password + Google login, backend sync, protected routes
3. **Fix layout** — no duplicate html/body, proper Server/Client component split
4. **Redesign login + dashboard** — premium, eco-themed, accessible
5. **Document everything** — changelog, auth flow diagram, improvement lists
6. **Leave the app demo-ready** — no console errors, no broken routes, polished UX
