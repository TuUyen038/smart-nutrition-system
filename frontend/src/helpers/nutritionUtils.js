/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 * @param {number} age - Age in years
 * @param {string} gender - 'male', 'female', or 'other'
 * @param {number} height - Height in cm
 * @param {number} weight - Weight in kg
 * @returns {number} BMR in calories
 */
export const calculateBMR = (age, gender, height, weight) => {
  if (!age || !height || !weight || !gender) return 0;

  // Mifflin-St Jeor Equation
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else if (gender === "female") {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
  // Average for "other"
  return 10 * weight + 6.25 * height - 5 * age - 78;
};

/**
 * Adjust calories based on user goal
 * @param {number} calories - Base calories (BMR or TDEE)
 * @param {string} goal - 'lose_weight', 'gain_weight', 'maintain_weight', or old format
 * @returns {number} Adjusted calories
 */
export const adjustByGoal = (calories, goal) => {
  switch (goal) {
    case "lose_weight":
    case "giam_can": // Giữ lại để tương thích
      return calories - 500;
    case "gain_weight":
    case "tang_co": // Giữ lại để tương thích
      return calories + 500;
    case "maintain_weight":
    case "maintain": // Giữ lại để tương thích
    case "can_bang": // Giữ lại để tương thích
    case "an_chay": // Giữ lại để tương thích
    case "": // Không chọn
    default:
      return calories;
  }
};

/**
 * Calculate daily calorie goal based on BMR and goal
 * Uses BMR directly (assumes sedentary activity level)
 * For more accuracy, can multiply BMR by activity factor (1.2-1.9)
 * @param {number} age - Age in years
 * @param {string} gender - 'male', 'female', or 'other'
 * @param {number} height - Height in cm
 * @param {number} weight - Weight in kg
 * @param {string} goal - User's goal
 * @param {number} activityFactor - Activity multiplier (default 1.375 for light activity)
 * @returns {number} Daily calorie goal
 */
export const calculateDailyCalorieGoal = (
  age,
  gender,
  height,
  weight,
  goal,
  activityFactor = 1.375
) => {
  const bmr = calculateBMR(age, gender, height, weight);
  if (bmr === 0) return 0;

  // Calculate TDEE (Total Daily Energy Expenditure)
  const tdee = bmr * activityFactor;

  // Adjust based on goal
  return Math.round(adjustByGoal(tdee, goal));
};

/**
 * Calculate consumed calories from daily menu data
 * @param {Array} dailyMenuData - Array of daily menu objects from API
 * @returns {number} Total consumed calories
 */
export const calculateConsumedCalories = (dailyMenuData) => {
  if (!Array.isArray(dailyMenuData)) return 0;

  let totalCalories = 0;

  dailyMenuData.forEach((day) => {
    if (day.recipes && Array.isArray(day.recipes)) {
      day.recipes.forEach((recipe) => {
        // Only count eaten recipes
        if (recipe.status === "eaten" && recipe.totalNutrition?.calories) {
          // Multiply by portion if available
          const portion = recipe.portion || 1;
          totalCalories += recipe.totalNutrition.calories * portion;
        }
      });
    }
  });

  return Math.round(totalCalories);
};

/**
 * Check if recipe ingredients contain any user allergies
 * @param {Array} recipeIngredients - Array of ingredient objects with 'name' property
 * @param {Array} userAllergies - Array of allergy strings
 * @returns {Array} Array of matching allergy ingredients
 */
export const checkAllergyIngredients = (recipeIngredients, userAllergies) => {
  if (!userAllergies || userAllergies.length === 0) return [];
  if (!recipeIngredients || recipeIngredients.length === 0) return [];

  const allergyIngredients = recipeIngredients.filter((ing) => {
    const ingName = (ing.name || "").toLowerCase();
    return userAllergies.some((allergy) => {
      const allergyLower = allergy.toLowerCase();
      return ingName.includes(allergyLower) || allergyLower.includes(ingName);
    });
  });

  return allergyIngredients;
};

/**
 * Calculate consumed nutrition from today's menu
 * @param {Array} dailyMenuData - Array of daily menu objects
 * @returns {Object} Consumed nutrition { calories, protein, fat, carbs, fiber, sugar, sodium }
 */
export const calculateConsumedNutrition = (dailyMenuData) => {
  const consumed = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  };

  if (!Array.isArray(dailyMenuData)) return consumed;

  dailyMenuData.forEach((day) => {
    if (day.recipes && Array.isArray(day.recipes)) {
      day.recipes.forEach((recipe) => {
        // Only count eaten recipes
        if (recipe.status === "eaten" && recipe.totalNutrition) {
          const portion = recipe.portion || 1;
          const nutrition = recipe.totalNutrition;
          consumed.calories += (nutrition.calories || 0) * portion;
          consumed.protein += (nutrition.protein || 0) * portion;
          consumed.fat += (nutrition.fat || 0) * portion;
          consumed.carbs += (nutrition.carbs || 0) * portion;
          consumed.fiber += (nutrition.fiber || 0) * portion;
          consumed.sugar += (nutrition.sugar || 0) * portion;
          consumed.sodium += (nutrition.sodium || 0) * portion;
        }
      });
    }
  });

  // Round values
  Object.keys(consumed).forEach((key) => {
    consumed[key] = Math.round(consumed[key] * 100) / 100;
  });

  return consumed;
};

