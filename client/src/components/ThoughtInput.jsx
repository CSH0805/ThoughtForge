import { useState } from "react";

const EXAMPLES = [
  "GPT Apps SDK 프로젝트 만들고 싶다. API 여러개 연결하고 질문 분석 기능 넣고 싶다. UI도 예쁘게 만들고 싶다.",
  "독서 습관을 만들고 싶다. 매일 30분씩 책을 읽고 싶은데 집중이 안 된다. 스마트폰 때문인 것 같다.",
  "스타트업 창업을 고려 중이다. 교육 분야에서 AI를 활용한 서비스를 만들고 싶다. 타겟은 중학생이다.",
];

export default function ThoughtInput({ onSubmit, loading }) {
  const [thought, setThought] = useState("");

  const handleSubmit = () => {
    if (!thought.trim() || loading) return;
    onSubmit(thought);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">
          💭 생각 입력
        </h2>
        <p className="text-xs text-slate-400">
          자유롭게 생각을 작성하세요. AI가 구조화해드립니다.
        </p>
      </div>

      <textarea
        className="flex-1 w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-slate-200 text-sm resize-none focus:outline-none focus:border-indigo-500 placeholder-slate-500"
        style={{ minHeight: "220px" }}
        placeholder="여기에 생각을 자유롭게 작성하세요...&#10;&#10;(Ctrl+Enter로 제출)"
        value={thought}
        onChange={(e) => setThought(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <div>
        <p className="text-xs text-slate-500 mb-2">예시 클릭:</p>
        <div className="flex flex-col gap-1">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => setThought(ex)}
              className="text-left text-xs text-indigo-400 hover:text-indigo-300 hover:bg-slate-700 rounded px-2 py-1.5 transition-colors"
            >
              {ex.length > 55 ? ex.slice(0, 55) + "..." : ex}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!thought.trim() || loading}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin">⟳</span>
            <span>AI 분석 중...</span>
          </>
        ) : (
          "🧠 생각 정리하기"
        )}
      </button>
    </div>
  );
}
