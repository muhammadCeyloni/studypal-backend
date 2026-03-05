const scrapeSLIIT = require("./scrapers/sliit");
const scrapeAPIIT = require("./scrapers/apiit");
const scrapeICBT = require("./scrapers/icbt");
const scrapeIIT = require("./scrapers/iit");
const scrapeNIBM = require("./scrapers/nibm");
const scrapeNSBM = require("./scrapers/nsbm");

async function runAll() {
  try {
    const sliit = await scrapeSLIIT();
    const apiit = await scrapeAPIIT();
    const icbt = await scrapeICBT();
    const iit = await scrapeIIT();
    const nibm = await scrapeNIBM();
    const nsbm = await scrapeNSBM();

    const allCourses = [
      ...sliit,
      ...apiit,
      ...icbt,
      ...iit,
      ...nibm,
      ...nsbm
    ];

    console.log("TOTAL COURSES:", allCourses.length);

  } catch (err) {
    console.error("Error running scrapers:", err);
  }
}

runAll();