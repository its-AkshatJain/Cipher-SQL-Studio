import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  description:  { type: String, required: true },
  difficulty:   { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  timeEstimate: { type: String, default: '' },
  question:     { type: String, required: true },
  schema:       { type: Object, required: true },
  tables:       [String],
  createdAt:    { type: Date, default: Date.now },
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
