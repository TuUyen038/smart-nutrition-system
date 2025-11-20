const mongoose = require("mongoose");

const mealPlanSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  // // "day" hoặc "week"
  // period: { 
  //   type: String, 
  //   enum: ["day", "week"], 
  //   default: "week" 
  // },

  startDate: { type: Date, required: true },
  endDate: { type: Date},

  // Các meal cụ thể trong giai đoạn này
  dailyMenuIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "DailyMenu" }],

  // Nguồn tạo ra plan
  source: { 
    type: String, 
    enum: ["ai", "user"], 
    default: "ai" 
  },

  generatedBy: { type: String, default: "nutrition_ai_v1" },

  status: { 
    type: String, 
    enum: ["suggested", "planned", "completed", "cancelled"], 
    default: "suggested" 
  },

}, { timestamps: true });

// Query nhanh plan theo user và thời gian
mealPlanSchema.index({ userId: 1, startDate: -1 });

module.exports = mongoose.model("MealPlan", mealPlanSchema);
