const mongoose = require("mongoose");
const Recipe = require("../models/Recipe");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const MONGO_URI = process.env.MONGO_URI;
const DailyMenu = require("../models/DailyMenu");
const MealPlan = require("../models/MealPlan");

async function seed() {
  await mongoose.connect(MONGO_URI);
//hien tai la 21
  const recipes = [
    {
    name: "Bún riêu cua",
    description: "Bún riêu cua với vị chua ngọt, dùng cua xay, cà chua và đậu hũ.",
    category: "main",
    instructions: [
      "Rửa sạch cua, tách mai cua, giã hoặc xay phần thịt và gạch với nước.",
      "Lọc lấy phần nước cua, đun sôi ở lửa vừa.",
      "Thêm cà chua cắt múi, đun đến khi mềm và tạo thành nước dùng chua ngọt.",
      "Thêm đậu hũ cắt miếng, nêm muối, nước mắm, đường cho vừa vị.",
      "Luộc bún tươi đến chín, xếp bún vào tô.",
      "Chan nước riêu nóng lên bún, thêm rau sống, giá và ớt."
    ],
    ingredients: [
      { ingredientId: null, name: "Cua đồng / cua tươi", quantity: { amount: 500, unit: "g" } },
      { ingredientId: null, name: "Cà chua", quantity: { amount: 3, unit: "unit" } },
      { ingredientId: null, name: "Đậu hũ trắng", quantity: { amount: 200, unit: "g" } },
      { ingredientId: null, name: "Bún tươi", quantity: { amount: 300, unit: "g" } },
      { ingredientId: null, name: "Giá đỗ", quantity: { amount: 100, unit: "g" } },
      { ingredientId: null, name: "Rau mùi / hành lá", quantity: { amount: 30, unit: "g" } }
    ],
    servings: 4,
    // Dinh dưỡng ước tính cho Bún riêu cua (cho 4 phần)
    totalNutrition: { calories: 1200, protein: 70, fat: 45, carbs: 130, fiber: 10, sugar: 15, sodium: 3200 },
    createdBy: "admin",
    verified: true
  },

  {
    name: "Bánh mì thịt nguội",
    description: "Bánh mì Việt Nam kẹp thịt nguội, patê, rau, dưa leo.",
    category: "main",
    instructions: [
      "Cắt bánh mì dọc thân nhưng không tách rời hoàn toàn.",
      "Phết patê và bơ vào bên trong bánh mì.",
      "Thêm thịt nguội (chả lụa, jambon…), dưa leo thái lát, rau mùi và ớt tươi (nếu muốn).",
      "Rưới một ít nước mắm pha (nếu thích) hoặc dùng bơ phương Tây.",
      "Kẹp lại và ăn ngay."
    ],
    ingredients: [
      { ingredientId: null, name: "Bánh mì baguette", quantity: { amount: 1, unit: "unit" } },
      { ingredientId: null, name: "Patê gan", quantity: { amount: 50, unit: "g" } },
      { ingredientId: null, name: "Bơ lạt", quantity: { amount: 30, unit: "g" } },
      { ingredientId: null, name: "Chả lụa / thịt nguội", quantity: { amount: 100, unit: "g" } },
      { ingredientId: null, name: "Dưa leo", quantity: { amount: 50, unit: "g" } },
      { ingredientId: null, name: "Rau mùi", quantity: { amount: 10, unit: "g" } }
    ],
    servings: 1,
    // Dinh dưỡng ước tính cho Bánh mì thịt nguội (cho 1 phần)
    totalNutrition: { calories: 550, protein: 30, fat: 30, carbs: 45, fiber: 2, sugar: 4, sodium: 1100 },
    createdBy: "admin",
    verified: true
  },

  {
    name: "Gỏi cuốn tôm thịt",
    description: "Gỏi cuốn (summer roll) tôm và thịt, cuốn cùng bún và rau sống.",
    category: "side",
    instructions: [
      "Luộc tôm đến khi chín, bóc vỏ và để ráo.",
      "Luộc thịt lợn (thịt ba chỉ) để ráo, thái lát mỏng.",
      "Chuẩn bị rau sống (xà lách, rau diếp, húng quế) và bún.",
      "Nhúng bánh tráng vào nước ấm cho mềm, sau đó đặt lên thớt.",
      "Xếp tôm, thịt, bún và rau vào giữa bánh tráng, cuộn chặt tay.",
      "Dọn gỏi cuốn lên đĩa và ăn cùng nước chấm (nước mắm chua ngọt hoặc tương)."
    ],
    ingredients: [
      { ingredientId: null, name: "Tôm", quantity: { amount: 200, unit: "g" } },
      { ingredientId: null, "name": "Thịt ba chỉ luộc", quantity: { amount: 150, unit: "g" } },
      { ingredientId: null, name: "Bún tươi", quantity: { amount: 100, unit: "g" } },
      { ingredientId: null, name: "Rau xà lách", quantity: { amount: 50, unit: "g" } },
      { ingredientId: null, name: "Bánh tráng", quantity: { amount: 10, unit: "unit" } }
    ],
    servings: 4,
    // Dinh dưỡng ước tính cho Gỏi cuốn tôm thịt (cho 4 phần)
    totalNutrition: { calories: 850, protein: 65, fat: 20, carbs: 100, fiber: 8, sugar: 12, sodium: 1800 },
    createdBy: "admin",
    verified: true
  },

  {
    name: "Sườn nướng (Cơm sườn)",
    description: "Sườn heo ướp nướng than, thơm mùi lemongrass, dùng kèm cơm tấm.",
    category: "main",
    instructions: [
      "Chặt sườn heo thành miếng vừa nướng.",
      "Ướp sườn với sả băm, tỏi, đường, nước mắm và một ít dầu ăn, để ít nhất 1 giờ.",
      "Nướng sườn trên bếp than hoặc lò nướng đến khi hai mặt vàng thơm và caramen.",
      "Xới cơm tấm ra đĩa, đặt sườn nướng lên trên.",
      "Rắc một ít hành lá hoặc mỡ hành nếu muốn."
    ],
    ingredients: [
      { ingredientId: null, name: "Sườn heo", quantity: { amount: 600, unit: "g" } },
      { ingredientId: null, name: "Sả", quantity: { amount: 2, unit: "unit" } },
      { ingredientId: null, name: "Tỏi", quantity: { amount: 3, unit: "unit" } },
      { ingredientId: null, name: "Đường", quantity: { amount: 1, unit: "tbsp" } },
      { ingredientId: null, name: "Nước mắm", quantity: { amount: 3, unit: "tbsp" } }
    ],
    servings: 4,
    // Dinh dưỡng ước tính cho Sườn nướng (chưa tính cơm) (cho 4 phần)
    totalNutrition: { calories: 1400, protein: 100, fat: 85, carbs: 40, fiber: 2, sugar: 20, sodium: 4000 },
    createdBy: "admin",
    verified: true
  },
  {
    name: "Bún mắm",
    description: "Bún mắm đặc trưng miền Tây, nước lèo làm từ mắm cá mạnh mùi, nhiều hải sản.",
    category: "main",
    instructions: [
      "Chuẩn bị mắm cá pha với nước lọc, đun sôi lửa nhỏ để tạo nước lèo.",
      "Thêm tôm, cá, mực hoặc các loại hải sản vào nước lèo, đun cho chín.",
      "Nêm nước mắm, đường, ớt theo khẩu vị.",
      "Chần bún trong nước sôi.",
      "Cho bún vào tô, chan nước mắm mắm, thêm rau sống như rau đắng, hành lá và ớt."
    ],
    ingredients: [
      { ingredientId: null, name: "Mắm cá", quantity: { amount: 200, unit: "g" } },
      { ingredientId: null, name: "Tôm", quantity: { amount: 200, unit: "g" } },
      { ingredientId: null, name: "Cá", quantity: { amount: 200, unit: "g" } },
      { ingredientId: null, name: "Bún tươi", quantity: { amount: 300, unit: "g" } },
      { ingredientId: null, name: "Rau đắng", quantity: { amount: 50, unit: "g" } }
    ],
    servings: 4,
    // Dinh dưỡng ước tính cho Bún mắm (cho 4 phần)
    totalNutrition: { calories: 1350, protein: 95, fat: 40, carbs: 140, fiber: 7, sugar: 18, sodium: 5500 },
    createdBy: "admin",
    verified: true
  },

  {
    name: "Chạo tôm",
    description: "Chạo tôm Huế: chạo tôm xiên mía, thường ăn cùng bún, rau và lạc rang.",
    category: "main",
    instructions: [
      "Giã hoặc xay tôm tươi, trộn với gia vị như đường, tiêu, bột ngọt nếu thích.",
      "Vo hỗn hợp tôm quanh thanh mía, ép chặt.",
      "Nướng hoặc hấp thanh mía tôm đến khi tôm chín và săn lại.",
      "Dọn chạo tôm cùng bún tươi, rau sống (rau diếp, húng quế) và lạc rang."
    ],
    ingredients: [
      { ingredientId: null, name: "Tôm tươi", quantity: { amount: 400, unit: "g" } },
      { ingredientId: null, name: "Thanh mía", quantity: { amount: 4, unit: "unit" } },
      { ingredientId: null, name: "Đường", quantity: { amount: 1, unit: "tbsp" } },
      { ingredientId: null, name: "Tiêu", quantity: { amount: 0.5, unit: "tsp" } },
      { ingredientId: null, name: "Lạc rang", quantity: { amount: 50, unit: "g" } }
    ],
    servings: 4,
    // Dinh dưỡng ước tính cho Chạo tôm (cho 4 phần)
    totalNutrition: { calories: 950, protein: 75, fat: 35, carbs: 80, fiber: 5, sugar: 15, sodium: 1500 },
    createdBy: "admin",
    verified: true
  },

  {
    name: "Bánh cuốn nhân thịt",
    description: "Bánh cuốn mỏng nhân thịt heo và nấm mèo, ăn kèm chả lụa và nước mắm pha.",
    category: "side",
    instructions: [
      "Pha bột bánh cuốn: bột gạo + chút bột năng + nước để được hỗn hợp lỏng mịn.",
      "Hấp hoặc tráng bánh trên vải hấp để tạo lớp bánh mỏng.",
      "Chuẩn bị nhân: thịt lợn xay + nấm mèo thái nhỏ + hành + tiêu + nước mắm.",
      "Đặt một ít nhân lên lớp bánh, cuộn lại nhẹ nhàng.",
      "Dọn bánh cuốn lên đĩa, thêm chả lụa thái lát, rắc hành phi, và chấm với nước mắm pha tỏi + đường + chanh."
    ],
    ingredients: [
      { ingredientId: null, name: "Bột gạo", quantity: { amount: 200, unit: "g" } },
      { ingredientId: null, name: "Bột năng", quantity: { amount: 50, unit: "g" } },
      { ingredientId: null, name: "Thịt lợn xay", quantity: { amount: 150, unit: "g" } },
      { ingredientId: null, name: "Nấm mèo (mộc nhĩ)", quantity: { amount: 30, unit: "g" } },
      { ingredientId: null, name: "Chả lụa", quantity: { amount: 100, unit: "g" } }
    ],
    servings: 4,
    // Dinh dưỡng ước tính cho Bánh cuốn (cho 4 phần)
    totalNutrition: { calories: 800, protein: 55, fat: 30, carbs: 85, fiber: 6, sugar: 9, sodium: 2200 },
    createdBy: "admin",
    verified: true
  },

  {
    name: "Bánh bò",
    description: "Bánh bò mềm, xốp, ngọt nhẹ, món tráng miệng truyền thống Việt Nam.",  
    category: "dessert",
    instructions: [
      "Pha bột gạo + bột nở (hoặc men) + đường + nước cốt dừa để được hỗn hợp bột sệt.",
      "Ủ bột ở nhiệt độ ấm khoảng 1–2 giờ đến khi bột nở.",
      "Đổ bột vào khuôn đã thoa dầu hoặc mỡ, hấp cách thủy khoảng 20–30 phút.",
      "Lấy bánh ra để nguội một chút rồi thưởng thức."
    ],
    ingredients: [
      { ingredientId: null, name: "Bột gạo", quantity: { amount: 250, unit: "g" } },
      { ingredientId: null, name: "Men hoặc bột nở", quantity: { amount: 5, unit: "g" } },
      { ingredientId: null, name: "Đường", quantity: { amount: 200, unit: "g" } },
      { ingredientId: null, name: "Nước cốt dừa", quantity: { amount: 200, unit: "ml" } }
    ],
    servings: 8,
    // Dinh dưỡng ước tính cho Bánh bò (cho 8 phần)
    totalNutrition: { calories: 1250, protein: 15, fat: 40, carbs: 220, fiber: 3, sugar: 150, sodium: 150 },
    createdBy: "admin",
    verified: true
  },

  {
    name: "Cà phê sữa đá",
    description: "Cà phê phin Việt Nam pha với sữa đặc, uống đá – món uống thịnh hành khắp Việt Nam.",
    category: "drink",
    instructions: [
      "Cho cà phê bột vào phin, ép nhẹ và đặt nắp phin.",
      "Rót một ít nước sôi để ủ rồi sau đó thêm nước sôi đầy phin.",
      "Đợi cà phê nhỏ giọt hết.",
      "Cho đá vào ly, rót cà phê lên đá.",
      "Thêm sữa đặc theo khẩu vị, khuấy đều và thưởng thức."
    ],
    ingredients: [
      { ingredientId: null, name: "Cà phê bột (phin)", quantity: { amount: 30, unit: "g" } },
      { ingredientId: null, name: "Sữa đặc", quantity: { amount: 50, unit: "ml" } },
      { ingredientId: null, name: "Đá viên", quantity: { amount: 100, unit: "g" } }
    ],
    servings: 1,
    // Dinh dưỡng ước tính cho Cà phê sữa đá (cho 1 phần)
    totalNutrition: { calories: 180, protein: 3, fat: 7, carbs: 25, fiber: 0, sugar: 24, sodium: 80 },
    createdBy: "admin",
    verified: true
  },

  {
    name: "Bánh khọt",
    description: "Bánh khọt kiểu miền Nam – bánh nhỏ chiên giòn, nhân tôm, ăn cùng rau sống và nước mắm chua ngọt.",
    category: "main",
    instructions: [
      "Pha bột bánh khọt: bột gạo + bột năng + nước dừa + nước + nghệ để tạo màu vàng nhẹ.",
      "Chờ bột nghỉ khoảng 15 phút.",
      "Làm nóng khuôn bánh khọt, cho dầu vào mỗi lỗ nhỏ.",
      "Đổ bột vào lỗ, thêm tôm tươi lên trên, chiên lửa nhỏ đến khi bánh giòn và chín.",
      "Lấy bánh ra, để ráo dầu.",
      "Ăn bánh khọt cùng rau sống (xà lách, húng quế), dưa leo và nước mắm chua ngọt."
    ],
    ingredients: [
      { ingredientId: null, name: "Bột gạo", quantity: { amount: 200, unit: "g" } },
      { ingredientId: null, name: "Bột năng", quantity: { amount: 50, unit: "g" } },
      { ingredientId: null, name: "Nước dừa", quantity: { amount: 150, unit: "ml" } },
      { ingredientId: null, name: "Tôm tươi", quantity: { amount: 150, unit: "g" } },
      { ingredientId: null, name: "Nghệ", quantity: { amount: 3, unit: "g" } }
    ],
    servings: 4,
    // Dinh dưỡng ước tính cho Bánh khọt (có dùng dầu/nước dừa) (cho 4 phần)
    totalNutrition: { calories: 1500, protein: 60, fat: 75, carbs: 140, fiber: 7, sugar: 15, sodium: 2500 },
    createdBy: "admin",
    verified: true
  },

  {
    "name": "Gà kho gừng",
    "description": "Món gà kho thơm mùi gừng, đậm đà, ăn cùng cơm nóng.",
    "category": "main",
    "instructions": [
      "Rửa sạch và chặt gà thành miếng vừa ăn.",
      "Ướp gà với nước mắm, đường, tiêu và gừng trong 15 phút.",
      "Phi thơm hành và gừng, cho gà vào đảo đều.",
      "Thêm nước dừa hoặc nước lọc và kho lửa nhỏ 20–25 phút.",
      "Nêm nếm lại và thêm tiêu trước khi tắt bếp."
    ],
    "ingredients": [
      { "ingredientId": null, "name": "Gà ta", "quantity": { "amount": 600, "unit": "g" } },
      { "ingredientId": null, "name": "Gừng", "quantity": { "amount": 20, "unit": "g" } },
      { "ingredientId": null, "name": "Hành tím", "quantity": { "amount": 3, "unit": "unit" } },
      { "ingredientId": null, "name": "Nước mắm", "quantity": { "amount": 2, "unit": "tbsp" } },
      { "ingredientId": null, "name": "Đường", "quantity": { "amount": 1, "unit": "tbsp" } },
      { "ingredientId": null, "name": "Tiêu", "quantity": { "amount": 0.5, "unit": "tsp" } }
    ],
    "servings": 3,
    // Dinh dưỡng ước tính cho Gà kho gừng (cho 3 phần)
    "totalNutrition": { calories: 850, protein: 110, fat: 40, carbs: 15, fiber: 2, sugar: 8, sodium: 2000 },
    "createdBy": "admin",
    "verified": true
  },

  {
    "name": "Thịt kho trứng",
    "description": "Món thịt kho quen thuộc trong bữa cơm Việt.",
    "category": "main",
    "instructions": [
      "Rửa sạch thịt ba chỉ, cắt miếng vuông.",
      "Luộc sơ thịt rồi rửa lại.",
      "Thắng đường tạo màu, cho thịt vào đảo.",
      "Thêm nước mắm, nước dừa và trứng đã luộc.",
      "Kho nhỏ lửa 45–60 phút đến khi thịt mềm."
    ],
    "ingredients": [
      { "ingredientId": null, "name": "Thịt ba chỉ", "quantity": { "amount": 500, "unit": "g" } },
      { "ingredientId": null, "name": "Trứng gà", "quantity": { "amount": 4, "unit": "unit" } },
      { "ingredientId": null, "name": "Đường", "quantity": { "amount": 1, "unit": "tbsp" } },
      { "ingredientId": null, "name": "Nước mắm", "quantity": { "amount": 3, "unit": "tbsp" } },
      { "ingredientId": null, "name": "Nước dừa tươi", "quantity": { "amount": 300, "unit": "ml" } }
    ],
    "servings": 4,
    // Dinh dưỡng ước tính cho Thịt kho trứng (cho 4 phần)
    "totalNutrition": { calories: 1800, protein: 100, fat: 140, carbs: 30, fiber: 0, sugar: 20, sodium: 3500 },
    "createdBy": "admin",
    "verified": true
  },

  {
    "name": "Cá kho tộ",
    "description": "Cá kho kiểu miền Nam, đậm vị, béo và thơm.",
    "category": "main",
    "instructions": [
      "Rửa cá, để ráo, ướp nước mắm, tiêu, đường, hành tím.",
      "Thắng đường làm màu.",
      "Cho cá vào kho lửa nhỏ 30–40 phút.",
      "Thêm ớt và tiêu trước khi tắt bếp."
    ],
    "ingredients": [
      { "ingredientId": null, "name": "Cá basa hoặc cá lóc", "quantity": { "amount": 500, "unit": "g" } },
      { "ingredientId": null, "name": "Hành tím", "quantity": { "amount": 2, "unit": "unit" } },
      { "ingredientId": null, "name": "Đường", "quantity": { "amount": 1, "unit": "tbsp" } },
      { "ingredientId": null, "name": "Nước mắm", "quantity": { "amount": 2, "unit": "tbsp" } },
      { "ingredientId": null, "name": "Ớt", "quantity": { "amount": 1, "unit": "unit" } }
    ],
    "servings": 3,
    // Dinh dưỡng ước tính cho Cá kho tộ (cho 3 phần)
    "totalNutrition": { calories: 700, protein: 90, fat: 30, carbs: 20, fiber: 1, sugar: 15, sodium: 3800 },
    "createdBy": "admin",
    "verified": true
  },

  {
    "name": "Canh chua cá",
    "description": "Canh chua miền Tây với cá, thơm, cà chua và bạc hà.",
    "category": "main",
    "instructions": [
      "Rửa cá và ướp với chút muối.",
      "Nấu nước sôi, cho thơm và cà chua vào.",
      "Thêm bạc hà, giá và rau thơm.",
      "Cho cá vào nấu 7–10 phút.",
      "Nêm nếm bằng đường, nước mắm và me chua."
    ],
    "ingredients": [
      { "ingredientId": null, "name": "Cá basa", "quantity": { "amount": 400, "unit": "g" } },
      { "ingredientId": null, "name": "Thơm", "quantity": { "amount": 100, "unit": "g" } },
      { "ingredientId": null, "name": "Cà chua", "quantity": { "amount": 2, "unit": "unit" } },
      { "ingredientId": null, "name": "Bạc hà", "quantity": { "amount": 50, "unit": "g" } },
      { "ingredientId": null, "name": "Me chua", "quantity": { "amount": 1, "unit": "tbsp" } }
    ],
    "servings": 4,
    // Dinh dưỡng ước tính cho Canh chua cá (cho 4 phần)
    "totalNutrition": { calories: 400, protein: 70, fat: 5, carbs: 25, fiber: 8, sugar: 12, sodium: 2200 },
    "createdBy": "admin",
    "verified": true
  },

  {
    "name": "Bò xào hành tây",
    "description": "Thịt bò mềm thơm, xào với hành tây ngọt tự nhiên.",
    "category": "main",
    "instructions": [
      "Ướp thịt bò với dầu hào, nước tương, tiêu và tỏi.",
      "Xào bò nhanh lửa lớn 2–3 phút.",
      "Thêm hành tây và đảo đều đến khi vừa chín.",
      "Nêm nếm lại và tắt bếp."
    ],
    "ingredients": [
      { "ingredientId": null, "name": "Thịt bò thăn", "quantity": { "amount": 300, "unit": "g" } },
      { "ingredientId": null, "name": "Hành tây", "quantity": { "amount": 1, "unit": "unit" } },
      { "ingredientId": null, "name": "Tỏi", "quantity": { "amount": 2, "unit": "unit" } },
      { "ingredientId": null, "name": "Dầu hào", "quantity": { "amount": 1, "unit": "tbsp" } }
    ],
    "servings": 2,
    // Dinh dưỡng ước tính cho Bò xào hành tây (cho 2 phần)
    "totalNutrition": { calories: 550, protein: 70, fat: 25, carbs: 15, fiber: 3, sugar: 7, sodium: 1500 },
    "createdBy": "admin",
    "verified": true
  },

  {
    "name": "Canh rau ngót thịt băm",
    "description": "Canh truyền thống, thanh mát, phù hợp cho mọi bữa ăn.",
    "category": "main",
    "instructions": [
      "Rửa rau ngót, vò nhẹ.",
      "Xào thịt băm với tỏi cho thơm.",
      "Thêm nước, đun sôi và cho rau vào.",
      "Nấu 5–7 phút, nêm nếm vừa ăn."
    ],
    "ingredients": [
      { "ingredientId": null, "name": "Rau ngót", "quantity": { "amount": 200, "unit": "g" } },
      { "ingredientId": null, "name": "Thịt heo băm", "quantity": { "amount": 150, "unit": "g" } },
      { "ingredientId": null, "name": "Tỏi", "quantity": { "amount": 2, "unit": "unit" } }
    ],
    "servings": 4,
    // Dinh dưỡng ước tính cho Canh rau ngót (cho 4 phần)
    "totalNutrition": { calories: 350, protein: 40, fat: 15, carbs: 10, fiber: 5, sugar: 3, sodium: 1800 },
    "createdBy": "admin",
    "verified": true
  },

  {
    "name": "Thịt bò kho",
    "description": "Bò kho kiểu Việt đậm mùi quế hồi, mềm và thơm.",
    "category": "main",
    "instructions": [
      "Ướp thịt bò với sả, tỏi, dầu điều, ngũ vị hương và muối.",
      "Xào bò đến săn lại.",
      "Thêm nước dừa và cà rốt, kho 1–1.5 giờ.",
      "Nêm nếm và dùng nóng với bánh mì."
    ],
    "ingredients": [
      { "ingredientId": null, "name": "Thịt bò gân", "quantity": { "amount": 600, "unit": "g" } },
      { "ingredientId": null, "name": "Cà rốt", "quantity": { "amount": 2, "unit": "unit" } },
      { "ingredientId": null, "name": "Sả", "quantity": { "amount": 2, "unit": "unit" } },
      { "ingredientId": null, "name": "Ngũ vị hương", "quantity": { "amount": 1, "unit": "tsp" } }
    ],
    "servings": 4,
    // Dinh dưỡng ước tính cho Thịt bò kho (cho 4 phần)
    "totalNutrition": { calories: 1200, protein: 120, fat: 60, carbs: 45, fiber: 10, sugar: 20, sodium: 3000 },
    "createdBy": "admin",
    "verified": true
  },

  {
    "name": "Cơm chiên trứng",
    "description": "Món cơm chiên đơn giản, nhanh cho bữa ăn gọn nhẹ.",
    "category": "main",
    "instructions": [
      "Đánh trứng và chiên chín vừa.",
      "Xào tỏi, cho cơm nguội vào đảo đều.",
      "Thêm trứng, nước tương và hành lá.",
      "Xào nhanh tay đến khi cơm tơi."
    ],
    "ingredients": [
      { "ingredientId": null, "name": "Cơm nguội", "quantity": { "amount": 300, "unit": "g" } },
      { "ingredientId": null, "name": "Trứng gà", "quantity": { "amount": 2, "unit": "unit" } },
      { "ingredientId": null, "name": "Tỏi", "quantity": { "amount": 1, "unit": "unit" } },
      { "ingredientId": null, "name": "Nước tương", "quantity": { "amount": 1, "unit": "tbsp" } }
    ],
    "servings": 2,
    // Dinh dưỡng ước tính cho Cơm chiên trứng (cho 2 phần)
    "totalNutrition": { calories: 750, protein: 25, fat: 35, carbs: 90, fiber: 2, sugar: 3, sodium: 1200 },
    "createdBy": "admin",
    "verified": true
  },

  {
    "name": "Mì xào bò",
    "description": "Mì xào mềm nhưng vẫn có độ dai, bò thơm và đậm vị.",
    "category": "main",
    "instructions": [
      "Chần mì và để ráo.",
      "Xào bò đã ướp.",
      "Thêm rau cải, cà rốt và mì.",
      "Nêm xì dầu, dầu hào, tiêu."
    ],
    "ingredients": [
      { "ingredientId": null, "name": "Mì gói hoặc mì trứng", "quantity": { "amount": 2, "unit": "unit" } },
      { "ingredientId": null, "name": "Thịt bò", "quantity": { "amount": 200, "unit": "g" } },
      { "ingredientId": null, "name": "Cải ngọt", "quantity": { "amount": 100, "unit": "g" } }
    ],
    "servings": 2,
    // Dinh dưỡng ước tính cho Mì xào bò (cho 2 phần)
    "totalNutrition": { calories: 880, protein: 60, fat: 40, carbs: 80, fiber: 5, sugar: 5, sodium: 2500 },
    "createdBy": "admin",
    "verified": true
  },

  {
    "name": "Đậu hũ sốt cà",
    "description": "Đậu hũ mềm sốt cà chua đơn giản và dễ ăn.",
    "category": "main",
    "instructions": [
      "Chiên đậu hũ vàng nhẹ.",
      "Phi hành, thêm cà chua xào nhuyễn.",
      "Cho đậu hũ vào đun nhỏ.",
      "Nêm đường, nước mắm và hành lá."
    ],
    "ingredients": [
      { "ingredientId": null, "name": "Đậu hũ", "quantity": { "amount": 3, "unit": "unit" } },
      { "ingredientId": null, "name": "Cà chua", "quantity": { "amount": 2, "unit": "unit" } },
      { "ingredientId": null, "name": "Hành lá", "quantity": { "amount": 1, "unit": "unit" } }
    ],
    "servings": 3,
    // Dinh dưỡng ước tính cho Đậu hũ sốt cà (cho 3 phần)
    "totalNutrition": { calories: 500, protein: 45, fat: 30, carbs: 15, fiber: 4, sugar: 8, sodium: 1500 },
    "createdBy": "admin",
    "verified": true
  }
]

// //them du lieu
  // await Recipe.insertMany(recipes);

//   // Xóa mot so dữ liệu cũ (nếu muốn reset)
//   const idsToKeep = [
//   "6909c0ede206b7f6915d7ac6", // ví dụ _id
//   "6909ca6e39e6c5872ab20d54",
//   "690e4102c9be52a79f6972f9",
//   "690e421dc9be52a79f697308",
//   "690e55b3c9adbbee72bb137a"
// ];
// await Recipe.deleteMany({ _id: { $nin: idsToKeep } });
// console.log("Deleted recipes except selected ones");

// //xoa het du lieu cu
  await DailyMenu.deleteMany({});
  await MealPlan.deleteMany({});



  process.exit();
}

seed();