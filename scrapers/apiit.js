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

async function scrapeAPIIT() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Starting APIIT scraping...");

  const courseLinks = [
    "https://apiit.lk/courses/beng-hons-software-engineering/",
    "https://apiit.lk/courses/bsc-hons-cyber-security/",
    "https://apiit.lk/courses/bsc-hons-computer-science-software-development/",
    "https://apiit.lk/courses/bsc-hons-computer-science-network-computing/",
    "https://apiit.lk/courses/bsc-hons-computer-science-internet-and-web-management/",
    "https://apiit.lk/courses/bsc-hons-computer-science-cloud-technologies/",
    "https://apiit.lk/courses/bsc-hons-computer-science/",
    "https://apiit.lk/courses/llb-hons-law-part-time/",
    "https://apiit.lk/courses/llb-hons-law/",
    "https://apiit.lk/courses/bsc-hons-business-management/",
    "https://apiit.lk/courses/ba-hons-business-innovation-and-entrepreneurship/",
    "https://apiit.lk/courses/bsc-hons-business-management-human-resource-management/",
    "https://apiit.lk/courses/bsc-hons-business-management-sustainability/",
    "https://apiit.lk/courses/bsc-hons-international-business-management/",
    "https://apiit.lk/courses/ba-hons-digital-and-social-media-marketing/",
    "https://apiit.lk/courses/ba-hons-finance-and-business-enterprise/",
    "https://apiit.lk/courses/ncuk-international-year-one-in-business-management/",
    "https://apiit.lk/courses/beng-hons-electrical-and-electronic-engineering/",
    "https://apiit.lk/courses/beng-hons-mechanical-engineering/",
    "https://apiit.lk/courses/bsc-hons-biomedical-science/",
    "https://apiit.lk/courses/bsc-hons-psychology/",
    "https://apiit.lk/courses/bsc-hons-artificial-intelligence/",
    "https://apiit.lk/courses/bsc-hons-international-hospitality-management/"
  ];

  const courses = [];

  for (let link of courseLinks) {
    try {
      console.log("Visiting:", link);

      await page.goto(link, { waitUntil: "networkidle2" });
      await delay(2000);

      const courseData = await page.evaluate(() => {
        const h1 = document.querySelector("h1");
        const fullText = document.body.innerText || "";
        return {
          title: h1 ? h1.innerText.trim() : null,
          fullText
        };
      });

      let cleanedTitle;

      if (courseData.title && courseData.title.length > 5) {
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

  institute: "APIIT",
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

  console.log("Total cleaned APIIT courses:", courses.length);

  return courses;
}

module.exports = scrapeAPIIT;