const Notification = require('../models/Notification');
const User = require('../models/User');
const { createEvent } = require('../services/calendarService');

// Get all notifications for logged-in user
const getNotifications = async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? { recipientType: 'admin' }
      : { userId: req.user.userId };

    const notifications = await Notification.find(query)
      .sort({ timestamp: -1 })
      .lean();

    res.json(notifications);
  } catch (err) {
    console.error('Fetch notifications error:', err.message);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const query = {
      read: false,
      ...(req.user.role === 'admin'
        ? { recipientType: 'admin' }
        : { userId: req.user.userId })
    };

    const count = await Notification.countDocuments(query);
    res.json({ unreadCount: count });
  } catch (err) {
    console.error('Unread count error:', err.message);
    res.status(500).json({ error: 'Failed to count unread notifications' });
  }
};

// Mark one notification as read
const markAsRead = async (req, res) => {
  try {
    const updated = await Notification.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { read: true } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Mark as read error:', err.message);
    res.status(500).json({ error: 'Failed to update notification' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const query = {
      read: false,
      ...(req.user.role === 'admin'
        ? { recipientType: 'admin' }
        : { userId: req.user.userId })
    };

    await Notification.updateMany(query, { $set: { read: true } });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all error:', err.message);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
};

// Create notification and optionally sync to calendar
const createNotification = async (req, res) => {
  try {
    const { userId, message, status, recipientType, syncToCalendar, calendarDetails } = req.body;

    const notification = await Notification.create({
      userId,
      message,
      status,
      recipientType,
      type: 'appointment'
    });

    if (syncToCalendar && calendarDetails?.start && calendarDetails?.end) {
      const user = await User.findById(userId);
      if (user?.googleAccessToken && user?.googleRefreshToken) {
        const calendarEvent = await createEvent({
          user,
          summary: calendarDetails.summary || 'Appointment Notification',
          description: message,
          start: calendarDetails.start,
          end: calendarDetails.end
        });

        if (calendarEvent) {
          console.log('📅 Notification synced to calendar:', calendarEvent.id);
        }
      }
    }

    res.status(201).json({ message: 'Notification created', notification });
  } catch (err) {
    console.error('Create notification error:', err.message);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification
};