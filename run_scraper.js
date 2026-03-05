const fs = require("fs");

// Import only the scrapers you need
const scrapeICBT = require("./scrapers/icbt");
const scrapeNIBM = require("./scrapers/nibm");
const scrapeSLIIT = require("./scrapers/sliit");
const scrapeIIT = require("./scrapers/iit");
const scrapeNSBM = require("./scrapers/nsbm");
const scrapeAPIIT = require("./scrapers/apiit");
// Later you can add:
// const scrapeNSBM = require("./scrapers/nsbm");
// const scrapeIIT = require("./scrapers/iit");

(async () => {
  const arg = process.argv[2]; // command line argument

  console.log("Selected mode:", arg || "none");

  let allCourses = [];

  try {

    // ===============================
    // RUN ONLY NIBM
    // ===============================
    if (arg === "nibm") {
      const nibmCourses = await scrapeNIBM();
      allCourses = [...nibmCourses];
    }

    // ===============================
    // RUN ONLY ICBT
    // ===============================
    else if (arg === "icbt") {
      const icbtCourses = await scrapeICBT();
      allCourses = [...icbtCourses];
    }

    // ===============================
    // RUN ONLY SLIIT
    // ===============================
    else if (arg === "sliit") {
      const sliitCourses = await scrapeSLIIT();
      allCourses = [...sliitCourses];
    }
    
    // ===============================
    // RUN ONLY IIT
    // ===============================
    else if (arg === "iit") {
  const iitCourses = await scrapeIIT();
  allCourses = [...iitCourses];
}

    // ===============================
    // RUN ONLY NSBM
    // ===============================
else if (arg === "nsbm") {
  const nsbmCourses = await scrapeNSBM();
  allCourses = [...nsbmCourses];
}

    // ===============================
    // RUN ONLY APIIT
    // ===============================
else if (arg === "apiit") {
  const apiitCourses = await scrapeAPIIT();
  allCourses = [...apiitCourses];
}


    // ===============================
    // RUN EVERYTHING
    // ===============================
    else if (arg === "all") {
      const icbtCourses = await scrapeICBT();
      const nibmCourses = await scrapeNIBM();
      const sliitCourses = await scrapeSLIIT();
      const iitCourses = await scrapeIIT();
      const nsbmCourses = await scrapeNSBM();
      const apiitCourses = await scrapeAPIIT();
      allCourses = [...icbtCourses, ...nibmCourses, ...sliitCourses];
    }

    else {
      console.log(`
Please specify which scraper to run:

node run_scraper.js nibm
node run_scraper.js icbt
node run_scraper.js sliit
node run_scraper.js iit
node run_scraper.js nsbm
node run_scraper.js apiit

Or run all scrapers:  
node run_scraper.js all
      `);
      process.exit();
    }

    fs.writeFileSync("all_courses.json", JSON.stringify(allCourses, null, 2));
    console.log("Total courses saved:", allCourses.length);

  } catch (err) {
    console.error("Error running scraper:", err.message);
  }
})();