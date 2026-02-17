import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AllEmployees } from './components/employee/AllEmployees';
import { Departments } from './components/employee/Departments';
import { Designations } from './components/employee/Designations';
import { TeamAttendance } from './components/attendance/TeamAttendance';
import { AttendanceReport } from './components/attendance/AttendanceReport';
import { Shifts } from './components/attendance/Shifts';
import { LeaveRequests } from './components/leave/LeaveRequests';
import { LeaveTypes } from './components/leave/LeaveTypes';
import { EmployeeLeaveTypes } from './components/leave/EmployeeLeaveTypes';
import { HolidaysAndBirthdays } from './components/leave/HolidaysAndBirthdays';
import { JobPostings } from './components/recruitment/JobPostings';
import { Candidates } from './components/recruitment/Candidates';
import { InterviewSchedule } from './components/recruitment/InterviewSchedule';
import { PayrollProcessing } from './components/payroll/PayrollProcessing';
import { SalaryStructure } from './components/payroll/SalaryStructure';
import { Announcements } from './components/announcements/Announcements';
import { Reports } from './components/reports/Reports';
import { HelpSupport } from './components/HelpSupport';
import { WhatChat } from './components/WhatChat';
import { SimpleClockInOut } from './components/SimpleClockInOut';
import { ClientManagement } from './components/ClientManagement';
import { Profile } from './components/Profile';
import { WeeklyWorkPlan } from './components/WeeklyWorkPlan';
import { TaskManagement } from './components/TaskManagement';
import { Holidays } from './components/Holidays';
import { Birthdays } from './components/Birthdays';
import { Settings } from './components/Settings';
import { Notifications } from './components/Notifications';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const [activePage, setActivePage] = useState('dashboard');
  const { user } = useAuth();

  if (!user) {
    return null; // AuthProvider handles showing LoginScreen
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'all-employees':
        return <AllEmployees />;
      case 'departments':
        return <Departments />;
      case 'designations':
        return <Designations />;
      case 'clients':
        return <ClientManagement />;
      case 'team-attendance':
        return <TeamAttendance />;
      case 'attendance-report':
        return <AttendanceReport />;
      case 'shifts':
        return <Shifts />;
      case 'clock-in-out':
        return <SimpleClockInOut />;
      case 'leave-requests':
        return <LeaveRequests />;
      case 'leave-types':
        return <LeaveTypes />;
      case 'employee-leave-types':
        return <EmployeeLeaveTypes />;
      case 'holidays-birthdays':
        return <HolidaysAndBirthdays />;
      case 'job-postings':
        return <JobPostings />;
      case 'candidates':
        return <Candidates />;
      case 'interview-schedule':
        return <InterviewSchedule />;
      case 'payroll-processing':
        return <PayrollProcessing />;
      case 'salary-structure':
        return <SalaryStructure />;
      case 'task-management':
        return <TaskManagement />;
      case 'group-chat':
        return <WhatChat />;
      case 'announcements':
        return <Announcements />;
      case 'holidays':
        return <Holidays />;
      case 'birthdays':
        return <Birthdays />;
      case 'reports':
        return <Reports />;
      case 'help-support':
        return <HelpSupport />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'notifications':
        return <Notifications />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DataProvider>
      <NotificationProvider>
        <div className="flex h-screen bg-gray-50">
          <Sidebar activePage={activePage} setActivePage={setActivePage} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header
              onProfileClick={() => setActivePage('profile')}
              onSettingsClick={() => setActivePage('settings')}
              onNavigate={(page) => setActivePage(page)}
            />
            <main className="flex-1 overflow-y-auto p-6">
              {renderPage()}
            </main>
          </div>
        </div>
      </NotificationProvider>
    </DataProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}