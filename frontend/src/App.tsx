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
import { EmployeeClockRecords } from './components/attendance/EmployeeClockRecords';
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
import { ReportTest } from './components/ReportTest';
import { HelpSupport } from './components/HelpSupport';
import { WhatChat } from './components/WhatChat';
// Removed SimpleClockInOut - now integrated into Dashboard
import { ClientManagement } from './components/ClientManagement';
import { Profile } from './components/Profile';
import { WeeklyWorkPlan } from './components/WeeklyWorkPlan';
import { TaskManagement } from './components/TaskManagement';
import { Holidays } from './components/Holidays';
import { Birthdays } from './components/Birthdays';
import { Settings } from './components/Settings';
import { Notifications } from './components/Notifications';
import { Celebrations } from './components/Celebrations';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

function AppContent() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
      case 'employee-clock-records':
        return <EmployeeClockRecords />;
      // case 'clock-in-out':
      //   return <SimpleClockInOut />; // Removed - now in Dashboard
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
      case 'holidays-birthdays':
      case 'holidays':
        return <Holidays />;
      case 'birthdays':
        return <Birthdays />;
      case 'reports':
        return <Reports />;
      case 'report-test':
        return <ReportTest />;
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
        <style dangerouslySetInnerHTML={{
          __html: `
          .app-sidebar {
            width: 256px !important;
            background-color: #111827 !important;
            color: white !important;
            height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
            border-right: 1px solid #374151 !important;
            flex-shrink: 0 !important;
            transition: transform 0.3s ease-in-out !important;
            z-index: 50 !important;
          }
          .hide-on-desktop {}
          .show-on-desktop { display: none !important; }
          .mobile-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(0,0,0,0.5);
            z-index: 40;
          }
          .custom-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
          .custom-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
          .custom-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }

          @media (max-width: 1024px) {
            .custom-grid-4 { grid-template-columns: repeat(2, 1fr); }
          }

          @media (max-width: 767px) {
            .app-sidebar {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              transform: translateX(-100%) !important;
            }
            .app-sidebar.open {
              transform: translateX(0) !important;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
            }
            .custom-grid-4, .custom-grid-3, .custom-grid-2 {
              grid-template-columns: repeat(1, 1fr) !important;
              gap: 1rem !important;
            }
          }

          @media (min-width: 768px) {
            .app-sidebar {
              position: relative !important;
              transform: translateX(0) !important;
            }
            .hide-on-desktop { display: none !important; }
            .show-on-desktop { display: block !important; }
            .mobile-overlay { display: none !important; }
          }
        `}} />
        <div className="flex h-screen bg-gray-50 overflow-hidden relative">
          {/* Mobile Sidebar Overlay */}
          {isMobileSidebarOpen && (
            <div
              className="mobile-overlay"
              onClick={() => setIsMobileSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          <Sidebar
            activePage={activePage}
            setActivePage={(page) => {
              setActivePage(page);
              setIsMobileSidebarOpen(false); // Close sidebar automatically on mobile when navigating
            }}
            isOpen={isMobileSidebarOpen}
            setIsOpen={setIsMobileSidebarOpen}
          />
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <Header
              onProfileClick={() => setActivePage('profile')}
              onSettingsClick={() => setActivePage('settings')}
              onNavigate={(page) => setActivePage(page)}
              onMenuToggle={() => setIsMobileSidebarOpen(true)}
            />
            <main className="flex-1 overflow-y-auto px-4 py-6 md:p-6">
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
    </AuthProvider>
  );
}