require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Course = require('./models/Course');
const cors = require('cors');
const recommendRoute = require("./routes/recommend");
const semanticRoute = require("./routes/semanticSearch");

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {

  console.log("MongoDB Connected");

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are the StudyPal AI Assistant. Help students in Sri Lanka find university degrees, understand academic terms, and guide career paths. Be friendly, concise, and highly encouraging." },
        { role: "user", content: message }
      ],
      temperature: 0.7,
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "Sorry, my servers are currently analyzing course data. Try again in a moment!" });
  }
});  

  app.listen(5000, () => {
    console.log("Server running on port 5000");
  });

})
.catch(err => {
  console.log("MongoDB Connection Error:", err);
});

app.get('/', (req, res) => {
  res.send("Server is running");
});

app.post('/add-course', async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

app.use("/semantic-search", semanticRoute);