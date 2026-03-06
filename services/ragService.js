const Course = require("../models/Course");
const { generateExplanation } = require("./aiService");

async function getRecommendations(userInput) {

  const { interests, maxBudget, level } = userInput;

  const courses = await Course.find({
    level: level,
    total_fee_lkr: { $lte: maxBudget }
  });

  const scored = courses.map(course => {

    let score = 0;

    interests.forEach(interest => {

      if (course.keywords.includes(interest.toLowerCase())) {
        score += 2;
      }

      if (course.course_name.toLowerCase().includes(interest.toLowerCase())) {
        score += 1;
      }

    });

    return { ...course._doc, score };

  });

  scored.sort((a,b)=>b.score-a.score);

  const topCourses = scored.slice(0,5);

  const explanation = await generateExplanation(userInput, topCourses);

  return {
    recommendations: topCourses,
    explanation
  };

}

const Course = require("../models/Course");

async function estimateFee(course) {

  const similarCourses = await Course.find({
    level: course.level,
    field: course.field,
    tuition_fee_total: { $ne: null }
  });

  if (similarCourses.length === 0) {
    return null;
  }

  const avgFee =
    similarCourses.reduce((sum, c) => sum + c.tuition_fee_total, 0) /
    similarCourses.length;

  return Math.round(avgFee);
}

module.exports = { getRecommendations };