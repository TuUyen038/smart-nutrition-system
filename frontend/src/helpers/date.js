export const toUTCISOString = (date) => {
  if (!date) throw new Error("Date is required");
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString();
};
