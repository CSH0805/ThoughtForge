import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin
        ? { email: form.email, password: form.password }
        : form;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      login(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        {/* 로고 */}
        <div className="text-center mb-7">
          <span className="text-5xl">🧠</span>
          <h1 className="text-2xl font-bold text-white mt-3">ThoughtForge</h1>
          <p className="text-slate-400 text-sm mt-1">생각을 구조화하는 AI 도구</p>
        </div>

        {/* 탭 */}
        <div className="flex bg-slate-900 p-1 rounded-xl mb-6">
          {["로그인", "회원가입"].map((label, i) => (
            <button
              key={i}
              onClick={() => { setIsLogin(i === 0); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isLogin === (i === 0)
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {!isLogin && (
            <input
              name="username"
              type="text"
              placeholder="사용자명"
              value={form.username}
              onChange={handleChange}
              required
              className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500"
            />
          )}
          <input
            name="email"
            type="email"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
            required
            className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500"
          />
          <input
            name="password"
            type="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange}
            required
            className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500"
          />

          {error && (
            <p className="text-red-400 text-xs bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors mt-1"
          >
            {loading ? "처리 중..." : isLogin ? "로그인" : "회원가입"}
          </button>
        </form>
      </div>
    </div>
  );
}
