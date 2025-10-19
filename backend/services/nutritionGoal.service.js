const NutritionGoal = require("../models/NutritionGoal");

function calculateBMR({ gender, age, height, weight }) {
  if (!gender || !age || !height || !weight) return 0;
  return gender === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
}

function adjustByGoal(calories, goal) {
  switch (goal) {
    case "lose_weight": return calories - 500;
    case "gain_weight": return calories + 500;
    default: return calories;
  }
}

exports.calculateNutritionGoal = (user) => {
  const bmr = calculateBMR(user);
  const caloriesTarget = adjustByGoal(bmr, user.goal);

  return {
    caloriesTarget,
    proteinTarget: Math.round((caloriesTarget * 0.3) / 4),
    fatTarget: Math.round((caloriesTarget * 0.25) / 9),
    carbTarget: Math.round((caloriesTarget * 0.45) / 4),
    fiberTarget: 25,
    sugarLimit: 50,
    sodiumLimit: 2300,
  };
};

exports.upsertNutritionGoal = async (user) => {
  const goalData = this.calculateNutritionGoal(user);
  let goal = await NutritionGoal.findOne({ userId: user._id });

  if (goal) {
    Object.assign(goal, goalData);
    goal.status = "active";
    await goal.save();
  } else {
    goal = await NutritionGoal.create({
      userId: user._id,
      ...goalData,
    });
  }

  return goal;
};

//calo: kcal
//pro, fat, carb, fiber, sugar: gram
//sodium: mg
