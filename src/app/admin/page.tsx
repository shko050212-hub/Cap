'use client';
import { useEffect, useState } from 'react';

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'rgba(255,255,255,0.45)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}
    >
      <p className="text-[#3a2a1e]/50 text-xs tracking-widest uppercase mb-3">{label}</p>
      <p className="text-[#1a1008] font-light" style={{ fontSize: 40, lineHeight: 1 }}>{value}</p>
      <div className="w-8 h-0.5 mt-4 rounded-full" style={{ background: accent }} />
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
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
    { label: '검수 대기', value: stats?.requested || '0', accent: '#d4a843' },
    { label: '전시 중', value: stats?.exhibited || '0', accent: '#6aaa7a' },
    { label: '반려됨', value: stats?.rejected || '0', accent: '#c0604a' },
    { label: '전체 작품', value: stats?.total || '0', accent: '#c8a694' },
    { label: '전체 회원', value: String(userCount), accent: '#8a7aaa' },
    { label: '검수 완료', value: stats?.inspected || '0', accent: '#5a9aaa' },
  ];

  const quickActions = [
    { href: '/admin/artworks?status=REQUESTED', label: '검수 대기 확인', sub: '승인/반려 처리' },
    { href: '/admin/auctions', label: '경매 현황', sub: '실시간 모니터링' },
    { href: '/admin/users', label: '회원 관리', sub: '블랙리스트/정지' },
    { href: '/admin/logs', label: '감사 로그', sub: '작업 기록 열람' },
  ];

  return (
    <div className="p-10">
      {/* 헤더 */}
      <div className="mb-10">
        <p className="text-[#3a2a1e]/40 text-xs tracking-[0.4em] uppercase mb-2">ArtMart Admin</p>
        <h1 className="text-[#1a1008] text-3xl font-light tracking-wide">운영 대시보드</h1>
        <div className="w-12 h-px bg-[#3a2a1e]/20 mt-4" />
      </div>

      {loading ? (
        <p className="text-[#3a2a1e]/40 text-sm">불러오는 중...</p>
      ) : (
        <>
          {/* 통계 카드 */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {cards.map(card => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          {/* 빠른 액션 */}
          <div>
            <p className="text-[#3a2a1e]/40 text-xs tracking-widest uppercase mb-4">빠른 액션</p>
            <div className="grid grid-cols-4 gap-3">
              {quickActions.map(action => (
                <a
                  key={action.href}
                  href={action.href}
                  className="rounded-2xl p-5 transition-all hover:scale-[1.02] active:scale-95"
                  style={{
                    background: 'rgba(26,16,8,0.08)',
                    border: '1px solid rgba(26,16,8,0.12)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <p className="text-[#1a1008] font-semibold text-sm mb-1">{action.label}</p>
                  <p className="text-[#3a2a1e]/50 text-xs">{action.sub}</p>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
