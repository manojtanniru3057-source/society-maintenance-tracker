# 🏢 Society Maintenance Tracker

> A full-stack MERN web application for apartment society management — residents raise maintenance complaints, admins manage them with priority workflows and email notifications.

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat&logo=jsonwebtokens)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Admin Setup](#-admin-setup)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)

---

## ✨ Features

### 👤 Resident
- Register & log in with JWT authentication
- Raise complaints with category, description, and optional photo (uploaded to Cloudinary CDN)
- View all own complaints with complete status history (every change logged with timestamp + actor + note)
- Read the society notice board
- Receive **email notifications** when complaint status changes
- Receive **email alerts** when an important notice is posted

### 🔑 Admin
- View **all complaints** across the society
- **Filter** by category, status, and date range
- Set complaint **priority**: Low / Medium / High
- Update complaint **status**: Open → In Progress → Resolved
  - Every change logged with timestamp, actor name, and optional note
  - Resolved complaints are permanently closed
- Complaints open beyond a configurable number of days auto-flagged as **⚠ Overdue** and sorted to top
- **Post notices** to the notice board; mark as "Important" to pin and email all residents
- **Dashboard**: total by status, total by category, overdue count with bar charts

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite |
| **Routing** | React Router v6 |
| **HTTP Client** | Axios (with token interceptors) |
| **UI / Toasts** | Vanilla CSS dark design system, react-hot-toast, react-icons |
| **Date Formatting** | date-fns |
| **Backend** | Node.js + Express 4 |
| **Database** | MongoDB + Mongoose |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs |
| **File Upload** | Multer → multer-storage-cloudinary → Cloudinary CDN |
| **Email** | Nodemailer + Gmail App Password |
| **Dev Server** | nodemon |

---

## 📁 Project Structure

```
society-maintenance-tracker/
├── .gitignore
├── README.md
├── SYSTEM_DESIGN.md              ← Technical design write-up
│
├── backend/
│   ├── .env.example              ← Copy to .env and fill in values
│   ├── package.json
│   ├── seed.js                   ← Create first admin account
│   ├── test_api.js               ← 27 automated API tests
│   └── src/
│       ├── server.js
│       ├── config/
│       │   ├── db.js             ← MongoDB connection
│       │   └── cloudinary.js     ← Cloudinary + Multer upload config
│       ├── models/
│       │   ├── User.js
│       │   ├── Complaint.js      ← Embedded history[], isOverdue virtual
│       │   └── Notice.js
│       ├── middleware/
│       │   ├── auth.js           ← protect + adminOnly guards
│       │   └── errorHandler.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── complaints.js
│       │   ├── notices.js
│       │   └── dashboard.js
│       └── utils/
│           └── email.js          ← Nodemailer + HTML email templates
│
└── frontend/
    ├── .env.example              ← Copy to .env and fill in values
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx               ← Router + ProtectedRoute
        ├── main.jsx
        ├── index.css             ← Full dark-mode design system
        ├── api/
        │   └── axios.js          ← Configured Axios with interceptors
        ├── context/
        │   └── AuthContext.jsx   ← Login / Register / Logout
        ├── components/
        │   ├── Layout.jsx        ← Sidebar + Outlet
        │   ├── Badges.jsx        ← Status, Priority, Overdue badges
        │   └── HistoryTimeline.jsx
        └── pages/
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── resident/
            │   ├── ResidentDashboard.jsx
            │   ├── RaiseComplaint.jsx
            │   ├── MyComplaints.jsx
            │   ├── ComplaintDetail.jsx
            │   └── NoticeBoardResident.jsx
            └── admin/
                ├── AdminDashboard.jsx
                ├── AdminComplaints.jsx
                ├── AdminComplaintDetail.jsx
                └── AdminNoticeBoard.jsx
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally
- A [Cloudinary](https://cloudinary.com/) free account
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) generated

### 1. Clone the repository

```bash
git clone https://github.com/your-username/society-maintenance-tracker.git
cd society-maintenance-tracker
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd ../frontend
npm install
```

### 3. Configure environment variables

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your real values

# Frontend
cd frontend
cp .env.example .env
# Only VITE_API_URL is needed
```

### 4. Create the admin account

```bash
cd backend
node seed.js
# Output: Admin created: admin@society.com / password: admin1234
```

> ⚠️ Change this password before deploying to production.

### 5. Run the development servers

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

### 6. Open the app

**→ http://localhost:5173**

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@society.com` | `admin1234` |
| **Resident** | Register at `/register` | Your choice |

---

## 🔐 Environment Variables

### `backend/.env.example`

```env
MONGODB_URI=mongodb://localhost:27017/societyTracker
JWT_SECRET=your_long_random_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password
PORT=5000
OVERDUE_DAYS=7
NODE_ENV=development
```

### `frontend/.env.example`

```env
VITE_API_URL=http://localhost:5000/api
```

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string — swap to Atlas URI for deployment |
| `JWT_SECRET` | Long random string for signing JWTs |
| `CLOUDINARY_*` | From Cloudinary Dashboard → Settings → Access Keys |
| `EMAIL_USER` | Gmail address for sending notifications |
| `EMAIL_PASS` | Gmail **App Password** (not your account password) |
| `OVERDUE_DAYS` | Days before an Open complaint is flagged overdue (default: 7) |

---

## 👤 Admin Setup

The public `/register` endpoint only creates **residents**. Run the seeder to create the admin:

```bash
cd backend
node seed.js
```

To add more admin accounts, manually update the `role` field to `"admin"` in MongoDB Compass.

---

## 🗄 Database Schema

### User
```
name, email (unique), password (bcrypt), role (resident|admin), flatNumber
```

### Complaint
```
title, category (enum 8), description, photoUrl, photoPublicId,
status (Open|In Progress|Resolved), priority (Low|Medium|High),
resident → User, history[] (embedded audit log)

history entry: { status, changedBy, changedByName, note, timestamp }

isOverdue: virtual — true when status ≠ Resolved AND age > OVERDUE_DAYS
```

### Notice
```
title, content, isImportant (bool), postedBy → User
```

---

## 📡 API Reference

All protected routes require: `Authorization: Bearer <token>`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register resident |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ Any | Get current user |

### Complaints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/complaints` | ✅ Resident | Raise complaint (multipart/form-data) |
| GET | `/api/complaints/my` | ✅ Resident | Own complaints |
| GET | `/api/complaints/:id` | ✅ Own/Admin | Single complaint + history |
| GET | `/api/complaints` | ✅ Admin | All complaints — filterable, paginated |
| PATCH | `/api/complaints/:id/priority` | ✅ Admin | Set priority |
| PATCH | `/api/complaints/:id/status` | ✅ Admin | Update status + email resident |

**Query params for `GET /api/complaints`:**
`?category=Plumbing` `?status=Open` `?from=2024-01-01` `?to=2024-12-31` `?page=1` `?limit=20`

### Notices

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notices` | ✅ Any | All notices (important pinned first) |
| POST | `/api/notices` | ✅ Admin | Post notice (+ email all if important) |
| DELETE | `/api/notices/:id` | ✅ Admin | Delete notice |

### Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard` | ✅ Admin | Stats: byStatus, byCategory, overdueCount |

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | ❌ | Server health check |

---

## 🧪 Running Tests

```bash
cd backend
node test_api.js
```

Runs **27 automated tests** with no external test framework — just Node's built-in `http` module.

```
Results: 27 passed, 0 failed
```

---

## 🌐 Deployment

> **Not set up yet** — planned for Render (backend) + Vercel (frontend) + MongoDB Atlas (database).

When ready:

1. **MongoDB Atlas** — change `MONGODB_URI` to your Atlas connection string (no code changes needed)
2. **Render** — deploy `/backend` as a Web Service, add all env vars + `FRONTEND_URL=https://your-app.vercel.app`
3. **Vercel** — deploy `/frontend`, set `VITE_API_URL=https://your-backend.onrender.com/api`
4. Photos → already on Cloudinary CDN ✅
5. Emails → Gmail SMTP works the same in production ✅

---

## 📐 System Design

See [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) for a detailed write-up covering:
- Complaint history model (embedded vs separate collection)
- Overdue detection (dynamic virtual vs cron job)
- Photo handling pipeline (Cloudinary streaming)
- Notification flow (fire-and-forget email)

---

## 📄 License

MIT
