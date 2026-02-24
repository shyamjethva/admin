import { Users, Calendar, FileText, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export function Dashboard() {
  const { employees, leaveRequests, attendance, announcements } = useData();
  const { user } = useAuth();

  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const pendingLeaves = leaveRequests.filter(lr => lr.status === 'pending').length;
  const todayDate = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === todayDate).length;
  const recentAnnouncements = announcements.slice(0, 3);

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
                <p className="text-xs text-gray-500 mt-2">{announcement.createdAt}</p>
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
      )}
    </div>
  );
}
