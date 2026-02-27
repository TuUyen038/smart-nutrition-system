const cheerio = require("cheerio");

// =====================================
// CONSTANTS
// =====================================

const UNIT_MAP = {
  g: "g",
  gram: "g",
  kg: "kg",
  mg: "mg",
  ml: "ml",
  l: "l",
  "thìa cà phê": "tsp",
  "thìa cafe": "tsp",
  "thìa cf": "tsp",
  "thìa café": "tsp",
  tsp: "tsp",
  "thìa canh": "tbsp",
  tbsp: "tbsp",
  cup: "cup",
};

const APPROX_UNIT_MAP = {
  nhúm: 0.5,
  "một nhúm": 0.5,
  ít: 1,
};

const UNIT_TO_GRAM = {
  g: 1,
  kg: 1000,
  mg: 0.001,
  ml: 1,
  l: 1000,
  tsp: 6,
  tbsp: 15,
  cup: 240,
};

const REMOVE_WORDS = ["nhỏ", "lớn", "thái lát", "băm", "thái hạt lựu"];

// =====================================
// HELPERS
// =====================================

function normalizeText(text) {
  return text.normalize("NFC").trim();
}

function parseAmount(raw) {
  if (!raw) return 1;

  raw = raw.trim();

  const fractionMap = {
    "¼": 0.25,
    "½": 0.5,
    "¾": 0.75,
  };

  if (fractionMap[raw]) return fractionMap[raw];

  if (raw.includes("/")) {
    const [a, b] = raw.split("/");
    return parseFloat(a) / parseFloat(b);
  }

  return parseFloat(raw.replace(",", ".")) || 1;
}

function extractNote(name) {
  const match = name.match(/\((.*?)\)/);
  if (!match) return { cleanName: name.trim(), note: null };

  return {
    cleanName: name.replace(/\(.*?\)/, "").trim(),
    note: match[1].trim(),
  };
}

function cleanCoreName(name) {
  name = normalizeText(name);

  REMOVE_WORDS.forEach((word) => {
    const pattern = new RegExp(`(^|\\s)${word}(?=\\s|$)`, "giu");
    name = name.replace(pattern, " ");
  });

  // remove special chars at start/end
  name = name
    .replace(/^[\s\-–—:;,./\\]+/, "") // đầu
    .replace(/[\s\-–—:;,./\\]+$/, ""); // cuối

  return name.replace(/\s+/g, " ").trim();
}
function splitAltName(name) {
  if (!name.includes("/")) return { name, altName: null };

  const parts = name.split("/").map(s => s.trim());

  return {
    name: parts[0],
    altName: parts[1] || null,
  };
}
function convertToGram(amount, unit) {
  if (!unit) return null;

  if (APPROX_UNIT_MAP[unit]) {
    return amount * APPROX_UNIT_MAP[unit];
  }

  const factor = UNIT_TO_GRAM[unit];
  if (!factor) return null;

  return amount * factor;
}

function parseRange(text) {
  const rangeRegex =
    /^(\d+(?:[.,]\d+)?)\s*[–-]\s*(\d+(?:[.,]\d+)?)\s*(mg|g|gram|kg|ml|l)/i;

  const match = text.match(rangeRegex);

  if (!match) return null;

  const min = parseFloat(match[1].replace(",", "."));
  const max = parseFloat(match[2].replace(",", "."));
  const unitRaw = match[3].toLowerCase();

  return {
    min,
    max,
    unit: unitRaw,
    amount: (min + max) / 2,
  };
}
// =====================================
// MAIN PARSER
// =====================================

