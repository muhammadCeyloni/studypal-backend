require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Course = require('./models/Course');
const cors = require('cors');
const recommendRoute = require("./routes/recommend");

const app = express();

// ✅ CORS FIRST
app.use(cors({
  origin: "http://localhost:5173"
}));

// ✅ JSON parser once only
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Connection Error:", err));

// Test Route
app.get('/', (req, res) => {
  res.send("Server is running");
});

// Add Course Route
app.post('/add-course', async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recommendation Route
app.use("/recommend", recommendRoute);


app.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/search', async (req, res) => {
  try {
    const keyword = req.query.keyword;

    const courses = await Course.find({
      keywords: { $regex: keyword, $options: 'i' }
    });

    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/filter', async (req, res) => {
  try {
    const { minFee, maxFee } = req.query;

    const courses = await Course.find({
      total_fee_lkr: {
        $gte: minFee,
        $lte: maxFee
      }
    });

    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

