const manualFees = require("../data/manual_fees.json");

function applyManualFees(course) {
  const instituteFees = manualFees[course.institute];

  if (!instituteFees) return course;

  const manualAmount = instituteFees[course.course_name];

  if (!manualAmount) return course;

  return {
    ...course,
    tuition_fee_total: manualAmount,
    tuition_fee_per_year: course.duration_years
      ? Math.round(manualAmount / course.duration_years)
      : null,
    fee_source: "manual"
  };
}

function assignPriceCategory(course) {
  if (!course.tuition_fee_total) return "Medium";

  if (course.tuition_fee_total < 1500000) return "Low";
  if (course.tuition_fee_total < 3000000) return "Medium";
  return "High";
}

course.price_category = assignPriceCategory(course);

module.exports = applyManualFees;