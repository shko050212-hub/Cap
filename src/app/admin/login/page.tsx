'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '로그인 실패');
      } else {
        window.location.href = '/admin';
      }
    } catch {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#c8a694' }}
    >
      {/* 배경 그라디언트 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% -20%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 50%, rgba(0,0,0,0.15) 100%)'
        }}
      />

      <div className="relative w-full max-w-sm mx-4">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <p className="text-[#3a2a1e]/50 text-xs tracking-[0.4em] uppercase mb-3">ArtMart</p>
          <h1 className="text-[#1a1008] text-3xl font-light tracking-[0.15em] uppercase">
            Admin
          </h1>
          <div className="w-12 h-px bg-[#3a2a1e]/30 mx-auto mt-4" />
        </div>

        {/* 카드 */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.7)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }}
        >
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[#3a2a1e]/70 text-xs font-semibold mb-2 tracking-wider uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@artmart.kr"
                className="w-full rounded-xl px-4 py-3 text-sm text-[#1a1008] placeholder-[#3a2a1e]/30 focus:outline-none focus:ring-2 focus:ring-[#3a2a1e]/20 transition"
                style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(58,42,30,0.15)' }}
              />
            </div>
            <div>
              <label className="block text-[#3a2a1e]/70 text-xs font-semibold mb-2 tracking-wider uppercase">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••••"
                className="w-full rounded-xl px-4 py-3 text-sm text-[#1a1008] placeholder-[#3a2a1e]/30 focus:outline-none focus:ring-2 focus:ring-[#3a2a1e]/20 transition"
                style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(58,42,30,0.15)' }}
              />
            </div>

            {error && (
              <div className="text-red-700 text-xs font-medium bg-red-50/80 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase transition-all active:scale-95"
              style={{
                background: loading ? 'rgba(26,16,8,0.4)' : '#1a1008',
                color: '#f5ede6',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(26,16,8,0.3)',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '확인 중...' : '입장'}
            </button>
          </form>

          <p className="text-center text-[#3a2a1e]/35 text-xs mt-6 leading-relaxed">
            인가된 관리자만 접근 가능합니다<br />
            모든 접근 기록은 저장됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
