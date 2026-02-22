const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  course_name: { type: String, required: true },
  institute: { type: String, required: true },
  short_name: { type: String, required: true },
  level: { type: String, required: true },
  duration_years: { type: Number, required: true },
  total_fee_lkr: { type: Number, required: true },
  is_ugc_recognized: { type: Boolean, required: true },
  affiliated_university: { type: String, required: true },
  locations: { type: [String], required: true },
  keywords: { type: [String], required: true }
});

// ✅ Separate indexes (safe)
courseSchema.index({ keywords: 1 });
courseSchema.index({ locations: 1 });
courseSchema.index({ institute: 1 });

module.exports = mongoose.model('Course', courseSchema);