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

  const handleAuctionAction = async (auction_id: number, action: string) => {
    await fetch('/api/admin/auctions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auction_id, action })
    });
    fetchData();
  };

  const STATUS_COLORS: Record<string, string> = {
    READY: 'text-gray-400 bg-gray-800 border-gray-700',
    BIDDING: 'text-blue-300 bg-blue-900/30 border-blue-700',
    EXTENDED: 'text-amber-300 bg-amber-900/30 border-amber-700',
    COMPLETED: 'text-green-300 bg-green-900/30 border-green-700',
    SUSPENDED: 'text-red-300 bg-red-900/30 border-red-700',
    FAILED: 'text-red-400 bg-red-900/20 border-red-800',
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">경매 모니터링</h1>
        <p className="text-gray-500 text-sm mt-1">실시간 경매 현황 및 이상 거래 감지</p>
      </div>

      {loading ? <div className="text-gray-500 text-sm">불러오는 중...</div> : (
        <div className="grid grid-cols-3 gap-6">
          {/* 경매 목록 */}
          <div className="col-span-2">
            <h2 className="text-gray-300 font-bold mb-3 text-sm uppercase tracking-wider">경매 현황</h2>
            <div className="space-y-3">
              {auctions.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-gray-600 text-sm text-center">진행 중인 경매가 없습니다.</div>
              ) : auctions.map(a => {
                const endMs = a.end_time ? new Date(a.end_time).getTime() : 0;
                const leftMs = endMs - currentTime;
                const m = Math.floor(leftMs / 60000);
                const s = Math.floor((leftMs % 60000) / 1000);
                return (
                  <div key={a.auction_id} className={`bg-gray-900 border rounded-xl p-4 ${a.is_abusing_flagged ? 'border-red-500' : 'border-gray-800'}`}>
                    {a.is_abusing_flagged && (
                      <div className="flex items-center gap-2 mb-3 text-red-400 text-xs font-bold bg-red-900/20 px-3 py-2 rounded">
                        ⚠️ 이상 거래 감지됨
                      </div>
                    )}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-bold">{a.title || `작품 #${a.artwork_id}`}</p>
                        <p className="text-gray-400 text-xs mt-1">현재 최고가: <span className="text-white font-bold">₩{a.current_highest_bid?.toLocaleString()}</span></p>
                        {leftMs > 0 && <p className="text-amber-400 text-xs mt-1">남은 시간: {m}분 {String(s).padStart(2, '0')}초</p>}
                        {leftMs <= 0 && a.status === 'BIDDING' && <p className="text-red-400 text-xs mt-1">마감</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded border text-xs font-bold ${STATUS_COLORS[a.status] || 'text-gray-400'}`}>{a.status}</span>
                        {a.status === 'BIDDING' && (
                          <button onClick={() => handleAuctionAction(a.auction_id, 'suspend')} className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded">정지</button>
                        )}
                        {a.status === 'SUSPENDED' && (
                          <button onClick={() => handleAuctionAction(a.auction_id, 'resume')} className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white text-xs font-bold rounded">재개</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 최근 입찰 스트림 */}
          <div>
            <h2 className="text-gray-300 font-bold mb-3 text-sm uppercase tracking-wider">최근 입찰 스트림</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {bids.length === 0 ? (
                <div className="p-6 text-gray-600 text-sm text-center">입찰 내역이 없습니다.</div>
              ) : (
                <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
                  {bids.map((bid, i) => (
                    <div key={i} className="p-3">
                      <div className="flex justify-between items-start">
                        <p className="text-gray-300 text-xs font-medium">{bid.artwork_title || `작품 #${bid.artwork_id}`}</p>
                        <span className="text-green-400 text-xs font-bold">₩{bid.amount?.toLocaleString()}</span>
                      </div>
                      <p className="text-gray-600 text-xs mt-0.5">{bid.email} · {new Date(bid.created_at).toLocaleTimeString('ko-KR')}</p>
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
