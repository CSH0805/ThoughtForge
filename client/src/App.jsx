import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import ThoughtInput from "./components/ThoughtInput";
import MiddlePanel from "./components/MiddlePanel";
import GraphView from "./components/GraphView";
import Sidebar from "./components/Sidebar";

export default function App() {
  const { user, token, loading, logout } = useAuth();
  const [result, setResult] = useState(null);
  const [thought, setThought] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [inputKey, setInputKey] = useState(0); // ThoughtInput 리셋용

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        로딩 중...
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const handleSubmit = async (thought) => {
    setThought(thought);
    setLoadingAI(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/organize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ thought }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "서버 오류");
      const data = await res.json();
      setResult(data);
      setRefreshTrigger((k) => k + 1); // 사이드바 갱신
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSelectHistory = (data) => {
    setThought(data.thought || "");
    setResult({
      markdown: data.markdown,
      nodes: data.nodes,
      edges: data.edges,
      prompts: data.prompts,
    });
  };

  const handleNewChat = () => {
    setResult(null);
    setThought("");
    setError(null);
    setInputKey((k) => k + 1);
  };

  const exportData = result
    ? { thought, markdown: result.markdown, prompts: result.prompts, nodes: result.nodes }
    : null;

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <header className="border-b border-slate-700 px-5 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🧠</span>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">ThoughtForge</h1>
              <p className="text-xs text-slate-400">생각을 구조화하고 시각화하는 AI 사고 정리 도구</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">{user.username}</span>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white border border-slate-600 hover:border-slate-400 rounded-lg transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 바디 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 사이드바 */}
        <Sidebar
          onSelectHistory={handleSelectHistory}
          onNewChat={handleNewChat}
          refreshTrigger={refreshTrigger}
        />

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
          {error && (
            <div className="flex-shrink-0 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-200"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex-1 grid gap-4 overflow-hidden" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            {/* 입력 */}
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 flex flex-col overflow-hidden">
              <ThoughtInput key={inputKey} onSubmit={handleSubmit} loading={loadingAI} />
            </div>

            {/* AI 정리 / 프롬프트 탭 */}
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 flex flex-col overflow-hidden">
              <MiddlePanel markdown={result?.markdown} prompts={result?.prompts} />
            </div>

            {/* 그래프 + 다운로드 */}
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 flex flex-col overflow-hidden">
              <GraphView nodes={result?.nodes} edges={result?.edges} exportData={exportData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
