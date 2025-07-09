import React, { useEffect, useState } from 'react';

interface Notification {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  read?: boolean;
}

const Notifications: React.FC<{ token: string | null; onUnreadCount?: (count: number) => void }> = ({ token, onUnreadCount }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = () => {
    if (!token) return;
    setLoading(true);
    fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setNotifications(data);
        if (onUnreadCount) onUnreadCount(data.filter((n: any) => !n.read).length);
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, [token]);

  const markAsRead = async (id: string) => {
    if (!token) return;
    await fetch(`/api/notifications/${id}/read`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    fetchNotifications();
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4">Moje notifikace</h2>
      {loading ? <div>Načítám…</div> : (
        <ul>
          {notifications.length === 0 && <li>Žádné notifikace.</li>}
          {notifications.map(n => (
            <li key={n.id} className={`mb-2 p-2 border-b text-sm ${!n.read ? 'bg-yellow-50' : ''}`.trim()}>
              <span className="font-bold">[{n.type}]</span> {n.message}
              <span className="block text-gray-500 text-xs">{new Date(n.createdAt).toLocaleString()}</span>
              {!n.read && (
                <button onClick={() => markAsRead(n.id)} className="ml-2 text-xs text-blue-600 underline">Označit jako přečtené</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
