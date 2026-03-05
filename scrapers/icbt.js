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

async function scrapeICBT() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  console.log("Opening ICBT Courses page...");

  await page.goto("https://icbt.lk/courses/", {
    waitUntil: "networkidle2",
  });

  await delay(5000);

  // Extract valid course links
  const links = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll("a"));

    return anchors
      .map(a => a.href)
      .filter(href =>
        href &&
        href.includes("/courses/") &&
        !href.includes("#") &&
        !href.includes("/page/") &&
        !href.endsWith("/courses/") &&
        !href.includes("/category/")
      );
  });

  const uniqueLinks = [...new Set(links)];
  console.log("Total ICBT course links found:", uniqueLinks.length);

  const courses = [];

  for (let link of uniqueLinks) {
    try {
      console.log("Visiting:", link);

      await page.goto(link, { waitUntil: "networkidle2" });
      await delay(3000);

      const courseData = await page.evaluate(() => {
        const title =
          document.querySelector("h1")?.innerText ||
          document.querySelector(".elementor-heading-title")?.innerText ||
          null;

        const fullText = document.body.innerText;

        return { title, fullText };
      });

      if (!courseData.title || courseData.title.trim() === "Courses")
        continue;

const cleanedTitle = courseData.title.trim();
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

  institute: "ICBT",
  location: "Sri Lanka",
  keywords: generateKeywords(cleanedTitle),
  url: link
});

    } catch (err) {
  console.log("Error scraping:", link);
  console.log("Reason:", err.message);
}
  }

  await browser.close();

  console.log("Total cleaned ICBT courses:", courses.length);

  return courses;   // ✅ IMPORTANT
}

module.exports = scrapeICBT;