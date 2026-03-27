import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ onSelectHistory, onNewChat, refreshTrigger }) {
  const { user, token, logout } = useAuth();
  const [history, setHistory] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setHistory(await res.json());
    } catch {}
  };

  const handleSelect = async (item) => {
    setActiveId(item.id);
    try {
      const res = await fetch(`/api/history/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) onSelectHistory(await res.json());
    } catch {}
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await fetch(`/api/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory((prev) => prev.filter((h) => h.id !== id));
      if (activeId === id) {
        setActiveId(null);
        onNewChat();
      }
    } catch {}
  };

  const handleNew = () => {
    setActiveId(null);
    onNewChat();
  };

  return (
    <div className="w-56 flex-shrink-0 flex flex-col bg-slate-900 border-r border-slate-700 overflow-hidden">
      {/* 유저 정보 */}
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <p className="text-sm font-semibold text-slate-200 truncate">{user.username}</p>
        <p className="text-xs text-slate-500 truncate">{user.email}</p>
      </div>

      {/* 새 생각 버튼 */}
      <div className="p-3 flex-shrink-0">
        <button
          onClick={handleNew}
          className="w-full py-2 text-sm text-indigo-400 hover:text-white hover:bg-indigo-600 border border-indigo-600/50 rounded-lg transition-colors"
        >
          + 새 생각
        </button>
      </div>

      {/* 히스토리 목록 */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <p className="text-xs text-slate-500 px-2 py-1 mb-1">내 채팅</p>
        {history.length === 0 ? (
          <p className="text-xs text-slate-600 px-2 py-1">기록이 없습니다</p>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`group flex items-center justify-between gap-1 px-3 py-2 rounded-lg cursor-pointer mb-0.5 transition-colors ${
                activeId === item.id
                  ? "bg-slate-700 text-slate-100"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <span className="text-xs truncate flex-1">
                {item.title || item.thought.slice(0, 30)}
              </span>
              <button
                onClick={(e) => handleDelete(e, item.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs flex-shrink-0 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
