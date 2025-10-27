// src/services/meal.service.js

const Meal = require('../models/Meal');
const MealPlan = require('../models/MealPlan');
const { calculateTotalNutrition } = require('../utils/calTotalNutri');
const mongoose = require('mongoose');

exports.createMeal = async(data) => {
    const { userId, mealType, date, recipes } = data;

    if (!userId || !mealType || !date || !recipes?.length) {
      throw new Error("Missing required fields");
    }

    const totalNutrition = await calculateTotalNutrition(recipes);

    const meal = await Meal.create({
      ...data,
      totalNutrition
    });

    return meal;
  }
/**
 * Lấy lịch sử ăn uống (Các Meal đã 'done').
 */
exports.getMealHistory = async (userId) => {
    return Meal.find({ userId, status: "completed" })
        .sort({ date: -1 })
        .populate({
            path: 'recipes._id',
            model: 'Recipe',
            select: 'date name imageUrl totalNutrition' 
        });
};

// src/services/meal.service.js

/**
 * Lấy chi tiết một Meal cụ thể, bao gồm thông tin chi tiết của các công thức (Recipe).
 * @param {ObjectId} userId - ID người dùng để kiểm tra quyền sở hữu.
 * @param {ObjectId} mealId - ID của Meal cần lấy chi tiết.
 * @returns {Meal} - Bản ghi Meal với các Recipe đã được populate.
 */
exports.getMealDetail = async (userId, mealId) => {
  // 1. Tìm Meal theo ID và xác minh quyền sở hữu
  const meal = await Meal.findOne({ 
    userId: userId, 
    _id: mealId 
  })
  // 2. Sử dụng populate để thay thế recipeId bằng dữ liệu chi tiết của Recipe
  .populate({
    path: 'recipes.recipeId',
    model: 'Recipe', // Tên Model của công thức
    // Chỉ lấy các trường cần thiết để hiển thị (ví dụ: tên, ảnh, dinh dưỡng gốc)
    select: 'name description imageUrl totalNutrition' 
  })
  // 3. (Tùy chọn) Populate tham chiếu ngược đến MealPlan
  .populate({
    path: 'mealPlanId',
    model: 'MealPlan', // Tên Model MealPlan
    select: 'status startDate'
  })
  .exec(); // Thực thi truy vấn

  if (!meal) {
    throw new Error('Meal not found or access denied.');
  }

  // Nếu Meal là bản đã chỉnh sửa, có thể thêm logic lấy bản gốc AI để so sánh
  if (meal.originalMealId) {
    // Có thể populate thêm originalMealId tại đây hoặc để Controller xử lý việc này
  }

  return meal;
};

/**
 * Thêm một công thức vào bữa ăn cụ thể hoặc tạo Meal mới.
 */
