const Ingredient = require("../models/Ingredient");
const { universalSearch } = require("../utils/search.util");

exports.searchIngredients = async (query) => {
  return await universalSearch(Ingredient, {
    keyword: query.keyword,
    fields: ["name", "category"], // tìm trong cả name và category
    page: query.page,
    limit: query.limit,
    sort: { name: 1 }, // sắp xếp theo tên
    select: "name category calories protein", // chỉ lấy field cần thiết
  });
};
