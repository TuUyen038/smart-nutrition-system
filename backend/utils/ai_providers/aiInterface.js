// aiInterface.js (Nâng cấp)
const { GeminiService } = require("./geminiProvider.js");
const { GroqService } = require("./groqProvider.js");

// Khởi tạo các Service Instance với các API Key khác nhau
// Key cho mục đích chung (food analysis)
const GEMINI_API_KEY_FOOD = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Khởi tạo Service (Lưu ý: sẽ ném lỗi nếu KEY bị thiếu)
const foodGeminiService = new GeminiService(
  GEMINI_API_KEY_FOOD,
  "gemini-2.5-flash"
);

// Khởi tạo Groq Service (fallback)
let groqService = null;
if (GROQ_API_KEY) {
  try {
    groqService = new GroqService(GROQ_API_KEY, "llama-3.1-70b-versatile");
    console.log("✅ Groq Service đã được khởi tạo (fallback provider)");
  } catch (error) {
    console.warn("⚠️ Không thể khởi tạo Groq Service:", error.message);
  }
} else {
  console.warn(
    "⚠️ GROQ_API_KEY không được cấu hình, fallback sẽ không hoạt động"
  );
}

/**
 * Hàm kiểm tra xem result có phải là lỗi quota không
 */
const isQuotaError = (result) => {
  try {
    const parsed = JSON.parse(result);
    return (
      parsed.statusCode === 429 ||
      parsed.errorMessage?.includes("429") ||
      parsed.errorMessage?.includes("quota") ||
      parsed.errorMessage?.includes("RESOURCE_EXHAUSTED")
    );
  } catch (e) {
    return false;
  }
};

/**
 * Hàm phân tích với fallback tự động
 * Thứ tự: Gemini Flash → Gemini Flash-Lite → Groq
 */
const analyzeWithFallback = async (
  imageFile,
  prompt,
  preferredModel = "gemini-2.5-flash"
) => {
  let result;
  let usedProvider = "unknown";
  let usedModel = "unknown";

  // Bước 1: Thử Gemini Flash trước
  try {
    console.log("🔄 [Fallback] Bước 1/3: Đang thử Gemini Flash...");
    result = await foodGeminiService.analyze(
      imageFile,
      prompt,
      "gemini-2.5-flash"
    );

    // Kiểm tra xem có phải lỗi quota không
    if (isQuotaError(result)) {
      throw new Error("Quota exceeded");
    }

    // Thành công với Flash
    usedProvider = "gemini";
    usedModel = "gemini-2.5-flash";
    console.log(`✅ [Fallback] Thành công với ${usedProvider} (${usedModel})`);
    return { result, provider: usedProvider, model: usedModel };
  } catch (error) {
    const isQuotaErr =
      error.status === 429 ||
      error.message?.includes("429") ||
      error.message?.includes("quota") ||
      error.message?.includes("RESOURCE_EXHAUSTED") ||
      error.message === "Quota exceeded" ||
      isQuotaError(result);

    if (isQuotaErr) {
      console.warn(
        "⚠️ [Fallback] Gemini Flash hết quota (429), chuyển sang Flash-Lite..."
      );
    } else {
      console.warn(
        `⚠️ [Fallback] Gemini Flash lỗi: ${error.message}, chuyển sang Flash-Lite...`
      );
    }
  }

  // Bước 2: Fallback sang Gemini Flash-Lite
  try {
    console.log("🔄 [Fallback] Bước 2/3: Đang thử Gemini Flash-Lite...");
    result = await foodGeminiService.analyze(
      imageFile,
      prompt,
      "gemini-2.5-flash-lite"
    );

    // Kiểm tra xem có phải lỗi quota không
    if (isQuotaError(result)) {
      throw new Error("Quota exceeded");
    }

    // Thành công với Flash-Lite
    usedProvider = "gemini";
    usedModel = "gemini-2.5-flash-lite";
    console.log(`✅ [Fallback] Thành công với ${usedProvider} (${usedModel})`);
    return { result, provider: usedProvider, model: usedModel };
  } catch (error) {
    const isQuotaErr =
      error.status === 429 ||
      error.message?.includes("429") ||
      error.message?.includes("quota") ||
      error.message?.includes("RESOURCE_EXHAUSTED") ||
      error.message === "Quota exceeded" ||
      isQuotaError(result);

    if (isQuotaErr) {
      console.warn(
        "⚠️ [Fallback] Gemini Flash-Lite cũng hết quota (429), chuyển sang Groq..."
      );
    } else {
      console.warn(
        `⚠️ [Fallback] Gemini Flash-Lite lỗi: ${error.message}, chuyển sang Groq...`
      );
    }
  }

  // Bước 3: Fallback sang Groq (nếu cả 2 Gemini đều lỗi)
  if (groqService) {
    try {
      console.log("🔄 [Fallback] Bước 3/3: Đang thử Groq...");
      result = await groqService.analyze(imageFile, prompt);
      usedProvider = "groq";
      usedModel = groqService.defaultModel;
      console.log(
        `✅ [Fallback] Thành công với ${usedProvider} (${usedModel})`
      );
      return { result, provider: usedProvider, model: usedModel };
    } catch (error) {
      console.error(
        `❌ [Fallback] Cả 3 providers đều lỗi. Groq: ${error.message}`
      );
      // Nếu cả 3 đều lỗi, trả về lỗi
      const errorObject = {
        foodName: "Lỗi API/Không xác định",
        errorMessage: `Cả Gemini Flash, Flash-Lite và Groq đều lỗi. Groq: ${error.message}`,
        statusCode: 500,
        provider: "all_failed",
      };
      return {
        result: JSON.stringify(errorObject),
        provider: "error",
        model: "none",
      };
    }
  } else {
    console.error(
      "❌ [Fallback] Groq Service không khả dụng, không thể fallback"
    );
    const errorObject = {
      foodName: "Lỗi API/Không xác định",
      errorMessage:
        "Gemini Flash và Flash-Lite đều lỗi, Groq không được cấu hình",
      statusCode: 500,
      provider: "no_fallback",
    };
    return {
      result: JSON.stringify(errorObject),
      provider: "error",
      model: "none",
    };
  }
};

