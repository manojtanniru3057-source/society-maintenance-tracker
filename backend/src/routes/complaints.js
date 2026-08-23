const express = require('express');
const Complaint = require('../models/Complaint');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { sendEmail, statusChangeEmail } = require('../utils/email');
const User = require('../models/User');

const router = express.Router();

const OVERDUE_DAYS = () => parseInt(process.env.OVERDUE_DAYS || '7', 10);

// Helper: compute isOverdue for a plain object
const addOverdue = (c) => {
  const obj = c.toObject ? c.toObject() : c;
  const overdueDays = OVERDUE_DAYS();
  obj.isOverdue =
    obj.status !== 'Resolved' &&
    Date.now() - new Date(obj.createdAt).getTime() > overdueDays * 24 * 60 * 60 * 1000;
  return obj;
};

// ───────────────────────────────────────────────
// RESIDENT ROUTES
// ───────────────────────────────────────────────

// POST /api/complaints  — raise a complaint (with optional photo)
router.post('/', protect, upload.single('photo'), async (req, res) => {
  const { title, category, description } = req.body;

  if (!title || !category || !description) {
    return res.status(400).json({ message: 'Title, category, and description are required' });
  }

  const complaintData = {
    title,
    category,
    description,
    resident: req.user._id,
    history: [
      {
        status: 'Open',
        changedBy: req.user._id,
        changedByName: req.user.name,
        note: 'Complaint raised',
        timestamp: new Date(),
      },
    ],
  };

  if (req.file) {
    complaintData.photoUrl = req.file.path;
    complaintData.photoPublicId = req.file.filename;
  }

  const complaint = await Complaint.create(complaintData);
  res.status(201).json(complaint.toObject());
});

// GET /api/complaints/my  — resident: view own complaints
router.get('/my', protect, async (req, res) => {
  const complaints = await Complaint.find({ resident: req.user._id }).sort({ createdAt: -1 });
  res.json(complaints.map(addOverdue));
});

// GET /api/complaints/:id  — view single complaint (resident: own only; admin: any)
router.get('/:id', protect, async (req, res) => {
  const complaint = await Complaint.findById(req.params.id).populate('resident', 'name email flatNumber');
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

  if (req.user.role !== 'admin' && complaint.resident._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json(addOverdue(complaint));
});

// ───────────────────────────────────────────────
// ADMIN ROUTES
// ───────────────────────────────────────────────

// GET /api/complaints  — admin: get all complaints with optional filters
router.get('/', protect, adminOnly, async (req, res) => {
  const { category, status, from, to, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (status) filter.status = status;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = toDate;
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .populate('resident', 'name email flatNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Complaint.countDocuments(filter),
  ]);

  const overdueDays = OVERDUE_DAYS();
  const now = Date.now();
  const results = complaints.map((c) => {
    const obj = c.toObject();
    obj.isOverdue =
      obj.status !== 'Resolved' &&
      now - new Date(obj.createdAt).getTime() > overdueDays * 24 * 60 * 60 * 1000;
    return obj;
  });

  // Sort: overdue first
  results.sort((a, b) => (b.isOverdue ? 1 : 0) - (a.isOverdue ? 1 : 0));

  res.json({ complaints: results, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

// PATCH /api/complaints/:id/priority  — admin: set priority
router.patch('/:id/priority', protect, adminOnly, async (req, res) => {
  const { priority } = req.body;
  if (!['Low', 'Medium', 'High'].includes(priority)) {
    return res.status(400).json({ message: 'Invalid priority' });
  }

  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    { priority },
    { new: true }
  ).populate('resident', 'name email');

  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
  res.json(addOverdue(complaint));
});

// PATCH /api/complaints/:id/status  — admin: update status + add history entry
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ['Open', 'In Progress', 'Resolved'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const complaint = await Complaint.findById(req.params.id).populate('resident', 'name email');
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
  if (complaint.status === 'Resolved') {
    return res.status(400).json({ message: 'Resolved complaints cannot be reopened' });
  }

  complaint.status = status;
  complaint.history.push({
    status,
    changedBy: req.user._id,
    changedByName: req.user.name,
    note: note || '',
    timestamp: new Date(),
  });
  await complaint.save();

  // Send email notification to resident
  sendEmail(
    complaint.resident.email,
    `Your complaint "${complaint.title}" status updated to ${status}`,
    statusChangeEmail(complaint.resident.name, complaint.title, status, note)
  );

  res.json(addOverdue(complaint));
});

module.exports = router;
