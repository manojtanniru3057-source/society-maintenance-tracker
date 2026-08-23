# System Design Write-Up
## Society Maintenance Tracker

**Word count target: ≤ 800 words**

---

### 1. Complaint History Model

**Design decision: Embedded array inside the Complaint document.**

Each `Complaint` document contains a `history` array of sub-documents. Every state transition appends a new entry:

```json
{
  "status": "In Progress",
  "changedBy": "<userId>",
  "changedByName": "Admin",
  "note": "Plumber dispatched",
  "timestamp": "2024-08-22T09:30:00Z"
}
```

**Why embedded vs. a separate collection?**

A separate `ComplaintHistory` collection would make sense if history entries were very large, shared across entities, or needed independent querying (e.g., "all status changes made by a specific admin today"). In this system, history is always read *together with* its complaint — never in isolation. Embedding keeps retrieval to a single MongoDB read, avoids a `$lookup` join, and simplifies transactional consistency (the history and status update commit atomically). MongoDB's 16 MB document limit is not a concern: even 500 history entries with notes stay well under 1 MB.

The initial "Open" entry is written at complaint-creation time by the resident, so every complaint always has at least one history entry. Status updates by admins strictly append — no edits, no deletions — making the array an immutable audit log.

**Querying per-complaint history:** `GET /api/complaints/:id` returns the full document, which includes the history array. No extra join needed.

---

### 2. Overdue Detection Approach

**Design decision: Computed dynamically on every request, not via a scheduled job.**

The `Complaint` model exposes an `isOverdue` virtual property:

```js
isOverdue = status !== 'Resolved' 
            && Date.now() - createdAt > OVERDUE_DAYS * 86_400_000
```

`OVERDUE_DAYS` is read from the environment variable at runtime, so the threshold can be tuned without a code deploy.

On the admin "all complaints" endpoint, `isOverdue` is computed per document after the MongoDB query, and the result set is sorted so overdue complaints appear first. The dashboard counts overdue complaints using a MongoDB query with `createdAt < (now - threshold)` — this is a pure database aggregation, fast and always current.

**Why not a cron job?**

A scheduled job that writes an `isOverdue` flag to the DB would introduce a stored boolean that lags behind reality between runs. It also adds operational complexity (job scheduler, failure handling, re-run logic). Dynamic computation is simpler, always accurate, and the cost is negligible (a subtraction per document). If this app scaled to millions of complaints needing complex SLA reporting, a materialized/precomputed approach with a cron job would be worth it — but for this use case, dynamic computation is clearly better.

---

### 3. Photo Handling

**Design decision: Cloudinary with multer-storage-cloudinary, not local disk.**

The backend will ultimately be deployed to Render's free tier, which has an ephemeral filesystem — any file written to disk is lost on dyno restart. Local storage is therefore not viable.

The upload pipeline works as follows:

1. The React frontend sends a `multipart/form-data` POST to `/api/complaints`.
2. `multer` processes the upload in memory.
3. `multer-storage-cloudinary` streams the file directly to Cloudinary's CDN — the file never touches the server's disk.
4. Cloudinary returns a public HTTPS URL and a `public_id`, both stored in the `Complaint` document (`photoUrl`, `photoPublicId`).
5. The frontend renders the photo directly from the Cloudinary CDN URL.

Cloudinary applies a transformation at upload time (`width: 1200, height: 900, crop: limit, quality: auto`) to optimize file size. The `public_id` is preserved for future use (e.g., deletion when a complaint is removed). File size is capped at 5 MB server-side by multer, and only `image/*` MIME types are accepted.

---

### 4. Notification Flow

**Design decision: Fire-and-forget with Nodemailer + Gmail App Password.**

Two notification triggers exist:

**A. Status change:** When an admin updates a complaint's status via `PATCH /api/complaints/:id/status`, after saving the complaint, the server calls `sendEmail()` with the resident's email, a subject line, and an HTML-formatted body showing the new status and optional note. This is non-blocking — if the email fails (e.g., Gmail rate limit), the error is logged but does not affect the HTTP response. The status update succeeds regardless.

**B. Important notice:** When an admin posts a notice with `isImportant: true`, the server queries all users with `role: "resident"` and fires an email to each one. This uses `Promise`-based async iteration with per-recipient error isolation so one failing address doesn't abort the others.

**Email templates** are pure HTML strings (no templating engine dependency) with inline styles, ensuring compatibility across email clients.

**Why Gmail + App Password?**

It requires no paid service, no third-party billing, and is free for low-volume society notifications. The Gmail App Password (not the account password) is stored in `.env` and never committed to git. For production scale, swapping `transporter` for SendGrid/SES requires only changing the Nodemailer transport config — no application logic changes.

**Why not WebSockets for real-time?**

Email was specified. WebSocket push would require a persistent connection, state management, and a more complex frontend. Email is appropriate for non-urgent maintenance status updates where residents don't need sub-second notification.

---

*Total: ~740 words*
