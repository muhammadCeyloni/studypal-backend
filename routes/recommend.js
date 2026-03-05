const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

router.post("/", async (req, res) => {
  try {
    const { interests, maxBudget, level } = req.body;

    const courses = await Course.find();

    const scoredCourses = courses.map(course => {
      let score = 0;

      // Level match
      if (course.level && course.level.toLowerCase() === level.toLowerCase()) {
        score += 2;
      }

      // Budget match
      if (course.total_fee_lkr && course.total_fee_lkr <= maxBudget) {
        score += 2;
      }

      // Interest match
      interests.forEach(interest => {
        if (course.keywords?.includes(interest.toLowerCase())) {
          score += 3;
        }

        if (course.course_name?.toLowerCase().includes(interest.toLowerCase())) {
          score += 2;
        }
      });

      return { ...course._doc, score };
    });

    // Remove zero score courses
    const filtered = scoredCourses.filter(c => c.score > 0);

    // Sort by best score
    filtered.sort((a, b) => b.score - a.score);

    const topCourses = filtered.slice(0, 5);

    res.json(topCourses);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;