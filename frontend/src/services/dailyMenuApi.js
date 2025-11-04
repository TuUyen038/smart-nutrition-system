const API_BASE_URL = "http://localhost:3000/api/daily-menu";
import { toUTCISOString } from "../helpers/date";
export const getRecipesByDateAndStatus = async (startDate, endDate, status) => {
  try {
    if(!endDate) {
      endDate = startDate;
    }
    const startUTC = encodeURIComponent(toUTCISOString(startDate));
    const endUTC = encodeURIComponent(toUTCISOString(endDate));
    const response = await fetch(`${API_BASE_URL}/recipes?startDate=${startUTC}&endDate=${endUTC}&status=${status}`);
    const history = await response.json();
    console.log("History:", history);

    return history;
  } catch (error) {
    console.error(error);
    throw new Error('Error retrieving meal history');
  }
};