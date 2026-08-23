const express = require('express');
const Notice = require('../models/Notice');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { sendEmail, importantNoticeEmail } = require('../utils/email');

const router = express.Router();

// GET /api/notices  — all users: view notices (important pinned to top)
router.get('/', protect, async (req, res) => {
  const notices = await Notice.find().populate('postedBy', 'name').sort({ isImportant: -1, createdAt: -1 });
  res.json(notices);
});

// POST /api/notices  — admin only: create notice
router.post('/', protect, adminOnly, async (req, res) => {
  const { title, content, isImportant } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  const notice = await Notice.create({
    title,
    content,
    isImportant: Boolean(isImportant),
    postedBy: req.user._id,
  });

  // If important: email all residents
  if (isImportant) {
    const residents = await User.find({ role: 'resident' }).select('name email');
    residents.forEach((r) => {
      sendEmail(r.email, `[Important Notice] ${title}`, importantNoticeEmail(r.name, title, content));
    });
  }

  res.status(201).json(notice);
});

// DELETE /api/notices/:id  — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  const notice = await Notice.findByIdAndDelete(req.params.id);
  if (!notice) return res.status(404).json({ message: 'Notice not found' });
  res.json({ message: 'Notice deleted' });
});

module.exports = router;
