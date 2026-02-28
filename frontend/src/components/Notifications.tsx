import { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
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
  Filter
} from 'lucide-react';
import { useNotifications, Notification } from '../context/NotificationContext';
import { Button } from './ui/button';

export function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useNotifications();
  const [filterType, setFilterType] = useState<Notification['type'] | 'all'>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all');

  const getNotificationIcon = (type: Notification['type']) => {
    const iconProps = { size: 24, className: "text-white" };
    switch (type) {
      case 'leave':
        return <Calendar {...iconProps} />;
      case 'task':
        return <ListTodo {...iconProps} />;
      case 'announcement':
        return <Megaphone {...iconProps} />;
      case 'interview':
        return <UserCheck {...iconProps} />;
      case 'payroll':
        return <Wallet {...iconProps} />;
      case 'birthday':
        return <Cake {...iconProps} />;
      case 'anniversary':
        return <PartyPopper {...iconProps} />;
      case 'holiday':
        return <Calendar {...iconProps} />;
      case 'clock':
        return <Clock {...iconProps} />;
      case 'client':
        return <Briefcase {...iconProps} />;
      default:
        return <AlertCircle {...iconProps} />;
    }
  };

  const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'urgent') return 'bg-red-600';
    if (priority === 'high') return 'bg-orange-600';

    switch (type) {
      case 'leave':
        return 'bg-blue-600';
      case 'task':
        return 'bg-purple-600';
      case 'announcement':
        return 'bg-indigo-600';
      case 'interview':
        return 'bg-green-600';
      case 'payroll':
        return 'bg-emerald-600';
      case 'birthday':
        return 'bg-pink-600';
      case 'anniversary':
        return 'bg-purple-600';
      case 'holiday':
        return 'bg-cyan-600';
      case 'clock':
        return 'bg-yellow-600';
      case 'client':
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filterType !== 'all' && notification.type !== filterType) return false;
    if (filterRead === 'read' && !notification.read) return false;
    if (filterRead === 'unread' && notification.read) return false;
    return true;
  });

  const notificationTypes: (Notification['type'] | 'all')[] = [
    'all',
    'leave',
    'task',
    'announcement',
    'interview',
    'payroll',
    'birthday',
    'holiday',
    'clock',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Bell size={32} className="text-blue-600" />
            Notifications
          </h1>
          <p className="text-gray-600 mt-1">
            Stay updated with all your important notifications
            {unreadCount > 0 && ` (${unreadCount} unread)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="flex items-center gap-2"
              >
                <CheckCheck size={16} />
                Mark all read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllNotifications}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 size={16} />
                Clear all
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Filter size={18} className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Filter by Type</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {notificationTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCheck size={18} className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Filter by Status</span>
          </div>
          <div className="flex gap-2">
            {(['all', 'unread', 'read'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterRead(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filterRead === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Bell className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {filterType !== 'all' || filterRead !== 'all'
                  ? 'Try adjusting your filters to see more notifications'
                  : 'You\'re all caught up! Check back later for updates.'}
              </p>
            </div>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow border border-gray-200 p-5 hover:shadow-md transition-shadow ${!notification.read ? 'border-l-4 border-l-blue-600' : ''
                }`}
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getNotificationColor(notification.type, notification.priority)}`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{notification.title}</h3>
                        {!notification.read && (
                          <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${notification.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        notification.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                        {notification.priority}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      title="Delete notification"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <p className="text-gray-700 mb-3 leading-relaxed">{notification.message}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs"
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
