import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const TABS = [
  { id: "markdown", label: "📝 AI 정리" },
  { id: "prompts", label: "💬 AI 프롬프트" },
];

function MarkdownTab({ markdown }) {
  if (!markdown) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center text-slate-500 gap-3">
        <span className="text-5xl">📝</span>
        <p className="text-sm">생각을 입력하면 Markdown으로 정리됩니다</p>
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto markdown-scroll pr-1">
      <div className="prose prose-invert prose-sm max-w-none prose-headings:text-indigo-300 prose-strong:text-slate-200 prose-li:text-slate-300 prose-p:text-slate-300">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}

function PromptsTab({ prompts }) {
  const [copied, setCopied] = useState(null);

  if (!prompts || prompts.length === 0) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center text-slate-500 gap-3">
        <span className="text-5xl">💬</span>
        <p className="text-sm">생각을 입력하면 단계별 AI 프롬프트가 생성됩니다</p>
      </div>
    );
  }

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto markdown-scroll pr-1 flex flex-col gap-3">
      {prompts.map((item, idx) => (
        <div
          key={idx}
          className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                {item.step}
              </span>
              <p className="text-indigo-300 font-semibold text-sm">{item.title}</p>
            </div>
            <button
              onClick={() => handleCopy(item.prompt, idx)}
              className="text-xs text-slate-400 hover:text-slate-200 bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded transition-colors flex-shrink-0"
            >
              {copied === idx ? "✅ 복사됨" : "📋 복사"}
            </button>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed bg-slate-800 rounded p-2 border border-slate-700 whitespace-pre-wrap">
            {item.prompt}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function MiddlePanel({ markdown, prompts }) {
  const [activeTab, setActiveTab] = useState("markdown");

  return (
    <div className="flex flex-col h-full">
      {/* TabBar */}
      <div className="flex gap-1 mb-4 bg-slate-900 p-1 rounded-lg flex-shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "markdown" ? (
        <MarkdownTab markdown={markdown} />
      ) : (
        <PromptsTab prompts={prompts} />
      )}
    </div>
  );
}
