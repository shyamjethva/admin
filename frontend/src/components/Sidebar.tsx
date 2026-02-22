import { Users, Calendar, FileText, Briefcase, DollarSign, Megaphone, BarChart3, HelpCircle, ChevronDown, ChevronRight, LogOut, MessageCircle, Clock, UserCheck, CheckSquare, ClipboardList, PartyPopper } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: { id: string; label: string; roles?: ('admin' | 'hr' | 'employee')[] }[];
  roles?: ('admin' | 'hr' | 'employee')[];
}

const menuItems: MenuItem[] = [
  {
    id: 'employee',
    label: 'Employee',
    icon: <Users size={20} />,
    roles: ['admin', 'hr'],
    children: [
      { id: 'all-employees', label: 'All Employees' },
      { id: 'departments', label: 'Departments' },
      { id: 'designations', label: 'Designations' },
    ],
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: <Calendar size={20} />,
    roles: ['admin', 'hr'],
    children: [
      { id: 'employee-clock-records', label: 'Employee Clock Records' },
      { id: 'shifts', label: 'Shifts' },
    ],
  },
  {
    id: 'clock-in-out',
    label: 'Clock In/Out',
    icon: <Clock size={20} />,
    roles: ['employee'],
    children: [],
  },
  {
    id: 'leave',
    label: 'Leave Management',
    icon: <FileText size={20} />,
    children: [
      { id: 'leave-requests', label: 'Leave Requests' },
      { id: 'leave-types', label: 'Leave Types', roles: ['admin', 'hr'] },
      { id: 'employee-leave-types', label: 'Leave Types', roles: ['employee'] },
    ],
  },
  {
    id: 'recruitment',
    label: 'Recruitment',
    icon: <Briefcase size={20} />,
    roles: ['admin', 'hr'],
    children: [
      { id: 'job-postings', label: 'Job Postings' },
      { id: 'candidates', label: 'Candidates' },
      { id: 'interview-schedule', label: 'Interview Schedule' },
    ],
  },
  {
    id: 'payroll',
    label: 'Payroll',
    icon: <DollarSign size={20} />,
    roles: ['admin', 'hr'],
    children: [
      { id: 'payroll-processing', label: 'Payroll Processing' },
      { id: 'salary-structure', label: 'Salary Structure' },
    ],
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: <UserCheck size={20} />,
    roles: ['admin', 'hr'],
    children: [],
  },
  {
    id: 'task-management',
    label: 'Task Management',
    icon: <CheckSquare size={20} />,
    children: [],
  },
  {
    id: 'group-chat',
    label: 'WhatChat',
    icon: <MessageCircle size={20} />,
    children: [],
  },
  {
    id: 'announcements',
    label: 'Announcements',
    icon: <Megaphone size={20} />,
    children: [],
  },
  {
    id: 'celebrations',
    label: 'Celebrations',
    icon: <PartyPopper size={20} />,
    children: [
      { id: 'holidays', label: 'Holidays' },
      { id: 'birthdays', label: 'Birthdays' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: <BarChart3 size={20} />,
    roles: ['admin', 'hr'],
    children: [
      { id: 'reports', label: 'Generate Reports' },
      { id: 'report-test', label: 'Report Storage Test' },
    ],
  },
  {
    id: 'help-support',
    label: 'Help & Support',
    icon: <HelpCircle size={20} />,
    children: [],
  },
];

export function Sidebar({ activePage, setActivePage }: SidebarProps) {
  const { user, logout } = useAuth();
  // Timer logic for employee
  const [timer, setTimer] = useState("00:00:00");
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  useEffect(() => {
    if (!user || user.role !== 'employee') return;
    const fetchAttendance = async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`http://localhost:5000/api/attendance?employeeId=${user.id}&date=${today}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const records = Array.isArray(data) ? data : data.data || [];
        const todayRecord = records.find((r: any) => r.date === today);
        setTodayRecord(todayRecord);
        setIsClockedIn(!!(todayRecord && todayRecord.checkIn && !todayRecord.checkOut));
      }
    };
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!isClockedIn || !todayRecord || !todayRecord.checkInTimestamp) {
      setTimer("00:00:00");
      return;
    }
    const interval = setInterval(() => {
      const start = new Date(todayRecord.checkInTimestamp);
      const now = new Date();
      const diff = Math.max(0, now.getTime() - start.getTime());
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimer(
        `${hours.toString().padStart(2, '0')}:` +
        `${minutes.toString().padStart(2, '0')}:` +
        `${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn, todayRecord]);
  const [expandedItems, setExpandedItems] = useState<string[]>(['employee']);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const hasAccess = (roles?: ('admin' | 'hr' | 'employee')[]) => {
    if (!roles || roles.length === 0) return true;
    return user && roles.includes(user.role);
  };

  const handleMenuClick = (item: MenuItem) => {
    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id);
    } else {
      setActivePage(item.id);
    }
  };

  const filteredMenuItems = menuItems.filter(item => hasAccess(item.roles));

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">Error Infotech</h1>
        <p className="text-sm text-gray-600 mt-1">{user?.role.toUpperCase()} Dashboard</p>
        {/* Employee Timer Display */}
        {user && user.role === 'employee' && isClockedIn && todayRecord && todayRecord.checkInTimestamp && (
          <div className="mt-2 flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            <span className="font-semibold text-blue-700">Timer: {timer}</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer mb-2 ${activePage === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          onClick={() => setActivePage('dashboard')}
        >
          <BarChart3 size={20} />
          <span>Dashboard</span>
        </div>

        {filteredMenuItems.map((item) => (
          <div key={item.id} className="mb-1">
            <div
              className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer ${activePage === item.id && (!item.children || item.children.length === 0)
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
                }`}
              onClick={() => handleMenuClick(item)}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.children && item.children.length > 0 && (
                <span>
                  {expandedItems.includes(item.id) ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </span>
              )}
            </div>

            {item.children && item.children.length > 0 && expandedItems.includes(item.id) && (
              <div className="ml-4 mt-1 space-y-1">
                {item.children
                  .filter(child => hasAccess(child.roles))
                  .map((child) => (
                    <div
                      key={child.id}
                      className={`px-4 py-2 rounded-lg cursor-pointer text-sm ${activePage === child.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      onClick={() => setActivePage(child.id)}
                    >
                      {child.label}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 w-full"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}