/**
 * Hàm phân tích chung, chọn mô hình/service phù hợp.
 * @deprecated Sử dụng analyzeWithFallback thay thế
 */
const analyzeFoodImage = async (modelName, imageFile, prompt) => {
  const { result } = await analyzeWithFallback(imageFile, prompt, modelName);
  return result;
};

const identifyFoodName = async (imageFile) => {
  const prompt = `
        Bạn là một chuyên gia ẩm thực. 
        Hãy nhận dạng món ăn trong bức ảnh. Nếu không tìm ra tên hãy trả về null. Chỉ trả về một đối tượng JSON với 
        tên món ăn bằng tiếng Việt, theo mẫu sau:
        * {
        * "foodName": "Bánh Mì Kẹp Thịt Nướng",
        * }
        `;
  const { result, provider, model } = await analyzeWithFallback(
    imageFile,
    prompt,
    "gemini-2.5-flash"
  );
  console.log(`📊 [identifyFoodName] Kết quả từ: ${provider} (${model})`);
  return result;
};

const getRecipe = async (foodName) => {
  const prompt = `
BẠN PHẢI TRẢ VỀ ĐÚNG FORMAT JSON SAU ĐÂY, KHÔNG ĐƯỢC THIẾU BẤT KỲ TRƯỜNG NÀO:

Hãy cung cấp công thức nấu ăn thật đơn giản và dễ nấu cho món "${foodName}". 

YÊU CẦU BẮT BUỘC:
1. Trong công thức này, có nêu nguyên liệu và khối lượng tương ứng. Ví dụ "cho 200g thịt vào chảo".
2. Tên nguyên liệu theo Bảng thành phần thực phẩm Việt Nam (Viện Dinh dưỡng, 2017)
3. Tất cả nguyên liệu lấy unit là g hoặc ml
4. **BẮT BUỘC PHẢI CÓ TRƯỜNG "servings"** - số khẩu phần mà công thức này dành cho (ví dụ: 1, 2, 3, 4...)

FORMAT JSON BẮT BUỘC (KHÔNG ĐƯỢC THIẾU TRƯỜNG NÀO):
{
  "ingredients": [
    {
      "name": "cá hồi",
      "quantity": {
        "amount": 300,
        "unit": "g"
      }
    }
  ],
  "instructions": [
    "Ướp thịt với nước mắm, đường, tiêu...",
    "Nướng thịt đến khi chín vàng..."
  ],
  "servings": 1
}

LƯU Ý QUAN TRỌNG:
- Trường "servings" là BẮT BUỘC và phải là số nguyên dương (1, 2, 3, 4...)
- KHÔNG ĐƯỢC bỏ qua trường "servings"
- Nếu không có "servings", JSON sẽ KHÔNG HỢP LỆ
    `;
  const { result, provider, model } = await analyzeWithFallback(
    null,
    prompt,
    "gemini-2.5-flash"
  );
  console.log(`📊 [getRecipe] Kết quả từ: ${provider} (${model})`);

  // Validate và đảm bảo có servings
  try {
    const parsed = JSON.parse(result);
    if (!parsed.servings || parsed.servings === undefined) {
      console.warn("⚠️ [getRecipe] Response thiếu servings, thêm mặc định = 1");
      parsed.servings = 1;
      return JSON.stringify(parsed);
    }
  } catch (e) {
    // Nếu parse lỗi, trả về nguyên result
    console.warn("⚠️ [getRecipe] Không thể parse JSON để validate servings");
  }

  return result;
};
const getRecipeStream = async (foodName, onToken) => {
  const prompt = `
BẠN PHẢI TRẢ VỀ ĐÚNG FORMAT JSON SAU ĐÂY, KHÔNG ĐƯỢC THIẾU BẤT KỲ TRƯỜNG NÀO:

Hãy cung cấp công thức nấu ăn thật đơn giản và dễ nấu cho món "${foodName}". 

YÊU CẦU BẮT BUỘC:
1. Trong công thức này, có nêu nguyên liệu và khối lượng tương ứng. Ví dụ "cho 200g thịt vào chảo".
2. Tên nguyên liệu theo Bảng thành phần thực phẩm Việt Nam (Viện Dinh dưỡng, 2017)
3. Tất cả nguyên liệu lấy unit là g hoặc ml
4. **BẮT BUỘC PHẢI CÓ TRƯỜNG "servings"** - số khẩu phần mà công thức này dành cho (ví dụ: 1, 2, 3, 4...)

FORMAT JSON BẮT BUỘC (KHÔNG ĐƯỢC THIẾU TRƯỜNG NÀO):
    {
      "ingredients": [
        {
          "name": "Thịt heo",
          "quantity": {
            "amount": 300,
            "unit": "g"
          }
        }
      ],
      "instructions": [
        "Ướp thịt với nước mắm, đường, tiêu...",
        "Nướng thịt đến khi chín vàng..."
      ],
      "servings": 1
    }

LƯU Ý QUAN TRỌNG:
- Trường "servings" là BẮT BUỘC và phải là số nguyên dương (1, 2, 3, 4...)
- KHÔNG ĐƯỢC bỏ qua trường "servings"
- Nếu không có "servings", JSON sẽ KHÔNG HỢP LỆ
  `;

  // Giả sử Gemini SDK có method streamAnalyze
  const stream = await foodGeminiService.streamAnalyze(
    null,
    prompt,
    "gemini-2.5-flash"
  );

  let result = "";
  for await (const token of stream) {
    result += token; // lưu dần token vào result
    if (onToken) onToken(token); // callback để UI hiển thị ngay
  }

  return result; // trả về toàn bộ JSON sau khi stream xong
};