exports.addRecipeToMeal = async (userId, mealData) => {
    const { date, mealType, recipeId, portion = 1.0 } = mealData;

    // 1. Tìm Meal hiện có cho ngày/loại bữa ăn này
    // Chú ý: Chỉ tìm các Meal đang "hoạt động" hoặc "gợi ý", không tìm các Meal đã "archived_suggestion"
    let meal = await Meal.findOne({
        userId,
        date: new Date(date),
        mealType,
        status: { $in: ['suggested', 'selected', 'edited'] } 
    });
    
    let isNewMeal = false;
    let originalMeal = null; // Biến để giữ bản ghi gốc (nếu là gợi ý AI)

    if (!meal) {
        // TRƯỜNG HỢP A: TẠO MEAL MỚI (Người dùng tự thêm)
        meal = new Meal({
            userId,
            date: new Date(date),
            mealType,
            source: 'user', 
            status: 'selected', 
            recipes: [],
        });
        isNewMeal = true;
    } else if (meal.status === 'suggested' && meal.source === 'ai') {
        // TRƯỜNG HỢP B: NHÂN BẢN MEAL GỐC (Chỉnh sửa gợi ý AI)
        
        originalMeal = meal; // Lưu bản gốc A

        // 1. Lưu trữ bản gốc A
        originalMeal.status = 'archived_suggestion';
        await originalMeal.save();

        // 2. Tạo bản ghi mới B (Bản sao/chỉnh sửa)
        // Dùng Mongoose's toObject() và tạo ObjectId mới để nhân bản
        const clonedMealData = originalMeal.toObject();
        delete clonedMealData._id;
        delete clonedMealData.createdAt;
        delete clonedMealData.updatedAt;
        
        meal = new Meal({
            ...clonedMealData,
            _id: new mongoose.Types.ObjectId(), // Gán ID mới
            source: 'user', // Nguồn là người dùng đã chỉnh sửa
            status: 'edited',
            originalMealId: originalMeal._id, // Trỏ về bản gốc A
        });
        
        // Cập nhật MealPlan
        if (originalMeal.mealPlanId) {
          exports.updateMealPlanOnMealClone(
          originalMeal.mealPlanId, 
          oldMealId, 
          meal._id // ID của Meal B
          );
        }
    } else if (meal.status === 'edited' || meal.status === 'selected') {
        // TRƯỜNG HỢP C: CẬP NHẬT MEAL ĐÃ CÓ (Đã được chọn/chỉnh sửa)
        meal.status = 'edited'; // Bất kỳ sự thay đổi nào cũng coi là chỉnh sửa
    }

    // 3. Thêm công thức mới vào mảng (Áp dụng cho mọi trường hợp)
    const newRecipe = { recipeId, portion, mealType };
    
    // Kiểm tra trùng lặp trước khi thêm
    const existingRecipe = meal.recipes.find(r => r.recipeId.toString() === recipeId);
    if (existingRecipe) {
        // Có thể tăng khẩu phần thay vì thêm mới
        existingRecipe.portion += portion; 
    } else {
        meal.recipes.push(newRecipe);
    }
    
    // 4. Tính toán lại tổng dinh dưỡng
    meal.totalNutrition = await calculateTotalNutrition(meal.recipes);
    
    await meal.save();
    
    return meal;
};

/**
 * [Hàm Phụ Trợ] Kiểm tra trạng thái của tất cả các Meals trong một MealPlan
 * để xác định trạng thái mới cho MealPlan đó.
 */
async function checkAndUpdateMealPlanStatus(mealPlanId) {
    if (!mealPlanId) return;

    // 1. Lấy tất cả Meals thuộc Plan
    const mealsInPlan = await Meal.find({ mealPlanId: mealPlanId });
    
    // 2. Phân loại trạng thái
    const totalMeals = mealsInPlan.length;
    const completedMeals = mealsInPlan.filter(m => m.status === 'done').length;
    const cancelledMeals = mealsInPlan.filter(m => m.status === 'cancelled').length;
    
    // Số bữa ăn VẪN ĐANG CHỜ (selected, suggested, edited)
    const pendingMeals = totalMeals - completedMeals - cancelledMeals;

    let newPlanStatus = null;

    if (totalMeals === 0) {
        // Nếu không còn Meal nào (trường hợp hiếm, nên hủy Plan)
        newPlanStatus = 'cancelled'; 
    } else if (pendingMeals === 0) {
        // TẤT CẢ meals đã done HOẶC cancelled (Plan đã kết thúc)
        newPlanStatus = 'past'; 
    } 
    // Nếu vẫn còn pendingMeals > 0, Plan vẫn ở trạng thái 'selected' hoặc 'suggested'
    // Ta không cần thay đổi trạng thái MealPlan trong trường hợp này.
    
    if (newPlanStatus) {
        await MealPlan.findByIdAndUpdate(mealPlanId, { status: newPlanStatus });
    }
}


/**
 * Cập nhật trạng thái bữa ăn (done/cancelled/selected/edited).
 */
