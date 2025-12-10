// analyzeController.js (Tối ưu hóa)
const fs = require('fs');
const Recipe = require('../models/Recipe');
const mongoose = require('mongoose');
const { createRecipe, saveRecipeToDB, getVerifiedRecipes, searchRecipesByIngredientName } = require('../services/recipe.service');
// Sửa import: Lấy tất cả các hàm mới
const { 
  identifyFoodName, 
  getRecipe, 
  getNutritionByAi, 
  getSubstitutionsAndWarnings,
  getRecipeStream,
  getIngredients
} = require('../utils/ai_providers/aiInterface'); 
const Analysis = require('../models/Analysis');
const recipeService = require('../services/recipe.service');

const searchByIngredientName = async (req, res) => {
  try {
    const { keyword, page, limit } = req.query;
    const result = await searchRecipesByIngredientName(keyword, { page, limit });

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("searchRecipes error:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tìm kiếm món ăn",
    });
  }
}


//lay danh sach mon an
const getAllRecipe = async (req, res) => {
  try {
    const recipes = await getVerifiedRecipes();
    return res.status(200).json({
      success: true,
      data: recipes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Hàm chính xử lý logic phân tích
const analyzeRecipe = async (req, res, next) => {
  const imageFile = req.file; 
  const modelToUse = req.body.model || 'gemini-2.5-flash'; // Đặt model mặc định rõ ràng hơn
  
  // Đối tượng JSON kết quả phân tích cuối cùng
  let finalAnalysisResult = {
      foodName: "Không xác định",
      recipe: null,
      nutrition: null,
      suggestions: null,
      warnings: null
  }; 
  
  // Đầu vào tùy chọn cho hàm 4
  const userRestrictions = req.body.restrictions || 'Người ăn kiêng, Người cao huyết áp, Người tiểu đường'; 

  // Hàm Parse an toàn và loại bỏ ký tự không mong muốn (```json)
  const safeParse = (text, defaultVal = {}) => {
      if (typeof text !== 'string') return defaultVal;
      try {
          return JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch (e) {
          console.warn(`⚠️ Lỗi Parse JSON: ${e.message}. Trả về giá trị mặc định.`);
          // Trả về một đối tượng chứa chuỗi thô để debug, nếu parse lỗi
          return { error: `Lỗi Parse JSON: ${e.message}`, rawText: text };
      }
  };

  if (!imageFile) {
    return res.status(400).json({ message: 'Vui lòng cung cấp file ảnh.' });
  }

  try {
    // ---------------------------------------------------------------------
    // 🧠 BƯỚC 1: NHẬN DIỆN MÓN ĂN (Tuần tự - SỬ DỤNG HÀM MỚI)
    // ---------------------------------------------------------------------
    console.log('1. Bắt đầu nhận diện món ăn...');
    
    // Sử dụng hàm identifyFoodName từ aiInterface
    const detectionJsonString = await identifyFoodName(imageFile);
    const parsedDetection = safeParse(detectionJsonString);
    
    // Trích xuất Tên món ăn
    let foodName = parsedDetection.foodName || "Không xác định";
    finalAnalysisResult.foodName = foodName;
    
    if (foodName === "Không xác định" || parsedDetection.error) {
        return res.status(400).json({ 
            success: false, 
            message: "Không thể nhận diện món ăn trong hình ảnh.",
            rawDetection: parsedDetection 
        });
    }
    
    console.log(`🍜 Món ăn được nhận diện: **${foodName}**`);
    res.status(200).json({
      success: true,
      foodName: foodName
    });
    // ---------------------------------------------------------------------
    // 🧩 BƯỚC 2: PHÂN TÍCH CHUYÊN SÂU (Song song - SỬ DỤNG CÁC HÀM MỚI)
    // ---------------------------------------------------------------------
    // console.log('2. Bắt đầu phân tích công thức, dinh dưỡng, và lời khuyên (Song song)...');
    
    // const [recipeRes, nutritionRes, adviceRes] = await Promise.allSettled([
    //   getRecipe(foodName), 
    //   calculateNutrition(foodName), // Giả sử hàm 3 được sửa lại để chấp nhận tên món
    //   getSubstitutionsAndWarnings(foodName, userRestrictions), 
    // ]);
    // console.log('Kết quả bước 2:', recipeRes, nutritionRes, adviceRes);
    // // ---------------------------------------------------------------------
    // // 💾 BƯỚC 3: XỬ LÝ VÀ LƯU KẾT QUẢ (Parse và Gán)
    // // ---------------------------------------------------------------------
    
    // // Lấy giá trị chuỗi JSON hoặc chuỗi lỗi
    // const getResultValue = (result) => result.status === 'fulfilled' ? result.value : JSON.stringify({ error: result.reason?.message || 'Không rõ lỗi' });
    
    // // 1. Công thức (recipe)
    // finalAnalysisResult.recipe = safeParse(getResultValue(recipeRes));
    
    // // 2. Dinh dưỡng (totalNutrition)
    // finalAnalysisResult.nutrition = safeParse(getResultValue(nutritionRes));
    
    // // 3. Gợi ý & Cảnh báo (suggestions/warnings)
    // const adviceParsed = safeParse(getResultValue(adviceRes));
    // finalAnalysisResult.suggestions = adviceParsed.substitutions || adviceParsed;
    // finalAnalysisResult.warnings = adviceParsed.warnings || [];

    // // Lưu kết quả HOÀN CHỈNH vào MongoDB
    // const newAnalysis = new Analysis({
    //   inputImagePath: imageFile.path, 
    //   modelUsed: modelToUse,
    //   // Lưu toàn bộ đối tượng đã được parse (chỉ 1 lần stringify cuối cùng)
    //   analysisResult: JSON.stringify(finalAnalysisResult), 
    //   createdAt: new Date(),
    // });
    
    // await newAnalysis.save();
    // console.log(`✅ Lưu phân tích thành công: ${newAnalysis._id}`);

    // // ---------------------------------------------------------------------
    // // ✅ BƯỚC 4: TRẢ VỀ PHẢN HỒI
    // // ---------------------------------------------------------------------
    // res.status(200).json({
    //   success: true,
    //   model: modelToUse,
    //   // Trả về đối tượng JS đã hoàn chỉnh, Frontend chỉ cần parse Response body 1 lần.
    //   analysis: finalAnalysisResult
    // });

  } catch (error) {
    console.error("🚨 Global Error:", error);
    // Nếu có lỗi, luôn dọn dẹp và gọi next() để middleware xử lý lỗi
    next(error); 
  } finally {
    // 🧹 Dọn file tạm
    if (imageFile && fs.existsSync(imageFile.path)) {
      fs.unlink(imageFile.path, (err) => {
          if (err) console.error("Lỗi khi xóa file tạm:", err);
      });
    }
  }
};

const detectImage = async (req, res, next) => {
  const imageFile = req.file; 
  const modelToUse = req.body.model || 'gemini-2.5-flash'; // Đặt model mặc định rõ ràng hơn
  
  let foodName;
  
  // Hàm Parse an toàn và loại bỏ ký tự không mong muốn (```json)
  const safeParse = (text, defaultVal = {}) => {
      if (typeof text !== 'string') return defaultVal;
      try {
          return JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch (e) {
          console.warn(`⚠️ Lỗi Parse JSON: ${e.message}. Trả về giá trị mặc định.`);
          // Trả về một đối tượng chứa chuỗi thô để debug, nếu parse lỗi
          return { error: `Lỗi Parse JSON: ${e.message}`, rawText: text };
      }
  };

  if (!imageFile) {
    return res.status(400).json({ message: 'Vui lòng cung cấp file ảnh.' });
  }

  try {
    console.log('1. Bắt đầu nhận diện món ăn...');
    
    const detectionJsonString = await identifyFoodName(imageFile);
    const parsedDetection = safeParse(detectionJsonString);
    
    // Trích xuất Tên món ăn
    foodName = parsedDetection.foodName || "Không xác định";
    
    if (foodName === "Không xác định" || parsedDetection.error) {
        return res.status(400).json({ 
            message: "Không thể nhận diện món ăn trong hình ảnh.",
            rawDetection: parsedDetection 
        });
    }
    
    console.log(`🍜 Món ăn được nhận diện: **${foodName}**`);
    res.status(200).json({
      foodName: foodName
    });
  } catch (error) {
    console.error("🚨 Global Error:", error);
    // Nếu có lỗi, luôn dọn dẹp và gọi next() để middleware xử lý lỗi
    next(error); 
  } finally {
    // Dọn file tạm
    if (imageFile && fs.existsSync(imageFile.path)) {
      fs.unlink(imageFile.path, (err) => {
          if (err) console.error("Lỗi khi xóa file tạm:", err);
      });
    }
  }
};
const getRecipeById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid recipe ID" });
  }

  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    return res.status(200).json(recipe);
  } catch (error) {
    console.error("Lỗi khi tìm món ăn:", error);
    return res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

const findRecipeByName = async (req, res) => {
  const { foodName } = req.params;

  try {
    const recipe = await Recipe.findOne({
      name: { $regex: new RegExp(foodName, 'i') },
      verified: true
    })
      .select('name ingredients instructions totalNutrition')
      .populate('ingredients', 'name quantity unit')
      .lean();
    if (!recipe) {
      console.log(`❌ Không tìm thấy trong DB: ${foodName}`);

      return res.status(200).json(null);
    }

    console.log(`✅ Đã tìm thấy công thức trong DB: ${recipe.name}`);
    return res.status(200).json(recipe);

  } catch (error) {
    console.error("Lỗi khi tìm mon an:", error);
    return res.status(500).json({ message: "Lỗi server khi tìm công thức.", error: error.message });
  }
};

const safeParse = (text, defaultVal = {}) => {
  if (!text || typeof text !== 'string') return defaultVal;
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (e) {
    console.warn(`Lỗi Parse JSON: ${e.message}. Trả về raw text.`);
    return { error: e.message, rawText: text };
  }
};
const createNewRecipe = async (req, res) => {
  const recipeData = req.body; 

  try {
    const savedRecipe = await saveRecipeToDB(recipeData); 
    return res.status(201).json(savedRecipe);
  } catch (error) {
    console.error(error);
    // Trả về lỗi nếu service báo lỗi
    return res.status(500).json({ message: "Lỗi server khi tạo công thức.", error: error.message });
  }
};

const findIngrAndInstrByAi = async (req, res, next) => {
  const foodName = req.params.foodName || req.body?.foodName;

  if (!foodName) {
    return res.status(400).json({ message: 'Thiếu foodName (params hoặc body).' });
  }

  try {
    console.log('Bắt đầu tìm trong AI cho:', foodName);

    const aiRaw = await getRecipe(foodName);
    const aiData = typeof aiRaw === 'string' ? safeParse(aiRaw) : (aiRaw || {});
    const result = {
      name: foodName,
      ingredients: aiData.ingredients || [],
      instructions: aiData.instructions || [],
    };
    if ((result.ingredients && result.ingredients.length > 0) ||
        (result.instructions && result.instructions.length > 0)) {

      // Tạo object dữ liệu công thức hoàn chỉnh
      const recipeDataToSave = {
        name: result.name,
        description: `Công thức gợi ý bởi AI cho món ${result.name}.`,
        category: "main",
        instructions: result.instructions,
        ingredients: result.ingredients,
        totalNutrition: null, 
        createdBy: 'ai',
        verified: false 
      };
      // saveRecipeToDB(recipeDataToSave)
    }
    return res.status(200).json(result);

  } catch (error) {
    console.error('Global Error:', error);
    return next(error);
  }
};
const findIngredientsByAi = async (req, res, next) => {
  const {recipe} = req.body;

  if (!recipe) {
    return res.status(400).json({ message: 'Thiếu recipe' });
  }

  try {
    console.log('Bắt đầu tìm nguyên liệu bởi AI');

    const aiRaw = await getIngredients(recipe);
    const aiData = typeof aiRaw === 'string' ? safeParse(aiRaw) : (aiRaw || {});
    const result = {
      ingredients: aiData.ingredients || [],
    };
    const dataToSave = {
      ingredients: result.ingredients,
    };
    return res.status(200).json(dataToSave);

  } catch (error) {
    console.error('Global Error:', error);
    return next(error);
  }
};
// const findIngrAndInstrByAi = async (req, res, next) => {
//   const foodName = req.params.foodName || req.body?.foodName;

//   if (!foodName) {
//     return res.status(400).json({ message: 'Thiếu foodName (params hoặc body).' });
//   }

//   try {
//     console.log('🔹 Bắt đầu tìm công thức AI cho:', foodName);

//     let aiRaw = '';

//     // Stream token từ AI
//     await getRecipeStream(foodName, (token) => {
//       aiRaw += token;

//       // 🔹 Log token ngay khi nhận
//       process.stdout.write(token); // hiển thị trực tiếp từng token

//       // Nếu muốn log dạng line: 
//       // console.log(token); 
//     });

//     console.log('\n🔹 Stream AI hoàn tất, bắt đầu parse JSON');

//     // Parse JSON sau khi stream xong
//     const aiData = typeof aiRaw === 'string' ? safeParse(aiRaw) : (aiRaw || {});
//     const result = {
//       name: foodName,
//       ingredients: aiData.ingredients || [],
//       instructions: aiData.instructions || [],
//     };

//     if ((result.ingredients && result.ingredients.length > 0) ||
//         (result.instructions && result.instructions.length > 0)) {

//       const recipeDataToSave = {
//         name: result.name,
//         description: `Công thức gợi ý bởi AI cho món ${result.name}.`,
//         category: "main",
//         instructions: result.instructions,
//         ingredients: result.ingredients,
//         totalNutrition: null, // có thể tính sau
//         createdBy: 'ai',
//         verified: false,
//       };

//       // saveRecipeToDB(recipeDataToSave)
//     }

//     return res.status(200).json(result);

//   } catch (error) {
//     console.error('🔴 Lỗi trong controller findIngrAndInstrByAi:', error);
//     return next(error);
//   }
// };


const getBackUpNutrition = async (req, res) => {
  const {ingrs} = req.body;
  const result = await getNutritionByAi(ingrs);
  return res.status(200).json(result);
}

module.exports = {searchByIngredientName, getAllRecipe, detectImage, findRecipeByName, findIngrAndInstrByAi, getBackUpNutrition, createNewRecipe, getRecipeById, findIngredientsByAi };