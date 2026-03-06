const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

const { getEmbedding } = require("../services/embeddingService");
const { cosineSimilarity } = require("../services/similarityService");
const { calculateMatchScore } = require("../services/matchScoreService");

router.post("/", async (req, res) => {

  try {

    const { query } = req.body;

    // Generate embedding for search query
    const queryEmbedding = await getEmbedding(query);

    // Example student profile (later this can come from database)
    const studentProfile = {
      interests: ["ai", "programming", "data"],
      level: "Postgraduate",
      budget: "medium"
    };

    // Get all courses
    const courses = await Course.find();

    const results = courses.map(course => {

      const similarity = cosineSimilarity(
        queryEmbedding,
        course.embedding
      );

      // calculate AI match score
      const match = calculateMatchScore(
        course,
        similarity,
        studentProfile
      );

      return {
        ...course._doc,
        similarity: Number(similarity.toFixed(3)),
        match_score: match.match_score,
        reasons: match.reasons
      };

    });

    // Sort by AI match score
    results.sort((a, b) => b.match_score - a.match_score);

    // Return top 5
    res.json(results.slice(0, 5));

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

module.exports = router;