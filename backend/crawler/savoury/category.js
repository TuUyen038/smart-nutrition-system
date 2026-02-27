const cheerio = require("cheerio");

const BASE_URL =
  "http://www.savourydays.com/recipe-type/mon-an-viet-nam/";

async function crawlCategory(page = 1) {
  try {
    const url =
      page === 1 ? BASE_URL : `${BASE_URL}page/${page}/`;

    console.log("--------------------------------------------------");
    console.log("Crawling page:", page);
    console.log("URL:", url);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      console.log("❌ Page not found:", page);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const recipes = [];

    $(".hentry").each((index, element) => {
      const title = $(element)
        .find(".entry-title a")
        .text()
        .trim();

      const detailUrl = $(element)
        .find(".entry-title a")
        .attr("href");

      const imageUrl = $(element)
        .find("img.photo")
        .attr("src");

      const date = $(element)
        .find("time")
        .text()
        .trim();

      if (title && detailUrl) {
        recipes.push({
          title,
          detailUrl,
          imageUrl,
          date,
        });
      }
    });

    console.log("✔ Found:", recipes.length);

    return recipes;
  } catch (error) {
    console.error("Crawl error:", error.message);
    return [];
  }
}

module.exports = crawlCategory;