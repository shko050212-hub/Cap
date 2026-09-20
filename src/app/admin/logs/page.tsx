'use client';
import { useEffect, useState } from 'react';

const ACTION_META: Record<string, { label: string; color: string }> = {
  LOGIN:       { label: 'LOGIN',       color: '#3a7aaa' },
  APPROVE:     { label: 'APPROVE',     color: '#3a7a5a' },
  REJECT:      { label: 'REJECT',      color: '#aa3a2a' },
  BID_CANCEL:  { label: 'BID_CANCEL',  color: '#b5871a' },
  REFUND:      { label: 'REFUND',      color: '#8a5aaa' },
  ROLE_CHANGE: { label: 'ROLE_CHANGE', color: '#5a9aaa' },
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await fetch('/api/admin/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  return (
    <div className="p-10">
      <div className="mb-8">
        <p className="text-[#3a2a1e]/40 text-xs tracking-[0.4em] uppercase mb-2">보안</p>
        <h1 className="text-[#1a1008] text-3xl font-light tracking-wide">감사 로그</h1>
        <div className="w-12 h-px bg-[#3a2a1e]/20 mt-4" />
        <p className="text-[#3a2a1e]/40 text-xs mt-3">모든 관리자 작업은 불변 기록으로 저장됩니다</p>
      </div>

      {loading ? (
        <p className="text-[#3a2a1e]/40 text-sm">불러오는 중...</p>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.6)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(58,42,30,0.1)' }}>
                {['시각', '관리자', '액션', '대상', '사유'].map(h => (
                  <th key={h} className="p-4 text-left text-[#3a2a1e]/40 font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(log => {
                const meta = ACTION_META[log.action_type] || { label: log.action_type, color: '#888' };
                return (
                  <tr key={log.log_id} className="hover:bg-white/20 transition" style={{ borderBottom: '1px solid rgba(58,42,30,0.06)' }}>
                    <td className="p-4 text-[#3a2a1e]/50 text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('ko-KR')}
                    </td>
                    <td className="p-4 text-[#3a2a1e]/70 text-xs">{log.admin_email || `#${log.admin_id}`}</td>
                    <td className="p-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ color: meta.color, background: `${meta.color}18` }}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="p-4 text-[#3a2a1e]/50 text-xs">{log.target_domain} #{log.target_id}</td>
                    <td className="p-4 text-[#3a2a1e]/40 text-xs">{log.reason || '—'}</td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr><td colSpan={5} className="p-10 text-center text-[#3a2a1e]/30 text-sm">로그가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
