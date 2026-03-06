const express = require("express");
const router = express.Router();

const Course = require("../models/Course");
const { generateExplanation,estimateCoursePrice } = require("../services/aiService");

router.post("/", async (req, res) => {

  try {

    const { interests, maxBudget, level } = req.body;

    const courses = await Course.find({
      level: level
    });

    const scoredCourses = courses.map(course => {

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

    scoredCourses.sort((a, b) => b.score - a.score);

    const topCourses = scoredCourses.slice(0, 5);

    for (let course of topCourses) {

  course.explanation = await generateExplanation(course, interests);

  if (!course.tuition_fee_total) {

    course.estimated_fee_lkr = await estimateCoursePrice(course);

  } else {

    course.estimated_fee_lkr = course.tuition_fee_total;

  }

}

    res.json(topCourses);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

module.exports = router;