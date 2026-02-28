import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';
import { toast } from 'sonner';
import { initializeSocket, setupSocketListeners } from '../services/socketService';
import api from '../services/api';

const safeISO = (value?: any) => {
  const d = value ? new Date(value) : new Date();
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

const safeDateOnly = (value?: any) => {
  const d = value ? new Date(value) : new Date();
  const ok = !isNaN(d.getTime());
  return (ok ? d : new Date()).toISOString().split("T")[0];
};


export interface Notification {
  id: string;
  type: 'leave' | 'task' | 'announcement' | 'interview' | 'payroll' | 'birthday' | 'anniversary' | 'holiday' | 'clock' | 'client' | 'system' | 'message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relatedId?: string; // ID of the related entity (task, leave request, etc.)
  actionUrl?: string; // Page to navigate to when clicked
  dismissed?: boolean; // Flag to hide deleted notifications without wiping them from tracking
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  clearChatNotifications: (chatId: string) => void;
  getLatestNotifications: (limit?: number) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const {
    leaveRequests,
    tasks,
    announcements,
    interviews,
    payrollEntries,
    birthdays,
    holidays,
    isClockActive
  } = useData();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastCheckedTime, setLastCheckedTime] = useState(new Date().toISOString());

  // Debug logs
  console.log('NotificationContext - User:', user?.name, 'Role:', user?.role);
  console.log('NotificationContext - Current notifications:', notifications);
  console.log('NotificationContext - Unread count:', notifications.filter(n => !n.read && !n.dismissed).length);

  // Initialize socket connection for real-time notifications
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      console.log('Initializing notification socket for user:', user.id);
      const socket = initializeSocket(token);

      // Debug connection
      socket.on('connect', () => {
        console.log('Notification socket connected:', socket.id);
      });

      socket.on('connect_error', (error) => {
        console.error('Notification socket connection error:', error);
      });

      // Setup centralized listeners
      const handleNewMessage = (data: any) => {
        console.log('🔔 NotificationContext received new_message event:', data);
        console.log('🔔 User ID:', user.id);
        console.log('🔔 Data sender ID:', data.senderId);

        // Handle 'new_message' events for non-chat notifications
        console.log('🔔 Checking new_message condition:', { dataType: data.type, conversationId: data.conversationId });
        if (data.type === 'new_message' && data.conversationId !== 'general') {
          // Robust comparison for sender ID (ensuring strings)
          const isFromSelf = String(data.senderId || data.userId) === String(user.id);
          console.log('🔔 Is from self:', isFromSelf);

          if (!isFromSelf) {
            const msgText = data.message || "Sent an attachment";
            console.log('🔔 Creating notification for message:', msgText);

            // Generate a truly unique ID for each notification to prevent duplicates
            const uniqueNotificationId = `other_${data.conversationId || 'general'}_${data.senderId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const newNotification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
              type: 'message',
              title: `New message from ${data.senderName || 'User'}`,
              message: msgText,
              priority: 'medium',
              relatedId: uniqueNotificationId,
              actionUrl: 'group-chat' // Matches Sidebar.tsx and App.tsx
            };

            console.log('🔔 Creating notification object:', newNotification);
            addNotification(newNotification);
            console.log('🔔 Notification added successfully');
          } else {
            console.log('🔔 Message is from self, not creating notification for user:', user.id);
          }
        } else {
          console.log('🔔 New message condition not met (likely chat message, handled by WhatChat):', { dataType: data.type, conversationId: data.conversationId });
        }
      };

      const handleOtherNotification = (data: any) => {
        console.log('🔔 NotificationContext received other notification event:', data);
        console.log('🔔 User ID:', user.id);
        console.log('🔔 Data sender ID:', data.senderId);

        // Only handle non-message notifications (e.g., leave, task, etc.)
        if (data.type && data.type !== 'message' && data.type !== 'new_message') {
          const msgText = data.message || "New notification";
          console.log('🔔 Creating other notification for:', msgText);

          const uniqueNotificationId = `other_${data.type}_${data.senderId || 'system'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          const newNotification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
            type: data.type,
            title: data.title || 'New Notification',
            message: msgText,
            priority: data.priority || 'medium',
            relatedId: uniqueNotificationId,
            actionUrl: data.actionUrl || ''
          };

          console.log('🔔 Creating other notification object:', newNotification);
          addNotification(newNotification);
          console.log('🔔 Other notification added successfully');
        } else {
          console.log('🔔 Other notification condition not met (likely chat message, handled by WhatChat):', { dataType: data.type });
        }
      };

      const handleChatNotification = (data: any) => {
        console.log('🔔 NotificationContext received chat_notification event:', data);
        console.log('🔔 User ID:', user?.id);
        console.log('🔔 Data sender ID:', data.senderId);

        // Handle 'chat_notification' events for chat messages
        // Check if this is a chat message notification
        if (data.type === 'message' && data.conversationId === 'general') {
          // Robust comparison for sender ID (ensuring strings)
          const isFromSelf = String(data.senderId) === String(user?.id);
          console.log('🔔 Is from self:', isFromSelf);

          const msgText = data.message || "Sent an attachment";
          console.log('🔔 Creating chat notification for message:', msgText);

          // Generate a truly unique ID for each notification to prevent duplicates
          const uniqueNotificationId = `chat_general_${data.senderId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          const newNotification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
            type: 'message',
            title: isFromSelf ? `You sent: ${msgText.substring(0, 30)}${msgText.length > 30 ? '...' : ''}` : `New message from ${data.senderName || 'User'}`,
            message: msgText,
            priority: 'medium',
            relatedId: uniqueNotificationId,
            actionUrl: 'group-chat' // Matches Sidebar.tsx and App.tsx
          };

          console.log('🔔 Creating chat notification object:', newNotification);
          addNotification(newNotification);
          console.log('🔔 Chat notification added successfully');
        } else {
          console.log('🔔 Chat notification condition not met:', { dataType: data.type, conversationId: data.conversationId });
        }
      };

      const cleanup = setupSocketListeners(
        socket,
        null, // Don't handle new_message in NotificationContext
        handleChatNotification,  // Handle chat notification events
        null  // Don't handle online users in NotificationContext
      );

      return () => {
        cleanup();
        socket.off('connect');
        socket.off('connect_error');
      };
    }
  }, [user]); // Removed addNotification from dependencies to avoid circular dependency

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`notifications_${user?.id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('Loaded notifications from localStorage:', parsed);
        setNotifications(parsed);
      } catch (err) {
        console.error('Error loading notifications:', err);
      }
    }

    // Load pending chat notifications from backend when user signs in
    if (user?.id) {
      console.log('User signed in, loading pending chat notifications for:', user.id, 'Role:', user.role);
      loadPendingChatNotifications();
    }
  }, [user?.id, user?.role]); // Added user.role to dependencies to ensure it runs when role changes too

  // Load pending chat notifications from backend
  const loadPendingChatNotifications = async () => {
    try {
      console.log('Loading pending chat notifications for user:', user?.id, 'Role:', user?.role);
      const response = await api.get('/chat-notifications');
      console.log('Response from chat-notifications API:', response.data);

      if (response.data.success && response.data.data) {
        console.log(`Found ${response.data.data.length} pending chat notifications for user ${user?.id}`);

        // Process each notification and convert to our notification format
        const chatNotifications = response.data.data.map((notif: any) => {
          // Check if this notification is for the current user (not from themselves)
          const isFromSelf = String(notif.senderId) === String(user?.id);

          return {
            id: `chat-${notif._id}-${Date.now()}`,
            type: 'message',
            title: isFromSelf
              ? `You sent: ${notif.message.substring(0, 30)}${notif.message.length > 30 ? '...' : ''}`
              : `New message from ${notif.senderName || 'User'}`,
            message: notif.message,
            timestamp: notif.createdAt || new Date().toISOString(),
            read: notif.isRead || false,
            priority: notif.priority || 'medium',
            relatedId: notif.messageId,
            actionUrl: 'group-chat'
          };
        });

        console.log('Mapped chat notifications:', chatNotifications);

        setNotifications(prev => {
          // Filter out duplicates based on relatedId
          const newNotifs = chatNotifications.filter((newNotif: any) =>
            !prev.some(existing => existing.relatedId === newNotif.relatedId)
          );

          console.log(`Adding ${newNotifs.length} new notifications, filtered out ${chatNotifications.length - newNotifs.length} duplicates`);

          // Add toast notifications for new messages that are not from the current user
          newNotifs.forEach(notification => {
            if (!notification.title.startsWith('You sent')) {
              const toastMessage = `${notification.title}: ${notification.message}`;
              if (notification.priority === 'urgent') toast.error(toastMessage);
              else if (notification.priority === 'high') toast.warning(toastMessage);
              else toast.info(toastMessage);
            }
          });

          return [...newNotifs, ...prev];
        });

        console.log('Loaded pending chat notifications:', chatNotifications);
      } else {
        console.log('No success or data in response');
      }
    } catch (error) {
      console.error('Error loading pending chat notifications:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }
    }
  };

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (user?.id) {
      console.log('Saving notifications to localStorage:', notifications);
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
    }
  }, [notifications, user?.id]);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      setNotifications((prev) => {
        // ✅ DEDUPE: same type + relatedId + title already exists
        const keyType = notification.type;
        const keyRelated = notification.relatedId || '';
        const keyTitle = notification.title;

        const exists = prev.some(
          (n) =>
            n.type === keyType &&
            (n.relatedId || '') === keyRelated &&
            n.title === keyTitle
        );

        if (exists) {
          console.log('🔔 Notification already exists, skipping:', notification);
          return prev;
        }

        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          read: false,
        };

        console.log('🔔 Adding new notification:', newNotification);

        //✅ toast only when actually added
        const toastMessage = `${notification.title}: ${notification.message}`;
        if (notification.priority === 'urgent') toast.error(toastMessage);
        else if (notification.priority === 'high') toast.warning(toastMessage);
        else toast.info(toastMessage);

        return [newNotification, ...prev];
      });
    },
    []
  );

  // Get latest notifications (last 20 by default)
  const getLatestNotifications = useCallback((limit: number = 20) => {
    return [...notifications]
      .filter(n => !n.dismissed)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }, [notifications]);

  // Clear notifications for specific chat/conversation
  const clearChatNotifications = useCallback((chatId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.relatedId?.includes(chatId) ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    // Also clear the badge by updating unread count
    console.log('All notifications marked as read');
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, dismissed: true } : notif));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, dismissed: true })));
  }, []);

  // Monitor leave requests for status changes
  useEffect(() => {
    if (!user || !leaveRequests) return;

    leaveRequests.forEach(request => {
      const requestTime = safeISO(request.appliedOn || request.createdAt);


      // New leave request notification (for Admin/HR)
      if ((user.role === 'admin' || user.role === 'hr') && request.status === 'pending' && requestTime > lastCheckedTime) {
        addNotification({
          type: 'leave',
          title: 'New Leave Request',
          message: `${request.employeeName} has requested ${request.leaveType || request.leaveTypeName || "Leave"} from ${request.startDate || request.fromDate} to ${request.endDate || request.toDate}`,
          priority: 'high',
          relatedId: request.id,
          actionUrl: 'leave-requests',
        });
      }

      // Leave approved/rejected notification (for employee)
      if (user.id === request.employeeId && request.status !== 'pending') {
        const isApproved = request.status === 'approved';
        // Check if this is a recent status change
        const existingNotif = notifications.find(n => n.relatedId === request.id && n.type === 'leave');
        if (!existingNotif) {
          addNotification({
            type: 'leave',
            title: isApproved ? 'Leave Request Approved' : 'Leave Request Rejected',
            message: `Your ${request.leaveType || request.leaveTypeName || request.leaveTypeCode || "Leave"} request from ${request.startDate || request.fromDate} to ${request.endDate || request.toDate} has been ${request.status}`,
            priority: isApproved ? 'medium' : 'high',
            relatedId: request.id,
            actionUrl: 'leave-requests',
          });
        }
      }
    });
  }, [leaveRequests, user, lastCheckedTime, notifications, addNotification]);

  // Monitor tasks for new assignments and updates
  useEffect(() => {
    if (!user || !tasks) return;

    tasks.forEach(task => {
      const taskTime = safeISO(task.createdAt);


      // Task assigned to current user
      if (task.assignedTo === user.id && taskTime > lastCheckedTime) {
        const existingNotif = notifications.find(n => n.relatedId === task.id && n.type === 'task');
        if (!existingNotif) {
          addNotification({
            type: 'task',
            title: 'New Task Assigned',
            message: `${task.assignedByName} assigned you: ${task.title}`,
            priority: task.priority === 'high' ? 'high' : 'medium',
            relatedId: task.id,
            actionUrl: 'task-management',
          });
        }
      }

      // Task status changed (notify assignedBy if task completed)
      if (task.assignedBy === user.id && task.status === 'completed') {
        const existingNotif = notifications.find(n => n.relatedId === task.id && n.message.includes('completed'));
        if (!existingNotif) {
          addNotification({
            type: 'task',
            title: 'Task Completed',
            message: `${task.assignedToName} completed: ${task.title}`,
            priority: 'low',
            relatedId: task.id,
            actionUrl: 'task-management',
          });
        }
      }
    });
  }, [tasks, user, lastCheckedTime, notifications, addNotification]);

  // Monitor announcements
  useEffect(() => {
    if (!user || !announcements) return;

    announcements.forEach(announcement => {
      const announcementTime = new Date(announcement.createdAt).toISOString();

      if (announcementTime > lastCheckedTime) {
        const existingNotif = notifications.find(n => n.relatedId === announcement.id && n.type === 'announcement');
        if (!existingNotif) {
          // Check if announcement is relevant to user
          const isRelevant =
            announcement.category === 'company-wide' ||
            (announcement.department && user.department === announcement.department);

          if (isRelevant) {
            addNotification({
              type: 'announcement',
              title: 'New Announcement',
              message: announcement.title,
              priority: announcement.priority,
              relatedId: announcement.id,
              actionUrl: 'announcements',
            });
          }
        }
      }
    });
  }, [announcements, user, lastCheckedTime, notifications, addNotification]);

  // Monitor interviews (for Admin/HR and candidates)
  useEffect(() => {
    if (!user || !interviews) return;

    if (user.role === 'admin' || user.role === 'hr') {
      interviews.forEach(interview => {
        if (interview.status === 'scheduled') {
          const interviewDate = new Date(interview.date);
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          // Notify about interviews tomorrow
          if (interviewDate.toDateString() === tomorrow.toDateString()) {
            const existingNotif = notifications.find(
              n => n.relatedId === interview.id && n.message.includes('tomorrow')
            );
            if (!existingNotif) {
              addNotification({
                type: 'interview',
                title: 'Interview Tomorrow',
                message: `Interview with ${interview.candidateName} for ${interview.position} at ${interview.time}`,
                priority: 'high',
                relatedId: interview.id,
                actionUrl: 'interview-schedule',
              });
            }
          }
        }
      });
    }
  }, [interviews, user, notifications, addNotification]);

  // Monitor payroll (for employees)
  useEffect(() => {
    if (!user || user.role === 'admin' || user.role === 'hr' || !payrollEntries) return;

    payrollEntries.forEach(entry => {
      if (entry.employeeId === user.id && entry.status === 'paid') {
        const existingNotif = notifications.find(n => n.relatedId === entry.id && n.type === 'payroll');
        if (!existingNotif) {
          addNotification({
            type: 'payroll',
            title: 'Salary Processed',
            message: `Your salary for ${entry.month} has been processed (₹${entry.netSalary.toLocaleString()})`,
            priority: 'medium',
            relatedId: entry.id,
            actionUrl: 'payroll-processing',
          });
        }
      }
    });
  }, [payrollEntries, user, notifications, addNotification]);

  // Birthday and anniversary reminders
  useEffect(() => {
    if (!user || !birthdays) return;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    birthdays.forEach(birthday => {
      const birthdayDate = new Date(birthday.date);
      const birthdayStr = safeDateOnly(birthday.date);


      // Check if birthday is today or within next 3 days
      const daysUntil = Math.floor((birthdayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil >= 0 && daysUntil <= 3) {
        const existingNotif = notifications.find(
          n => n.relatedId === birthday.id && n.type === 'birthday' && n.message.includes(birthday.employeeName)
        );

        if (!existingNotif) {
          const message = daysUntil === 0
            ? `Today is ${birthday.employeeName}'s birthday! 🎉`
            : `${birthday.employeeName}'s birthday is in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`;

          addNotification({
            type: 'birthday',
            title: 'Birthday Reminder',
            message,
            priority: daysUntil === 0 ? 'medium' : 'low',
            relatedId: birthday.id,
            actionUrl: 'celebrations',
          });
        }
      }
    });
  }, [birthdays, user, notifications, addNotification]);

  // Holiday reminders
  useEffect(() => {
    if (!user || !holidays) return;

    const today = new Date();

    holidays.forEach(holiday => {
      const holidayDate = new Date(safeISO(holiday.date));

      const daysUntil = Math.floor((holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Notify 3 days before holiday
      if (daysUntil === 3) {
        const existingNotif = notifications.find(
          n => n.relatedId === holiday.id && n.type === 'holiday'
        );

        if (!existingNotif) {
          addNotification({
            type: 'holiday',
            title: 'Upcoming Holiday',
            message: `${holiday.name} is coming up on ${holiday.date}`,
            priority: 'low',
            relatedId: holiday.id,
            actionUrl: 'holidays-birthdays',
          });
        }
      }
    });
  }, [holidays, user, notifications, addNotification]);

  // Clock-in reminder (if not clocked in by 9:30 AM)
  useEffect(() => {
    if (!user) return;

    const checkClockInReminder = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Check if it's 9:30 AM and user hasn't clocked in
      if (hours === 9 && minutes === 30 && !isClockActive) {
        const today = new Date().toDateString();
        const existingNotif = notifications.find(
          n => n.type === 'clock' && new Date(n.timestamp).toDateString() === today
        );

        if (!existingNotif) {
          addNotification({
            type: 'clock',
            title: 'Clock-In Reminder',
            message: 'Don\'t forget to clock in for the day!',
            priority: 'high',
            actionUrl: 'dashboard',
          });
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkClockInReminder, 60000);
    checkClockInReminder(); // Check immediately

    return () => clearInterval(interval);
  }, [user, isClockActive, notifications, addNotification]);

  // Update last checked time periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLastCheckedTime(new Date().toISOString());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const activeNotifications = notifications.filter(n => !n.dismissed);
  const unreadCount = activeNotifications.filter(n => !n.read).length;

  console.log('🔔 Final unread count:', unreadCount);
  console.log('🔔 Active notifications:', activeNotifications);

  return (
    <NotificationContext.Provider
      value={{
        notifications: activeNotifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        clearChatNotifications,
        getLatestNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}