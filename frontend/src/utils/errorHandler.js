export const parseError = (error) => {
  // Nếu là Error object
  if (error instanceof Error) {
    return error.message;
  }

  // Nếu là response từ fetch
  if (error.response) {
    return error.response.data?.message || error.response.statusText || "Có lỗi xảy ra";
  }

  // Nếu là object có message
  if (error.message) {
    return error.message;
  }

  // Nếu là string
  if (typeof error === "string") {
    return error;
  }

  // Default
  return "Có lỗi xảy ra. Vui lòng thử lại.";
};

/**
 * Xử lý lỗi và trả về message phù hợp
 */
export const handleError = (error, customMessage = null) => {
  const message = customMessage || parseError(error);
  
  // Log error để debug (chỉ trong development)
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", error);
  }

  return message;
};

/**
 * Wrapper cho async function để tự động handle error
 */
export const withErrorHandling = (asyncFn, errorHandler = null) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      const message = handleError(error);
      if (errorHandler) {
        errorHandler(message, error);
      }
      throw error;
    }
  };
};

