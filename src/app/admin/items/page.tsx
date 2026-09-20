'use client';
import { useEffect, useState, useRef } from 'react';

export default function AdminItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const prevPrices = useRef<Record<number, number>>({});

  const fetchItems = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/admin/all-items');
      if (res.ok) {
        const data = await res.json();
        
        setItems(prev => {
          if (prev.length > 0) {
            const prices: Record<number, number> = {};
            prev.forEach(p => prices[p.id] = p.currentPrice);
            prevPrices.current = prices;
          }
          return data.items || [];
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // 2초마다 폴링으로 실시간 주식 호가 변동 효과
    const interval = setInterval(() => fetchItems(true), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-10">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <p className="text-[#3a2a1e]/40 text-xs tracking-[0.4em] uppercase mb-2">물품 전체</p>
          <div className="flex items-center gap-3">
            <h1 className="text-[#1a1008] text-3xl font-light tracking-wide">상품 보기</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-600 rounded-full text-[10px] font-bold tracking-wider animate-pulse border border-red-500/20">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> LIVE TICKER
            </span>
          </div>
          <div className="w-12 h-px bg-[#3a2a1e]/20 mt-4" />
        </div>
      </div>

      {loading ? (
        <p className="text-[#3a2a1e]/40 text-sm">불러오는 중...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {items.map(item => {
            const oldPrice = prevPrices.current[item.id] || item.currentPrice;
            const isUp = item.currentPrice > oldPrice;

            return (
              <div key={item.id} className="rounded-xl overflow-hidden transition-all duration-500 relative flex flex-col"
                style={{
                  background: isUp ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.45)',
                  border: isUp ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(16px)',
                  transform: isUp ? 'scale(1.05)' : 'scale(1)'
                }}>
                
                {/* 뱃지 */}
                <div className="absolute top-2 left-2 z-10 flex gap-1">
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full text-white" 
                    style={{ background: item.saleType === 'auction' ? '#8a5aaa' : '#3a7aaa' }}>
                    {item.saleType === 'auction' ? '경매' : '일반'}
                  </span>
                  {item.saleType === 'auction' && (
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded-full text-red-600 bg-red-100 border border-red-200 animate-pulse">
                      실시간 호가 반영
                    </span>
                  )}
                </div>

                {/* 이미지 */}
                <div className="w-full aspect-square bg-[#e8ddd4] relative">
                  <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                </div>

                {/* 정보 */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[#1a1008] font-bold text-sm truncate">{item.title}</p>
                    <p className="text-[#3a2a1e]/50 text-[10px] mt-0.5">{item.artist} · {item.type}</p>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-[#3a2a1e]/10 text-right">
                    <p className="text-[#3a2a1e]/40 text-[9px] uppercase tracking-wider mb-0.5">
                      {item.saleType === 'auction' ? (item.isBidded ? '현재 최고 호가' : '시작가') : '판매가'}
                    </p>
                    <p className={`font-bold text-lg transition-colors duration-500 ${isUp ? 'text-red-600' : 'text-[#1a1008]'}`}>
                      {isUp && <span className="text-xs mr-1">▲</span>}
                      ₩{item.currentPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
