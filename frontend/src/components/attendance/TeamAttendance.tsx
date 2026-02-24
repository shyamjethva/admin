// import { useState } from 'react';
// import { Plus, Pencil, Trash2, Calendar as CalendarIcon } from 'lucide-react';
// import { useData, Attendance } from '../../context/DataContext';
// import { Modal } from '../Modal';

// export function TeamAttendance() {
//   const { attendance, addAttendance, updateAttendance, deleteAttendance, employees } = useData();
//   const [showModal, setShowModal] = useState(false);
//   const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
//   const [selectedDate, setSelectedDate] = useState('');
//   const [formData, setFormData] = useState({
//     employeeId: '',
//     employeeName: '',
//     date: '',
//     checkIn: '',
//     checkOut: '',
//     status: 'present' as 'present' | 'absent' | 'late' | 'half-day',
//     hours: 0,
//   });

//   const filteredAttendance = attendance.filter(a => a.date === selectedDate);

//   const handleAdd = () => {
//     setEditingAttendance(null);
//     setFormData({
//       employeeId: '',
//       employeeName: '',
//       date: selectedDate,
//       checkIn: '',
//       checkOut: '',
//       status: 'present',
//       hours: 0,
//     });
//     setShowModal(true);
//   };

//   const handleEdit = (attendance: Attendance) => {
//     setEditingAttendance(attendance);
//     setFormData({
//       employeeId: attendance.employeeId,
//       employeeName: attendance.employeeName,
//       date: attendance.date,
//       checkIn: attendance.checkIn,
//       checkOut: attendance.checkOut,
//       status: attendance.status,
//       hours: attendance.hours,
//     });
//     setShowModal(true);
//   };

//   const handleDelete = (id: string) => {
//     if (window.confirm('Are you sure you want to delete this attendance record?')) {
//       deleteAttendance(id);
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const hours = calculateHours(formData.checkIn, formData.checkOut);
//     if (editingAttendance) {
//       updateAttendance(editingAttendance.id, { ...formData, hours });
//     } else {
//       addAttendance({ ...formData, hours });
//     }
//     setShowModal(false);
//   };

//   const calculateHours = (checkIn: string, checkOut: string) => {
//     const [inHour, inMin] = checkIn.split(':').map(Number);
//     const [outHour, outMin] = checkOut.split(':').map(Number);
//     const totalMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin);
//     return totalMinutes / 60;
//   };

//   const handleEmployeeChange = (employeeId: string) => {
//     const employee = employees.find(e => e.id === employeeId);
//     if (employee) {
//       setFormData({ ...formData, employeeId, employeeName: employee.name });
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Team Attendance</h1>
//           <p className="text-gray-600 mt-1">Track daily attendance for team members</p>
//         </div>
//         <button
//           onClick={handleAdd}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           <Plus size={20} />
//           Mark Attendance
//         </button>
//       </div>

//       <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
//         <div className="flex items-center gap-3">
//           <CalendarIcon size={20} className="text-gray-600" />
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <div className="flex-1 flex gap-4 justify-end">
//             <div className="text-sm">
//               <span className="text-gray-600">Present: </span>
//               <span className="font-medium text-green-600">
//                 {filteredAttendance.filter(a => a.status === 'present').length}
//               </span>
//             </div>
//             <div className="text-sm">
//               <span className="text-gray-600">Late: </span>
//               <span className="font-medium text-yellow-600">
//                 {filteredAttendance.filter(a => a.status === 'late').length}
//               </span>
//             </div>
//             <div className="text-sm">
//               <span className="text-gray-600">Absent: </span>
//               <span className="font-medium text-red-600">
//                 {filteredAttendance.filter(a => a.status === 'absent').length}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow border border-gray-200">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredAttendance.map((record) => (
//                 <tr key={record.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="font-medium text-gray-900">{record.employeeName}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-gray-600">{record.checkIn}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-gray-600">{record.checkOut}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-gray-600">{record.hours.toFixed(1)}h</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.status === 'present' ? 'bg-green-100 text-green-700' :
//                         record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
//                           record.status === 'half-day' ? 'bg-blue-100 text-blue-700' :
//                             'bg-red-100 text-red-700'
//                       }`}>
//                       {record.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => handleEdit(record)}
//                         className="p-1 text-blue-600 hover:bg-blue-50 rounded"
//                       >
//                         <Pencil size={16} />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(record.id)}
//                         className="p-1 text-red-600 hover:bg-red-50 rounded"
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {showModal && (
//         <Modal onClose={() => setShowModal(false)} title={editingAttendance ? 'Edit Attendance' : 'Mark Attendance'}>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
//               <select
//                 value={formData.employeeId}
//                 onChange={(e) => handleEmployeeChange(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               >
//                 <option value="">Select Employee</option>
//                 {employees.map((emp) => (
//                   <option key={emp.id} value={emp.id}>{emp.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//               <input
//                 type="date"
//                 value={formData.date}
//                 onChange={(e) => setFormData({ ...formData, date: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
//                 <input
//                   type="time"
//                   value={formData.checkIn}
//                   onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
//                 <input
//                   type="time"
//                   value={formData.checkOut}
//                   onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//               <select
//                 value={formData.status}
//                 onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               >
//                 <option value="present">Present</option>
//                 <option value="late">Late</option>
//                 <option value="half-day">Half Day</option>
//                 <option value="absent">Absent</option>
//               </select>
//             </div>
//             <div className="flex gap-3 pt-4">
//               <button
//                 type="submit"
//                 className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//               >
//                 {editingAttendance ? 'Update' : 'Mark'} Attendance
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setShowModal(false)}
//                 className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}
//     </div>
//   );
// }



import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Calendar as CalendarIcon, Users } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { attendanceService } from '../../services/attendanceservices';
import { Modal } from '../Modal';

