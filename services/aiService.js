const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function generateExplanation(course, interests) {

  const prompt = `
A student is searching for university courses.

Student interests: ${interests.join(", ")}

Course:
Name: ${course.course_name}
Institute: ${course.institute}
Level: ${course.level}

Explain in 2 sentences why this course is suitable.
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "user", content: prompt }
    ],
    temperature: 0.7
  });

  return completion.choices[0].message.content;
}

async function estimateCoursePrice(course){

const prompt = `
Estimate the TOTAL tuition fee in Sri Lankan Rupees.

Course: ${course.course_name}
Institute: ${course.institute}
Duration: ${course.duration_years} years
Level: ${course.level}

Return ONLY a number.
Example:
450000
900000
`;

const completion = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [
    { role: "user", content: prompt }
  ],
  temperature: 0.2
});

const text = completion.choices[0].message.content;

const match = text.match(/\d+/);

let number = match ? parseInt(match[0]) : 0;

if(number === 0){
  const yearlyAverage = 250000;
  number = yearlyAverage * course.duration_years;
}

return number;

}

module.exports = { generateExplanation, estimateCoursePrice };