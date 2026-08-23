# Society Maintenance Tracker — Project Summary

## What This App Does

An apartment society management portal with two user roles:

- **Residents** raise maintenance complaints (with photos), track their status, and read notices
- **Admins** manage all complaints through a priority + status workflow, post notices, and view analytics

---

## Everything That Was Built

### Phase 1 — Backend Setup

| Item | Detail |
|------|--------|
| Generated JWT secret | 64-byte cryptographically secure hex string via Node `crypto` |
| MongoDB connection | `src/config/db.js` — connects via `MONGODB_URI` env var, swappable for Atlas with zero code changes |
| Cloudinary config | `src/config/cloudinary.js` — Multer streams uploads directly to cloud, never touches local disk |
| Email utility | `src/utils/email.js` — Nodemailer + Gmail App Password, two branded HTML templates |

### Phase 2 — Database Models (Mongoose)

#### User Model
- Fields: `name`, `email` (unique), `password` (bcrypt, 12 rounds), `role` (resident/admin), `flatNumber`
- Password never returned in queries (`select: false`)
- `comparePassword()` instance method for login

#### Complaint Model
- Fields: `title`, `category` (8 options), `description`, `photoUrl`, `photoPublicId`, `status`, `priority`, `resident` (ref)
- **`history[]` embedded array** — append-only audit log, each entry: `{ status, changedBy, changedByName, note, timestamp }`
- **`isOverdue` virtual** — computed dynamically: `status !== Resolved && age > OVERDUE_DAYS days`

#### Notice Model
- Fields: `title`, `content`, `isImportant`, `postedBy` (ref)
- `isImportant = true` triggers email blast to all residents

### Phase 3 — API Routes (14 endpoints)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/health` | None | Health check |
| POST | `/api/auth/register` | None | Register resident |
| POST | `/api/auth/login` | None | Login, returns JWT |
| GET | `/api/auth/me` | Any | Current user info |
| POST | `/api/complaints` | Resident | Raise complaint + optional Cloudinary photo |
| GET | `/api/complaints/my` | Resident | Own complaints only |
| GET | `/api/complaints/:id` | Own/Admin | Single complaint with history |
| GET | `/api/complaints` | Admin | All complaints — filterable, paginated, overdue-first |
| PATCH | `/api/complaints/:id/priority` | Admin | Set Low/Medium/High |
| PATCH | `/api/complaints/:id/status` | Admin | Update status + append history + email resident |
| GET | `/api/notices` | Any | All notices (important pinned first) |
| POST | `/api/notices` | Admin | Post notice (+ optional email blast) |
| DELETE | `/api/notices/:id` | Admin | Delete notice |
| GET | `/api/dashboard` | Admin | Aggregated stats |

### Phase 4 — Middleware

| File | What It Does |
|------|-------------|
| `auth.js` → `protect` | Verifies Bearer JWT, attaches `req.user` |
| `auth.js` → `adminOnly` | Returns 403 if `req.user.role !== 'admin'` |
| `errorHandler.js` | Catches Mongoose validation, duplicate key (11000), JWT errors, Multer file-size — all formatted as JSON |

### Phase 5 — Frontend (React 18 + Vite)

#### Design System (`index.css`)
- Full dark mode with CSS custom properties (`--bg: #0f0f1a`, `--primary: #6366f1`)
- Glassmorphism cards with `backdrop-filter`
- Gradient buttons with hover lift animations
- Badge styles for all statuses, priorities, and overdue
- Sidebar layout, data tables, filter bar, stat cards, bar charts, history timeline, notice cards, auth page, spinner

#### Routing (`App.jsx`)
- `ProtectedRoute` — redirects unauthenticated → `/login`, wrong role → home
- Resident routes: dashboard, raise, my complaints, complaint detail, notices
- Admin routes: dashboard, all complaints, complaint detail, notices

#### Auth Context (`AuthContext.jsx`)
- Stores `smt_token` + `smt_user` in localStorage
- Axios interceptor auto-attaches `Authorization: Bearer ...` header
- 401 response clears storage and redirects to `/login`

#### Pages Built

