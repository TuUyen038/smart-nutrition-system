const API_BASE_URL = "http://localhost:3000/api";
import { getToken } from "./authApi";

/**
 * Upload ảnh lên Cloudinary
 */
export const uploadImage = async (file, type = "recipe") => {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append("image", file);

    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload-image?type=${type}`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Không thể đọc lỗi từ server.",
      }));
      throw new Error(
        errorData.message || `Lỗi HTTP ${response.status} khi upload ảnh`
      );
    }

    const data = await response.json();
    return {
      url: data.url,
      public_id: data.public_id,
    };
  } catch (error) {
    console.error("Lỗi khi upload ảnh:", error.message);
    throw error;
  }
};

