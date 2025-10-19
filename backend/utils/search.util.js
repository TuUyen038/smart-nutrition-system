/**
 * Universal Search Utility for MongoDB (Mongoose)
 * ------------------------------------------------
 * Tính năng:
 *  - Tìm theo 1 hoặc nhiều field (ví dụ: name, description)
 *  - Có thể giới hạn kết quả (limit)
 *  - Có thể sắp xếp (sort)
 *  - Có thể phân trang (page, limit)
 *  - Có thể chọn fields trả về (select)
 *
 * @param {Mongoose.Model} Model - Mongoose model cần search
 * @param {Object} options - Tuỳ chọn tìm kiếm
 * @param {string} options.keyword - Từ khoá tìm kiếm
 * @param {string[]} [options.fields=["name"]] - Danh sách field để tìm trong
 * @param {number} [options.page=1] - Trang hiện tại (pagination)
 * @param {number} [options.limit=10] - Số kết quả mỗi trang
 * @param {Object} [options.sort={ createdAt: -1 }] - Sắp xếp (mặc định: mới nhất)
 * @param {string} [options.select] - Các field cần lấy ra (VD: "name calories")
 * @returns {Promise<{ results: any[], total: number, totalPages: number, currentPage: number }>}
 */

exports.universalSearch = async (Model, options = {}) => {
  const {
    keyword,
    fields = ["name"],
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    select,
  } = options;

  // Nếu không có từ khóa, trả tất cả (hoặc rỗng)
  if (!keyword) {
    const results = await Model.find()
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)
      .select(select || "");
    const total = await Model.countDocuments();
    return {
      results,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // Tạo regex để tìm (không phân biệt hoa thường)
  const regex = new RegExp(keyword, "i");

  // Tạo query: tìm trong nhiều field
  const orQuery = fields.map((field) => ({ [field]: regex }));

  const total = await Model.countDocuments({ $or: orQuery });
  const results = await Model.find({ $or: orQuery })
    .sort(sort)
    .limit(limit)
    .skip((page - 1) * limit)
    .select(select || "");

  return {
    results,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
};
