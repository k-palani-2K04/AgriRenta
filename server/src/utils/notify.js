import Notification from '../models/Notification.js';

export async function createNotification({ userId, type, title, body, bookingId, payload }) {
  if (!userId) return null;
  try {
    return await Notification.create({
      userId,
      type,
      title,
      body: body || '',
      bookingId: bookingId || undefined,
      payload: payload || {}
    });
  } catch (error) {
    console.error('[Notify] Failed to create notification:', error.message);
    return null;
  }
}

export async function notifyBookingParties(booking, { type, title, body, payload }) {
  const farmerId = booking.farmerId?._id || booking.farmerId;
  const providerId = booking.providerId?._id || booking.providerId;
  const bookingId = booking._id;

  await Promise.all([
    createNotification({ userId: farmerId, type, title, body, bookingId, payload }),
    createNotification({ userId: providerId, type, title, body, bookingId, payload })
  ]);
}