| Page | Key Features |
|------|-------------|
| **Login** | Icon inputs, show/hide password toggle, toast on error |
| **Register** | Two-column grid, flat number field, role forced to resident |
| **Resident Dashboard** | 4 stat cards (total/open/in-progress/resolved), recent complaints table |
| **Raise Complaint** | Category select, photo upload with live preview + remove, FormData multipart POST |
| **My Complaints** | Full table with overdue badge highlighting |
| **Complaint Detail** | Two-column: details + photo (left), history timeline (right) |
| **Notice Board (Resident)** | Important notices red-styled and pinned to top |
| **Admin Dashboard** | 5 stat cards + animated bar charts (by status, by category) + overdue alert |
| **Admin Complaints** | Category/status/date filters, pagination, overdue rows red-highlighted |
| **Admin Complaint Detail** | Priority selector, status selector + note textarea + "Update & Notify" CTA; resolved = locked state |
| **Admin Notice Board** | Toggle form to post, important checkbox triggers email blast, delete per notice |

### Phase 6 — Admin Seeder & Testing

| Item | Detail |
|------|--------|
| `seed.js` | Creates `admin@society.com / admin1234` — idempotent |
| `test_api.js` | 27 automated tests using Node built-in `http` — no extra test framework |
| Test result | ✅ 27/27 passing |

### Phase 7 — Documentation

| File | Contents |
|------|---------|
| `README.md` | Setup guide, env variable tables, database schema, full API docs with request/response shapes, deployment notes |
| `SYSTEM_DESIGN.md` | ~740-word write-up on: complaint history model, overdue detection, photo handling, notification flow |

---

## All Packages Used

### Backend

| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT auth |
| `dotenv` | Load `.env` |
| `express-async-errors` | Auto-catch async errors |
| `cors` | Cross-origin requests |
| `cloudinary` | Cloud image SDK |
| `multer` | File upload parsing |
| `multer-storage-cloudinary` | Stream files to Cloudinary |
| `nodemailer` | Email via Gmail SMTP |
| `nodemon` (dev) | Auto-restart on save |

### Frontend

| Package | Purpose |
|---------|---------|
| `react` + `react-dom` | UI library |
| `vite` | Dev server + bundler |
| `react-router-dom` | SPA routing |
| `axios` | HTTP client |
| `react-hot-toast` | Toast notifications |
| `react-icons` | Feather icon set |
| `date-fns` | Date formatting |

---

## Key Design Decisions

### 1. Complaint History — Embedded Array
History is stored as an array inside each Complaint document (not a separate collection).  
**Why:** History is always read with its complaint — never independently. Single DB read, atomic save, no joins.

### 2. Overdue Detection — Dynamic Virtual
`isOverdue` is a Mongoose virtual computed on every request: `status !== Resolved && age > OVERDUE_DAYS`.  
**Why:** Always accurate. No cron job complexity. Threshold is configurable via env var without a redeploy.

### 3. Photo Storage — Cloudinary (never local disk)
Multer streams uploads directly to Cloudinary. The URL and public_id are stored in MongoDB.  
**Why:** Render's free tier has an ephemeral filesystem. Any local file would be lost on restart.

### 4. Email — Fire-and-Forget
`sendEmail()` is called after the DB operation succeeds but errors are caught and logged, not thrown.  
**Why:** A Gmail rate limit or network blip should never fail the main operation (status update or notice post).

### 5. Admin Account — Seed Script Only
Public `/register` always creates residents. Admins are created via `node seed.js`.  
**Why:** Prevents any user from self-elevating to admin through the API.

---

## How to Run Right Now

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Open **http://localhost:5173**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@society.com` | `admin1234` |
| Resident | Register at `/register` | Your choice |

---

## What Was Tested (27/27 ✅)

- Health endpoint
- Resident registration (role cannot be self-elevated)
- Login + bad password rejection
- `/me` endpoint
- Admin login
- Resident cannot access admin routes (403)
- All complaint filters (status, category, date range, pagination shape)
- Non-existent complaint returns 404
- Unauthenticated notice POST (401)
- Resident cannot post notice (403)
- Admin post regular notice
- Admin post important notice
- Important notice sorted first in list
- Admin delete notice + verify removal
- Dashboard response shape (byStatus, byCategory, overdueCount)
- Resident blocked from dashboard (403)

---

## What Needs Your Input

| Item | Status |
|------|--------|
| **Email delivery** | ✅ Configured — verify by posting an important notice and checking your inbox. Gmail may show a security alert the first time. |
| **Photo upload** | ✅ Configured with your Cloudinary credentials — test by raising a complaint with a photo. |
| **Change admin password** | ⚠ `admin1234` is the seed default — change it before any real use. |
| **Deployment** | Not set up yet — Render (backend) + Vercel (frontend) + Atlas (DB) ready when you are. |
