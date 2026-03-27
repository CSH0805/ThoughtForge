import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function extractJSON(text) {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) return match[1].trim();
  return text.trim();
}

export async function processThought(thought) {
  const prompt = `다음 생각을 분석하고 반드시 JSON 형식으로만 반환해줘. 설명 없이 JSON만.

형식:
{
  "markdown": "## 주제\\n\\n### 핵심 아이디어\\n- 아이디어\\n\\n### 문제\\n- 문제\\n\\n### 해결 방법\\n- 해결방법\\n\\n### 추가 아이디어\\n- 추가아이디어",
  "prompts": [
    {
      "step": 1,
      "title": "단계 제목",
      "prompt": "AI에게 전달할 구체적인 프롬프트 내용"
    }
  ],
  "nodes": [
    {"id": "1", "label": "핵심 주제", "detail": ["핵심 내용 1", "핵심 내용 2", "핵심 내용 3"]},
    {"id": "2", "label": "사용 기술", "detail": ["Node.js", "React", "MongoDB"]}
  ],
  "edges": [
    {"id": "e1-2", "source": "1", "target": "2"}
  ]
}

규칙:
- nodes는 5~8개 사이로 생성
- 각 node의 detail은 해당 항목의 구체적인 세부 항목을 배열로 3~5개 나열 (예: 기술이면 기술명, 기능이면 세부기능, 문제면 구체적 문제점)
- edges로 nodes 간의 연결 관계 표현
- markdown은 구조화된 Markdown 문서 (한국어)
- prompts는 이 아이디어를 실제로 AI(ChatGPT 등)를 이용해 개발할 때 단계별로 사용할 프롬프트 3~5개. 각 prompt는 복사해서 AI에게 바로 붙여넣을 수 있을 정도로 구체적으로 작성
- 모든 텍스트는 한국어

생각: ${thought}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const text = response.choices[0].message.content;
  return JSON.parse(extractJSON(text));
}