/**
 * Calculate daily nutrition limits based on user profile
 * Đảm bảo tổng P+F+C = 100% calories và nằm trong AMDR
 *
 * AMDR (Acceptable Macronutrient Distribution Range):
 * - Protein: 10-35% calories
 * - Fat: 20-35% calories
 * - Carbs: 45-65% calories
 *
 * @param {Object} userInfo - User info { age, gender, height, weight, goal }
 * @param {number} dailyCalorieGoal - Daily calorie goal
 * @returns {Object} Daily nutrition limits { protein, fat, carbs, fiber, sodium, sugar }
 */
export const calculateDailyNutritionLimits = (userInfo, dailyCalorieGoal) => {
  const weight = userInfo?.weight || 0;
  const gender = userInfo?.gender || "male";
  const goal = userInfo?.goal || "maintain_weight";

  if (!dailyCalorieGoal || dailyCalorieGoal <= 0) {
    // Fallback values
    return {
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: gender === "male" ? 38 : 25,
      sodium: 2000,
      sugar: 0,
    };
  }

  // =====================
  // 1. PROTEIN: Tính theo g/kg (ưu tiên theo goal)
  // =====================
  let proteinPerKg = 1.0; // Default
  if (goal === "lose_weight" || goal === "giam_can") {
    proteinPerKg = 1.6; // Higher protein for weight loss
  } else if (goal === "gain_weight" || goal === "tang_co") {
    proteinPerKg = 1.8; // Higher protein for muscle gain
  }

  let dailyProteinGrams = weight > 0 ? weight * proteinPerKg : 0;
  let proteinCalories = dailyProteinGrams * 4; // 1g protein = 4 kcal
  let proteinPercent = (proteinCalories / dailyCalorieGoal) * 100;

  // Kiểm tra và điều chỉnh Protein để nằm trong AMDR (10-35%)
  const PROTEIN_MIN_PERCENT = 10;
  const PROTEIN_MAX_PERCENT = 35;

  if (proteinPercent < PROTEIN_MIN_PERCENT) {
    // Tăng protein lên 10%
    proteinCalories = dailyCalorieGoal * (PROTEIN_MIN_PERCENT / 100);
    dailyProteinGrams = Math.round(proteinCalories / 4);
    proteinPercent = PROTEIN_MIN_PERCENT;
  } else if (proteinPercent > PROTEIN_MAX_PERCENT) {
    // Giảm protein xuống 35%
    proteinCalories = dailyCalorieGoal * (PROTEIN_MAX_PERCENT / 100);
    dailyProteinGrams = Math.round(proteinCalories / 4);
    proteinPercent = PROTEIN_MAX_PERCENT;
  }

  // =====================
  // 2. FAT: 30% (trong AMDR 20-35%)
  // =====================
  let fatCalories = dailyCalorieGoal * 0.3;
  let fatPercent = 30;
  let dailyFatGrams = Math.round(fatCalories / 9); // 1g fat = 9 kcal

  // =====================
  // 3. CARBS: Phần còn lại (đảm bảo tổng = 100%)
  // =====================
  let carbsCalories = dailyCalorieGoal - proteinCalories - fatCalories;
  let carbsPercent = (carbsCalories / dailyCalorieGoal) * 100;
  let dailyCarbsGrams = Math.round(carbsCalories / 4); // 1g carbs = 4 kcal

  // Kiểm tra Carbs có trong AMDR (45-65%) không?
  const CARBS_MIN_PERCENT = 45;
  const CARBS_MAX_PERCENT = 65;

  if (carbsPercent < CARBS_MIN_PERCENT) {
    // Carbs quá thấp → Giảm Fat để tăng Carbs
    // Cần: Carbs >= 45% → Carbs (kcal) >= dailyCalorieGoal × 0.45
    const targetCarbsCalories = dailyCalorieGoal * (CARBS_MIN_PERCENT / 100);
    const maxFatCalories = dailyCalorieGoal - proteinCalories - targetCarbsCalories;

    // Đảm bảo Fat vẫn trong AMDR (20-35%)
    const FAT_MIN_PERCENT = 20;
    const FAT_MAX_PERCENT = 35;
    const minFatCalories = dailyCalorieGoal * (FAT_MIN_PERCENT / 100);

    if (maxFatCalories >= minFatCalories) {
      // Có thể giảm Fat
      fatCalories = maxFatCalories;
      fatPercent = (fatCalories / dailyCalorieGoal) * 100;
      dailyFatGrams = Math.round(fatCalories / 9);

      // Recalculate Carbs
      carbsCalories = dailyCalorieGoal - proteinCalories - fatCalories;
      carbsPercent = (carbsCalories / dailyCalorieGoal) * 100;
      dailyCarbsGrams = Math.round(carbsCalories / 4);
    }
    // Nếu không thể giảm Fat (sẽ < 20%), giữ nguyên và chấp nhận Carbs < 45%
  } else if (carbsPercent > CARBS_MAX_PERCENT) {
    // Carbs quá cao → Tăng Fat để giảm Carbs
    // Cần: Carbs <= 65% → Carbs (kcal) <= dailyCalorieGoal × 0.65
    const targetCarbsCalories = dailyCalorieGoal * (CARBS_MAX_PERCENT / 100);
    const minFatCalories = dailyCalorieGoal - proteinCalories - targetCarbsCalories;

    // Đảm bảo Fat vẫn trong AMDR (20-35%)
    const FAT_MAX_PERCENT = 35;
    const maxFatCalories = dailyCalorieGoal * (FAT_MAX_PERCENT / 100);

    if (minFatCalories <= maxFatCalories) {
      // Có thể tăng Fat
      fatCalories = minFatCalories;
      fatPercent = (fatCalories / dailyCalorieGoal) * 100;
      dailyFatGrams = Math.round(fatCalories / 9);

      // Recalculate Carbs
      carbsCalories = dailyCalorieGoal - proteinCalories - fatCalories;
      carbsPercent = (carbsCalories / dailyCalorieGoal) * 100;
      dailyCarbsGrams = Math.round(carbsCalories / 4);
    }
    // Nếu không thể tăng Fat (sẽ > 35%), giữ nguyên và chấp nhận Carbs > 65%
  }

  // =====================
  // 4. FIBER: 14g/1000kcal (khuyến nghị VA, Academy of Nutrition and Dietetics)
  // =====================
  const fiberPer1000kcal = 14;
  let dailyFiberLimit = Math.round((dailyCalorieGoal / 1000) * fiberPer1000kcal);

  // Giới hạn theo giới tính (Nam: 30-38g, Nữ: 21-25g)
  if (gender === "male") {
    dailyFiberLimit = Math.min(dailyFiberLimit, 38); // Max 38g
    dailyFiberLimit = Math.max(dailyFiberLimit, 30); // Min 30g
  } else {
    dailyFiberLimit = Math.min(dailyFiberLimit, 25); // Max 25g
    dailyFiberLimit = Math.max(dailyFiberLimit, 21); // Min 21g
  }

  // =====================
  // 5. SODIUM: <2000mg/ngày (WHO khuyến nghị)
  // =====================
  const dailySodiumLimit = 2000; // mg

  // =====================
  // 6. SUGAR: <5% calories (WHO khuyến nghị - mức tốt nhất)
  // =====================
  // WHO: <10% (tối đa), <5% (khuyến nghị)
  // Sử dụng 5% làm limit
  const sugarPercent = 5; // 5% calories
  const sugarCalories = dailyCalorieGoal * (sugarPercent / 100);
  const dailySugarLimit = Math.round(sugarCalories / 4); // 1g sugar = 4 kcal

  // Debug log (có thể xóa sau)
  console.log("📊 Nutrition Limits Calculation:", {
    dailyCalorieGoal,
    protein: { grams: dailyProteinGrams, percent: proteinPercent.toFixed(1) + "%" },
    fat: { grams: dailyFatGrams, percent: fatPercent.toFixed(1) + "%" },
    carbs: { grams: dailyCarbsGrams, percent: carbsPercent.toFixed(1) + "%" },
    totalPercent: (proteinPercent + fatPercent + carbsPercent).toFixed(1) + "%",
    fiber: dailyFiberLimit,
    sodium: dailySodiumLimit,
    sugar: dailySugarLimit,
  });

  return {
    protein: Math.round(dailyProteinGrams),
    fat: dailyFatGrams,
    carbs: dailyCarbsGrams,
    fiber: dailyFiberLimit,
    sodium: dailySodiumLimit,
    sugar: dailySugarLimit,
  };
};

