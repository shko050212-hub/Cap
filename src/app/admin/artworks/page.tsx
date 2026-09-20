'use client';
import { useEffect, useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
  IN_STORAGE: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
  INSPECTED: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30',
  EXHIBITED: 'bg-green-400/20 text-green-300 border-green-400/30',
  REJECTED: 'bg-red-400/20 text-red-300 border-red-400/30',
  SOLD: 'bg-gray-400/20 text-gray-300 border-gray-400/30',
};

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: '신청 접수',
  IN_STORAGE: '입고 완료',
  INSPECTED: '검수 완료',
  EXHIBITED: '전시 중',
  REJECTED: '반려',
  SOLD: '판매 완료',
};

export default function AdminArtworksPage() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [rejectReason, setRejectReason] = useState('');
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

  const toggleSelect = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filters = ['', 'REQUESTED', 'IN_STORAGE', 'INSPECTED', 'EXHIBITED', 'REJECTED'];
  const filterLabels: Record<string, string> = { '': '전체', REQUESTED: '신청', IN_STORAGE: '입고', INSPECTED: '검수완료', EXHIBITED: '전시중', REJECTED: '반려' };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">작품 검수 관리</h1>
        <p className="text-gray-500 text-sm mt-1">위탁 작품 상태 관리 및 승인/반려 처리</p>
      </div>

      {/* 필터 칩 */}
      <div className="flex gap-2 mb-6">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition ${
              filter === f ? 'bg-blue-600 border-blue-500 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'
            }`}>
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {/* 일괄 액션 */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
          <span className="text-blue-300 text-sm font-bold">{selected.length}건 선택됨</span>
          <button onClick={() => handleAction(selected, 'approve')} className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded">일괄 승인</button>
          <button onClick={() => { const r = prompt('반려 사유를 입력하세요:'); if (r) handleAction(selected, 'reject', r); }} className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded">일괄 반려</button>
          <button onClick={() => setSelected([])} className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold rounded">선택 해제</button>
        </div>
      )}

      {/* 테이블 */}
      {loading ? (
        <div className="text-gray-500 text-sm">불러오는 중...</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-4 text-left"><input type="checkbox" onChange={e => setSelected(e.target.checked ? artworks.map(a => a.consignment_id) : [])} /></th>
                <th className="p-4 text-left text-gray-400 font-medium">작품</th>
                <th className="p-4 text-left text-gray-400 font-medium">판매자</th>
                <th className="p-4 text-left text-gray-400 font-medium">가격</th>
                <th className="p-4 text-left text-gray-400 font-medium">상태</th>
                <th className="p-4 text-left text-gray-400 font-medium">등록일</th>
                <th className="p-4 text-left text-gray-400 font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {artworks.map(art => (
                <tr key={art.consignment_id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="p-4">
                    <input type="checkbox" checked={selected.includes(art.consignment_id)} onChange={() => toggleSelect(art.consignment_id)} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {art.image_url && <img src={art.image_url} className="w-10 h-10 object-cover rounded" />}
                      <div>
                        <p className="text-white font-medium">{art.title}</p>
                        <p className="text-gray-500 text-xs">{art.sale_type === 'auction' ? '경매' : '일반 판매'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">{art.seller_name || art.seller_email || '-'}</td>
                  <td className="p-4 text-gray-300">₩{art.price?.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded border text-xs font-bold ${STATUS_COLORS[art.status] || 'text-gray-400 bg-gray-800 border-gray-700'}`}>
                      {STATUS_LABELS[art.status] || art.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-xs">{new Date(art.created_at).toLocaleDateString('ko-KR')}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {art.status === 'REQUESTED' && (
                        <>
                          <button onClick={() => handleAction([art.consignment_id], 'approve')} className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded">승인</button>
                          <button onClick={() => { const r = prompt('반려 사유:'); if (r) handleAction([art.consignment_id], 'reject', r); }} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded">반려</button>
                        </>
                      )}
                      {art.image_url && (
                        <button onClick={() => setPreviewArt(art)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold rounded">미리보기</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {artworks.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-gray-600">해당 상태의 작품이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 스케일 프리뷰어 모달 */}
      {previewArt && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setPreviewArt(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold">스케일 미리보기 — {previewArt.title}</h3>
              <button onClick={() => setPreviewArt(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            {/* 가상 벽면 */}
            <div className="relative bg-gray-800 rounded-xl overflow-hidden" style={{ height: 400 }}>
              {/* 눈높이 기준선 (바닥 기준 150cm, 전체 175cm) */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-center pointer-events-none">
                {/* 성인 실루엣 */}
                <div className="relative" style={{ height: 350, width: 60 }}>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-gray-600/60 rounded-full" style={{ width: 30, height: 30, bottom: 320 }} />
                  <div className="absolute bg-gray-600/60 rounded-sm" style={{ width: 20, height: 140, bottom: 180, left: '50%', transform: 'translateX(-50%)' }} />
                  <div className="absolute bg-gray-600/60 rounded-sm" style={{ width: 60, height: 8, bottom: 240, left: '50%', transform: 'translateX(-50%)' }} />
                  <div className="absolute bg-gray-600/60 rounded-sm" style={{ width: 12, height: 90, bottom: 90, left: 0 }} />
                  <div className="absolute bg-gray-600/60 rounded-sm" style={{ width: 12, height: 90, bottom: 90, right: 0 }} />
                  <div className="absolute bg-gray-600/60 rounded-sm" style={{ width: 14, height: 90, bottom: 0, left: 8 }} />
                  <div className="absolute bg-gray-600/60 rounded-sm" style={{ width: 14, height: 90, bottom: 0, right: 8 }} />
                </div>
              </div>
              {/* 눈높이 선 */}
              <div className="absolute inset-x-0 border-t border-dashed border-blue-400/50" style={{ bottom: `${(150 / 175) * 350}px` }}>
                <span className="absolute right-2 -top-4 text-blue-400 text-xs">눈높이 150cm</span>
              </div>
              {/* 작품 이미지 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ marginLeft: 60 }}>
                <img src={previewArt.image_url}
                  style={{
                    width: Math.min((previewArt.width_cm || 60) * 2, 300),
                    height: Math.min((previewArt.height_cm || 60) * 2, 300),
                    objectFit: 'contain',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}
                />
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-3 text-center">
              작품 크기: {previewArt.width_cm || '?'}cm × {previewArt.height_cm || '?'}cm | 1px ≈ 0.5cm 기준 렌더링
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
