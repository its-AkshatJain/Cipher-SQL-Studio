import express from 'express';
import UserProgress from '../models/UserProgress.js';

const router = express.Router();

/**
 * GET /api/progress/user/:userId
 * Fetch all progress records for a given user (for the assignments list page)
 */
router.get('/user/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const records = await UserProgress.find({ userId }).lean();
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/progress/:sessionId/:assignmentId
 * Load a user's saved progress for a specific assignment
 */
router.get('/:sessionId/:assignmentId', async (req, res, next) => {
  try {
    const { sessionId, assignmentId } = req.params;
    const progress = await UserProgress.findOne({
      userId: sessionId,
      assignmentId,
    }).lean();

    // Return empty progress if not found — not an error
    res.json({
      success: true,
      data: progress || {
        sqlQuery: '',
        isCompleted: false,
        attemptCount: 0,
        lastAttempt: null,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/progress
 * Save or update a user's progress for an assignment (upsert)
 * Body: { sessionId, assignmentId, sqlQuery, isCompleted }
 */
router.post('/', async (req, res, next) => {
  try {
    const { sessionId, assignmentId, sqlQuery, isCompleted, incrementAttempt } = req.body;

    if (!sessionId || !assignmentId) {
      return res.status(400).json({ success: false, message: 'sessionId and assignmentId are required.' });
    }

    const update = {
      $set: { sqlQuery, isCompleted: isCompleted ?? false, lastAttempt: new Date() },
    };

    // Only count an attempt when the user actually clicked "Run Query"
    if (incrementAttempt) {
      update.$inc = { attemptCount: 1 };
    }

    const progress = await UserProgress.findOneAndUpdate(
      { userId: sessionId, assignmentId },
      update,
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ success: true, data: progress });
  } catch (err) {
    next(err);
  }
});

export default router;