exports.updateMealStatus = async (mealId, newStatus) => {
    const meal = await Meal.findById(mealId);
    
    if (!meal) {
        throw new Error('Meal not found');
    }
    
    // Kiểm tra xem trạng thái mới có hợp lệ trong enum không
    const validStatuses = ["suggested", "selected", "edited", "done", "cancelled", "archived_suggestion"];
    if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}`);
    }

    const oldStatus = meal.status;
    meal.status = newStatus;

    // Lưu Meal trước
    await meal.save();

    // Logic kiểm tra ảnh hưởng đến MealPlan chỉ cần thiết khi trạng thái kết thúc thay đổi
    if (meal.mealPlanId && (newStatus === 'done' || newStatus === 'cancelled') && oldStatus !== newStatus) {
        
        // GỌI HÀM PHỤ TRỢ để kiểm tra và cập nhật Plan
        await checkAndUpdateMealPlanStatus(meal.mealPlanId);
    }
    
    return meal;
};


/**
 * Cập nhật một Meal hiện có, bao gồm cả việc thêm/xóa/sửa công thức 
 * và tính toán lại dinh dưỡng.
 * * @param {string} mealId - ID của Meal cần cập nhật.
 * @param {object} updateData - Dữ liệu cập nhật (ví dụ: recipes, note, date).
 * @param {string} userId - ID người dùng để kiểm tra quyền sở hữu.
 * @returns {Meal} - Bản ghi Meal đã được cập nhật.
 */
exports.updateMeal = async (mealId, updateData, userId) => {
    let meal = await Meal.findById(mealId);

    if (!meal) {
        throw new Error('Meal not found.');
    }

    // // 1. Kiểm tra quyền sở hữu (Security check)
    // if (meal.userId.toString() !== userId.toString()) {
    //     throw new Error('Permission denied. User does not own this meal.');
    // }

    const oldStatus = meal.status;
    const oldMealId = meal._id;
    let newMeal = meal; // Mặc định là bản gốc, sẽ thay đổi nếu có clone

    // 2. Xử lý logic nhân bản (Cloning) nếu người dùng chỉnh sửa gợi ý AI gốc
    // Chỉ nhân bản nếu là gợi ý AI VÀ đang ở trạng thái suggested VÀ có chỉnh sửa recipes
    if (meal.source === 'ai' && oldStatus === 'suggested' && updateData.recipes) {
        
        // a. Lưu trữ bản gốc A (archive the original suggestion)
        // Chuyển bản gốc sang trạng thái lưu trữ để không hiển thị trong Plan
        meal.status = 'archived_suggestion';
        await meal.save();

        // b. Tạo bản ghi mới B (Bản sao/chỉnh sửa)
        const clonedMealData = meal.toObject();
        // Loại bỏ các trường tự động tạo để Mongoose tạo mới
        delete clonedMealData._id;
        delete clonedMealData.createdAt;
        delete clonedMealData.updatedAt;

        newMeal = new Meal({
            ...clonedMealData,
            _id: new mongoose.Types.ObjectId(),
            source: 'user', // Nguồn từ người dùng (đã chỉnh sửa/chốt)
            status: 'edited', // Trạng thái là bản đã được chỉnh sửa
            originalMealId: oldMealId, // Trỏ về bản gốc A (để truy vết)
            
            // NOTE: TotalNutrition sẽ được tính lại ở bước 5
        });

        // c. Cập nhật MealPlan (Nếu có)
        if (meal.mealPlanId) {
            // SỬA LỖI CÚ PHÁP: Gọi phương thức từ MealPlanService đã import
            await MealPlanService.updateMealPlanOnMealClone(
                meal.mealPlanId, 
                oldMealId, 
                newMeal._id
            );
        }
    }

    // --- BƯỚC 3, 4, 5 ÁP DỤNG TRÊN BẢN GHI MỚI/HIỆN TẠI (newMeal) ---

    // 3. Áp dụng các cập nhật dữ liệu
    // Nếu có recipes mới, thay thế toàn bộ mảng recipes hiện tại
    if (updateData.recipes) {
        newMeal.recipes = updateData.recipes;
    }
    
    // Áp dụng các trường khác (ví dụ: note, date, feedback, v.v.)
    Object.keys(updateData).forEach(key => {
        // Tránh ghi đè các trường cố định
        if (key !== 'recipes' && key !== 'userId' && key !== 'mealPlanId' && newMeal[key] !== undefined) {
            newMeal[key] = updateData[key];
        }
    });

    // 4. Cập nhật trạng thái nếu cần thiết
    // Ưu tiên sử dụng status từ updateData nếu nó được truyền vào
    if (updateData.status && updateData.status !== newMeal.status) {
        newMeal.status = updateData.status;
    } 
    
    // Nếu đây là bản clone từ AI (đang có status 'edited'), thì giữ nguyên.
    // Nếu là bản gốc (không clone), và người dùng cập nhật, có thể chuyển sang 'selected'
    // Logic này có thể tùy chỉnh thêm để đảm bảo status hợp lý.

    // 5. Tính toán lại tổng dinh dưỡng (BẮT BUỘC)
    newMeal.totalNutrition = await calculateTotalNutrition(newMeal.recipes);
    
    await newMeal.save();

    return newMeal;
};