const getNutritionByAi = async (ingrs) => {
  const prompt = `
        Dựa trên danh sách tên nguyên liệu sau: ${ingrs},
        Hãy trả về danh sách nutrition tính trên 100g nguyên liệu, liệt kê theo thứ tự của danh sách nguyên liệu đó
        sugar và sodium đơn vị là mg, calories là kcal, còn lại là g
        trong đó mỗi object chứa thông tin của 1 nguyên liệu, ưu tiên dữ liệu lấy từ Bảng thành phần thực phẩm Việt Nam (Viện Dinh dưỡng, 2017), không có thì hãy lấy từ nguồn đáng tin cậy.
        Trả về 1 obj theo mẫu:
         * {
            * "Nutrition": [
            * {
            *   "name": "Thịt heo",
            *   "source": "Viện Dinh dưỡng",
            *   "calories": 95,
            *   "protein": 80,
            *   "fat": 45,
            *   "carbs": 50,
            *   "fiber": 10,
            *   "sugar": 10,
            *   "sodium": 100,
            * }, 
            * {
            *   "name": "Thịt chim",
            *   "source": "Viện Dinh dưỡng",
            *   "calories": 205,
            *   "protein": 80,
            *   "fat": 45,
            *   "carbs": 50,
            *   "fiber": 10,
            *   "sugar": 10,
            *   "sodium": 100,
            * }, 
            * ]
        *}
    `;
  const { result, provider, model } = await analyzeWithFallback(
    null,
    prompt,
    "gemini-2.5-flash"
  );
  console.log(`📊 [getNutritionByAi] Kết quả từ: ${provider} (${model})`);
  return result;
};

