const API_BASE_URL = "http://localhost:3000/api/audit-logs";
import { getToken } from "./authApi";

/**
 * Lấy danh sách audit logs
 * @param {Object} filters - Filters: { userId, resourceType, resourceId, action, userEmail, startDate, endDate }
 * @param {number} page - Số trang (default: 1)
 * @param {number} limit - Số lượng kết quả (default: 50)
 * @returns {Promise<Object>} { logs, total, page, limit, totalPages }
 */
export const getAuditLogs = async (filters = {}, page = 1, limit = 50) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    // Thêm filters vào params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể lấy danh sách audit logs");
    }

    return data;
  } catch (error) {
    console.error("Get audit logs error:", error);
    throw error;
  }
};

/**
 * Lấy chi tiết 1 audit log
 * @param {string} logId - ID của audit log
 * @returns {Promise<Object>} Audit log object
 */
export const getAuditLogById = async (logId) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }

    const response = await fetch(`${API_BASE_URL}/${logId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể lấy chi tiết audit log");
    }

    return data;
  } catch (error) {
    console.error("Get audit log by id error:", error);
    throw error;
  }
};

