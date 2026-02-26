import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema({
  columnName: { type: String, required: true },
  dataType:   { type: String, required: true }, // "INTEGER", "TEXT", "REAL", "DATE", etc.
}, { _id: false });

const sampleTableSchema = new mongoose.Schema({
  tableName: { type: String, required: true },
  columns:   [columnSchema],
  rows:      [mongoose.Schema.Types.Mixed], // Array of row objects e.g. [{id:1, name:"Alice"}]
}, { _id: false });

const expectedOutputSchema = new mongoose.Schema({
  type:  { type: String, enum: ['table', 'single_value', 'column', 'count', 'row'], required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  // Examples:
  // table:        [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]
  // single_value: 42
  // column:       [50000, 60000, 75000]
  // count:        5
  // row:          { id: 1, name: "Alice", salary: 50000 }
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
  title:          { type: String, required: true },
  description:    { type: String, required: true },
  difficulty:     { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  timeEstimate:   { type: String, default: '' },
  question:       { type: String, required: true },
  pgSchema:       { type: String, required: true }, // PostgreSQL schema name for isolated sandbox data
  sampleTables:   [sampleTableSchema],
  expectedOutput: expectedOutputSchema,
}, { timestamps: true });

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
