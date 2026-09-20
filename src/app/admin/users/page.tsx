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
    const reason = action === 'blacklist' ? prompt('블랙리스트 처리 사유를 입력하세요:') : '';
    if (action === 'blacklist' && !reason) return;
    await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, action, reason })
    });
    fetchUsers();
  };

  const filtered = users.filter(u => u.email.includes(search) || (u.profile_name || '').includes(search));

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">회원 관리</h1>
        <p className="text-gray-500 text-sm mt-1">회원 상태 관리 및 블랙리스트 처리</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="이메일 또는 이름 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-80 bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {loading ? <div className="text-gray-500 text-sm">불러오는 중...</div> : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-4 text-left text-gray-400 font-medium">이메일 (마스킹)</th>
                <th className="p-4 text-left text-gray-400 font-medium">닉네임</th>
                <th className="p-4 text-left text-gray-400 font-medium">보유 코인</th>
                <th className="p-4 text-left text-gray-400 font-medium">역할</th>
                <th className="p-4 text-left text-gray-400 font-medium">가입일</th>
                <th className="p-4 text-left text-gray-400 font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="p-4">
                    <span className="text-gray-300">{maskEmail(user.email)}</span>
                  </td>
                  <td className="p-4 text-gray-400">{user.profile_name || '-'}</td>
                  <td className="p-4 text-white font-medium">{(user.coins || 0).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded border text-xs font-bold ${
                      user.role === 'BLACKLIST' ? 'bg-red-900/30 text-red-300 border-red-700' :
                      user.role === 'ADMIN' ? 'bg-blue-900/30 text-blue-300 border-blue-700' :
                      'bg-gray-800 text-gray-400 border-gray-700'
                    }`}>{user.role || 'USER'}</span>
                  </td>
                  <td className="p-4 text-gray-500 text-xs">{new Date(user.created_at).toLocaleDateString('ko-KR')}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {user.role !== 'BLACKLIST' ? (
                        <button onClick={() => handleAction(user.id, 'blacklist')}
                          className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded">
                          블랙리스트
                        </button>
                      ) : (
                        <button onClick={() => handleAction(user.id, 'unblock')}
                          className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white text-xs font-bold rounded">
                          차단 해제
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-600">검색 결과가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
