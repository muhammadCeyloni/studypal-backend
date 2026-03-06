require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Course = require('../models/Course');
const { getEmbedding } = require('../services/embeddingService');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const courses = JSON.parse(
  fs.readFileSync('./all_courses.json', 'utf-8')
);

async function importData() {

  try {

    await Course.deleteMany(); // optional reset

    for (let course of courses) {

      // combine useful searchable text
      const text = `
        ${course.course_name}
        ${course.institute}
        ${course.keywords ? course.keywords.join(" ") : ""}
      `;

      // generate embedding
      const embedding = await getEmbedding(text);

      course.embedding = embedding;

      await Course.create(course);

      console.log(`Imported: ${course.course_name}`);

    }

    console.log("✅ Courses Imported Successfully With Embeddings");

    process.exit();

  } catch (error) {

    console.error(error);

    process.exit(1);

  }

}

importData();