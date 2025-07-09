import React, { useEffect, useState } from 'react';

interface AuditLog {
  _id: string;
  userId?: string;
  action: string;
  details?: any;
  createdAt: string;
}

const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [userId, setUserId] = useState('');
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (action) params.append('action', action);
    params.append('limit', '100');
    const res = await fetch(`/api/audit-logs?${params.toString()}`);
    const data = await res.json();
    setLogs(data);
    setLoading(false);
  };

  // Export logů do CSV
  const exportToCSV = () => {
    const header = ['Datum', 'Uživatel', 'Akce', 'Detaily'];
    const rows = logs.map(log => [
      new Date(log.createdAt).toLocaleString(),
      log.userId || '-',
      log.action,
      JSON.stringify(log.details)
    ]);
    const csvContent = [header, ...rows].map(r => r.map(f => '"' + f.replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white dark:bg-gray-800 rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4">Audit log</h2>
      <form className="flex gap-2 mb-4 flex-wrap" onSubmit={e => { e.preventDefault(); fetchLogs(); }}>
        <input
          className="border rounded px-2 py-1 dark:bg-gray-900 dark:text-white"
          placeholder="userId"
          value={userId}
          onChange={e => setUserId(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1 dark:bg-gray-900 dark:text-white"
          placeholder="action (např. POST /api/service-records)"
          value={action}
          onChange={e => setAction(e.target.value)}
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded disabled:opacity-50 min-w-[90px]">Filtrovat</button>
        <button type="button" onClick={exportToCSV} className="bg-blue-600 text-white px-4 py-1 rounded min-w-[90px]">Export CSV</button>
      </form>
      {loading ? <div>Načítání…</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-2">Datum</th>
                <th className="p-2">Uživatel</th>
                <th className="p-2">Akce</th>
                <th className="p-2">Detaily</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-2 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-2 whitespace-nowrap">{log.userId || '-'}</td>
                  <td className="p-2 whitespace-nowrap">{log.action}</td>
                  <td className="p-2 max-w-xs overflow-x-auto">
                    <pre className="whitespace-pre-wrap break-all text-xs bg-gray-50 dark:bg-gray-900 p-1 rounded max-h-32 overflow-y-auto">{JSON.stringify(log.details, null, 2)}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;
