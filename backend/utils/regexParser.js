function extractQuantityUnit(text) {
  const regex = /(\d+)\s*(g|kg|ml|l|bát|củ|thìa|muỗng)?\s*([\p{L}\s]+)/giu;
  const matches = [...text.matchAll(regex)];

  return matches.map(m => ({
    quantity: parseFloat(m[1]),
    unit: m[2] || null,
    ingredient: m[3].trim()
  }));
}

module.exports = { extractQuantityUnit };
