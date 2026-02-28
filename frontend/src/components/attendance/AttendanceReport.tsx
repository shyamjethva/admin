import { useState } from 'react';
import { Download, Calendar, Users, TrendingUp, Clock } from 'lucide-react';
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
    // Safely extract employee ID
    const empId = emp.id || emp._id;
    const empAttendance = filteredAttendance.filter(a => {
      // Handle case where a.employeeId might be an object
      const attendanceEmpId = typeof a.employeeId === 'object' ?
        (a.employeeId._id || a.employeeId.id) : a.employeeId;
      return attendanceEmpId === empId;
    });
    const present = empAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const absent = empAttendance.filter(a => a.status === 'absent').length;
    const totalHours = empAttendance.reduce((sum, a) => sum + a.hours, 0);

    // Enhanced department resolution with debugging
    const empName = typeof emp.name === 'string' ?
      emp.name :
      typeof emp.name === 'object' ?
        (emp.name.name || emp.name._id || emp.name.email || 'Unknown Employee') :
        'Unknown Employee';
    console.log(`🔄 Processing employee: ${empName}`, emp);
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
      console.log(`🔄 Trying fallback methods for ${empName}`);
      // You can add more sophisticated fallback logic here if needed
    }

    console.log(`📊 Final department for ${empName}: ${departmentName}`);

    return {
      ...emp,
      name: empName, // Use the safely extracted name
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
        'Employee Name': typeof stat.name === 'string' ?
          stat.name :
          typeof stat.name === 'object' ?
            (stat.name.name || stat.name._id || stat.name.email || 'Unknown Employee') :
            'Unknown Employee',
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
    <div className="w-full px-4 md:px-6 pb-10 space-y-8">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Attendance Report</h1>
          <p className="text-gray-500 mt-1 font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            Comprehensive monthly performance and analytical insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2.5 flex items-center gap-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-2">Select Month</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 bg-gray-50 border-none rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-gray-700 transition-all"
            />
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2.5 px-6 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download size={20} className="stroke-[2.5]" />
            Download Data
          </button>
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Present', value: employeeStats.reduce((sum, s) => sum + (Number(s.present) || 0), 0), icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Absent', value: employeeStats.reduce((sum, s) => sum + (Number(s.absent) || 0), 0), icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-50' },
          {
            label: 'Avg Attendance', value: `${(employeeStats.reduce((sum, s) => {
              const p = Number(s.present) || 0;
              const a = Number(s.absent) || 0;
              return sum + (p / (p + a || 1) * 100);
            }, 0) / (employeeStats.length || 1)).toFixed(1)}%`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50'
          },
          { label: 'Total Hours', value: `${employeeStats.reduce((sum, s) => sum + (Number(s.totalHours) || 0), 0).toFixed(0)}h`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-md">
            <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl`}>
              <stat.icon size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-2xl font-black text-gray-900 mt-0.5">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Detailed Breakdown</h2>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-black uppercase tracking-widest rounded-lg border border-blue-100">
            {employeeStats.length} Staff Members
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Employee</th>
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Department</th>
                <th className="px-8 py-5 text-center text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Present</th>
                <th className="px-8 py-5 text-center text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Absent</th>
                <th className="px-8 py-5 text-center text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Total Hours</th>
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Attendance Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employeeStats.map((stat, idx) => {
                const total = stat.present + stat.absent;
                const percentage = total > 0 ? ((stat.present / total) * 100).toFixed(1) : '0';
                return (
                  <tr key={stat.id || idx} className="hover:bg-blue-50/10 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center font-bold text-gray-600 border border-gray-100 transition-transform group-hover:scale-110 group-hover:rotate-6">
                          {stat.name.charAt(0)}
                        </div>
                        <span className="font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {stat.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-gray-200/50">
                        {stat.department}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-center">
                      <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                        {stat.present}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-center">
                      <span className="text-sm font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
                        {stat.absent}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-center">
                      <span className="text-sm font-black text-gray-800">
                        {stat.totalHours}h
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-gray-100/80 rounded-full h-2.5 w-32 overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${parseFloat(percentage) > 80 ? 'bg-emerald-500' : parseFloat(percentage) > 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[12px] font-black text-gray-900">{percentage}%</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">Score</span>
                        </div>
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
