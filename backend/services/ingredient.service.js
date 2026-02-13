const Ingredient = require("../models/Ingredient");
const { universalSearch } = require("../utils/search");

exports.searchIngredients = async (query) => {
  return await universalSearch(Ingredient, {
    keyword: query.keyword,
    fields: ["name", "category"],
    page: query.page,
    limit: query.limit,
    sort: { name: 1 },
    select: "name category calories protein",
  });
};
