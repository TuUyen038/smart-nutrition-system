function normalizeDate(input) {
  let d;

  if (typeof input === "string") {
    d = new Date(input + "T00:00:00+07:00"); // YYYY-MM-DD string
  } else if (input instanceof Date) {
    d = input; // Date object
  } else {
    throw new Error("Invalid date input: " + input);
  }

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
}

module.exports = {
    normalizeDate,
};