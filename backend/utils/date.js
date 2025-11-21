function normalizeDate(input) {
  // input là Date object hoặc string
  const d = new Date(input + "T00:00:00+07:00"); // ép về giờ Việt Nam
  
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
}

module.exports = {
    normalizeDate,
};