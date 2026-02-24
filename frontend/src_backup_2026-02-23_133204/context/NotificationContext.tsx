import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';
import { toast } from 'sonner@2.0.3';

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
  type: 'leave' | 'task' | 'announcement' | 'interview' | 'payroll' | 'birthday' | 'anniversary' | 'holiday' | 'clock' | 'client' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relatedId?: string; // ID of the related entity (task, leave request, etc.)
  actionUrl?: string; // Page to navigate to when clicked
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
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

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`notifications_${user?.id}`);
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (err) {
        console.error('Error loading notifications:', err);
      }
    }
  }, [user?.id]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (user?.id) {
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

        if (exists) return prev;

        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          read: false,
        };

        // ✅ toast only when actually added
        const toastMessage = `${notification.title}: ${notification.message}`;
        if (notification.priority === 'urgent') toast.error(toastMessage);
        else if (notification.priority === 'high') toast.warning(toastMessage);
        else toast.info(toastMessage);

        return [newNotification, ...prev];
      });
    },
    []
  );


  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
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
            message: `Your ${request.leaveType} request from ${request.startDate} to ${request.endDate} has been ${request.status}`,
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
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
