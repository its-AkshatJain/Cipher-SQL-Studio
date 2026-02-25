import express from 'express';
import Assignment from '../models/Assignment.js';

const router = express.Router();

// GET /api/assignments — list all assignments
router.get('/', async (req, res, next) => {
  try {
    const assignments = await Assignment.find({}).sort({ createdAt: 1 }).lean();

    // Map _id to id for frontend compatibility
    const data = assignments.map(({ _id, ...rest }) => ({ id: _id, ...rest }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/assignments/:id — get single assignment
router.get('/:id', async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const { _id, ...rest } = assignment;
    res.json({ success: true, data: { id: _id, ...rest } });
  } catch (err) {
    // CastError = bad ObjectId format
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    next(err);
  }
});

export default router;
