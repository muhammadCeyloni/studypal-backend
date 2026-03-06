function calculateMatchScore(course, similarity, studentProfile) {

  let score = 0;
  let reasons = [];

  // semantic similarity (AI embeddings)
  score += similarity * 50;

  // keyword interest match
  const interestMatch = course.keywords.some(k =>
    studentProfile.interests.includes(k)
  );

  if (interestMatch) {
    score += 20;
    reasons.push("Matches your interests");
  }

  // level match
  if (course.level === studentProfile.level) {
    score += 15;
    reasons.push("Matches your education level");
  }

  // price category match
  if (studentProfile.budget === course.price_category) {
    score += 15;
    reasons.push("Fits your budget range");
  }

  return {
    match_score: Math.round(score),
    reasons
  };

}

module.exports = { calculateMatchScore };