// Pomocná utilita pro registraci service workeru a push subscription
export async function registerPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { supported: false };
  }
  const registration = await navigator.serviceWorker.register('/service-worker.js');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { supported: true, granted: false };
  }
  // Získání VAPID public key z backendu
  const res = await fetch('/api/push/vapid-public-key');
  const { publicKey } = await res.json();
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey)
  });
  // Odeslání subscription na backend
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify(subscription)
  });
  return { supported: true, granted: true };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
