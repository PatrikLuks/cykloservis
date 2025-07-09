import webpush from 'web-push';
// @ts-ignore
import { getVapidKeys } from './vapidKeys';
import PushSubscription from '../models/PushSubscription';

const vapidKeys = getVapidKeys();
webpush.setVapidDetails(
  'mailto:info@cykloservis.cz',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export async function sendPushToUser(userId: string, payload: any) {
  const subscriptions = await PushSubscription.find({ userId });
  const notificationPayload = JSON.stringify(payload);
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: sub.keys
      }, notificationPayload);
    } catch (err: any) {
      // Pokud subscription expirovala, smažeme ji
      if (err.statusCode === 410 || err.statusCode === 404) {
        await PushSubscription.deleteOne({ _id: sub._id });
      }
    }
  }
}