/**
 * Generate warnings and suggestions for a recipe
 * Rule:
 * 1. Dị ứng (cao nhất) - xuất hiện đầu tiên
 * 2. Dinh dưỡng vượt quá lượng còn lại có thể nạp - chỉ cảnh báo nếu vượt
 * @param {Object} recipeNutrition - Recipe nutrition object { calories, protein, fat, carbs, ... }
 * @param {Array} recipeIngredients - Array of ingredient objects
 * @param {Object} userInfo - User info { age, gender, height, weight, goal, allergies }
 * @param {Object} consumedNutrition - Nutrition already consumed today { calories, protein, fat, ... }
 * @param {number} dailyCalorieGoal - Daily calorie goal
 * @returns {Array} Array of warning objects { type: 'error'|'warning', message: string }
 */
export const generateRecipeWarnings = (
  recipeNutrition,
  recipeIngredients,
  userInfo,
  consumedNutrition,
  dailyCalorieGoal
) => {
  const warnings = [];

  if (!recipeNutrition || !recipeNutrition.calories) {
    return warnings;
  }

  // 1. CHECK ALLERGY FIRST (cao nhất, xuất hiện đầu tiên)
  if (userInfo && userInfo.allergies && userInfo.allergies.length > 0) {
    const allergyIngredients = checkAllergyIngredients(recipeIngredients, userInfo.allergies);
    if (allergyIngredients.length > 0) {
      const allergyNames = allergyIngredients.map((ing) => ing.name).join(", ");
      warnings.push({
        type: "error",
        message: `CẢNH BÁO DỊ ỨNG: Món này chứa nguyên liệu bạn bị dị ứng: ${allergyNames}`,
        reasonType: "allergy",
        allergyIngredients: allergyIngredients.map((ing) => ing.name),
      });
    }
  }

  // 2. CHECK NUTRITION EXCEEDS DAILY INTAKE (chỉ cảnh báo nếu vượt quá lượng còn lại)
  if (!consumedNutrition) {
    consumedNutrition = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };
  }

  // Calculate daily limits
  const dailyLimits = calculateDailyNutritionLimits(userInfo, dailyCalorieGoal);

  // Helper function to check if nutrition exceeds remaining limit
  const checkNutritionExceed = (
    nutrientName,
    recipeValue,
    consumedValue,
    dailyLimit,
    unit,
    precision = 0
  ) => {
    const remaining = dailyLimit - consumedValue;
    const totalAfter = consumedValue + recipeValue;

    // Chỉ cảnh báo nếu vượt quá limit
    if (totalAfter > dailyLimit) {
      const excess = totalAfter - dailyLimit;
      warnings.push({
        type: "warning",
        message: `Cảnh báo: Món này sẽ khiến bạn vượt ${excess.toFixed(
          precision
        )} ${unit} ${nutrientName} so với khuyến nghị hàng ngày (${dailyLimit.toFixed(
          precision
        )} ${unit}). Bạn đã tiêu thụ ${consumedValue.toFixed(
          precision
        )} ${unit}, còn lại ${Math.max(0, remaining).toFixed(precision)} ${unit}.`,
        reasonType: nutrientName.toLowerCase(),
      });
    }
  };

  // Chỉ cảnh báo cho: Fat, Sodium (muối), Sugar (đường)
  // Bỏ qua cảnh báo cho: Calories, Protein, Carbs, Fiber

  // Fat warning
  checkNutritionExceed(
    "fat",
    recipeNutrition.fat || 0,
    consumedNutrition.fat || 0,
    dailyLimits.fat,
    "g",
    1
  );

  // Sodium warning (muối)
  checkNutritionExceed(
    "sodium",
    recipeNutrition.sodium || 0,
    consumedNutrition.sodium || 0,
    dailyLimits.sodium,
    "mg",
    0
  );

  // Sugar warning (đường)
  checkNutritionExceed(
    "sugar",
    recipeNutrition.sugar || 0,
    consumedNutrition.sugar || 0,
    dailyLimits.sugar,
    "g",
    1
  );

  return warnings;
};

