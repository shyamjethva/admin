import { useState } from 'react';
import { Download, FileText, Users, Calendar, DollarSign } from 'lucide-react';
import { useData } from '../../context/DataContext';
import * as XLSX from 'xlsx';

export function Reports() {
  const { employees, attendance, leaveRequests, leaveTypes, payrollEntries, departments } = useData();
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

  const attendanceStats = {
    totalDays: safeAttendance.filter(a => a.date?.startsWith(selectedMonth)).length,
    present: safeAttendance.filter(a => a.date?.startsWith(selectedMonth) && a.status === 'present').length,
    absent: safeAttendance.filter(a => a.date?.startsWith(selectedMonth) && a.status === 'absent').length,
    late: safeAttendance.filter(a => a.date?.startsWith(selectedMonth) && a.status === 'late').length,
  };

  const leaveStats = {
    totalRequests: safeLeaveRequests.filter(lr => (lr.fromDate || lr.startDate)?.startsWith(selectedMonth)).length,
    approved: safeLeaveRequests.filter(lr => (lr.fromDate || lr.startDate)?.startsWith(selectedMonth) && lr.status === 'approved').length,
    pending: safeLeaveRequests.filter(lr => (lr.fromDate || lr.startDate)?.startsWith(selectedMonth) && lr.status === 'pending').length,
    rejected: safeLeaveRequests.filter(lr => (lr.fromDate || lr.startDate)?.startsWith(selectedMonth) && lr.status === 'rejected').length,
  };

  const payrollStats = {
    totalPayroll: safePayrollEntries.filter(p => p.month?.startsWith(selectedMonth)).reduce((sum, p) => sum + (p.netSalary || 0), 0),
    totalEmployees: safePayrollEntries.filter(p => p.month?.startsWith(selectedMonth)).length,
    processed: safePayrollEntries.filter(p => p.month?.startsWith(selectedMonth) && p.status === 'processed').length,
    paid: safePayrollEntries.filter(p => p.month?.startsWith(selectedMonth) && p.status === 'paid').length,
  };

  const handleDownload = (reportType: string) => {
    let data: any[] = [];
    let fileName = '';
    let sheetName = '';

    if (reportType === 'attendance') {
      // Enhanced employee lookup that handles both ID references and populated objects
      const getEmployeeInfo = (attendanceRecord: any) => {
        console.log('🔍 Processing attendance record for employee info:', attendanceRecord);

        // Case 1: employeeId is a populated employee object (but minimal data)
        if (attendanceRecord.employeeId && typeof attendanceRecord.employeeId === 'object') {
          console.log('✅ Found populated employee object in attendance record');
          const emp = attendanceRecord.employeeId;
          console.log('🔍 Employee object structure:', emp);
          console.log('🔍 Employee keys:', Object.keys(emp));
          console.log('🔍 Department field:', emp.department);
          console.log('🔍 DepartmentId field:', emp.departmentId);

          // Since the populated object is minimal, look up the full employee data
          console.log('🔄 Looking up full employee data by ID:', emp._id || emp.id);
          const fullEmployee = employees.find(e =>
            e._id === (emp._id || emp.id) || e.id === (emp._id || emp.id)
          );

          if (fullEmployee) {
            console.log('✅ Found full employee data:', fullEmployee);
            console.log('🔍 Full employee departmentId:', fullEmployee.departmentId);

            // Extract department information from full employee data
            let departmentName = 'N/A';

            // Method 1: Check if department is populated in full employee data
            if (fullEmployee.department && typeof fullEmployee.department === 'object') {
              departmentName = fullEmployee.department.name || fullEmployee.department.title || 'N/A';
              console.log('✅ Found populated department in full employee:', departmentName);
            }
            // Method 2: Check if departmentId is populated
            else if (fullEmployee.departmentId && typeof fullEmployee.departmentId === 'object') {
              departmentName = fullEmployee.departmentId.name || fullEmployee.departmentId.title || 'N/A';
              console.log('✅ Found populated departmentId in full employee:', departmentName);
            }
            // Method 3: Look up department by departmentId reference
            else if (fullEmployee.departmentId && typeof fullEmployee.departmentId === 'string') {
              console.log('🔍 Looking up department by departmentId:', fullEmployee.departmentId);
              console.log('🔍 Available departments:', departments.map(d => ({
                id: d._id,
                name: d.name,
                description: d.description
              })));

              const dept = departments.find(d => {
                const match = (d._id === fullEmployee.departmentId || d.id === fullEmployee.departmentId);
                console.log(`_dept ${d.name}: _id=${d._id}, id=${d.id}, match=${match}`);
                return match;
              });

              if (dept) {
                departmentName = dept.name;
                console.log('✅ Found department by ID lookup:', departmentName);
              } else {
                console.log('❌ No department found by ID lookup');
              }
            }

            console.log('📊 Final department result for full employee lookup:', departmentName);

            return {
              id: fullEmployee._id || fullEmployee.id,
              name: fullEmployee.name || emp.name || 'Unknown',
              departmentId: fullEmployee.departmentId,
              department: fullEmployee.department,
              departmentName: departmentName
            };
          } else {
            console.log('❌ Full employee data not found, falling back to name matching');
            // Fall back to name-based matching
          }
        }

        // Case 2: Check if attendance record has direct department info
        if (attendanceRecord.department || attendanceRecord.departmentName || attendanceRecord.deptName) {
          console.log('✅ Found direct department info in attendance record');
          return {
            id: attendanceRecord.employeeId || 'Unknown',
            name: attendanceRecord.employeeName || 'Unknown',
            departmentId: attendanceRecord.departmentId,
            department: attendanceRecord.department,
            departmentName: attendanceRecord.departmentName ||
              attendanceRecord.deptName ||
              attendanceRecord.department?.name
          };
        }

        // Case 3: employeeId is a string ID - look up in employees array
        if (typeof attendanceRecord.employeeId === 'string') {
          console.log('🔍 Looking up employee by ID:', attendanceRecord.employeeId);
          const employee = employees.find(e =>
            e.id === attendanceRecord.employeeId ||
            e._id === attendanceRecord.employeeId ||
            e.employeeId === attendanceRecord.employeeId
          );

          if (employee) {
            console.log('✅ Found employee in lookup:', employee);
            return {
              id: employee.id || employee._id,
              name: employee.name || 'Unknown',
              departmentId: employee.departmentId,
              department: employee.department,
              departmentName: employee.department?.name ||
                employee.departmentName ||
                employee.deptName
            };
          } else {
            console.log('❌ Employee not found in lookup');
          }
        }

        // Fallback: Direct employee lookup by name
        console.log('🔄 Trying direct employee lookup by name for:', attendanceRecord.employeeName);
        if (attendanceRecord.employeeName && attendanceRecord.employeeName !== 'Unknown') {
          const directEmployee = employees.find(e =>
            e.name === attendanceRecord.employeeName ||
            e.name?.toLowerCase() === attendanceRecord.employeeName?.toLowerCase()
          );

          if (directEmployee) {
            console.log('✅ Found employee by direct name lookup:', directEmployee);

            // Get department from this employee
            let deptName = 'N/A';
            if (directEmployee.departmentId) {
              const dept = departments.find(d =>
                d._id === directEmployee.departmentId || d.id === directEmployee.departmentId
              );
              if (dept) {
                deptName = dept.name;
                console.log('✅ Found department for direct employee lookup:', deptName);
              }
            }

            return {
              id: directEmployee._id || directEmployee.id,
              name: directEmployee.name || attendanceRecord.employeeName,
              departmentId: directEmployee.departmentId,
              department: directEmployee.department,
              departmentName: deptName
            };
          }
        }
      };

      // Get department name with comprehensive debugging
      const getDepartmentName = (employeeInfo: any) => {
        if (!employeeInfo) {
          console.log('❌ No employee info provided');
          return 'N/A';
        }

        console.log('🔍 Employee info for department lookup:', employeeInfo);
        console.log('🔍 Employee info keys:', Object.keys(employeeInfo));
        console.log('🔍 Department field type:', typeof employeeInfo.department, employeeInfo.department);
        console.log('🔍 DepartmentId field type:', typeof employeeInfo.departmentId, employeeInfo.departmentId);

        // Method 1: Check if department is populated in employee info
        if (employeeInfo.department && typeof employeeInfo.department === 'object') {
          console.log('✅ Found populated department object:', employeeInfo.department);
          return employeeInfo.department.name || employeeInfo.department.title || 'N/A';
        }

        // Method 2: Check if departmentId is populated
        if (employeeInfo.departmentId && typeof employeeInfo.departmentId === 'object') {
          console.log('✅ Found populated departmentId object:', employeeInfo.departmentId);
          return employeeInfo.departmentId.name || employeeInfo.departmentId.title || 'N/A';
        }

        // Method 3: Look up by departmentId reference
        if (employeeInfo.departmentId && typeof employeeInfo.departmentId === 'string') {
          console.log('🔍 Looking up department by departmentId:', employeeInfo.departmentId);
          console.log('🔍 Available departments:', departments.map(d => ({ id: d.id, _id: d._id, name: d.name })));

          const dept = departments.find(d => {
            const match = (d.id === employeeInfo.departmentId ||
              d._id === employeeInfo.departmentId ||
              String(d.id) === String(employeeInfo.departmentId) ||
              String(d._id) === String(employeeInfo.departmentId));
            console.log(`_dept ${d.name}: id=${d.id}, _id=${d._id}, match=${match}`);
            return match;
          });

          if (dept) {
            console.log('✅ Found department by ID lookup:', dept.name);
            return dept.name;
          } else {
            console.log('❌ No department found by departmentId lookup');
          }
        }

        // Method 4: Look up by department reference (name or ID)
        if (employeeInfo.department && typeof employeeInfo.department === 'string') {
          console.log('🔍 Looking up department by department field:', employeeInfo.department);

          const dept = departments.find(d => {
            const match = (d.id === employeeInfo.department ||
              d._id === employeeInfo.department ||
              d.name === employeeInfo.department ||
              String(d.id) === String(employeeInfo.department) ||
              String(d._id) === String(employeeInfo.department));
            console.log(`_dept ${d.name}: id=${d.id}, _id=${d._id}, name=${d.name}, match=${match}`);
            return match;
          });

          if (dept) {
            console.log('✅ Found department by department field lookup:', dept.name);
            return dept.name;
          } else {
            console.log('❌ No department found by department field lookup');
          }
        }

        // Method 5: Try to find department by employee name matching (fallback)
        if (employeeInfo.name && employeeInfo.name !== 'Unknown') {
          console.log('🔍 Trying to find department by employee name matching for:', employeeInfo.name);
          // Look for employees with same name and get their department
          const matchingEmployees = employees.filter(e =>
            (e.name === employeeInfo.name || e.name?.toLowerCase() === employeeInfo.name?.toLowerCase()) &&
            (e.departmentId || e.department)
          );

          if (matchingEmployees.length > 0) {
            const firstMatch = matchingEmployees[0];
            console.log('✅ Found matching employee:', firstMatch);

            // Try to get department from this matching employee
            if (firstMatch.departmentId) {
              const dept = departments.find(d =>
                d.id === firstMatch.departmentId || d._id === firstMatch.departmentId
              );
              if (dept) {
                console.log('✅ Found department via employee name matching:', dept.name);
                return dept.name;
              }
            }
          }
        }

        console.log('❌ No department found after all methods');
        console.log('📊 Departments available:', departments.length);
        console.log('📊 Sample department:', departments[0]);
        return 'N/A';
      };

      // Filter attendance for selected month
      const monthAttendance = safeAttendance.filter(a => a.date?.startsWith(selectedMonth));
      console.log('📋 Month Attendance Data:', monthAttendance);
      console.log('📋 Employees Data:', employees);
      console.log('📋 Departments Data:', departments);

      data = monthAttendance.map(a => {
        const employeeInfo = getEmployeeInfo(a);
        // Safe check for employeeInfo and departmentName
        const departmentResult = (employeeInfo && employeeInfo.departmentName) ? employeeInfo.departmentName : 'N/A';

        console.log('📊 Final data for record:', {
          employee: employeeInfo?.name || 'Unknown',
          department: departmentResult,
          hasEmployeeInfo: !!employeeInfo,
          employeeInfoKeys: employeeInfo ? Object.keys(employeeInfo) : []
        });

        return {
          'Date': a.date,
          'Employee ID': (employeeInfo && employeeInfo.id) ? employeeInfo.id : 'Unknown',
          'Employee Name': (employeeInfo && employeeInfo.name) ? employeeInfo.name : 'Unknown',
          'Department': departmentResult,
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
          'Employee Name': lr.employeeName || 'Unknown',
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
        'Employee Name': p.employeeName || employees.find(e => e.id === p.employeeId)?.name || 'Unknown',
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
