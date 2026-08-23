const mongoose = require('mongoose');

const CATEGORIES = ['Plumbing', 'Electrical', 'Cleaning', 'Security', 'Elevator', 'Parking', 'Garden', 'Other'];
const STATUSES = ['Open', 'In Progress', 'Resolved'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const historyEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    changedByName: { type: String, required: true },
    note: { type: String, trim: true, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 120,
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    photoUrl: {
      type: String,
      default: null,
    },
    photoPublicId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'Open',
    },
    priority: {
      type: String,
      enum: PRIORITIES,
      default: 'Low',
    },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    history: [historyEntrySchema],
  },
  { timestamps: true }
);

// Virtual: isOverdue — computed dynamically based on env config
complaintSchema.virtual('isOverdue').get(function () {
  if (this.status === 'Resolved') return false;
  const overdueDays = parseInt(process.env.OVERDUE_DAYS || '7', 10);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Date.now() - this.createdAt.getTime() > overdueDays * msPerDay;
});

complaintSchema.set('toJSON', { virtuals: true });
complaintSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Complaint', complaintSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.STATUSES = STATUSES;
module.exports.PRIORITIES = PRIORITIES;