// services/aiFoodService.js (ví dụ)
const getIngredients = async (recipeInput, servings = null) => {
  let recipeText = "";

  // Nếu FE gửi lên là mảng các bước: ["Bước 1...", "Bước 2..."]
  if (Array.isArray(recipeInput)) {
    recipeText = recipeInput.join("\n");
  }
  // Nếu FE gửi lên là string: "Bước 1...\nBước 2..."
  else if (typeof recipeInput === "string") {
    recipeText = recipeInput;
  }
  // Nếu sau này bạn lỡ gửi cả object recipe (có thể bỏ nếu không dùng)
  else if (recipeInput && typeof recipeInput === "object") {
    recipeText =
      recipeInput.instructionsText ||
      (Array.isArray(recipeInput.instructions)
        ? recipeInput.instructions.join("\n")
        : recipeInput.description || JSON.stringify(recipeInput));
  }

  // Thêm thông tin servings vào prompt nếu có
  const servingsInfo =
    servings && servings > 0
      ? `\n\nQUAN TRỌNG: Công thức này dành cho ${servings} khẩu phần. Hãy tính toán "quantity.amount" cho TỔNG SỐ NGUYÊN LIỆU CẦN THIẾT để nấu cho ${servings} khẩu phần này. Nếu công thức chỉ ghi cho 1 khẩu phần, hãy nhân lên cho ${servings} khẩu phần.`
      : "";

  const prompt = `
Dựa trên Công thức nấu ăn sau:
${recipeText}${servingsInfo}

Hãy trả về danh sách ingredients đầy đủ, có quantity và unit đầy đủ 
(nếu công thức thiếu quantity thì tự ước lượng và sau đó gán thuộc tính estimate là true).

Yêu cầu QUAN TRỌNG:
- "name": tên nguyên liệu đơn giản, dễ hiểu, KHÔNG bao gồm cách chế biến (không có các từ như chiên, rán, nướng...)
- "quantity.amount": number (không được là string) - LƯU Ý: Nếu có servings, amount phải là tổng số nguyên liệu cần cho TẤT CẢ các khẩu phần
- "quantity.unit": BẮT BUỘC phải là "g" (gram) cho TẤT CẢ các nguyên liệu. KHÔNG được dùng "ml" hay bất kỳ đơn vị nào khác. Nếu nguyên liệu là chất lỏng, hãy quy đổi sang gram (ví dụ: 1ml nước = 1g, 1ml dầu ăn ≈ 0.92g)
- "quantity.estimate": boolean, true nếu là ước lượng

Trả về 1 JSON object đúng format:
{
  "ingredients": [
    {
      "name": "Thịt heo",
      "quantity": {
        "amount": 300,
        "unit": "g",
        "estimate": false
      }
    }
  ]
}
  `.trim();

  const { result, provider, model } = await analyzeWithFallback(
    null,
    prompt,
    "gemini-2.5-flash"
  );
  console.log(
    `📊 [getIngredients] Kết quả từ: ${provider} (${model})${servings ? ` - Servings: ${servings}` : ""}`
  );
  return result;
};

const getSubstitutionsAndWarnings = async (foodName, restrictions) => {
  const prompt = `
        Món ăn: "${foodName}". 
        Hãy đưa ra các gợi ý thay thế nguyên liệu để phù hợp hơn (ví dụ: thay thế cho người ăn chay, hoặc giảm chất béo/đường). 
        Đồng thời, đưa ra các cảnh báo rõ ràng nếu món ăn KHÔNG PHÙ HỢP với các đối tượng sau: **${restrictions}**.
    `;
  // Gọi hàm analyze mà KHÔNG CÓ ảnh
  const { result, provider, model } = await analyzeWithFallback(
    null,
    prompt,
    "gemini-2.5-flash"
  );
  console.log(
    `📊 [getSubstitutionsAndWarnings] Kết quả từ: ${provider} (${model})`
  );
  return result;

  /* * Cấu trúc JSON mong muốn:
   * {
   * "foodName": "Bánh Mì Kẹp Thịt Nướng",
   * "substitutions": [
   * {"original": "Thịt ba chỉ heo", "suggestion": "Đậu phụ nướng hoặc nấm cho người ăn chay."},
   * {"original": "Đường", "suggestion": "Mật ong."},
   * ],
   * "warnings": [
   * {"message": "Bánh mì trắng và nước sốt có đường có thể làm tăng đường huyết. Nên thay bằng bánh mì nguyên cám và hạn chế đường."},
   * ],
   * "error": null
   * }
   */
};

