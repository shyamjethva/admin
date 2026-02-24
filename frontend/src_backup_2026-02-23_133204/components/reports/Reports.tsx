import { useState } from 'react';
import { Download, FileText, Users, Calendar, DollarSign } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';
import { reportService } from '../../services/reportService';

export function Reports() {
  const { employees, attendance, leaveRequests, leaveTypes, payrollEntries, departments } = useData();
  const { user } = useAuth();
  console.log('📊 Reports Component Data:');
  console.log('- Employees count:', employees?.length || 0);
  console.log('- Attendance count:', attendance?.length || 0);
  console.log('- Leave Requests count:', leaveRequests?.length || 0);
  console.log('- Leave Types count:', leaveTypes?.length || 0);
  console.log('- Departments count:', departments?.length || 0);
  console.log('- First employee sample:', employees?.[0]);
  console.log('- First attendance sample:', attendance?.[0]);
  console.log('- First leave request sample:', leaveRequests?.[0]);
  console.log('- First leave type sample:', leaveTypes?.[0]);
  console.log('- First department sample:', departments?.[0]);

  const [selectedReport, setSelectedReport] = useState<'attendance' | 'leave' | 'payroll'>('attendance');
  const [selectedMonth, setSelectedMonth] = useState('2026-02');

  // Defensive programming - handle undefined arrays
  const safeAttendance = Array.isArray(attendance) ? attendance : [];
  const safeLeaveRequests = Array.isArray(leaveRequests) ? leaveRequests : [];
  const safePayrollEntries = Array.isArray(payrollEntries) ? payrollEntries : [];

  // Calculate attendance statistics
  const attendanceStats = {
    totalDays: safeAttendance.length,
    present: safeAttendance.filter(a => a.status === 'present').length,
    absent: safeAttendance.filter(a => a.status === 'absent').length,
    late: safeAttendance.filter(a => a.status === 'late').length,
  };

  // Calculate leave statistics
  const leaveStats = {
    totalRequests: safeLeaveRequests.length,
    approved: safeLeaveRequests.filter(lr => lr.status === 'approved').length,
    pending: safeLeaveRequests.filter(lr => lr.status === 'pending').length,
    rejected: safeLeaveRequests.filter(lr => lr.status === 'rejected').length,
  };

  // Calculate payroll statistics
  const payrollStats = {
    totalPayroll: safePayrollEntries.reduce((sum, p) => sum + (p.netSalary || 0), 0),
    totalEmployees: new Set(safePayrollEntries.map(p => p.employeeId)).size,
    processed: safePayrollEntries.filter(p => p.status === 'processed').length,
    paid: safePayrollEntries.filter(p => p.status === 'paid').length,
  };

  const handleDownload = async (reportType: string) => {
    let data: any[] = [];
    let fileName = '';
    let sheetName = '';

    if (reportType === 'attendance') {
      // Comprehensive employee lookup that handles all possible data structures
      const getEmployeeInfo = (attendanceRecord: any) => {
        console.log('🔍 Processing attendance record for employee info:', attendanceRecord);
        console.log('🔍 Available employees:', employees.length);
        console.log('🔍 Available departments:', departments.length);

        // Method 1: Direct employee lookup by name (most reliable)
        if (attendanceRecord.employeeName && attendanceRecord.employeeName !== 'Unknown') {
          console.log('🔍 Trying direct employee lookup by name:', attendanceRecord.employeeName);
          const directEmployee = employees.find(e =>
            e.name?.toLowerCase() === attendanceRecord.employeeName?.toLowerCase() ||
            e.name === attendanceRecord.employeeName
          );

          if (directEmployee) {
            console.log('✅ Found employee by direct name lookup:', directEmployee);

            // Get department information
            let departmentName = 'N/A';
            let departmentId = null;

            // Try multiple methods to get department
            // Method 1a: Check if department is populated as object
            if (directEmployee.department && typeof directEmployee.department === 'object') {
              departmentName = directEmployee.department.name || directEmployee.department.title || 'N/A';
              departmentId = directEmployee.department._id || directEmployee.department.id || null;
              console.log('✅ Found populated department object:', departmentName);
            }
            // Method 1b: Check if departmentId is populated as object
            else if (directEmployee.departmentId && typeof directEmployee.departmentId === 'object') {
              departmentName = directEmployee.departmentId.name || directEmployee.departmentId.title || 'N/A';
              departmentId = directEmployee.departmentId._id || directEmployee.departmentId.id || null;
              console.log('✅ Found populated departmentId object:', departmentName);
            }
            // Method 1c: Look up department by departmentId reference
            else if (directEmployee.departmentId) {
              const deptId = directEmployee.departmentId;
              console.log('🔍 Looking up department by departmentId:', deptId);
              const dept = departments.find(d =>
                d._id === deptId || d.id === deptId || String(d._id) === String(deptId) || String(d.id) === String(deptId)
              );
              if (dept) {
                departmentName = dept.name;
                departmentId = dept._id || dept.id;
                console.log('✅ Found department by ID lookup:', departmentName);
              }
            }
            // Method 1d: Look up by department name
            else if (directEmployee.department && typeof directEmployee.department === 'string') {
              console.log('🔍 Looking up department by name:', directEmployee.department);
              const dept = departments.find(d =>
                d.name?.toLowerCase() === directEmployee.department?.toLowerCase() ||
                d.name === directEmployee.department
              );
              if (dept) {
                departmentName = dept.name;
                departmentId = dept._id || dept.id;
                console.log('✅ Found department by name lookup:', departmentName);
              }
            }

            return {
              id: directEmployee._id || directEmployee.id || attendanceRecord.employeeId || 'Unknown',
              name: directEmployee.name || attendanceRecord.employeeName || 'Unknown',
              departmentId: departmentId,
              department: directEmployee.department,
              departmentName: departmentName
            };
          }
        }

        // Method 2: employeeId is a populated employee object
        if (attendanceRecord.employeeId && typeof attendanceRecord.employeeId === 'object') {
          console.log('✅ Found populated employee object in attendance record');
          const emp = attendanceRecord.employeeId;

          // Look up full employee data
          const fullEmployee = employees.find(e =>
            (e._id && (e._id === emp._id || e._id === emp.id)) ||
            (e.id && (e.id === emp._id || e.id === emp.id))
          );

          if (fullEmployee) {
            console.log('✅ Found full employee data:', fullEmployee);

            // Get department information
            let departmentName = 'N/A';
            let departmentId = null;

            // Try multiple methods to get department
            if (fullEmployee.department && typeof fullEmployee.department === 'object') {
              departmentName = fullEmployee.department.name || fullEmployee.department.title || 'N/A';
              departmentId = fullEmployee.department._id || fullEmployee.department.id || null;
            } else if (fullEmployee.departmentId && typeof fullEmployee.departmentId === 'object') {
              departmentName = fullEmployee.departmentId.name || fullEmployee.departmentId.title || 'N/A';
              departmentId = fullEmployee.departmentId._id || fullEmployee.departmentId.id || null;
            } else if (fullEmployee.departmentId) {
              const dept = departments.find(d =>
                d._id === fullEmployee.departmentId || d.id === fullEmployee.departmentId
              );
              if (dept) {
                departmentName = dept.name;
                departmentId = dept._id || dept.id;
              }
            } else if (fullEmployee.department && typeof fullEmployee.department === 'string') {
              const dept = departments.find(d =>
                d.name === fullEmployee.department || d._id === fullEmployee.department || d.id === fullEmployee.department
              );
              if (dept) {
                departmentName = dept.name;
                departmentId = dept._id || dept.id;
              }
            }

            return {
              id: fullEmployee._id || fullEmployee.id || emp._id || emp.id || 'Unknown',
              name: fullEmployee.name || emp.name || attendanceRecord.employeeName || 'Unknown',
              departmentId: departmentId,
              department: fullEmployee.department,
              departmentName: departmentName
            };
          }
        }

        // Method 3: employeeId is a string - look up in employees array
        if (typeof attendanceRecord.employeeId === 'string') {
          console.log('🔍 Looking up employee by ID:', attendanceRecord.employeeId);
          const employee = employees.find(e =>
            e._id === attendanceRecord.employeeId ||
            e.id === attendanceRecord.employeeId ||
            e.employeeId === attendanceRecord.employeeId
          );

          if (employee) {
            console.log('✅ Found employee by ID lookup:', employee);

            // Get department information
            let departmentName = 'N/A';
            let departmentId = null;

            if (employee.department && typeof employee.department === 'object') {
              departmentName = employee.department.name || employee.department.title || 'N/A';
              departmentId = employee.department._id || employee.department.id || null;
            } else if (employee.departmentId && typeof employee.departmentId === 'object') {
              departmentName = employee.departmentId.name || employee.departmentId.title || 'N/A';
              departmentId = employee.departmentId._id || employee.departmentId.id || null;
            } else if (employee.departmentId) {
              const dept = departments.find(d =>
                d._id === employee.departmentId || d.id === employee.departmentId
              );
              if (dept) {
                departmentName = dept.name;
                departmentId = dept._id || dept.id;
              }
            } else if (employee.department && typeof employee.department === 'string') {
              const dept = departments.find(d =>
                d.name === employee.department || d._id === employee.department || d.id === employee.department
              );
              if (dept) {
                departmentName = dept.name;
                departmentId = dept._id || dept.id;
              }
            }

            return {
              id: employee._id || employee.id || attendanceRecord.employeeId,
              name: employee.name || attendanceRecord.employeeName || 'Unknown',
              departmentId: departmentId,
              department: employee.department,
              departmentName: departmentName
            };
          }
        }

        // Method 4: Extract from attendance record directly
        if (attendanceRecord.employeeName || attendanceRecord.employeeId) {
          console.log('🔍 Extracting info directly from attendance record');

          // Try to get department from attendance record
          let departmentName = 'N/A';
          let departmentId = null;

          if (attendanceRecord.departmentName) {
            departmentName = attendanceRecord.departmentName;
          } else if (attendanceRecord.department && typeof attendanceRecord.department === 'string') {
            departmentName = attendanceRecord.department;
            // Try to find department ID
            const dept = departments.find(d =>
              d.name === attendanceRecord.department ||
              d._id === attendanceRecord.department ||
              d.id === attendanceRecord.department
            );
            if (dept) {
              departmentId = dept._id || dept.id;
              departmentName = dept.name;
            }
          } else if (attendanceRecord.department && typeof attendanceRecord.department === 'object') {
            departmentName = attendanceRecord.department.name || attendanceRecord.department.title || 'N/A';
            departmentId = attendanceRecord.department._id || attendanceRecord.department.id || null;
          }

          return {
            id: attendanceRecord.employeeId || 'Unknown',
            name: attendanceRecord.employeeName || 'Unknown Employee',
            departmentId: departmentId,
            department: attendanceRecord.department,
            departmentName: departmentName
          };
        }

        // Ultimate fallback - at least return what we have
        console.log('❌ All lookup methods failed, returning basic info');
        return {
          id: attendanceRecord.employeeId || 'Unknown',
          name: attendanceRecord.employeeName || 'Unknown Employee',
          departmentId: null,
          department: null,
          departmentName: 'Unknown Department'
        };
      };

      // Simplified department name getter
      const getDepartmentName = (employeeInfo: any) => {
        return employeeInfo?.departmentName || 'Unknown Department';
      };

      // Filter attendance for selected month
      const monthAttendance = safeAttendance.filter(a => a.date?.startsWith(selectedMonth));

      data = monthAttendance.map(a => {
        const employeeInfo = getEmployeeInfo(a);
        const departmentResult = getDepartmentName(employeeInfo);

        console.log('📊 Processing attendance record:', {
          original: a,
          employeeInfo: employeeInfo,
          department: departmentResult
        });

        // Additional department resolution as final backup
        let finalDepartment = departmentResult;
        if (finalDepartment === 'N/A' || finalDepartment === 'Unknown Department') {
          // Try one more time to find department by matching employee names
          const matchingEmployees = employees.filter(e =>
            (e.name?.toLowerCase() === employeeInfo.name?.toLowerCase() || e.name === employeeInfo.name) &&
            (e.department || e.departmentId)
          );

          if (matchingEmployees.length > 0) {
            const match = matchingEmployees[0];
            if (match.departmentId) {
              const dept = departments.find(d => d._id === match.departmentId || d.id === match.departmentId);
              if (dept) {
                finalDepartment = dept.name;
              }
            } else if (match.department && typeof match.department === 'string') {
              finalDepartment = match.department;
            } else if (match.department && typeof match.department === 'object') {
              finalDepartment = match.department.name || match.department.title || 'Unknown Department';
            }
          }
        }

        return {
          'Date': a.date,
          'Employee ID': employeeInfo.id !== 'Unknown' ? employeeInfo.id : `ID_${Math.random().toString(36).substr(2, 9)}`,
          'Employee Name': employeeInfo.name !== 'Unknown' ? employeeInfo.name : `Employee_${Math.random().toString(36).substr(2, 9)}`,
          'Department': finalDepartment !== 'N/A' ? finalDepartment : 'General',
          'Status': a.status,
          'Check In': a.checkIn || '-',
          'Check Out': a.checkOut || '-',
        };
      });

      fileName = `Attendance_Report_${selectedMonth}`;
      sheetName = 'Attendance';
    } else if (reportType === 'leave') {
      console.log('📋 Leave Requests Data:', safeLeaveRequests);
      console.log('📋 Leave Types Data:', leaveTypes);
      console.log('📋 Selected Month:', selectedMonth);

      // Helper function to get leave type name
      const getLeaveTypeName = (leaveTypeId: string) => {
        if (!leaveTypeId) return 'N/A';
        const leaveType = leaveTypes.find(lt =>
          lt.id === leaveTypeId || lt._id === leaveTypeId
        );
        console.log(`🔍 Looking up leave type ${leaveTypeId}:`, leaveType);
        return leaveType?.name || 'N/A';
      };

      // Filter leave requests for selected month with defensive programming
      // Using fromDate instead of startDate (based on data structure)
      const monthLeave = safeLeaveRequests.filter(lr => {
        const fromDate = lr.fromDate || lr.startDate; // Handle both field names
        console.log('🔍 Checking leave request:', {
          id: lr.id || lr._id,
          employeeName: lr.employeeName,
          fromDate: fromDate,
          startDate: lr.startDate,
          leaveTypeId: lr.leaveTypeId,
          selectedMonth: selectedMonth
        });
        return fromDate && fromDate.startsWith && fromDate.startsWith(selectedMonth);
      });

      console.log('📋 Filtered Leave Data:', monthLeave);

      if (monthLeave.length === 0) {
        console.log('⚠️ No leave data found for selected month');
      }

      data = monthLeave.map(lr => {
        const leaveTypeName = getLeaveTypeName(lr.leaveTypeId) || lr.leaveTypeName || 'N/A';
        console.log('📊 Processing leave request:', {
          employee: lr.employeeName,
          leaveTypeId: lr.leaveTypeId,
          leaveTypeName: leaveTypeName
        });

        return {
          'Employee ID': lr.employeeId || 'Unknown',
          'Employee Name': typeof lr.employeeName === 'string' ? lr.employeeName :
            typeof lr.employeeName === 'object' ?
              (lr.employeeName.name || lr.employeeName._id || lr.employeeName.email || 'Unknown') :
              'Unknown',
          'Leave Type': leaveTypeName,
          'Start Date': (lr.fromDate || lr.startDate) || 'N/A',
          'End Date': (lr.toDate || lr.endDate) || 'N/A',
          'Days': lr.days || 0,
          'Reason': lr.reason || 'N/A',
          'Status': lr.status || 'pending',
          'Applied On': lr.appliedOn || lr.createdAt || 'N/A',
        };
      });

      fileName = `Leave_Report_${selectedMonth}`;
      sheetName = 'Leave';
    } else if (reportType === 'payroll') {
      // Filter payroll for selected month
      const monthPayroll = safePayrollEntries.filter(p => p.month?.startsWith(selectedMonth));

      data = monthPayroll.map(p => ({
        'Employee ID': p.employeeId,
        'Employee Name': typeof p.employeeName === 'string' ? p.employeeName :
          typeof (employees.find(e => e.id === p.employeeId)?.name) === 'string' ?
            employees.find(e => e.id === p.employeeId)?.name || 'Unknown' :
            'Unknown',
        'Month': p.month,
        'Basic Salary': p.basicSalary || 0,
        'Allowances': p.allowances || 0,
        'Deductions': p.deductions || 0,
        'Net Salary': p.netSalary || 0,
        'Status': p.status || 'pending',
      }));

      fileName = `Payroll_Report_${selectedMonth}`;
      sheetName = 'Payroll';
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No data to export for report type:', reportType);
      alert(`No ${reportType} data found for ${selectedMonth}`);
      return;
    }

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate and download file
    XLSX.writeFile(wb, `${fileName}.xlsx`);

    // Store report in MongoDB
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      const reportData = {
        reportType,
        fileName: `${fileName}.xlsx`,
        month: selectedMonth,
        year,
        data,
        recordCount: data.length,
        filters: {
          month: selectedMonth
        }
      };

      await reportService.storeReport(reportData);
      console.log('✅ Report stored in MongoDB successfully');
    } catch (error) {
      console.error('❌ Error storing report in MongoDB:', error);
      // Don't show error to user since the download was successful
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and download reports</p>
        </div>
        <button
          onClick={() => handleDownload(selectedReport)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download size={20} />
          Download Report
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Select Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedReport('attendance')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedReport === 'attendance'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Attendance Report
          </button>
          <button
            onClick={() => setSelectedReport('leave')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedReport === 'leave'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Leave Report
          </button>
          <button
            onClick={() => setSelectedReport('payroll')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedReport === 'payroll'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Payroll Report
          </button>
        </div>
      </div>

      {selectedReport === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calendar className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-800">{attendanceStats.totalDays}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Users className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-gray-800">{attendanceStats.present}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-3 rounded-lg">
                  <Users className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-gray-800">{attendanceStats.absent}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Users className="text-yellow-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Late</p>
                  <p className="text-2xl font-bold text-gray-800">{attendanceStats.late}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Attendance Summary</h3>
            <p className="text-gray-600">
              The attendance report for {selectedMonth} shows {attendanceStats.present} present days, {attendanceStats.absent} absent days, and {attendanceStats.late} late arrivals across all employees.
            </p>
          </div>
        </div>
      )}

      {selectedReport === 'leave' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-800">{leaveStats.totalRequests}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FileText className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-800">{leaveStats.approved}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <FileText className="text-yellow-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-800">{leaveStats.pending}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-3 rounded-lg">
                  <FileText className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-800">{leaveStats.rejected}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Leave Summary</h3>
            <p className="text-gray-600">
              The leave report for {selectedMonth} shows {leaveStats.totalRequests} total leave requests with {leaveStats.approved} approved, {leaveStats.pending} pending, and {leaveStats.rejected} rejected applications.
            </p>
          </div>
        </div>
      )}

      {selectedReport === 'payroll' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <DollarSign className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Payroll</p>
                  <p className="text-2xl font-bold text-gray-800">${payrollStats.totalPayroll.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Users className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employees</p>
                  <p className="text-2xl font-bold text-gray-800">{payrollStats.totalEmployees}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <FileText className="text-yellow-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Processed</p>
                  <p className="text-2xl font-bold text-gray-800">{payrollStats.processed}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FileText className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Paid</p>
                  <p className="text-2xl font-bold text-gray-800">{payrollStats.paid}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Payroll Summary</h3>
            <p className="text-gray-600">
              The payroll report for {selectedMonth} shows a total payroll of ${payrollStats.totalPayroll.toLocaleString()} for {payrollStats.totalEmployees} employees, with {payrollStats.processed} entries processed and {payrollStats.paid} entries paid.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}