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

async function scrapeNSBM() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Starting NSBM scraping...");

  const courseLinks = [
    "https://www.nsbm.ac.lk/course/bachelor-of-management-honors-in-business-analytics/",
    "https://www.nsbm.ac.lk/course/bachelor-of-management-honors-in-applied-economics/",
    "https://www.nsbm.ac.lk/course/bbm-hons-tourism-hospitality-events/",
    "https://www.nsbm.ac.lk/course/bsc-in-multimedia/",
    "https://www.nsbm.ac.lk/course/ba-in-business-communication/",
    "https://www.nsbm.ac.lk/course/bm-hons-in-accounting-and-finance/",
    "https://www.nsbm.ac.lk/course/bm-hons-in-international-business/",
    "https://www.nsbm.ac.lk/course/bsc-in-business-management-industrial-management-special-ugc/",
    "https://www.nsbm.ac.lk/course/bsc-in-business-management-project-management-special/",
    "https://www.nsbm.ac.lk/course/bsc-in-business-management-logistics-management-special/",
    "https://www.nsbm.ac.lk/course/bsc-in-business-management-human-resource-management-special/",
    "https://www.nsbm.ac.lk/course/bachelor-of-laws-honours/",
    "https://www.nsbm.ac.lk/course/bm-hons-in-marketing-management/",
    "https://www.nsbm.ac.lk/course/bm-hons-in-law-and-business-studies/",
    "https://www.nsbm.ac.lk/course/bm-hons-in-law-and-international-trade/",
    "https://www.nsbm.ac.lk/course/bm-hons-in-law-and-e-commerce/",
    "https://www.nsbm.ac.lk/course/bsc-in-business-management-innovation-logistic/",
    "https://www.nsbm.ac.lk/course/bsc-hons-business-communication/",
    "https://www.nsbm.ac.lk/course/bsc-hons-events-tourism-and-hospitality-management/",
    "https://www.nsbm.ac.lk/course/bsc-hons-operations-and-logistics-management/",
    "https://www.nsbm.ac.lk/course/bsc-hons-marketing-management/",
    "https://www.nsbm.ac.lk/course/bsc-hons-accounting-and-finance/",
    "https://www.nsbm.ac.lk/course/bsc-hons-international-management-and-business/",
    "https://www.nsbm.ac.lk/course/llb-hons-law-university-of-plymouth-uk/"
  ];

  const courses = [];

  for (let link of courseLinks) {
    try {
      console.log("Visiting:", link);

      await page.goto(link, {
  waitUntil: "domcontentloaded",
  timeout: 60000
});
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
        console.log("Fallback to URL slug:", link);
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

  institute: "NSBM",
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

  console.log("Total cleaned NSBM courses:", courses.length);

  return courses;
}

module.exports = scrapeNSBM;