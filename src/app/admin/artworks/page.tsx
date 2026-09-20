'use client';
import { useEffect, useState } from 'react';

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  REQUESTED:  { label: '신청 접수', color: '#b5871a', bg: 'rgba(213,168,67,0.15)' },
  IN_STORAGE: { label: '입고 완료', color: '#3a7aaa', bg: 'rgba(58,122,170,0.15)' },
  INSPECTED:  { label: '검수 완료', color: '#3a7a5a', bg: 'rgba(58,122,90,0.15)' },
  EXHIBITED:  { label: '전시 중',   color: '#2a6a3a', bg: 'rgba(42,106,58,0.15)' },
  REJECTED:   { label: '반려',      color: '#aa3a2a', bg: 'rgba(170,58,42,0.15)' },
  SOLD:       { label: '판매 완료', color: '#5a5a5a', bg: 'rgba(90,90,90,0.15)' },
};

function Badge({ status }: { status: string }) {
  const meta = STATUS_META[status] || { label: status, color: '#888', bg: 'rgba(0,0,0,0.05)' };
  return (
    <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ color: meta.color, background: meta.bg }}>
      {meta.label}
    </span>
  );
}

export default function AdminArtworksPage() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [previewArt, setPreviewArt] = useState<any>(null);

  const fetchArtworks = async (status = '') => {
    setLoading(true);
    const res = await fetch(`/api/admin/artworks${status ? `?status=${status}` : ''}`);
    if (res.ok) {
      const data = await res.json();
      setArtworks(data.artworks);
    }
    setLoading(false);
  };

  useEffect(() => { fetchArtworks(filter); }, [filter]);

  const handleAction = async (ids: number[], action: string, reason = '') => {
    for (const id of ids) {
      await fetch('/api/admin/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consignment_id: id, action, reject_reason: reason })
      });
    }
    setSelected([]);
    fetchArtworks(filter);
  };

  const filters = [
    { value: '', label: '전체' },
    { value: 'REQUESTED', label: '신청' },
    { value: 'INSPECTED', label: '검수완료' },
    { value: 'EXHIBITED', label: '전시중' },
    { value: 'REJECTED', label: '반려' },
  ];

  return (
    <div className="p-10">
      <div className="mb-8">
        <p className="text-[#3a2a1e]/40 text-xs tracking-[0.4em] uppercase mb-2">작품 관리</p>
        <h1 className="text-[#1a1008] text-3xl font-light tracking-wide">검수 관리</h1>
        <div className="w-12 h-px bg-[#3a2a1e]/20 mt-4" />
      </div>

      {/* 필터 칩 */}
      <div className="flex gap-2 mb-6">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: filter === f.value ? '#1a1008' : 'rgba(255,255,255,0.5)',
              color: filter === f.value ? '#f5ede6' : '#3a2a1e',
              border: '1px solid ' + (filter === f.value ? '#1a1008' : 'rgba(58,42,30,0.15)'),
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 일괄 액션 */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(58,42,30,0.15)' }}>
          <span className="text-[#1a1008] text-sm font-semibold">{selected.length}건 선택</span>
          <button onClick={() => handleAction(selected, 'approve')}
            className="px-4 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: '#3a7a5a' }}>
            일괄 승인
          </button>
          <button onClick={() => { const r = prompt('반려 사유:'); if (r) handleAction(selected, 'reject', r); }}
            className="px-4 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: '#aa3a2a' }}>
            일괄 반려
          </button>
          <button onClick={() => setSelected([])}
            className="px-4 py-1.5 rounded-full text-xs font-bold" style={{ background: 'rgba(58,42,30,0.1)', color: '#3a2a1e' }}>
            해제
          </button>
        </div>
      )}

      {/* 테이블 */}
      {loading ? (
        <p className="text-[#3a2a1e]/40 text-sm">불러오는 중...</p>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.6)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(58,42,30,0.1)' }}>
                <th className="p-4 text-left">
                  <input type="checkbox" onChange={e => setSelected(e.target.checked ? artworks.map(a => a.consignment_id) : [])} />
                </th>
                <th className="p-4 text-left text-[#3a2a1e]/50 font-medium text-xs uppercase tracking-wider">작품</th>
                <th className="p-4 text-left text-[#3a2a1e]/50 font-medium text-xs uppercase tracking-wider">판매자</th>
                <th className="p-4 text-left text-[#3a2a1e]/50 font-medium text-xs uppercase tracking-wider">가격</th>
                <th className="p-4 text-left text-[#3a2a1e]/50 font-medium text-xs uppercase tracking-wider">상태</th>
                <th className="p-4 text-left text-[#3a2a1e]/50 font-medium text-xs uppercase tracking-wider">등록일</th>
                <th className="p-4 text-left text-[#3a2a1e]/50 font-medium text-xs uppercase tracking-wider">액션</th>
              </tr>
            </thead>
            <tbody>
              {artworks.map(art => (
                <tr key={art.consignment_id} style={{ borderBottom: '1px solid rgba(58,42,30,0.06)' }}
                  className="hover:bg-white/20 transition">
                  <td className="p-4">
                    <input type="checkbox" checked={selected.includes(art.consignment_id)} onChange={() => setSelected(prev => prev.includes(art.consignment_id) ? prev.filter(x => x !== art.consignment_id) : [...prev, art.consignment_id])} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {art.image_url && <img src={art.image_url} className="w-12 h-12 object-cover rounded-lg" style={{ border: '1px solid rgba(58,42,30,0.1)' }} />}
                      <div>
                        <p className="text-[#1a1008] font-semibold">{art.title}</p>
                        <p className="text-[#3a2a1e]/40 text-xs mt-0.5">{art.sale_type === 'auction' ? '경매' : '일반'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-[#3a2a1e]/70">{art.seller_name || art.seller_email || '-'}</td>
                  <td className="p-4 text-[#1a1008] font-medium">₩{art.price?.toLocaleString()}</td>
                  <td className="p-4"><Badge status={art.status} /></td>
                  <td className="p-4 text-[#3a2a1e]/40 text-xs">{new Date(art.created_at).toLocaleDateString('ko-KR')}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {art.status === 'REQUESTED' && (
                        <>
                          <button onClick={() => handleAction([art.consignment_id], 'approve')}
                            className="px-3 py-1.5 rounded-full text-xs font-bold text-white transition" style={{ background: '#3a7a5a' }}>승인</button>
                          <button onClick={() => { const r = prompt('반려 사유:'); if (r) handleAction([art.consignment_id], 'reject', r); }}
                            className="px-3 py-1.5 rounded-full text-xs font-bold text-white transition" style={{ background: '#aa3a2a' }}>반려</button>
                        </>
                      )}
                      {art.image_url && (
                        <button onClick={() => setPreviewArt(art)}
                          className="px-3 py-1.5 rounded-full text-xs font-bold transition" style={{ background: 'rgba(58,42,30,0.1)', color: '#3a2a1e' }}>미리보기</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {artworks.length === 0 && (
                <tr><td colSpan={7} className="p-10 text-center text-[#3a2a1e]/30 text-sm">해당 상태의 작품이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 스케일 프리뷰어 */}
      {previewArt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(26,16,8,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setPreviewArt(null)}>
          <div className="rounded-2xl p-6 max-w-2xl w-full mx-4" style={{ background: 'rgba(245,237,230,0.95)', border: '1px solid rgba(58,42,30,0.2)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-[#3a2a1e]/40 text-xs tracking-widest uppercase">스케일 미리보기</p>
                <h3 className="text-[#1a1008] font-semibold mt-1">{previewArt.title}</h3>
              </div>
              <button onClick={() => setPreviewArt(null)} className="text-[#3a2a1e]/40 hover:text-[#1a1008] text-xl">✕</button>
            </div>
            <div className="relative rounded-xl overflow-hidden" style={{ height: 380, background: '#e8ddd4' }}>
              {/* 성인 실루엣 */}
              <div className="absolute bottom-0 left-16 flex flex-col items-center" style={{ height: 350 }}>
                <div className="rounded-full bg-[#3a2a1e]/20" style={{ width: 24, height: 24, marginBottom: 2 }} />
                <div className="rounded-sm bg-[#3a2a1e]/20" style={{ width: 16, height: 100 }} />
                <div className="rounded-sm bg-[#3a2a1e]/20" style={{ width: 10, height: 100 }} />
              </div>
              {/* 눈높이 선 */}
              <div className="absolute inset-x-0" style={{ bottom: `${(150 / 175) * 350}px`, borderTop: '1px dashed rgba(58,42,30,0.3)' }}>
                <span className="absolute right-3 -top-4 text-[#3a2a1e]/40 text-xs">눈높이 150cm</span>
              </div>
              {/* 작품 이미지 */}
              <div className="absolute top-1/2 left-1/2" style={{ transform: 'translate(-50%, -50%)', marginLeft: 40 }}>
                <img src={previewArt.image_url}
                  style={{
                    width: Math.min((previewArt.width_cm || 60) * 2, 280),
                    height: Math.min((previewArt.height_cm || 60) * 2, 280),
                    objectFit: 'contain',
                    border: '2px solid rgba(58,42,30,0.2)',
                    borderRadius: 4
                  }}
                />
              </div>
            </div>
            <p className="text-[#3a2a1e]/40 text-xs mt-3 text-center">
              {previewArt.width_cm || '?'}cm × {previewArt.height_cm || '?'}cm
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
