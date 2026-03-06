const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  course_name: String,
  degree_type: String,
  level: String,
  duration_years: Number,

  tuition_fee_total: Number,
  tuition_fee_per_year: Number,
  currency: String,
  fee_source: String,
  price_category: String,

  installment_available: Boolean,
  scholarship_available: Boolean,

  intake_months: [String],
  application_deadline: String,

  institute: String,
  location: String,

  keywords: [String],
  url: String,
  
  embedding: {
    type: [Number],
    default: []
  }

});

// indexes for search
courseSchema.index({ keywords: 1 });
courseSchema.index({ institute: 1 });
courseSchema.index({ level: 1 });

module.exports = mongoose.model("Course", courseSchema);