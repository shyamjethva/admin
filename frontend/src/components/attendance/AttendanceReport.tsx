import { useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import { useData } from '../../context/DataContext';
import * as XLSX from 'xlsx';

export function AttendanceReport() {
  const { attendance, employees, departments } = useData();
  const [selectedMonth, setSelectedMonth] = useState('');

  // Debug logging
  console.log('🔄 AttendanceReport - employees:', employees);
  console.log('🔄 AttendanceReport - departments:', departments);
  console.log('🔄 AttendanceReport - attendance:', attendance);

  // Log first employee details to understand structure
  if (employees.length > 0) {
    console.log('🔄 First employee structure:', employees[0]);
    console.log('🔄 First employee keys:', Object.keys(employees[0]));
    console.log('🔄 Department field type:', typeof employees[0].department, employees[0].department);
    console.log('🔄 DepartmentId field type:', typeof employees[0].departmentId, employees[0].departmentId);
  }

  // Log first department details
  if (departments.length > 0) {
    console.log('🔄 First department structure:', departments[0]);
    console.log('🔄 First department keys:', Object.keys(departments[0]));
  }

  const filteredAttendance = attendance.filter(a => a.date.startsWith(selectedMonth));

  const employeeStats = employees.map(emp => {
    const empAttendance = filteredAttendance.filter(a => a.employeeId === emp.id);
    const present = empAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const absent = empAttendance.filter(a => a.status === 'absent').length;
    const totalHours = empAttendance.reduce((sum, a) => sum + a.hours, 0);

    // Enhanced department resolution with debugging
    console.log(`🔄 Processing employee: ${emp.name}`, emp);
    console.log(`🔄 Available departments:`, departments);

    let departmentName = 'N/A';

    // Method 1: Check if department is already populated as an object
    if (emp.department && typeof emp.department === 'object' && emp.department.name) {
      departmentName = emp.department.name;
      console.log(`✅ Found populated department object: ${departmentName}`);
    }
    // Method 2: Check if departmentId is populated as an object
    else if (emp.departmentId && typeof emp.departmentId === 'object' && emp.departmentId.name) {
      departmentName = emp.departmentId.name;
      console.log(`✅ Found populated departmentId object: ${departmentName}`);
    }
    // Method 3: Check departmentId field (ID reference)
    else if (emp.departmentId && typeof emp.departmentId === 'string') {
      console.log(`🔄 Looking for departmentId: ${emp.departmentId}`);
      const department = departments.find(d => d.id === emp.departmentId || d._id === emp.departmentId);
      if (department) {
        departmentName = department.name;
        console.log(`✅ Found department by departmentId: ${departmentName}`);
      } else {
        console.log(`❌ No department found for departmentId: ${emp.departmentId}`);
      }
    }
    // Method 4: Check department field (ID reference)
    else if (emp.department && typeof emp.department === 'string') {
      console.log(`🔄 Checking department ID string: ${emp.department}`);
      const department = departments.find(d => d.id === emp.department || d._id === emp.department);
      if (department) {
        departmentName = department.name;
        console.log(`✅ Found department by department string: ${departmentName}`);
      } else {
        console.log(`❌ No department found for department string: ${emp.department}`);
      }
    }
    // Method 5: Try alternative field names
    else {
      // Check for other possible department field names
      const possibleFields = ['departmentName', 'deptName', 'dept'];
      for (const field of possibleFields) {
        if (emp[field]) {
          departmentName = emp[field];
          console.log(`✅ Found department in ${field}: ${departmentName}`);
          break;
        }
      }
    }

    // Method 3: Try to find department by employee name pattern (fallback)
    if (departmentName === 'N/A') {
      console.log(`🔄 Trying fallback methods for ${emp.name}`);
      // You can add more sophisticated fallback logic here if needed
    }

    console.log(`📊 Final department for ${emp.name}: ${departmentName}`);

    return {
      ...emp,
      present,
      absent,
      totalHours: totalHours.toFixed(1),
      department: departmentName
    };
  });

  const handleDownload = () => {
    try {
      // Prepare data for Excel
      const reportData = employeeStats.map(stat => ({
        'Employee Name': stat.name,
        'Department': stat.department, // Now properly mapped
        'Present Days': stat.present,
        'Absent Days': stat.absent,
        'Total Hours': parseFloat(stat.totalHours),
        'Attendance %': parseFloat(((stat.present / (stat.present + stat.absent)) * 100).toFixed(1)) || 0
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(reportData);

      // Add summary row
      const summaryRow = [
        'SUMMARY',
        '',
        employeeStats.reduce((sum, stat) => sum + stat.present, 0),
        employeeStats.reduce((sum, stat) => sum + stat.absent, 0),
        employeeStats.reduce((sum, stat) => sum + parseFloat(stat.totalHours), 0).toFixed(1),
        ''
      ];

      // Add summary to worksheet
      XLSX.utils.sheet_add_aoa(ws, [summaryRow], { origin: -1 });

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');

      // Generate filename with selected month
      const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const filename = `Attendance_Report_${monthName.replace(' ', '_')}.xlsx`;

      // Download the file
      XLSX.writeFile(wb, filename);

      alert(`✅ Attendance report for ${monthName} downloaded successfully!`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('❌ Failed to generate report. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Attendance Report</h1>
          <p className="text-gray-600 mt-1">View and download attendance reports</p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download size={20} />
          Download Report
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Calendar size={20} className="text-gray-600" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employeeStats.map((stat) => {
                const total = stat.present + stat.absent;
                const percentage = total > 0 ? ((stat.present / total) * 100).toFixed(1) : '0';
                return (
                  <tr key={stat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{stat.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{stat.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">{stat.present}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-600 font-medium">{stat.absent}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{stat.totalHours}h</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
