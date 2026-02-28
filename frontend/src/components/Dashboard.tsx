import { Users, Calendar, FileText, DollarSign, TrendingUp, TrendingDown, Clock, Coffee, LogIn, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { clockService } from '../services/clockservice';

export function Dashboard() {
  const { employees, leaveRequests, attendance, announcements } = useData();
  const { user } = useAuth();

  // Attendance state
  const [status, setStatus] = useState<'clocked_out' | 'clocked_in' | 'on_break'>('clocked_out');
  const [workingTime, setWorkingTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [breakTime, setBreakTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [lastCheckInTime, setLastCheckInTime] = useState<Date | null>(null);
  const [lastBreakInTime, setLastBreakInTime] = useState<Date | null>(null);
  const [totals, setTotals] = useState({
    totalClockTime: '0h 0m',
    totalBreakTime: '0h 0m',
    netWorkingHours: '0h 0m'
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load today's attendance on mount
  useEffect(() => {
    if (user?.role === 'employee') {
      loadTodayAttendance();
    }
  }, [user]);

  // Timer effect - calculate actual elapsed time
  useEffect(() => {
    let interval: any;

    const calculateElapsedTime = () => {
      const now = new Date();

      if (status === 'clocked_in' && lastCheckInTime) {
        // Calculate working time: (now - lastCheckInTime) - break time
        const totalElapsed = (now.getTime() - lastCheckInTime.getTime()) / 1000;
        // We'll need to subtract break time from backend eventually
        const hours = Math.floor(totalElapsed / 3600);
        const minutes = Math.floor((totalElapsed % 3600) / 60);
        const seconds = Math.floor(totalElapsed % 60);
        setWorkingTime({ hours, minutes, seconds });
      } else if (status === 'on_break' && lastBreakInTime) {
        // Calculate break time: (now - lastBreakInTime)
        const breakElapsed = (now.getTime() - lastBreakInTime.getTime()) / 1000;
        const hours = Math.floor(breakElapsed / 3600);
        const minutes = Math.floor((breakElapsed % 3600) / 60);
        const seconds = Math.floor(breakElapsed % 60);
        setBreakTime({ hours, minutes, seconds });
      }
    };

    if (status === 'clocked_in' || status === 'on_break') {
      // Calculate immediately on status change
      calculateElapsedTime();

      // Then update every second
      interval = setInterval(calculateElapsedTime, 1000);
    }

    return () => clearInterval(interval);
  }, [status, lastCheckInTime, lastBreakInTime]);

  const loadTodayAttendance = async () => {
    try {
      const response = await clockService.getToday(user!.id);
      if (response.success && response.data && !Array.isArray(response.data)) {
        const record: any = response.data;
        setStatus(record.status || 'clocked_out');

        // Set timestamp states for timer calculation
        if (record.status === 'clocked_in' && record.lastClockInAt) {
          setLastCheckInTime(new Date(record.lastClockInAt));
          setLastBreakInTime(null);
        } else if (record.status === 'on_break' && record.breaks && record.breaks.length > 0) {
          const latestBreak = record.breaks[record.breaks.length - 1];
          if (latestBreak && !latestBreak.breakOutAt && latestBreak.breakInAt) {
            setLastBreakInTime(new Date(latestBreak.breakInAt));
            // Also set check-in time for working time calculation
            if (record.lastClockInAt) {
              setLastCheckInTime(new Date(record.lastClockInAt));
            }
          }
        } else {
          // Clocked out
          setLastCheckInTime(null);
          setLastBreakInTime(null);
        }

        // Update totals
        if (record.totals) {
          setTotals({
            totalClockTime: formatSeconds(record.totals.totalClockSeconds || 0),
            totalBreakTime: formatSeconds(record.totals.totalBreakSeconds || 0),
            netWorkingHours: formatSeconds(record.totals.workSeconds || 0)
          });
        }

        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to load attendance:', error);
    }
  };

  const formatSeconds = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleClockIn = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await clockService.clockIn({
        employeeId: user.id,
        employeeName: user.name
      });
      if (response.success) {
        setStatus('clocked_in');
        setLastCheckInTime(new Date());
        setLastBreakInTime(null);
        await loadTodayAttendance();
      }
    } catch (error) {
      console.error('Clock in failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await clockService.clockOut({ employeeId: user.id });
      if (response.success) {
        setStatus('clocked_out');
        setLastCheckInTime(null);
        setLastBreakInTime(null);
        setWorkingTime({ hours: 0, minutes: 0, seconds: 0 });
        setBreakTime({ hours: 0, minutes: 0, seconds: 0 });
        await loadTodayAttendance();
      }
    } catch (error) {
      console.error('Clock out failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBreakIn = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await clockService.breakIn({ employeeId: user.id });
      if (response.success) {
        setStatus('on_break');
        setLastBreakInTime(new Date());
        await loadTodayAttendance();
      }
    } catch (error) {
      console.error('Break in failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBreakOut = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await clockService.breakOut({ employeeId: user.id });
      if (response.success) {
        setStatus('clocked_in');
        setLastBreakInTime(null);
        await loadTodayAttendance();
      }
    } catch (error) {
      console.error('Break out failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'clocked_in': return 'bg-green-100 text-green-800';
      case 'on_break': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'clocked_in': return 'WORKING';
      case 'on_break': return 'ON BREAK';
      default: return 'CLOCKED OUT';
    }
  };

  const formatTime = (time: { hours: number, minutes: number, seconds: number }) => {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
  };

  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const pendingLeaves = leaveRequests.filter(lr => lr.status === 'pending').length;
  const todayDate = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === todayDate).length;
  const recentAnnouncements = announcements.slice(0, 3);

  // Check if employee can perform actions
  const canBreakIn = status === 'clocked_in';
  const canClockOut = status !== 'on_break';
  const canBreakOut = status === 'on_break';
  const canClockIn = status === 'clocked_out';

  // Check if break out is allowed (minimum 1 minute rule)
  const [canBreakOutEarly, setCanBreakOutEarly] = useState(true);

  useEffect(() => {
    if (status === 'on_break' && lastBreakInTime) {
      const timer = setInterval(() => {
        const elapsed = (new Date().getTime() - lastBreakInTime.getTime()) / 1000;
        setCanBreakOutEarly(elapsed >= 60);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCanBreakOutEarly(true);
    }
  }, [status, lastBreakInTime]);

  // Filter leave requests for current employee only
  const employeeLeaveRequests = user?.role === 'employee'
    ? leaveRequests.filter(lr => lr.employeeId === user.id || lr.employeeName === user.name)
    : leaveRequests;

  // Calculate days for each leave request
  const calculateDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 1;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  };

  // Add days calculation to leave requests
  const leaveRequestsWithDays = employeeLeaveRequests.map(lr => ({
    ...lr,
    calculatedDays: Number(lr.days || calculateDays(lr.startDate || lr.fromDate, lr.endDate || lr.toDate) || 1)
  }));

  const stats = [
    {
      label: 'Total Employees',
      value: employees.length,
      change: '+5%',
      positive: true,
      icon: <Users size={24} />,
      color: 'bg-blue-500',
    },
    {
      label: 'Present Today',
      value: todayAttendance,
      change: `${Math.round((todayAttendance / employees.length) * 100)}%`,
      positive: true,
      icon: <Calendar size={24} />,
      color: 'bg-green-500',
    },
    {
      label: 'Pending Leaves',
      value: pendingLeaves,
      change: '-2',
      positive: false,
      icon: <FileText size={24} />,
      color: 'bg-yellow-500',
    },
    {
      label: 'Active Employees',
      value: activeEmployees,
      change: '+3%',
      positive: true,
      icon: <DollarSign size={24} />,
      color: 'bg-purple-500',
    },
  ];

  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (!Number.isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}/${month}/${date.getFullYear()}`;
      }
    } catch (e) { }
    return dateStr;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-sm ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.positive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{stat.change}</span>
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {user?.role === 'employee' ? 'My Recent Leave Requests' : 'Recent Leave Requests'}
          </h2>
          <div className="space-y-3">
            {leaveRequestsWithDays.slice(0, 5).map((leave) => (
              <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                {user?.role === 'employee' ? (
                  // For employees, show employee name, leave type, and calculated days
                  <div>
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-600">{leave.leaveType} - {leave.calculatedDays} days</p>
                  </div>
                ) : (
                  // For admin/HR, show employee name, leave type, and calculated days
                  <div>
                    <p className="font-medium text-gray-800">{leave.employeeName}</p>
                    <p className="text-sm text-gray-600">{leave.leaveType} - {leave.calculatedDays} days</p>
                  </div>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${leave.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                  {leave.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Announcements</h2>
          <div className="space-y-3">
            {recentAnnouncements.map((announcement) => (
              <div key={announcement.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-800">{announcement.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${announcement.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    announcement.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                    {announcement.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{announcement.content}</p>
                <p className="text-xs text-gray-500 mt-2">{formatDisplayDate(announcement.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {user?.role === 'admin' || user?.role === 'hr' ? (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Department Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['Development', 'Human Resources', 'Sales', 'Marketing'].map((dept) => {
              const deptEmployees = employees.filter(e => e.department === dept).length;
              return (
                <div key={dept} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{dept}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{deptEmployees}</p>
                  <p className="text-xs text-gray-500 mt-1">Employees</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {/* Attendance Widget for Employees */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Attendance</h2>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
                {lastUpdated && (
                  <span className="text-xs text-gray-500">
                    Updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <button
                onClick={handleClockIn}
                disabled={!canClockIn || loading}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all cursor-pointer ${canClockIn
                  ? 'bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300'
                  : 'bg-gray-100 border-2 border-gray-200 cursor-not-allowed'
                  }`}
              >
                <LogIn className={`w-8 h-8 mb-2 ${canClockIn ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${canClockIn ? 'text-green-700' : 'text-gray-500'}`}>Clock In</span>
              </button>

              <button
                onClick={handleClockOut}
                disabled={!canClockOut || loading}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all cursor-pointer ${canClockOut
                  ? 'bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-300'
                  : 'bg-gray-100 border-2 border-gray-200 cursor-not-allowed'
                  }`}
              >
                <LogOut className={`w-8 h-8 mb-2 ${canClockOut ? 'text-red-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${canClockOut ? 'text-red-700' : 'text-gray-500'}`}>Clock Out</span>
              </button>

              <button
                onClick={handleBreakIn}
                disabled={!canBreakIn || loading}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${canBreakIn
                  ? 'bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-200 hover:border-yellow-300'
                  : 'bg-gray-100 border-2 border-gray-200 cursor-not-allowed'
                  }`}
              >
                <Coffee className={`w-8 h-8 mb-2 ${canBreakIn ? 'text-yellow-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${canBreakIn ? 'text-yellow-700' : 'text-gray-500'}`}>Break In</span>
              </button>

              <button
                onClick={handleBreakOut}
                disabled={!canBreakOut || !canBreakOutEarly || loading}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${canBreakOut && canBreakOutEarly
                  ? 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300'
                  : 'bg-gray-100 border-2 border-gray-200 cursor-not-allowed'
                  }`}
              >
                <Coffee className={`w-8 h-8 mb-2 rotate-180 ${canBreakOut && canBreakOutEarly ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${canBreakOut && canBreakOutEarly ? 'text-blue-700' : 'text-gray-500'}`}>
                  {canBreakOut && !canBreakOutEarly ? `Wait ${Math.ceil(60 - (new Date().getTime() - lastBreakInTime!.getTime()) / 1000)}s` : 'Break Out'}
                </span>
              </button>
            </div>

            {/* Live Timers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="text-blue-600" size={20} />
                  <span className="font-medium text-blue-800">Working Time</span>
                </div>
                <div className="text-2xl font-mono font-bold text-blue-700">
                  {formatTime(workingTime)}
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Coffee className="text-orange-600" size={20} />
                  <span className="font-medium text-orange-800">Break Time</span>
                </div>
                <div className="text-2xl font-mono font-bold text-orange-700">
                  {formatTime(breakTime)}
                </div>
              </div>
            </div>

            {/* Today Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-3">Today Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Clock Time</p>
                  <p className="text-xl font-bold text-gray-800">{totals.totalClockTime}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Break Time</p>
                  <p className="text-xl font-bold text-gray-800">{totals.totalBreakTime}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Net Working Hours</p>
                  <p className="text-xl font-bold text-green-600">{totals.netWorkingHours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* My Information */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Department</p>
                <p className="text-lg font-medium text-gray-800 mt-1">{user?.department}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Designation</p>
                <p className="text-lg font-medium text-gray-800 mt-1">{user?.designation}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">My Leaves</p>
                <p className="text-lg font-medium text-gray-800 mt-1">
                  {leaveRequestsWithDays.length} Applied
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
