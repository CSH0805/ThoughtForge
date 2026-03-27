import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownView({ markdown }) {
  if (!markdown) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-slate-500 gap-3">
        <span className="text-5xl">📝</span>
        <p className="text-sm">생각을 입력하면 Markdown으로 정리됩니다</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold text-slate-200 mb-4">📝 AI 정리</h2>
      <div className="flex-1 overflow-y-auto markdown-scroll pr-1">
        <div className="prose prose-invert prose-sm max-w-none prose-headings:text-indigo-300 prose-strong:text-slate-200 prose-li:text-slate-300 prose-p:text-slate-300">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
