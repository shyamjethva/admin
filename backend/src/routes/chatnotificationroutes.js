import { Router } from 'express';
import ChatNotificationController from '../controllers/chatnotificationcontroller.js';
import { protect as authenticateToken } from '../middleware/authmiddleware.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get user's notifications
router.get('/', async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const notifications = await ChatNotificationController.getUserNotifications(
            req.user.id,
            parseInt(limit)
        );
        res.json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get user's unread notification count
router.get('/unread-count', async (req, res) => {
    try {
        const count = await ChatNotificationController.getUserUnreadCount(req.user.id);
        res.json({ success: true, data: { count } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get unread count by conversation
router.get('/unread-count/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const count = await ChatNotificationController.getUnreadCountByConversation(
            req.user.id,
            conversationId
        );
        res.json({ success: true, data: { count } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const notification = await ChatNotificationController.markAsRead(
            req.params.id,
            req.user.id
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Mark all notifications as read
router.put('/read-all', async (req, res) => {
    try {
        const result = await ChatNotificationController.markAllAsRead(req.user.id);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Mark conversation as read
router.put('/conversation/:conversationId/read', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const result = await ChatNotificationController.markConversationAsRead(
            req.user.id,
            conversationId
        );
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete notification
router.delete('/:id', async (req, res) => {
    try {
        const result = await ChatNotificationController.deleteNotification(
            req.params.id,
            req.user.id
        );

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get recent notifications for popup display
router.get('/recent', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const notifications = await ChatNotificationController.getRecentNotifications(
            req.user.id,
            parseInt(limit)
        );
        res.json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;