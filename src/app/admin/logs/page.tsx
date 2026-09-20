'use client';
import { useEffect, useState } from 'react';

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'text-blue-300 bg-blue-900/20 border-blue-700',
  APPROVE: 'text-green-300 bg-green-900/20 border-green-700',
  REJECT: 'text-red-300 bg-red-900/20 border-red-700',
  BID_CANCEL: 'text-amber-300 bg-amber-900/20 border-amber-700',
  REFUND: 'text-purple-300 bg-purple-900/20 border-purple-700',
  ROLE_CHANGE: 'text-cyan-300 bg-cyan-900/20 border-cyan-700',
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
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">감사 로그</h1>
        <p className="text-gray-500 text-sm mt-1">모든 관리자 작업이 불변 기록으로 저장됩니다</p>
      </div>

      {loading ? <div className="text-gray-500 text-sm">불러오는 중...</div> : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-4 text-left text-gray-400 font-medium">시각</th>
                <th className="p-4 text-left text-gray-400 font-medium">관리자</th>
                <th className="p-4 text-left text-gray-400 font-medium">액션</th>
                <th className="p-4 text-left text-gray-400 font-medium">대상</th>
                <th className="p-4 text-left text-gray-400 font-medium">사유</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.log_id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="p-4 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('ko-KR')}
                  </td>
                  <td className="p-4 text-gray-300 text-xs">{log.admin_email || `#${log.admin_id}`}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded border text-xs font-bold ${ACTION_COLORS[log.action_type] || 'text-gray-400 bg-gray-800 border-gray-700'}`}>
                      {log.action_type}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-xs">{log.target_domain} #{log.target_id}</td>
                  <td className="p-4 text-gray-500 text-xs">{log.reason || '-'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-600">로그가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
