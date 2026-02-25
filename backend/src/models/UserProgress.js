import mongoose from 'mongoose';

/**
 * UserProgress — tracks each user's (identified by sessionId) attempt on each assignment.
 * No authentication required: sessionId is a UUID generated client-side and stored in localStorage.
 */
const userProgressSchema = new mongoose.Schema({
  userId:       { type: String, required: true },       // sessionId from localStorage
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  sqlQuery:     { type: String, default: '' },          // Last saved query
  isCompleted:  { type: Boolean, default: false },
  attemptCount: { type: Number, default: 0 },
  lastAttempt:  { type: Date, default: Date.now },
}, { timestamps: true });

// Compound index: one progress doc per (user, assignment)
userProgressSchema.index({ userId: 1, assignmentId: 1 }, { unique: true });

const UserProgress = mongoose.model('UserProgress', userProgressSchema);
export default UserProgress;
