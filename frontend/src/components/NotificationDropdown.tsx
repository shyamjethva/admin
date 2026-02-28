import { useState, useRef, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  Calendar,
  ListTodo,
  Megaphone,
  UserCheck,
  Wallet,
  Cake,
  PartyPopper,
  Clock,
  Briefcase,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { useNotifications, Notification } from '../context/NotificationContext';

interface NotificationDropdownProps {
  onNavigate?: (page: string) => void;
}

export function NotificationDropdown({ onNavigate }: NotificationDropdownProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications, getLatestNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get latest 20 notifications for display
  const latestNotifications = getLatestNotifications(20);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getNotificationIcon = (type: Notification['type']) => {
    const cls = 'w-5 h-5';
    switch (type) {
      case 'leave': return <Calendar className={cls} />;
      case 'task': return <ListTodo className={cls} />;
      case 'announcement': return <Megaphone className={cls} />;
      case 'interview': return <UserCheck className={cls} />;
      case 'payroll': return <Wallet className={cls} />;
      case 'birthday': return <Cake className={cls} />;
      case 'anniversary': return <PartyPopper className={cls} />;
      case 'holiday': return <Calendar className={cls} />;
      case 'clock': return <Clock className={cls} />;
      case 'client': return <Briefcase className={cls} />;
      case 'message': return <MessageSquare className={cls} />;
      default: return <AlertCircle className={cls} />;
    }
  };

  const getIconColors = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'urgent') return { bg: 'bg-red-100', text: 'text-red-600' };
    if (priority === 'high') return { bg: 'bg-orange-100', text: 'text-orange-600' };
    switch (type) {
      case 'leave': return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'task': return { bg: 'bg-purple-100', text: 'text-purple-600' };
      case 'announcement': return { bg: 'bg-indigo-100', text: 'text-indigo-600' };
      case 'interview': return { bg: 'bg-green-100', text: 'text-green-600' };
      case 'payroll': return { bg: 'bg-emerald-100', text: 'text-emerald-600' };
      case 'birthday': return { bg: 'bg-pink-100', text: 'text-pink-600' };
      case 'anniversary': return { bg: 'bg-purple-100', text: 'text-purple-600' };
      case 'holiday': return { bg: 'bg-cyan-100', text: 'text-cyan-600' };
      case 'clock': return { bg: 'bg-yellow-100', text: 'text-yellow-600' };
      case 'client': return { bg: 'bg-gray-100', text: 'text-gray-600' };
      case 'message': return { bg: 'bg-teal-100', text: 'text-teal-600' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl && onNavigate) {
      onNavigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>

      {/* ── Bell Button ── */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`relative p-2.5 rounded-xl transition-all duration-200 ${isOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
        aria-label="Notifications"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white leading-none shadow">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/*── Dropdown Panel── */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] flex flex-col overflow-hidden"
          style={{ width: '380px', maxWidth: '95vw', maxHeight: '500px' }}
        >

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0 bg-gray-50">
            <div>
              <h3 className="text-base font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0
                ? <p className="text-xs text-blue-600 font-medium mt-0.5">{unreadCount} unread</p>
                : <p className="text-xs text-gray-500 font-medium mt-0.5">All caught up</p>
              }
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                  <button
                    onClick={clearAllNotifications}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-100 rounded-md transition-colors"
                    title="Delete all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Body – Scrollable */}
          <div className="overflow-y-auto flex-1" style={{ maxHeight: '420px' }}>
            {latestNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-600">No notifications</p>
                <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div>
                {latestNotifications.map((notification) => {
                  const { bg, text } = getIconColors(notification.type, notification.priority);
                  return (
                    <div
                      key={notification.id}
                      className={`group flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-25' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {/* Icon Badge */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${bg} ${text} mt-0.5`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            {notification.type === 'message' ? (
                              <p className={`text-sm font-medium leading-tight ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title.replace('New message from ', '')}
                              </p>
                            ) : (
                              <p className={`text-sm font-medium leading-tight ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </p>
                            )}
                          </div>
                          {/* Unread dot */}
                          {!notification.read && (
                            <span className="mt-1 flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-xs font-medium text-gray-800 mt-1 line-clamp-1 leading-tight">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[10px] text-gray-400 font-medium">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                          {notification.type === 'message' && (
                            <span className="text-[9px] font-bold text-teal-600 bg-teal-100 px-1.5 py-0.5 rounded-full">
                              MESSAGE
                            </span>
                          )}
                        </div>
                      </div>

                      {/* X button – visible on hover */}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                        className="flex-shrink-0 mt-0.5 p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer - Removed as per requirements */}
        </div>
      )}
    </div>
  );
}
