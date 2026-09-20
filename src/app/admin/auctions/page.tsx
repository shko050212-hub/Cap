'use client';
import { useEffect, useState, useRef } from 'react';

export default function AdminAuctionsPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const prevPrices = useRef<Record<number, number>>({});

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/admin/auctions');
      if (res.ok) {
        const data = await res.json();
        
        // 이전 가격 저장 (주식 차트처럼 깜빡임 효과를 위해)
        setAuctions(prev => {
          if (prev.length > 0) {
            const prices: Record<number, number> = {};
            prev.forEach(p => prices[p.auction_id] = p.current_highest_bid);
            prevPrices.current = prices;
          }
          return data.auctions || [];
        });
        setBids(data.recent_bids || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // 초기 로드
    // 실시간 주식 호가창처럼 2초마다 백그라운드 폴링 (Live Ticker)
    const liveInterval = setInterval(() => fetchData(true), 2000);
    return () => clearInterval(liveInterval);
  }, []);

  const handleAction = async (auction_id: number, action: string) => {
    await fetch('/api/admin/auctions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auction_id, action })
    });
    fetchData(true);
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
      <div className="mb-8 flex justify-between items-end">
        <div>
          <p className="text-[#3a2a1e]/40 text-xs tracking-[0.4em] uppercase mb-2">경매 관리</p>
          <div className="flex items-center gap-3">
            <h1 className="text-[#1a1008] text-3xl font-light tracking-wide">실시간 경매 호가창</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-600 rounded-full text-[10px] font-bold tracking-wider animate-pulse border border-red-500/20">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> LIVE
            </span>
          </div>
          <div className="w-12 h-px bg-[#3a2a1e]/20 mt-4" />
        </div>
      </div>

      {loading ? <p className="text-[#3a2a1e]/40 text-sm">불러오는 중...</p> : (
        <div className="grid grid-cols-3 gap-6">
          {/* 경매 목록 */}
          <div className="col-span-2 space-y-3">
            <p className="text-[#3a2a1e]/40 text-xs tracking-widest uppercase mb-2">실시간 경매 종목</p>
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
              
              // 가격 상승 여부 체크 (주식처럼 빨간불)
              const oldPrice = prevPrices.current[a.auction_id] || a.current_highest_bid;
              const isUp = a.current_highest_bid > oldPrice;

              return (
                <div key={a.auction_id} className="rounded-2xl p-4 transition-all duration-500"
                  style={{
                    background: isUp ? 'rgba(239,68,68,0.1)' : (a.is_abusing_flagged ? 'rgba(170,58,42,0.08)' : 'rgba(255,255,255,0.45)'),
                    border: isUp ? '1px solid rgba(239,68,68,0.3)' : (a.is_abusing_flagged ? '1px solid rgba(170,58,42,0.3)' : '1px solid rgba(255,255,255,0.6)'),
                    backdropFilter: 'blur(16px)',
                    transform: isUp ? 'scale(1.02)' : 'scale(1)'
                  }}>
                  <div className="flex gap-4 items-center">
                    {/* 작품 이미지 추가 */}
                    <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-[#3a2a1e]/10 bg-[#e8ddd4]">
                      {a.image_url ? (
                        <img src={a.image_url} alt="artwork" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#3a2a1e]/30 text-[10px]">No Image</div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      {a.is_abusing_flagged && (
                        <div className="text-[10px] font-bold mb-1 px-2 py-0.5 rounded inline-block" style={{ color: '#aa3a2a', background: 'rgba(170,58,42,0.1)' }}>
                          ⚠ 이상 거래 감지
                        </div>
                      )}
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[#1a1008] font-bold text-lg">{a.title || `작품 #${a.artwork_id}`}</p>
                          <p className="text-[#3a2a1e]/50 text-xs mt-0.5">최고 입찰자: {a.winner_email || '없음'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#3a2a1e]/50 text-[10px] uppercase tracking-wider mb-0.5">현재 호가</p>
                          <p className={`font-bold text-2xl transition-colors duration-500 ${isUp ? 'text-red-600' : 'text-[#1a1008]'}`}>
                            {isUp && <span className="text-sm mr-1">▲</span>}
                            ₩{a.current_highest_bid?.toLocaleString()}
                          </p>
                          {leftMs > 0 && (
                            <p className="text-xs mt-1 font-mono" style={{ color: '#b5871a' }}>
                              마감 {m}:{String(s).padStart(2, '0')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 ml-4 pl-4 border-l border-[#3a2a1e]/10">
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap" style={{ color: meta.color, background: `${meta.color}18` }}>
                        {meta.label}
                      </span>
                      {a.status === 'BIDDING' && (
                        <button onClick={() => handleAction(a.auction_id, 'suspend')}
                          className="px-3 py-1.5 rounded-full text-xs font-bold text-white transition hover:bg-red-700" style={{ background: '#aa3a2a' }}>거래 정지</button>
                      )}
                      {a.status === 'SUSPENDED' && (
                        <button onClick={() => handleAction(a.auction_id, 'resume')}
                          className="px-3 py-1.5 rounded-full text-xs font-bold text-white transition hover:bg-green-700" style={{ background: '#3a7a5a' }}>거래 재개</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 입찰 체결 스트림 */}
          <div>
            <p className="text-[#3a2a1e]/40 text-xs tracking-widest uppercase mb-2">실시간 체결 내역</p>
            <div className="rounded-2xl overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)' }}>
              {bids.length === 0 ? (
                <div className="p-8 text-center text-[#3a2a1e]/30 text-sm">체결 내역 없음</div>
              ) : (
                <div className="divide-y divide-[rgba(58,42,30,0.06)] max-h-[600px] overflow-y-auto">
                  {bids.map((bid, i) => (
                    <div key={bid.id || i} className="p-4 animate-[fadeIn_0.5s_ease-out]">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-[#1a1008] text-xs font-bold truncate pr-2">{bid.artwork_title || `#${bid.artwork_id}`}</p>
                        <span className="text-xs font-bold text-red-600 whitespace-nowrap">
                          {Number(bid.amount) < 0 ? `₩${Math.abs(bid.amount).toLocaleString()}` : `₩${bid.amount?.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[#3a2a1e]/40 text-[10px] truncate max-w-[120px]">{bid.email}</p>
                        <p className="text-[#3a2a1e]/30 text-[10px] font-mono">{new Date(bid.created_at).toLocaleTimeString('ko-KR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* 블러 그라디언트 (하단) */}
              <div className="absolute bottom-0 inset-x-0 h-10 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(245,237,230,0.9), transparent)' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
