import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);


export const toUTCISOString = (date) => {
  if (!date) throw new Error("Date is required");
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString();
};
export function normalizeDateVN(date) {
  if (!date) return null;
  return dayjs(date).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");
}