/**
 * Xác định nguyên liệu cần thay thế dựa trên warnings
 * Gắn đúng reason với nguyên liệu từ warning message
 * @param {Array} warnings - Array of warning objects { type, message, reasonType, ... }
 * @param {Array} recipeIngredients - Array of ingredient objects
 * @param {Object} userInfo - User info { allergies, goal }
 * @returns {Array} Array of objects { ingredient: {...}, reason: string, priority: 'error'|'warning', reasonType: string }
 */
export const identifyIngredientsToSubstitute = (warnings, recipeIngredients, userInfo) => {
  const ingredientsToSubstitute = [];

  if (!warnings || warnings.length === 0 || !recipeIngredients || recipeIngredients.length === 0) {
    return ingredientsToSubstitute;
  }

  // 1. Xác định nguyên liệu gây dị ứng (từ allergy warnings)
  const allergyWarnings = warnings.filter((w) => w.reasonType === "allergy");
  if (allergyWarnings.length > 0) {
    allergyWarnings.forEach((warning) => {
      // Lấy danh sách nguyên liệu dị ứng từ warning
      const allergyNames = warning.allergyIngredients || [];
      if (allergyNames.length > 0) {
        // Tìm nguyên liệu trong recipeIngredients
        recipeIngredients.forEach((ing) => {
          const ingName = (ing.name || "").toLowerCase();
          const isAllergyIngredient = allergyNames.some((allergyName) => {
            const allergyLower = allergyName.toLowerCase();
            return ingName.includes(allergyLower) || allergyLower.includes(ingName);
          });

          if (isAllergyIngredient) {
            // Kiểm tra xem đã có trong danh sách chưa
            const exists = ingredientsToSubstitute.some(
              (item) => item.ingredient.name === ing.name
            );
            if (!exists) {
              ingredientsToSubstitute.push({
                ingredient: ing,
                reason: `Dị ứng: Nguyên liệu này chứa chất bạn bị dị ứng`,
                priority: "error",
                reasonType: "allergy",
              });
            }
          }
        });
      }
    });
  }

  // 2. Xác định nguyên liệu có calo cao (nếu có warning về calo)
  const calorieWarnings = warnings.filter((w) => w.reasonType === "calorie");
  if (calorieWarnings.length > 0) {
    // Danh sách từ khóa thường gặp ở nguyên liệu có calo cao
    const highCalorieKeywords = [
      "thịt ba chỉ",
      "thịt mỡ",
      "dầu",
      "mỡ",
      "đường",
      "đường trắng",
      "bơ",
      "phô mai",
      "kem",
      "sữa đặc",
      "sữa béo",
    ];

    recipeIngredients.forEach((ing) => {
      const ingName = (ing.name || "").toLowerCase();
      const isHighCalorie = highCalorieKeywords.some((keyword) => ingName.includes(keyword));

      if (isHighCalorie) {
        // Kiểm tra xem đã có trong danh sách chưa
        const exists = ingredientsToSubstitute.some((item) => item.ingredient.name === ing.name);
        if (!exists) {
          ingredientsToSubstitute.push({
            ingredient: ing,
            reason: `Calo cao: Nguyên liệu này có thể đóng góp nhiều calo so với mục tiêu hàng ngày`,
            priority: "error",
            reasonType: "calorie",
          });
        }
      }
    });
  }

  // 3. Xác định nguyên liệu có natri cao (nếu có warning về natri)
  const sodiumWarnings = warnings.filter((w) => w.reasonType === "sodium");
  if (sodiumWarnings.length > 0) {
    // Danh sách từ khóa thường gặp ở nguyên liệu có natri cao
    const highSodiumKeywords = [
      "muối",
      "nước mắm",
      "nước tương",
      "bột canh",
      "hạt nêm",
      "phô mai",
      "thịt nguội",
      "xúc xích",
      "thịt xông khói",
    ];

    recipeIngredients.forEach((ing) => {
      const ingName = (ing.name || "").toLowerCase();
      const isHighSodium = highSodiumKeywords.some((keyword) => ingName.includes(keyword));

      if (isHighSodium) {
        // Kiểm tra xem đã có trong danh sách chưa
        const exists = ingredientsToSubstitute.some((item) => item.ingredient.name === ing.name);
        if (!exists) {
          ingredientsToSubstitute.push({
            ingredient: ing,
            reason: `Natri cao: Nguyên liệu này có thể đóng góp nhiều natri so với khuyến nghị hàng ngày`,
            priority: "warning",
            reasonType: "sodium",
          });
        }
      }
    });
  }

  // 4. Xác định nguyên liệu có đường cao (nếu có warning về đường)
  const sugarWarnings = warnings.filter((w) => w.reasonType === "sugar");
  if (sugarWarnings.length > 0) {
    // Danh sách từ khóa thường gặp ở nguyên liệu có đường cao
    const highSugarKeywords = [
      "đường",
      "đường trắng",
      "đường nâu",
      "mật ong",
      "siro",
      "kẹo",
      "sữa đặc",
      "kem",
    ];

    recipeIngredients.forEach((ing) => {
      const ingName = (ing.name || "").toLowerCase();
      const isHighSugar = highSugarKeywords.some((keyword) => ingName.includes(keyword));

      if (isHighSugar) {
        // Kiểm tra xem đã có trong danh sách chưa
        const exists = ingredientsToSubstitute.some((item) => item.ingredient.name === ing.name);
        if (!exists) {
          ingredientsToSubstitute.push({
            ingredient: ing,
            reason: `Đường cao: Nguyên liệu này có thể đóng góp nhiều đường so với khuyến nghị hàng ngày`,
            priority: "warning",
            reasonType: "sugar",
          });
        }
      }
    });
  }

  // 5. Xác định nguyên liệu có protein cao (nếu có warning về protein)
  const proteinWarnings = warnings.filter((w) => w.reasonType === "protein");
  if (proteinWarnings.length > 0) {
    const highProteinKeywords = [
      "thịt",
      "cá",
      "tôm",
      "cua",
      "trứng",
      "sữa",
      "đậu phụ",
      "đậu",
      "hạt",
      "phô mai",
    ];

    recipeIngredients.forEach((ing) => {
      const ingName = (ing.name || "").toLowerCase();
      const isHighProtein = highProteinKeywords.some((keyword) => ingName.includes(keyword));

      if (isHighProtein) {
        const exists = ingredientsToSubstitute.some((item) => item.ingredient.name === ing.name);
        if (!exists) {
          ingredientsToSubstitute.push({
            ingredient: ing,
            reason: `Protein cao: Nguyên liệu này có thể đóng góp nhiều protein so với khuyến nghị hàng ngày`,
            priority: "warning",
            reasonType: "protein",
          });
        }
      }
    });
  }

  // 6. Xác định nguyên liệu có fat cao (nếu có warning về fat)
  const fatWarnings = warnings.filter((w) => w.reasonType === "fat");
  if (fatWarnings.length > 0) {
    const highFatKeywords = [
      "dầu",
      "mỡ",
      "bơ",
      "thịt mỡ",
      "thịt ba chỉ",
      "phô mai",
      "kem",
      "sữa béo",
      "hạt",
    ];

    recipeIngredients.forEach((ing) => {
      const ingName = (ing.name || "").toLowerCase();
      const isHighFat = highFatKeywords.some((keyword) => ingName.includes(keyword));

      if (isHighFat) {
        const exists = ingredientsToSubstitute.some((item) => item.ingredient.name === ing.name);
        if (!exists) {
          ingredientsToSubstitute.push({
            ingredient: ing,
            reason: `Chất béo cao: Nguyên liệu này có thể đóng góp nhiều chất béo so với khuyến nghị hàng ngày`,
            priority: "warning",
            reasonType: "fat",
          });
        }
      }
    });
  }

  // 7. Xác định nguyên liệu có carbs cao (nếu có warning về carbs)
  const carbsWarnings = warnings.filter((w) => w.reasonType === "carbs");
  if (carbsWarnings.length > 0) {
    const highCarbsKeywords = [
      "gạo",
      "bún",
      "mì",
      "bánh mì",
      "khoai",
      "ngô",
      "bột",
      "đường",
      "mật ong",
    ];

    recipeIngredients.forEach((ing) => {
      const ingName = (ing.name || "").toLowerCase();
      const isHighCarbs = highCarbsKeywords.some((keyword) => ingName.includes(keyword));

      if (isHighCarbs) {
        const exists = ingredientsToSubstitute.some((item) => item.ingredient.name === ing.name);
        if (!exists) {
          ingredientsToSubstitute.push({
            ingredient: ing,
            reason: `Carbohydrate cao: Nguyên liệu này có thể đóng góp nhiều carbohydrate so với khuyến nghị hàng ngày`,
            priority: "warning",
            reasonType: "carbs",
          });
        }
      }
    });
  }

  // 8. Xác định nguyên liệu có fiber cao (nếu có warning về fiber)
  // Lưu ý: Fiber thường tốt cho sức khỏe, nhưng nếu vượt quá nhiều có thể gây khó tiêu
  const fiberWarnings = warnings.filter((w) => w.reasonType === "fiber");
  if (fiberWarnings.length > 0) {
    const highFiberKeywords = ["rau", "củ", "quả", "đậu", "hạt", "ngũ cốc", "yến mạch"];

    recipeIngredients.forEach((ing) => {
      const ingName = (ing.name || "").toLowerCase();
      const isHighFiber = highFiberKeywords.some((keyword) => ingName.includes(keyword));

      if (isHighFiber) {
        const exists = ingredientsToSubstitute.some((item) => item.ingredient.name === ing.name);
        if (!exists) {
          ingredientsToSubstitute.push({
            ingredient: ing,
            reason: `Chất xơ cao: Nguyên liệu này có thể đóng góp nhiều chất xơ so với khuyến nghị hàng ngày`,
            priority: "warning",
            reasonType: "fiber",
          });
        }
      }
    });
  }

  return ingredientsToSubstitute;
};
