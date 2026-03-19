import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processThought(thought) {
  const prompt = `
다음 생각을 분석해서 JSON으로 반환해줘.

형식:
{
  "markdown": "생각을 Markdown 구조로 정리",
  "nodes": [
    {"id": "1", "label": "주제"},
    {"id": "2", "label": "아이디어"}
  ],
  "edges": [
    {"source": "1", "target": "2"}
  ]
}

생각:
${thought}
`;

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  const text = response.output[0].content[0].text;

  return JSON.parse(text);
}
