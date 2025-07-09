import { NotificationPreferences } from '../../../shared/types';

export async function getNotificationPreferences(token: string): Promise<NotificationPreferences | null> {
  const res = await fetch('/api/notification-preferences', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  return await res.json();
}

export async function saveNotificationPreferences(token: string, prefs: NotificationPreferences): Promise<boolean> {
  const res = await fetch('/api/notification-preferences', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(prefs)
  });
  return res.ok;
}