function parseIngredient(text) {
  text = normalizeText(text.toLowerCase());

  // XỬ LÝ RANGE TRƯỚC
  const range = parseRange(text);

  if (range) {
    const name = text
      .replace(
        /^(\d+(?:[.,]\d+)?)\s*[–-]\s*(\d+(?:[.,]\d+)?)\s*(gram|mg|kg|ml|l|g)/i,
        "",
      )
      .trim();

    const mappedUnit = UNIT_MAP[range.unit] || range.unit;
    const gramValue = convertToGram(range.amount, mappedUnit);

    return {
      name,
      note: null,
      quantity: {
        min: range.min,
        max: range.max,
        originalAmount: range.amount,
        originalUnit: mappedUnit,
        amount: gramValue || null,
        unit: gramValue ? "g" : null,
      },
    };
  }

  text = normalizeText(text.toLowerCase());
  const unitPattern = Object.keys({
    ...UNIT_MAP,
    ...APPROX_UNIT_MAP,
  })
    .sort((a, b) => b.length - a.length)
    .join("|");

  const regex = new RegExp(
    `^([\\d¼½¾\\/\\s.,]*)\\s*(${unitPattern})?\\s*(.*)$`,
    "iu",
  );
  const match = text.match(regex);

  if (!match) {
    return {
      name: text,
      note: null,
      quantity: {
        originalAmount: null,
        originalUnit: null,
        amount: null,
        unit: null,
      },
    };
  }

  const originalAmount = parseAmount(match[1]);
  const rawUnit = (match[2] || "").trim();
  const mappedUnit = UNIT_MAP[rawUnit] || rawUnit || null;

  const { cleanName, note } = extractNote(match[3]);
  const coreName = cleanCoreName(cleanName);

  const gramValue = convertToGram(originalAmount, mappedUnit);

  return {
    name: coreName,
    note,
    quantity: {
      originalAmount: originalAmount || null,
      originalUnit: mappedUnit,
      amount: gramValue || null,
      unit: gramValue ? "g" : null,
    },
  };
}

function parseInstructions(container, $) {
  const result = [];
  let started = false;

  const clone = container.clone();

  clone.find("script, style, ins, iframe, .adsbygoogle").remove();

  clone.find("p, li").each((i, el) => {
    let raw = $(el).text().trim();

    if (!raw) return;

    const text = raw
      .normalize("NFC")
      .replace(/^[^\p{L}\p{N}]+/gu, "") // remove emoji
      .trim();

    const lower = text.toLowerCase();

    // detect start
    if (lower.includes("cách làm")) {
      started = true;
      return;
    }

    if (!started) return;

    if (/^\d+\./.test(text) || /^[A-Za-z]\./.test(text)) {
      result.push(text);
      return;
    }

    // sub step
    if (/^[-–]/.test(text)) {
      result.push("- " + text.replace(/^[-–]\s*/, ""));
      return;
    }

    // continuation
    if (result.length > 0) {
      result[result.length - 1] += " " + text;
    }
  });

  return result;
}
function extractServing(text) {
  text = text.toLowerCase().normalize("NFC");

  const patterns = [
    /khẩu phần\s*[:\-]?\s*(\d+(?:\s*[–-]\s*\d+)?)/i,
    /phần ăn\s*[:\-]?\s*(\d+(?:\s*[–-]\s*\d+)?)/i,
    /cho\s*(\d+(?:\s*[–-]\s*\d+)?)\s*người/i,
    /serves?\s*(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const range = match[1].split(/[–-]/).map(Number);
      return range.length === 2
        ? Math.round((range[0] + range[1]) / 2)
        : range[0];
    }
  }

  return null;
}
// =====================================
// CRAWLER
// =====================================

async function crawlDetail(url) {
  console.log("Crawling detail:", url);

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  const html = await response.text();
  const $ = cheerio.load(html);

  const name = $("h1[itemprop='name']").text().trim();
  const description =
    $("meta[property='og:description']").attr("content") || "";

  const container = $("div[itemprop='recipeInstructions']");
  const ingredients = [];

  container.find("ul").each((i, ul) => {
    $(ul)
      .find("li")
      .each((_, li) => {
        const text = $(li).text().trim();
        if (/^\d|¼|½|¾/.test(text)) {
          ingredients.push(parseIngredient(text));
        }
      });
  });

  const instructions = parseInstructions(container, $);

  return {
    name,
    description,
    ingredients,
    instructions,
  };
}

module.exports = crawlDetail;
