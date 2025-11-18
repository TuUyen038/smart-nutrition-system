export const mapMenusToDailyMenuPayload = (menusObj, userId) => {
  return Object.keys(menusObj)
    .filter((date) => menusObj[date].length > 0)
    .map((date) => ({
      userId,
      date,
      recipes: menusObj[date].map((r) => ({
        recipeId: r.id,
        portion: r.portion || 1,
        note: r.note || "",
        servingTime: r.servingTime || "other",
        status: "planned",
      })),
    }));
};