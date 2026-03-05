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

async function scrapeNIBM() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Starting NIBM scraping (Direct URLs)...");

  const courseLinks = [
    // School of Business
    "https://nibm.ac.lk/course/ba-hons-human-resource-management",
    "https://nibm.ac.lk/course/ba-hons-management-and-leadership",
    "https://nibm.ac.lk/course/ba-hons-international-tourism-and-hospitality-management",
    "https://nibm.ac.lk/course/ba-hons-professional-accounting",
    "https://nibm.ac.lk/course/bsc-hons-in-digital-banking-and-finance",
    "https://nibm.ac.lk/course/bsc-hons-in-digital-marketing",
    "https://nibm.ac.lk/course/bachelor-of-business",

    // School of Computing
    "https://nibm.ac.lk/course/bsc-hons-ethical-hacking-and-network-security",
    "https://nibm.ac.lk/course/bsc-hons-information-technology-for-business",
    "https://nibm.ac.lk/course/bsc-hons-compuer-science-with-software-engineering",
    "https://nibm.ac.lk/course/ba-hons-creative-multimedia",
    "https://nibm.ac.lk/course/ba-hons-professional-design-visual-communication",
    "https://nibm.ac.lk/course/bsc-hons-computerscience-with-ai",
    "https://nibm.ac.lk/course/bsc-hons-computer-science-with-applied-ai",
    "https://nibm.ac.lk/course/bsc-hons-computer-science-with-data-science",

    // Engineering
    "https://nibm.ac.lk/course/bachelor-of-engineering-honours-civil-engineering",
    "https://nibm.ac.lk/course/bsc-hons-quantity-surveying-commercial-management",
    "https://nibm.ac.lk/course/beng-hons-in-electro-mechanical-engineering",

    // Language
    "https://nibm.ac.lk/course/ba-hons-english-and-tesol",
    "https://nibm.ac.lk/course/ba-hons-english-studies",

    // Design
    "https://nibm.ac.lk/course/bachelor-of-design-fas",
    "https://nibm.ac.lk/course/bachelor-of-arts-in-interior-architecture",
    "https://nibm.ac.lk/course/bachelor-of-built-environment-interior-design-major-hons",
    "https://nibm.ac.lk/course/bachelor-of-arts-hons-in-fashion-design",

    // Humanities
    "https://nibm.ac.lk/course/bachelor-of-arts-hons-in-broadcasting-journalism",
    "https://nibm.ac.lk/course/bsc-hons-in-psychology",

    // Analytics
    "https://nibm.ac.lk/course/bsc-hons-data-science",

    // Productivity
    "https://nibm.ac.lk/course/bsc-hons-global-logistics",
    "https://nibm.ac.lk/course/bsc-hons-global-logistics-part-time",
    "https://nibm.ac.lk/course/bsc-hons-manufacturing-management-full-time",
    "https://nibm.ac.lk/course/bsc-hons-manufacturing-management-part-time"
  ];

  const courses = [];

  for (let link of courseLinks) {
    try {
      console.log("Visiting:", link);

      await page.goto(link, { waitUntil: "networkidle2" });
      await delay(2000);

      const courseData = await page.evaluate(() => {
        const title =
          document.querySelector("h1")?.innerText ||
          document.querySelector(".entry-title")?.innerText ||
          null;

        const fullText = document.body.innerText || "";

        return { title, fullText };
      });

      if (!courseData.title) {
        console.log("No title found for:", link);
        continue;
      }

      // 🔹 Clean title
      const cleanedTitle = courseData.title
        .replace(/\n/g, "")
        .replace(/\s+/g, " ")
        .trim();

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

  institute: "NIBM",
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

  console.log("Total cleaned NIBM courses:", courses.length);

  return courses;
}

module.exports = scrapeNIBM;