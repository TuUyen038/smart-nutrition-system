const http = require("http");
const https = require("https");

const MAPPING_API_BASE_URL = process.env.MAPPING_API_URL || "http://localhost:8000";

/**
 * Make HTTP request using built-in modules
 * @param {string} url - Full URL
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - Parsed JSON response
 */
async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith("https");
    const client = isHttps ? https : http;

    const reqOptions = {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      timeout: 30000,
    };

    const req = client.request(url, reqOptions, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(
              new Error(
                `API error: ${res.statusCode} ${res.statusMessage || "Unknown"}`
              )
            );
          } else {
            const parsed = JSON.parse(data);
            resolve(parsed);
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Call Python mapping API to match ingredients
 * @param {Array<{name: string}>} ingredients - Array of ingredients to match
 * @param {number} topK - Number of top results to return (default: 5)
 * @returns {Promise<Array>} - Array of mapping results
 */
async function callMappingAPI(ingredients, topK = 5) {
  try {
    const payload = {
      ingredients: ingredients.map((ing) => ({
        name: typeof ing === "string" ? ing : ing.name,
      })),
      top_k: topK,
    };

    console.log(`📡 Gọi Mapping API với ${ingredients.length} nguyên liệu...`);

    const data = await makeRequest(`${MAPPING_API_BASE_URL}/search_batch`, {
      method: "POST",
      body: payload,
    });

    return data.results || [];
  } catch (error) {
    console.error(
      "❌ Error calling mapping API:",
      error.message
    );
    throw error;
  }
}

/**
 * Convert raw mapping results to review CSV format
 * @param {Array<Object>} mappingResults - Raw results from API
 * @param {Object} recipeMetadata - Recipe info: {recipeId, recipeName}
 * @param {Object} ingredientMetadata - Original ingredient info from recipes.json
 * @returns {Object} - Formatted mapping result for CSV
 */
function formatMappingResult(mappingResult, recipeMetadata, ingredientMetadata) {
  const apiResult = mappingResult.results?.[0];
  const confidence = apiResult?.score ? Math.round(apiResult.score * 100) : 0;
  const exactMatch =
    apiResult?.exact_alias_match ||
    (confidence >= 95 && apiResult?.score >= 0.95);

  return {
    recipeId: recipeMetadata.recipeId || "", // Will be added when importing
    recipeName: recipeMetadata.recipeName || "",
    rawName: mappingResult.input?.name || "", // TÊN BAN ĐẦU
    suggestedName: apiResult?.name_vi || apiResult?.name || "", // TÊN SAU KHI MAPPING
    confidence: confidence,
    exactMatch: exactMatch ? "yes" : "no",
    mongoId: apiResult?.mongo_id || apiResult?.id || "", // ObjectId from DB
    amount: ingredientMetadata?.quantity?.amount || 0,
    unit: ingredientMetadata?.quantity?.unit || "g",
    originalAmount: ingredientMetadata?.quantity?.originalAmount || 0,
    originalUnit: ingredientMetadata?.quantity?.originalUnit || "",
    note: ingredientMetadata?.note || "",
    approved: confidence >= 90 ? "yes" : confidence >= 70 ? "pending" : "no",
    userNotes: "", // User will fill this during review
  };
}

/**
 * Batch map ingredients
 * @param {Array<Object>} recipes - Array of recipe objects
 * @returns {Promise<Array>} - Array of formatted mapping results
 */
async function batchMapIngredients(recipes) {
  const allResults = [];
  let processedCount = 0;
  let errorCount = 0;

  console.log(`\n🔍 Bắt đầu mapping ${recipes.length} recipes...`);

  for (const recipe of recipes) {
    try {
      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        continue;
      }

      // Extract unique ingredients from recipe
      const ingredientInputs = recipe.ingredients.map((ing) => ({
        name: ing.name || "",
      }));

      // Call mapping API
      const mappingResults = await callMappingAPI(ingredientInputs, 3);

      // Format results
      for (let i = 0; i < mappingResults.length; i++) {
        const mapping = mappingResults[i];
        const ingredient = recipe.ingredients[i];

        const formatted = formatMappingResult(
          mapping,
          {
            recipeId: null, // Will be added during import
            recipeName: recipe.name || recipe.title || "Unknown",
          },
          ingredient
        );

        allResults.push(formatted);
      }

      processedCount++;

      // Log progress
      if (processedCount % 10 === 0) {
        console.log(`  ✅ Processed ${processedCount}/${recipes.length} recipes`);
      }

      // Small delay to avoid blocking
      await new Promise((r) => setTimeout(r, 100));
    } catch (error) {
      errorCount++;
      console.error(
        `  ❌ Error processing recipe "${recipe.name}":`,
        error.message
      );
    }
  }

  console.log(`\n✅ Mapping hoàn tất:`);
  console.log(`  - Thành công: ${processedCount}/${recipes.length}`);
  console.log(`  - Lỗi: ${errorCount}`);
  console.log(`  - Tổng mapping results: ${allResults.length}`);

  return allResults;
}

/**
 * Get statistics about mapping results
 * @param {Array<Object>} results - Mapping results
 * @returns {Object} - Statistics
 */
function getStatistics(results) {
  const total = results.length;
  const approved = results.filter((r) => r.approved === "yes").length;
  const pending = results.filter((r) => r.approved === "pending").length;
  const rejected = results.filter((r) => r.approved === "no").length;
  const high = results.filter((r) => r.confidence >= 90).length;
  const medium = results.filter((r) => r.confidence >= 70 && r.confidence < 90)
    .length;
  const low = results.filter((r) => r.confidence < 70).length;
  const exact = results.filter((r) => r.exactMatch === "yes").length;

  return {
    total,
    approved,
    pending,
    rejected,
    confidence: {
      high: `${high} (${((high / total) * 100).toFixed(1)}%)`,
      medium: `${medium} (${((medium / total) * 100).toFixed(1)}%)`,
      low: `${low} (${((low / total) * 100).toFixed(1)}%)`,
    },
    exactMatch: `${exact} (${((exact / total) * 100).toFixed(1)}%)`,
  };
}

module.exports = {
  callMappingAPI,
  formatMappingResult,
  batchMapIngredients,
  getStatistics,
};
