require("dotenv").config();

const HF_API_URL = "https://api-inference.huggingface.co/models/nguyenvulebinh/vi-nlp-ner";

// const HF_API_URL = "https://api-inference.huggingface.co/models/dslim/bert-base-NER";
const HF_API_KEY = process.env.HF_API_KEY;

async function runNER(text) {
console.log(HF_API_KEY)
  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: text })
  });

  if (!response.ok) {
    throw new Error(`HuggingFace API error: ${response.statusText}`);
  }

  return await response.json();
}

module.exports = { runNER };
