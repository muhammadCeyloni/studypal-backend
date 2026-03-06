require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("../models/Course");
const { getEmbedding } = require("../services/embeddingService");

mongoose.connect(process.env.MONGO_URI);

async function generateCourseEmbeddings() {

  const courses = await Course.find();

  for (const course of courses) {

    const text =
      course.course_name +
      " " +
      course.institute +
      " " +
      course.keywords.join(" ");

    const embedding = await getEmbedding(text);

    course.embedding = embedding;

    await course.save();

    console.log("Embedding created:", course.course_name);
  }

  console.log("All embeddings generated");

  process.exit();
}

generateCourseEmbeddings();