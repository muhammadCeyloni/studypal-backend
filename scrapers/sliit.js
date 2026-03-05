const puppeteer = require("puppeteer");
const {
  delay,
  extractDuration,
  generateKeywords,
  extractDegreeType,
  detectLevel,
  extractTitleFromURL,
  extractFee,
  detectInstallment,
  detectScholarship,
  extractIntakeMonths,
  extractDeadline
} = require("../utils/helpers");

async function scrapeSLIIT() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Starting SLIIT scraping...");

  const courseLinks = [
    "https://www.sliit.lk/humanities-sciences/programmes/undergraduate-degree-programs/bsc-hon-in-biomedical-science/",
    "https://www.sliit.lk/humanities-sciences/programmes/undergraduate-degree-programs/bsc-hons-psychology/",
    "https://www.sliit.lk/humanities-sciences/programmes/undergraduate-degree-programs/llb-hons-law-degree/",
    "https://www.sliit.lk/humanities-sciences/programmes/undergraduate-degree-programs/b-ed-hons-in-biological-sciences-degree/",
    "https://www.sliit.lk/humanities-sciences/programmes/undergraduate-degree-programs/b-ed-hons-in-english-degree/",
    "https://www.sliit.lk/humanities-sciences/programmes/undergraduate-degree-programs/b-ed-hons-in-physical-sciences-degree/",
    "https://www.sliit.lk/humanities-sciences/programmes/undergraduate-degree-programs/social-sciences-degree/",
    "https://www.sliit.lk/humanities-sciences/programmes/undergraduate-degree-programs/bachelor-of-science-hons-in-biotechnology-degree/",
    "https://www.sliit.lk/humanities-sciences/programmes/undergraduate-degree-programs/bsc-hons-in-financial-mathematics-and-applied-statistics/",
    "https://www.sliit.lk/llb-hons-law/",
    "https://www.sliit.lk/bsc-hons-psychology/",
    "https://www.sliit.lk/humanities-sciences/programmes/undergraduate-degree-programs/english-studies-degree/",
    "https://www.sliit.lk/graduate-studies/programms/pgd-programmes/postgraduate-diploma-in-education/",
    "https://www.sliit.lk/graduate-studies/programms/msc-programmes/masters-of-education/"
  ];

  const courses = [];

  for (let link of courseLinks) {
    try {
      console.log("Visiting:", link);

      await page.goto(link, { waitUntil: "networkidle2" });
      await delay(2000);

      await page.waitForSelector("body", { timeout: 10000 });

      const courseData = await page.evaluate(() => {
        const possibleSelectors = [
          "h1",
          ".entry-title",
          ".page-title",
          ".elementor-heading-title"
        ];

        let title = null;

        for (let selector of possibleSelectors) {
          const el = document.querySelector(selector);
          if (el && el.innerText.trim().length > 5) {
            title = el.innerText.trim();
            break;
          }
        }

        const fullText = document.body.innerText || "";
        return { title, fullText };
      });

      // 🔥 OPTION 3 LOGIC
      let cleanedTitle;

if (courseData.title) {
  cleanedTitle = courseData.title
    .replace(/\n/g, "")
    .replace(/\s+/g, " ")
    .trim();
} else {
  console.log("Fallback to URL slug for:", link);
  cleanedTitle = extractTitleFromURL(link);
}

// ✅ ADD THESE TWO LINES
const degreeType = extractDegreeType(cleanedTitle);
const level = detectLevel(cleanedTitle, link);

const durationYears = extractDuration(courseData.fullText);
const feeData = extractFee(courseData.fullText);
const installment = detectInstallment(courseData.fullText);
const scholarship = detectScholarship(courseData.fullText);
const intakeMonths = extractIntakeMonths(courseData.fullText);
const deadline = extractDeadline(courseData.fullText);

courses.push({
  course_name: cleanedTitle,
  degree_type: degreeType,
  level: level,
  duration_years: durationYears,

  tuition_fee_total: feeData ? feeData.amount : null,
  tuition_fee_per_year: feeData && durationYears
    ? Math.round(feeData.amount / durationYears)
    : null,

  currency: feeData ? feeData.currency : "LKR",
  fee_source: feeData ? "scraped" : "estimated",
  price_category: null,

  installment_available: installment,
  scholarship_available: scholarship,
  intake_months: intakeMonths,
  application_deadline: deadline,

  institute: "SLIIT",
  location: "Sri Lanka",
  keywords: generateKeywords(cleanedTitle),
  url: link
});
      console.log("Added:", cleanedTitle);

    } catch (err) {
  console.log("Error scraping:", link);
  console.log("Reason:", err.message);
}
  }

  await browser.close();

  console.log("Total cleaned SLIIT courses:", courses.length);

  return courses;
}

module.exports = scrapeSLIIT;