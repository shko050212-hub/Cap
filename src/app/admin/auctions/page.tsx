'use client';
import { useEffect, useState } from 'react';

export default function AdminAuctionsPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/auctions');
    if (res.ok) {
      const data = await res.json();
      setAuctions(data.auctions || []);
      setBids(data.recent_bids || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (auction_id: number, action: string) => {
    await fetch('/api/admin/auctions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auction_id, action })
    });
    fetchData();
  };

  const statusMeta: Record<string, { label: string; color: string }> = {
    READY:     { label: '준비중',   color: '#888' },
    BIDDING:   { label: '진행중',   color: '#3a7aaa' },
    EXTENDED:  { label: '연장됨',   color: '#b5871a' },
    COMPLETED: { label: '완료',     color: '#3a7a5a' },
    SUSPENDED: { label: '일시정지', color: '#aa3a2a' },
  };

  return (
    <div className="p-10">
      <div className="mb-8">
        <p className="text-[#3a2a1e]/40 text-xs tracking-[0.4em] uppercase mb-2">경매 관리</p>
        <h1 className="text-[#1a1008] text-3xl font-light tracking-wide">경매 모니터링</h1>
        <div className="w-12 h-px bg-[#3a2a1e]/20 mt-4" />
      </div>

      {loading ? <p className="text-[#3a2a1e]/40 text-sm">불러오는 중...</p> : (
        <div className="grid grid-cols-3 gap-6">
          {/* 경매 목록 */}
          <div className="col-span-2 space-y-3">
            <p className="text-[#3a2a1e]/40 text-xs tracking-widest uppercase mb-2">경매 현황</p>
            {auctions.length === 0 ? (
              <div className="rounded-2xl p-8 text-center text-[#3a2a1e]/30 text-sm"
                style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)' }}>
                진행 중인 경매가 없습니다
              </div>
            ) : auctions.map(a => {
              const endMs = a.end_time ? new Date(a.end_time).getTime() : 0;
              const leftMs = endMs - currentTime;
              const m = Math.floor(leftMs / 60000);
              const s = Math.floor((leftMs % 60000) / 1000);
              const meta = statusMeta[a.status] || { label: a.status, color: '#888' };
              return (
                <div key={a.auction_id} className="rounded-2xl p-5"
                  style={{
                    background: a.is_abusing_flagged ? 'rgba(170,58,42,0.08)' : 'rgba(255,255,255,0.45)',
                    border: a.is_abusing_flagged ? '1px solid rgba(170,58,42,0.3)' : '1px solid rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(16px)'
                  }}>
                  {a.is_abusing_flagged && (
                    <div className="text-xs font-bold mb-3 px-3 py-2 rounded-lg" style={{ color: '#aa3a2a', background: 'rgba(170,58,42,0.1)' }}>
                      ⚠ 이상 거래 감지
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[#1a1008] font-semibold">{a.title || `작품 #${a.artwork_id}`}</p>
                      <p className="text-[#3a2a1e]/50 text-sm mt-1">
                        최고가 <span className="text-[#1a1008] font-bold">₩{a.current_highest_bid?.toLocaleString()}</span>
                      </p>
                      {leftMs > 0 && <p className="text-xs mt-1.5" style={{ color: '#b5871a' }}>남은 시간: {m}분 {String(s).padStart(2, '0')}초</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ color: meta.color, background: `${meta.color}18` }}>
                        {meta.label}
                      </span>
                      {a.status === 'BIDDING' && (
                        <button onClick={() => handleAction(a.auction_id, 'suspend')}
                          className="px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: '#aa3a2a' }}>정지</button>
                      )}
                      {a.status === 'SUSPENDED' && (
                        <button onClick={() => handleAction(a.auction_id, 'resume')}
                          className="px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: '#3a7a5a' }}>재개</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 입찰 스트림 */}
          <div>
            <p className="text-[#3a2a1e]/40 text-xs tracking-widest uppercase mb-2">입찰 스트림</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)' }}>
              {bids.length === 0 ? (
                <div className="p-8 text-center text-[#3a2a1e]/30 text-sm">입찰 내역 없음</div>
              ) : (
                <div className="divide-y max-h-[500px] overflow-y-auto" style={{ divideColor: 'rgba(58,42,30,0.06)' }}>
                  {bids.map((bid, i) => (
                    <div key={i} className="p-4">
                      <div className="flex justify-between items-start">
                        <p className="text-[#1a1008] text-xs font-semibold">{bid.artwork_title || `#${bid.artwork_id}`}</p>
                        <span className="text-xs font-bold" style={{ color: '#3a7a5a' }}>₩{bid.amount?.toLocaleString()}</span>
                      </div>
                      <p className="text-[#3a2a1e]/40 text-xs mt-0.5">{bid.email} · {new Date(bid.created_at).toLocaleTimeString('ko-KR')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
