const express = require('express');
const Complaint = require('../models/Complaint');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard  — admin only
router.get('/', protect, adminOnly, async (req, res) => {
  const overdueDays = parseInt(process.env.OVERDUE_DAYS || '7', 10);
  const overdueThreshold = new Date(Date.now() - overdueDays * 24 * 60 * 60 * 1000);

  const [statusAgg, categoryAgg, overdueCount, total] = await Promise.all([
    // Complaints by status
    Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    // Complaints by category
    Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
    // Overdue: status != Resolved AND createdAt before threshold
    Complaint.countDocuments({
      status: { $ne: 'Resolved' },
      createdAt: { $lt: overdueThreshold },
    }),
    Complaint.countDocuments(),
  ]);

  const byStatus = { Open: 0, 'In Progress': 0, Resolved: 0 };
  statusAgg.forEach((s) => { byStatus[s._id] = s.count; });

  const byCategory = {};
  categoryAgg.forEach((c) => { byCategory[c._id] = c.count; });

  res.json({ total, byStatus, byCategory, overdueCount });
});

module.exports = router;
