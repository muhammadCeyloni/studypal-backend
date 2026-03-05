require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Course = require('./models/Course');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const courses = JSON.parse(
  fs.readFileSync('./all_courses.json', 'utf-8')
);

async function importData() {
  try {

    await Course.deleteMany(); // optional reset

    await Course.insertMany(courses);

    console.log("Courses Imported Successfully");

    process.exit();

  } catch (error) {

    console.error(error);

    process.exit(1);
  }
}

importData();