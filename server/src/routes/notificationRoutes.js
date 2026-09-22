import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const unreadOnly = req.query.unread === 'true';
    const filter = { userId: req.user._id };
    if (unreadOnly) filter.read = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(40);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false
    });

    return res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('[NotificationRoutes] List error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load notifications' });
  }
});

router.put('/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to mark all read' });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    return res.json({ success: true, notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to mark notification read' });
  }
});

export default router;
