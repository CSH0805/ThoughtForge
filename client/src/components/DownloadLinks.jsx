import { useState } from "react";
import { downloadPDF, downloadDOCX } from "../utils/exportReport";

export default function DownloadLinks({ exportData }) {
  const [status, setStatus] = useState({ pdf: "idle", docx: "idle" });

  if (!exportData) return null;

  const handle = async (type) => {
    setStatus((s) => ({ ...s, [type]: "loading" }));
    try {
      if (type === "pdf") await downloadPDF(exportData);
      else await downloadDOCX(exportData);
      setStatus((s) => ({ ...s, [type]: "done" }));
      setTimeout(() => setStatus((s) => ({ ...s, [type]: "idle" })), 2000);
    } catch (e) {
      console.error(e);
      setStatus((s) => ({ ...s, [type]: "idle" }));
    }
  };

  const btn = (type, icon, label) => {
    const s = status[type];
    return (
      <button
        key={type}
        onClick={() => handle(type)}
        disabled={s === "loading"}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white disabled:opacity-50 transition-colors"
      >
        <span>{icon}</span>
        <span>
          {s === "loading" ? "생성 중..." : s === "done" ? "✅ 저장됨" : label}
        </span>
      </button>
    );
  };

  return (
    <div className="flex-shrink-0 pt-3 mt-3 border-t border-slate-700 flex items-center gap-2">
      <span className="text-xs text-slate-500 mr-1">다운로드</span>
      {btn("pdf", "📄", "PDF")}
      {btn("docx", "📝", "DOCX")}
    </div>
  );
}
