function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

function detectLevel(title, url = "") {
  const combined = (title + " " + url)
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\(/g, "")
    .replace(/\)/g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // POSTGRADUATE
  if (
    combined.includes("msc") ||
    combined.includes("master") ||
    combined.includes("mba") ||
    combined.includes("meng") ||
    combined.includes("postgraduate")
  ) {
    return "Postgraduate";
  }

  // UNDERGRADUATE
  if (
    combined.includes("bsc") ||
    combined.includes("ba ") ||
    combined.includes("bachelor") ||
    combined.includes("beng") ||
    combined.includes("bcom") ||
    combined.includes("llb") ||
    combined.includes("hons") ||
    combined.includes("honours")
  ) {
    return "Undergraduate";
  }

  // DIPLOMA
  if (combined.includes("diploma")) {
    return "Diploma";
  }

  // FOUNDATION
  if (combined.includes("foundation") || combined.includes("certificate")) {
    return "Foundation";
  }

  return "Other";
}

function extractDuration(text) {
  const match = text.match(/(\d+)\s*year/i);
  return match ? parseInt(match[1]) : null;
}

function generateKeywords(title) {
  const cleaned = title
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .toLowerCase();

  const words = cleaned
    .split(/\s+/)
    .filter(word =>
      word.length > 3 &&
      ![
        "hons",
        "year",
        "years",
        "degree",
        "level",
        "extended",
        "international"
      ].includes(word)
    );

  return [...new Set(words)];
}

function extractDegreeType(urlOrTitle) {
  const text = urlOrTitle
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\(/g, "")
    .replace(/\)/g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // ===== POSTGRADUATE =====
  if (text.includes("msc") || text.includes("master of science"))
    return "MSc";

  if (text.includes("mba"))
    return "MBA";

  if (text.includes("meng"))
    return "MEng";

  if (text.includes("postgraduate diploma") || text.includes("pgd"))
    return "Postgraduate Diploma";

  // ===== LAW =====
  if (text.includes("llb hons") || text.includes("llb honours"))
    return "LLB (Hons)";

  if (text.includes("llb"))
    return "LLB";

  // ===== ENGINEERING =====
  if (text.includes("beng hons"))
    return "BEng (Hons)";

  if (text.includes("beng"))
    return "BEng";

  // ===== SCIENCE =====
  if (text.includes("bsc hons"))
    return "BSc (Hons)";

  if (text.includes("bsc"))
    return "BSc";

  // ===== ARTS =====
  if (text.includes("ba hons"))
    return "BA (Hons)";

  if (text.includes("ba"))
    return "BA";

  // ===== MANAGEMENT / BUSINESS =====
  if (text.includes("bbm hons"))
    return "BBM (Hons)";

  if (text.includes("bbm"))
    return "BBM";

  if (text.includes("bm hons"))
    return "BM (Hons)";

  if (text.includes("bachelor of management"))
    return "Bachelor of Management";

  if (text.includes("bcom"))
    return "BCom";

  // ===== EDUCATION =====
  if (text.includes("bed hons") || text.includes("b ed hons"))
    return "BEd (Hons)";

  if (text.includes("bed"))
    return "BEd";

  // ===== GENERAL FALLBACK =====
  if (text.includes("bachelor"))
    return "Bachelor Degree";

  return "Unknown";
}

function extractFee(text) {
  if (!text) return null;

  const patterns = [
    /(LKR|Rs\.?)\s?([\d,]+)/i,
    /(USD)\s?([\d,]+)/i
  ];

  for (let pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const currency = match[1].toUpperCase().includes("USD") ? "USD" : "LKR";
      const amount = parseInt(match[2].replace(/,/g, ""));
      return { amount, currency };
    }
  }

  return null;
}

function detectInstallment(text) {
  if (!text) return false;

  const keywords = [
    "installment",
    "payment plan",
    "monthly payment",
    "easy payment",
    "pay in installments"
  ];

  return keywords.some(word =>
    text.toLowerCase().includes(word)
  );
}

function extractTitleFromURL(url) {
  const slug = url
    .split("/")
    .filter(Boolean)
    .pop(); // last part of URL

  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase())
    .trim();
}

function detectScholarship(text) {
  if (!text) return false;

  const keywords = [
    "scholarship",
    "merit scholarship",
    "financial aid",
    "bursary"
  ];

  return keywords.some(word =>
    text.toLowerCase().includes(word)
  );
}

function extractIntakeMonths(text) {
  if (!text) return [];

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const found = [];

  for (let month of months) {
    if (text.includes(month)) {
      found.push(month);
    }
  }

  return [...new Set(found)];
}



function extractDeadline(text) {
  const match = text.match(
    /(deadline|apply before|closing date)[^\.]{0,50}/i
  );

  return match ? match[0] : null;
}

module.exports = {
  delay,
  detectLevel,
  extractDuration,
  generateKeywords,
  extractDeadline,
  detectInstallment,
  detectScholarship,
  extractIntakeMonths,
  extractFee,
  extractDegreeType,
  extractTitleFromURL
};