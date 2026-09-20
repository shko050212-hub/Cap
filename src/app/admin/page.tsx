'use client';
import { useEffect, useState } from 'react';

interface Stats {
  requested: string;
  inspected: string;
  exhibited: string;
  rejected: string;
  total: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artRes, userRes] = await Promise.all([
          fetch('/api/admin/artworks'),
          fetch('/api/admin/users')
        ]);
        if (artRes.ok) {
          const data = await artRes.json();
          setStats(data.stats);
        }
        if (userRes.ok) {
          const data = await userRes.json();
          setUserCount(data.users.length);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    { label: '검수 대기', value: stats?.requested || '0', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: '⏳' },
    { label: '검수 완료', value: stats?.inspected || '0', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', icon: '✅' },
    { label: '전시 중', value: stats?.exhibited || '0', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20', icon: '🖼️' },
    { label: '반려됨', value: stats?.rejected || '0', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', icon: '❌' },
    { label: '전체 작품', value: stats?.total || '0', color: 'text-gray-300', bg: 'bg-gray-700/30 border-gray-700', icon: '📦' },
    { label: '전체 회원', value: String(userCount), color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20', icon: '👥' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">대시보드</h1>
        <p className="text-gray-500 text-sm mt-1">ArtMart Admin Console — 운영 현황 요약</p>
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">불러오는 중...</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {cards.map(card => (
              <div key={card.label} className={`border rounded-xl p-6 ${card.bg}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{card.icon}</span>
                  <span className={`text-3xl font-bold ${card.color}`}>{card.value}</span>
                </div>
                <p className="text-gray-400 text-sm font-medium">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-white font-bold mb-4">빠른 액션</h2>
            <div className="grid grid-cols-4 gap-3">
              {[
                { href: '/admin/artworks?status=REQUESTED', label: '검수 대기 작품 보기', color: 'bg-amber-600 hover:bg-amber-500' },
                { href: '/admin/auctions', label: '경매 현황 보기', color: 'bg-blue-600 hover:bg-blue-500' },
                { href: '/admin/users', label: '회원 목록 보기', color: 'bg-purple-600 hover:bg-purple-500' },
                { href: '/admin/logs', label: '감사 로그 보기', color: 'bg-gray-700 hover:bg-gray-600' },
              ].map(action => (
                <a key={action.href} href={action.href}
                  className={`${action.color} text-white text-sm font-medium py-3 px-4 rounded-lg text-center transition`}>
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