/**
 * Gợi ý nguyên liệu thay thế cho những nguyên liệu không phù hợp với user
 * @param {Array} ingredientsToSubstitute - Danh sách nguyên liệu cần thay thế [{ingredient: {...}, reason: string, priority: string, reasonType: string}, ...]
 * @param {Array} allIngredients - Danh sách tất cả nguyên liệu (để AI hiểu context)
 * @param {String} userGoal - Mục tiêu của user (lose_weight, gain_weight, maintain_weight)
 * @param {String} instructions - Công thức nấu ăn (để AI giữ đúng cấu trúc món ăn)
 * @param {String} dishName - Tên món ăn (để AI hiểu loại món)
 * @returns {String} JSON string với format: {substitutions: [{original: "Thịt heo", reason: "...", suggestions: ["Đậu phụ", "Nấm"]}]}
 */
const getIngredientSubstitutions = async (
  ingredientsToSubstitute,
  allIngredients,
  userGoal,
  instructions = "",
  dishName = ""
) => {
  // Xử lý danh sách nguyên liệu cần thay thế
  if (!ingredientsToSubstitute || ingredientsToSubstitute.length === 0) {
    return JSON.stringify({ substitutions: [] });
  }

  const ingredientsToSubstituteList = ingredientsToSubstitute
    .map((item) => {
      const ing = item.ingredient;
      const name = ing.name || "";
      const quantity = ing.quantity?.amount
        ? ` (${ing.quantity.amount}${ing.quantity.unit || "g"})`
        : "";
      return {
        name: `${name}${quantity}`,
        reason: item.reason,
        reasonType: item.reasonType || "unknown",
        priority: item.priority || "warning",
      };
    })
    .map((item, idx) => `${idx + 1}. ${item.name} - Lý do: ${item.reason}`)
    .join("\n");

  const allIngredientsList = Array.isArray(allIngredients)
    ? allIngredients
        .map(
          (ing) =>
            `${ing.name}${ing.quantity?.amount ? ` (${ing.quantity.amount}${ing.quantity.unit || "g"})` : ""}`
        )
        .join(", ")
    : "";

  const goalMap = {
    lose_weight: "giảm cân",
    gain_weight: "tăng cân",
    maintain_weight: "duy trì cân nặng",
    giam_can: "giảm cân",
    tang_co: "tăng cân",
    maintain: "duy trì cân nặng",
    can_bang: "duy trì cân nặng",
  };
  const goalText = goalMap[userGoal] || "duy trì sức khỏe";

  // Xác định mục tiêu thay thế dựa trên reasonType
  const reasonTypeMap = {
    allergy:
      "DỊ ỨNG - Buộc phải thay thế vì người dùng bị dị ứng với nguyên liệu này",
    calorie:
      "CALO CAO - Nguyên liệu này đóng góp quá nhiều calo so với mục tiêu hàng ngày",
    sodium: "NATRI CAO - Hàm lượng natri cao so với mục tiêu",
    sugar: "ĐƯỜNG CAO - Hàm lượng đường cao, không phù hợp với mục tiêu",
    fat: "CHẤT BÉO BÃO HÒA CAO - Quá nhiều chất béo bão hòa so với profile user",
    diet: "CHẾ ĐỘ ĂN - Không phù hợp với chế độ ăn của người dùng (ví dụ: ăn chay)",
  };

  const substitutionReasons = ingredientsToSubstitute
    .map((item) => {
      const reasonType = item.reasonType || "unknown";
      const reasonDesc = reasonTypeMap[reasonType] || item.reason;
      return `- ${item.ingredient.name}: ${reasonDesc}`;
    })
    .join("\n");

  // LOG: Thông tin gửi cho AI
  console.log(
    "🔍 [getIngredientSubstitutions] ===== THÔNG TIN GỬI CHO AI ====="
  );
  console.log(
    "📦 ingredientsToSubstitute:",
    JSON.stringify(ingredientsToSubstitute, null, 2)
  );
  console.log("📋 allIngredients count:", allIngredients?.length || 0);
  console.log("🎯 userGoal:", userGoal);
  console.log("🍽️ dishName:", dishName);
  console.log("📝 instructions length:", instructions?.length || 0);
  console.log("📄 substitutionReasons:", substitutionReasons);

  const prompt = `
Bạn là một chuyên gia dinh dưỡng và ẩm thực. Hãy đưa ra gợi ý nguyên liệu thay thế cho những nguyên liệu KHÔNG PHÙ HỢP với người dùng.

THÔNG TIN MÓN ĂN:
${dishName ? `- Tên món: ${dishName}` : ""}
- Tất cả nguyên liệu trong món: ${allIngredientsList}
${instructions ? `- Công thức nấu:\n${instructions}` : ""}

NGUYÊN LIỆU CẦN THAY THẾ VÀ LÝ DO:
${substitutionReasons}

MỤC TIÊU CỦA NGƯỜI DÙNG: ${goalText}

YÊU CẦU QUAN TRỌNG:
1. **GIỮ ĐÚNG CẤU TRÚC MÓN ĂN**: 
   - Phải thay thế bằng nguyên liệu có chức năng tương tự trong món ăn
   - Ví dụ: Mì Ý phải thay bằng loại mì/pasta tương tự, KHÔNG được thay bằng mì tôm
   - Ví dụ: Thịt trong món thịt kho phải thay bằng protein tương tự (thịt khác hoặc đậu phụ), không thay bằng rau
   - Ví dụ: Nước dùng phải giữ nguyên loại (nước dùng gà, bò, chay), chỉ thay nguyên liệu tạo nước dùng

2. **PHÙ HỢP VỚI LÝ DO THAY THẾ**:
   - Nếu lý do là DỊ ỨNG: Thay bằng nguyên liệu hoàn toàn khác, không chứa chất gây dị ứng
   - Nếu lý do là CALO CAO: Thay bằng nguyên liệu ít calo hơn nhưng vẫn giữ được hương vị và cấu trúc
   - Nếu lý do là NATRI/ĐƯỜNG/CHẤT BÉO CAO: Thay bằng nguyên liệu có hàm lượng thấp hơn
   - Nếu lý do là CHẾ ĐỘ ĂN (ăn chay): Thay thịt/cá bằng nguồn protein thực vật (đậu phụ, nấm, đậu, etc.)

3. **TÊN NGUYÊN LIỆU**:
   - Phải là tên phổ biến theo Bảng thành phần thực phẩm Việt Nam
   - Tên đơn giản, dễ hiểu, dễ tìm trong database
   - Không dùng tên kết hợp phức tạp (ví dụ: "Ức gà" thay vì "Ức gà không da")

FORMAT JSON BẮT BUỘC:
{
  "substitutions": [
    {
      "original": "Thịt heo",
      "reason": "Dị ứng: Nguyên liệu này chứa chất bạn bị dị ứng",
      "suggestions": ["Ức gà", "Đậu phụ", "Nấm hương"]
    },
    {
      "original": "Đường trắng",
      "reason": "Đường cao: Hàm lượng đường cao, không phù hợp với mục tiêu",
      "suggestions": ["Mật ong", "Đường thốt nốt"]
    }
  ]
}

LƯU Ý:
- Chỉ trả về JSON, không có markdown code block
- Mỗi nguyên liệu cần thay thế phải có ít nhất 1-3 gợi ý
- Nếu không thể thay thế được (ví dụ: món quá đặc thù), suggestions có thể là mảng rỗng []
- QUAN TRỌNG: Phải giữ đúng cấu trúc và bản chất của món ăn
  `;

  const { result, provider, model } = await analyzeWithFallback(
    null,
    prompt,
    "gemini-2.5-flash"
  );
  console.log(
    `📊 [getIngredientSubstitutions] Kết quả từ: ${provider} (${model})`
  );

  // LOG: Kết quả từ AI
  console.log("✅ [getIngredientSubstitutions] ===== KẾT QUẢ TỪ AI =====");
  console.log("📄 Raw result:", result);
  try {
    const parsed = JSON.parse(result);
    console.log("📦 Parsed result:", JSON.stringify(parsed, null, 2));
    console.log("🔢 Substitutions count:", parsed.substitutions?.length || 0);
  } catch (e) {
    console.error("❌ [getIngredientSubstitutions] Lỗi parse JSON:", e.message);
  }
  console.log("==========================================");

  return result;
};

module.exports = {
  analyzeFoodImage,
  identifyFoodName,
  getRecipe,
  getNutritionByAi,
  getSubstitutionsAndWarnings,
  getRecipeStream,
  getIngredients,
  getIngredientSubstitutions,
};
