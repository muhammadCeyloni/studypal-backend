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

async function scrapeIIT() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Starting IIT scraping...");

  const baseURL = "https://www.iit.ac.lk/course/";

  await page.goto(baseURL, { waitUntil: "networkidle2" });
  await delay(3000);

  // 🔹 Extract all course links
  const courseLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("a"));

    return links
      .map(a => a.href)
      .filter(link =>
  link.includes("/course/") &&
  !link.includes("#") &&
  !link.endsWith("/course/")
)
  });

  // Remove duplicates
  const uniqueLinks = [...new Set(courseLinks)];

  console.log("Found IIT course links:", uniqueLinks.length);

  const courses = [];

  for (let link of uniqueLinks) {
    try {
      console.log("Visiting:", link);

      await page.goto(link, { waitUntil: "networkidle2" });
      await delay(2000);

      const courseData = await page.evaluate(() => {
        const possibleSelectors = [
          "h1",
          ".entry-title",
          ".page-title"
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

      // Option 3 logic
      let cleanedTitle;

      if (courseData.title) {
        cleanedTitle = courseData.title
          .replace(/\n/g, "")
          .replace(/\s+/g, " ")
          .trim();
      } else {
        cleanedTitle = extractTitleFromURL(link);
      }

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

  institute: "IIT",
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

  console.log("Total cleaned IIT courses:", courses.length);

  return courses;
}

module.exports = scrapeIIT;