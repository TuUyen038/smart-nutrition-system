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
// export function formatDateVN(date) {
//   const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
//   return local.toISOString().split("T")[0];

// }
export const formatDateVN = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return formatDateVN(d);
};

export const createWeekDates = (weekStartStr) => {
  const parts = weekStartStr.split("-");
  const startDate = new Date(parts[0], parts[1] - 1, parts[2]);

  const weekObj = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);

    const formatted = formatDateVN(d);
    weekObj[formatted] = [];
  }
  return weekObj;
};
