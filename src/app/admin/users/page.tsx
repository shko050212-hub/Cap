'use client';
import { useEffect, useState } from 'react';

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  return local.slice(0, 2) + '****@' + domain;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAction = async (user_id: number, action: string) => {
    const reason = action === 'blacklist' ? prompt('블랙리스트 처리 사유:') : '';
    if (action === 'blacklist' && !reason) return;
    await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, action, reason })
    });
    fetchUsers();
  };

  const filtered = users.filter(u =>
    u.email.includes(search) || (u.profile_name || '').includes(search)
  );

  return (
    <div className="p-10">
      <div className="mb-8">
        <p className="text-[#3a2a1e]/40 text-xs tracking-[0.4em] uppercase mb-2">회원 관리</p>
        <h1 className="text-[#1a1008] text-3xl font-light tracking-wide">회원 목록</h1>
        <div className="w-12 h-px bg-[#3a2a1e]/20 mt-4" />
      </div>

      <input
        type="text"
        placeholder="이메일 또는 이름 검색"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-6 w-80 px-4 py-2.5 rounded-xl text-sm text-[#1a1008] placeholder-[#3a2a1e]/30 focus:outline-none focus:ring-2 focus:ring-[#3a2a1e]/20 transition"
        style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(58,42,30,0.15)' }}
      />

      {loading ? (
        <p className="text-[#3a2a1e]/40 text-sm">불러오는 중...</p>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.6)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(58,42,30,0.1)' }}>
                {['이메일', '닉네임', '보유 코인', '역할', '가입일', '액션'].map(h => (
                  <th key={h} className="p-4 text-left text-[#3a2a1e]/40 font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-white/20 transition" style={{ borderBottom: '1px solid rgba(58,42,30,0.06)' }}>
                  <td className="p-4 text-[#3a2a1e]/70 text-xs">{maskEmail(user.email)}</td>
                  <td className="p-4 text-[#1a1008] font-medium">{user.profile_name || '-'}</td>
                  <td className="p-4 text-[#1a1008]">{(user.coins || 0).toLocaleString()}</td>
                  <td className="p-4">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{
                        color: user.role === 'BLACKLIST' ? '#aa3a2a' : user.role === 'ADMIN' ? '#3a7aaa' : '#5a5a5a',
                        background: user.role === 'BLACKLIST' ? 'rgba(170,58,42,0.12)' : user.role === 'ADMIN' ? 'rgba(58,122,170,0.12)' : 'rgba(90,90,90,0.1)'
                      }}>
                      {user.role || 'USER'}
                    </span>
                  </td>
                  <td className="p-4 text-[#3a2a1e]/40 text-xs">{new Date(user.created_at).toLocaleDateString('ko-KR')}</td>
                  <td className="p-4">
                    {user.role !== 'BLACKLIST' ? (
                      <button onClick={() => handleAction(user.id, 'blacklist')}
                        className="px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: '#aa3a2a' }}>
                        블랙리스트
                      </button>
                    ) : (
                      <button onClick={() => handleAction(user.id, 'unblock')}
                        className="px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: '#3a7a5a' }}>
                        차단 해제
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-10 text-center text-[#3a2a1e]/30 text-sm">결과 없음</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
