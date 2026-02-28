import { Users, Calendar, FileText, Briefcase, DollarSign, Megaphone, BarChart3, HelpCircle, ChevronDown, LogOut, MessageCircle, Clock, UserCheck, CheckSquare, PartyPopper, ChevronRight, Users2, Building2, HandCoins, ReceiptText, BadgeCheck, CalendarCheck, PiggyBank, GraduationCap, ClipboardList, FileBarChart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export function Sidebar({ activePage, setActivePage }: SidebarProps) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  // State to manage expanded/collapsed submenus
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'leave': false,
    'attendance': false,
    'recruitment': false,
    'payroll': false,
    'reports': false
  });

  // Toggle submenu expansion
  const toggleSubMenu = (menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      roles: ['admin', 'hr'],
      hasSubmenu: true,
      submenu: [
        { id: 'all-employees', label: 'All Employees', icon: Users },
        { id: 'departments', label: 'Departments', icon: Building2 },
        { id: 'designations', label: 'Designations', icon: BadgeCheck },
      ]
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: Clock,
      roles: ['admin', 'hr'],
      hasSubmenu: true,
      submenu: [
        { id: 'employee-clock-records', label: 'Employee Clock Records', icon: Clock },
        { id: 'shifts', label: 'Shifts', icon: Clock },
      ]
    },
    {
      id: 'leave',
      label: 'Leave',
      icon: FileText,
      hasSubmenu: true,
      submenu: [
        { id: 'leave-requests', label: 'Leave Requests', icon: FileText },
        { id: 'leave-types', label: 'Leave Types', icon: FileText },
      ]
    },
    {
      id: 'recruitment',
      label: 'Recruitment',
      icon: Briefcase,
      roles: ['admin', 'hr'],
      hasSubmenu: true,
      submenu: [
        { id: 'job-postings', label: 'Job Postings', icon: Briefcase },
        { id: 'candidates', label: 'Candidates', icon: Users },
        { id: 'interview-schedule', label: 'Interview Schedule', icon: CalendarCheck },
      ]
    },
    {
      id: 'payroll',
      label: 'Payroll',
      icon: DollarSign,
      roles: ['admin', 'hr'],
      hasSubmenu: true,
      submenu: [
        { id: 'payroll-processing', label: 'Payroll Processing', icon: HandCoins },
        { id: 'salary-structure', label: 'Salary Structure', icon: PiggyBank },
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileBarChart,
      roles: ['admin', 'hr'],
      hasSubmenu: true,
      submenu: [
        { id: 'reports', label: 'All Reports', icon: FileBarChart },
        { id: 'report-test', label: 'Report Test', icon: ClipboardList },
      ]
    },
    { id: 'clients', label: 'Clients', icon: UserCheck, roles: ['admin', 'hr'] },
    { id: 'task-management', label: 'Tasks', icon: CheckSquare },
    { id: 'group-chat', label: 'Team Chat', icon: MessageCircle },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'holidays-birthdays', label: 'Celebrations', icon: PartyPopper },
    { id: 'help-support', label: 'Help', icon: HelpCircle },
  ];

  const hasAccess = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    return user && roles.includes(user.role);
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles || item.roles.length === 0) return true;
    return hasAccess(item.roles);
  });

  return (
    <div style={{
      width: '256px',
      backgroundColor: '#111827', // gray-900
      color: 'white',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #374151' // gray-700
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 24px 16px',
        borderBottom: '1px solid #374151',
        backgroundColor: '#2563eb' // blue-600
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '4px'
        }}>
          Error Infotech
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.8)'
        }}>
          Admin Panel
        </p>
        {user && (
          <div style={{
            marginTop: '16px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '12px',
            borderRadius: '8px'
          }}>
            <p style={{
              fontSize: '14px',
              color: 'white',
              fontWeight: '500'
            }}>
              {user.name}
            </p>
            <p style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.7)',
              textTransform: 'capitalize'
            }}>
              {user.role}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '16px',
        overflowY: 'scroll',
        /* Hide scrollbar for IE, Edge and Firefox */
        msOverflowStyle: 'none',  /* IE and Edge */
        scrollbarWidth: 'none'  /* Firefox */
      }}>
        <style>
          {`
          nav::-webkit-scrollbar {
            display: none;
          }
        `}
        </style>
        <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filteredMenuItems.map((item) => {
            const isExpanded = expandedMenus[item.id];
            const isActiveParent = item.hasSubmenu && item.submenu.some(sub => sub.id === activePage);

            return (
              <div key={item.id}>
                {/* Main menu item */}
                <div
                  onClick={() => {
                    if (item.hasSubmenu) {
                      toggleSubMenu(item.id);
                    } else {
                      setActivePage(item.id);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '4px',
                    cursor: item.hasSubmenu ? 'pointer' : 'pointer',
                    backgroundColor: activePage === item.id || isActiveParent ? '#3b82f6' : 'transparent', // blue-500
                    color: activePage === item.id || isActiveParent ? 'white' : '#9ca3af', // gray-400
                    transition: 'all 0.2s'
                  }}
                >
                  <item.icon size={20} style={{
                    marginRight: '12px',
                    color: activePage === item.id || isActiveParent ? 'white' : '#9ca3af'
                  }} />
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'white',
                    flex: 1
                  }}>
                    {item.label}
                  </span>
                  {item.hasSubmenu && (
                    <ChevronDown
                      size={16}
                      style={{
                        color: activePage === item.id || isActiveParent ? 'white' : '#9ca3af',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }}
                    />
                  )}
                  {item.id === 'group-chat' && unreadCount > 0 && (
                    <span style={{
                      marginLeft: 'auto',
                      backgroundColor: '#ef4444', // red-500
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </div>

                {/* Submenu items */}
                {item.hasSubmenu && isExpanded && (
                  <div style={{
                    paddingLeft: '20px',
                    marginTop: '4px',
                    marginBottom: '4px',
                  }}>
                    {item.submenu.map((subItem) => (
                      <div
                        key={subItem.id}
                        onClick={() => setActivePage(subItem.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          marginBottom: '2px',
                          cursor: 'pointer',
                          backgroundColor: activePage === subItem.id ? '#2563eb' : 'rgba(255,255,255,0.05)', // blue-600
                          color: activePage === subItem.id ? 'white' : '#d1d5db', // gray-300
                          transition: 'all 0.2s',
                          marginLeft: '12px',
                          borderLeft: activePage === subItem.id ? '2px solid #3b82f6' : '2px solid transparent'
                        }}
                      >
                        <subItem.icon size={16} style={{
                          marginRight: '10px',
                          color: activePage === subItem.id ? '#93c5fd' : '#9ca3af' // blue-300
                        }} />
                        <span style={{
                          fontSize: '13px',
                          color: activePage === subItem.id ? 'white' : '#9ca3af'
                        }}>
                          {subItem.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #374151',
        backgroundColor: '#1f2937' // gray-800
      }}>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <LogOut size={18} style={{
            marginRight: '12px',
            color: '#9ca3af'
          }} />
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: 'white'
          }}>
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );
}