export function TeamAttendance() {
  const { attendance, addAttendance, updateAttendance, deleteAttendance, employees, fetchData, markAbsentEmployees } = useData();

  console.log('🔄 TeamAttendance - Component rendered');
  console.log('🔄 TeamAttendance - employees:', employees);
  const [showModal, setShowModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFormData, setBulkFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    checkIn: '09:00',
    checkOut: '18:00',
    status: 'present' as 'present' | 'absent' | 'late' | 'half-day',
  });


  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    date: '',
    checkIn: '',
    checkOut: '',
    status: 'present' as 'present' | 'absent' | 'late' | 'half-day',
    hours: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const getId = (r: any) => r?.id || r?._id;

  const getEmployeeName = (r: any) => {
    let name = r?.employeeName || '';

    if (!name && r?.employeeId) {
      if (typeof r.employeeId === 'object') {
        name = r.employeeId.name || r.employeeId._id || r.employeeId.email || '';
      } else {
        name = r.employeeId;
      }
    }

    console.log('🔄 TeamAttendance - getEmployeeName:', { record: r, name });
    return name || 'Unknown Employee';
  };

  // Fetch attendance data when component mounts
  useEffect(() => {
    console.log('🔄 TeamAttendance - Component mounted, fetching attendance data');
    // The DataContext handles data fetching automatically, no need to manually fetch here
  }, []);

  // Refresh attendance data when the component becomes visible
  useEffect(() => {
    console.log('🔄 TeamAttendance - Triggering attendance refresh');
    // Force refresh by accessing the context data
    // This will trigger the DataContext's automatic refresh mechanism
  }, [attendance]);

  console.log('🔄 TeamAttendance - attendance data:', attendance);
  console.log('🔄 TeamAttendance - selectedDate:', selectedDate);
  console.log('🔄 TeamAttendance - All attendance dates:', attendance.map((a: any) => a.date));

  // Show ALL employees with their attendance for selected date
  const getAttendanceForEmployee = (employeeId: string) => {
    return attendance.find(
      (att: any) => att.date === selectedDate && String(att.employeeId) === String(employeeId)
    );
  };

  const filteredAttendance = attendance.filter((a: any) => a.date === selectedDate);
  console.log('🔄 TeamAttendance - filteredAttendance:', filteredAttendance);

  const handleAdd = () => {
    setEditingAttendance(null);
    setFormData({
      employeeId: '',
      employeeName: '',
      date: selectedDate,
      checkIn: '',
      checkOut: '',
      status: 'present',
      hours: 0,
    });
    setShowModal(true);
  };

  const handleEdit = (row: any) => {
    setEditingAttendance(row);
    let employeeIdValue;
    if (typeof row.employeeId === 'object' && row.employeeId) {
      employeeIdValue = String(row.employeeId._id || row.employeeId.id || row.employeeId);
    } else {
      employeeIdValue = String(row.employeeId);
    }
    const employeeNameValue = getEmployeeName(row);

    setFormData({
      employeeId: employeeIdValue,
      employeeName: employeeNameValue,
      date: row.date || selectedDate,
      checkIn: row.checkIn || '',
      checkOut: row.checkOut || '',
      status: row.status || 'present',
      hours: Number(row.hours || 0),
    });
    setShowModal(true);
  };

  const handleDelete = (row: any) => {
    const id = getId(row);
    if (!id) return;

    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      deleteAttendance(id);
    }
  };

  const calculateHours = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return 0;
    const [inHour, inMin] = checkIn.split(':').map(Number);
    const [outHour, outMin] = checkOut.split(':').map(Number);

    // If checkOut is less than checkIn, assume it's PM (evening shift)
    // e.g., 10:00 to 07:00 = 10:00 to 19:00 = 9 hours
    let adjustedOutHour = outHour;
    if (outHour < inHour) {
      // Add 12 hours to checkOut if it's less than checkIn (assumes PM)
      adjustedOutHour = outHour + 12;
    } else if (outHour === inHour && outMin < inMin) {
      // Same hour but checkOut minutes less than checkIn - also add 12
      adjustedOutHour = outHour + 12;
    }

    const totalMinutes = (adjustedOutHour * 60 + outMin) - (inHour * 60 + inMin);
    return totalMinutes > 0 ? totalMinutes / 60 : 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) return;

    setIsSubmitting(true);

    const hours = calculateHours(formData.checkIn, formData.checkOut);

    if (editingAttendance) {
      const id = getId(editingAttendance);
      if (!id) {
        setIsSubmitting(false);
        return;
      }
      updateAttendance(id, { ...formData, hours });
    } else {
      addAttendance({ ...formData, hours });
    }

    // Close modal and reset submitting state after a delay to allow for success/error handling
    setTimeout(() => {
      setShowModal(false);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees.find((e: any) => String(e.id) === String(employeeId) || String(e._id) === String(employeeId));
    if (employee) {
      const employeeName = typeof employee.name === 'string' ? employee.name :
        typeof employee.name === 'object' ? employee.name.name || employee.name._id || 'Unknown Employee' :
          'Unknown Employee';
      setFormData({ ...formData, employeeId: String(employeeId), employeeName });
    }
  };

  // Bulk attendance - mark all employees at once
  const handleBulkSubmit = async () => {
    setIsSubmitting(true);
    const hours = calculateHours(bulkFormData.checkIn, bulkFormData.checkOut);

    // Add attendance for each employee
    let successCount = 0;
    let errorCount = 0;

    for (const emp of employees) {
      const empId = String(emp.id || emp._id);
      const empName = typeof emp.name === 'string' ? emp.name :
        typeof emp.name === 'object' ? emp.name.name || emp.name._id || 'Unknown Employee' :
          'Unknown Employee';
      try {
        await addAttendance({
          employeeId: empId,
          employeeName: empName,
          date: bulkFormData.date,
          checkIn: bulkFormData.checkIn,
          checkOut: bulkFormData.checkOut,
          status: bulkFormData.status,
          hours,
        });
        successCount++;
      } catch (err) {
        errorCount++;
        console.error(`Error adding attendance for ${empName}:`, err);
      }
    }

    setIsSubmitting(false);
    setShowBulkModal(false);
    alert(`Attendance marked for ${successCount} employees${errorCount > 0 ? `. ${errorCount} failed.` : '.'}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Team Attendance</h1>
          <p className="text-gray-600 mt-1">Track daily attendance for team members</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Mark Attendance
          </button>
          <button
            onClick={handleBulkSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Users size={16} />
            <span>Mark All Employees</span>
          </button>
          {/* Removed "Mark Absent Employees" button - attendance records are only created when employees clock in/out */}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <CalendarIcon size={20} className="text-gray-600" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex-1 flex gap-4 justify-end">
            <div className="text-sm">
              <span className="text-gray-600">Total Employees: </span>
              <span className="font-medium text-gray-900">{employees.length}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Present: </span>
              <span className="font-medium text-green-600">
                {employees.filter((emp: any) => {
                  const att = getAttendanceForEmployee(String(emp.id || emp._id));
                  return att?.status === 'present';
                }).length}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Late: </span>
              <span className="font-medium text-yellow-600">
                {employees.filter((emp: any) => {
                  const att = getAttendanceForEmployee(String(emp.id || emp._id));
                  return att?.status === 'late';
                }).length}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Absent: </span>
              <span className="font-medium text-red-600">
                {employees.filter((emp: any) => {
                  const att = getAttendanceForEmployee(String(emp.id || emp._id));
                  return att?.status === 'absent';
                }).length}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Not Marked: </span>
              <span className="font-medium text-gray-600">
                {employees.filter((emp: any) => !getAttendanceForEmployee(String(emp.id || emp._id))).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Show ALL employees with their attendance for selected date */}
              {employees.map((emp: any) => {
                const empId = String(emp.id || emp._id);
                const attRecord = attendance.find((a: any) => {
                  let aId;
                  if (typeof a.employeeId === 'object' && a.employeeId) {
                    aId = a.employeeId._id || a.employeeId.id || a.employeeId;
                  } else {
                    aId = a.employeeId;
                  }
                  return String(aId) === String(empId) && a.date === selectedDate;
                });
                return (
                  <tr key={empId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{
                        typeof emp.name === 'string' ? emp.name :
                          typeof emp.name === 'object' && emp.name ?
                            (emp.name as any).name || (emp.name as any)._id || (emp.name as any).email || 'Unknown Employee' :
                            'Unknown Employee'
                      }</div>
                      <div className="text-sm text-gray-500">{
                        typeof emp.department === 'object' && emp.department?.name ? emp.department.name :
                          typeof emp.departmentId === 'object' && emp.departmentId?.name ? emp.departmentId.name :
                            typeof emp.department === 'string' ? emp.department :
                              typeof emp.departmentId === 'string' ? emp.departmentId : '-'
                      }</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {attRecord?.checkIn || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {attRecord?.checkOut || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {attRecord ? (Number(attRecord.hours || 0)).toFixed(1) + 'h' : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attRecord ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${attRecord.status === 'present'
                            ? 'bg-green-100 text-green-700'
                            : attRecord.status === 'late'
                              ? 'bg-yellow-100 text-yellow-700'
                              : attRecord.status === 'half-day'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {attRecord.status}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          Not Marked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (attRecord) {
                              handleEdit(attRecord);
                            } else {
                              // Mark attendance for this employee
                              const empName = typeof emp.name === 'string' ? emp.name :
                                typeof emp.name === 'object' ? emp.name.name || emp.name._id || 'Unknown Employee' :
                                  'Unknown Employee';
                              setFormData({
                                employeeId: String(empId),
                                employeeName: empName,
                                date: selectedDate,
                                checkIn: '09:00',
                                checkOut: '18:00',
                                status: 'present',
                                hours: 9,
                              });
                              setShowModal(true);
                            }
                          }}
                          className={`p-1 rounded ${attRecord ? 'text-blue-600 hover:bg-blue-50' : 'text-green-600 hover:bg-green-50'}`}
                        >
                          {attRecord ? <Pencil size={16} /> : <Plus size={16} />}
                        </button>
                        {attRecord && (
                          <button onClick={() => handleDelete(attRecord)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              }
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editingAttendance ? 'Edit Attendance' : 'Mark Attendance'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select
                value={formData.employeeId}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Employee</option>
                {employees.map((emp: any) => {
                  // Handle different employee data structures
                  const employeeId = emp.id || emp._id || (emp as any).employeeId;
                  let employeeName = 'Unknown Employee';
                  if (typeof emp.name === 'string') {
                    employeeName = emp.name;
                  } else if (typeof emp.name === 'object' && emp.name) {
                    employeeName = emp.name.name || emp.name._id || emp.name.email || 'Unknown Employee';
                  } else if (emp.fullName) {
                    employeeName = emp.fullName;
                  } else if (emp.displayName) {
                    employeeName = emp.displayName;
                  }

                  let employeeEmail = '';
                  if (typeof emp.email === 'string') {
                    employeeEmail = emp.email;
                  } else if (typeof emp.email === 'object' && emp.email) {
                    employeeEmail = emp.email.email || emp.email._id || '';
                  } else if (emp.email) {
                    employeeEmail = emp.email;
                  }

                  // Only show employees with valid IDs
                  if (!employeeId) return null;

                  return (
                    <option key={employeeId} value={employeeId}>
                      {employeeName}{employeeEmail ? ` (${employeeEmail})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
                <input
                  type="time"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
                <input
                  type="time"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">Use 24-hour format (e.g., 19:00 for 7 PM)</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
                <option value="absent">Absent</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-4 py-2 rounded-lg ${isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              >
                {isSubmitting
                  ? 'Saving...'
                  : editingAttendance
                    ? 'Update Attendance'
                    : 'Mark Attendance'}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bulk Attendance Modal */}
      {showBulkModal && (
        <Modal onClose={() => setShowBulkModal(false)} title="Mark All Employees Attendance">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                This will mark attendance for <strong>{employees.length}</strong> employees on the selected date.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={bulkFormData.date}
                onChange={(e) => setBulkFormData({ ...bulkFormData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
                <input
                  type="time"
                  value={bulkFormData.checkIn}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, checkIn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
                <input
                  type="time"
                  value={bulkFormData.checkOut}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, checkOut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">Use 24-hour format (e.g., 19:00 for 7 PM)</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={bulkFormData.status}
                onChange={(e) => setBulkFormData({ ...bulkFormData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
                <option value="absent">Absent</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleBulkSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Marking...' : `Mark All ${employees.length} Employees`}
              </button>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
