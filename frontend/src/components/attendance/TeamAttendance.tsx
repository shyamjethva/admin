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
    <div className="w-full px-4 md:px-6 pb-10 space-y-8">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Team Attendance</h1>
          <p className="text-gray-500 mt-1 font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            Comprehensive daily tracking and team performance management
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2.5 px-6 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={20} className="stroke-[3]" />
            Mark Attendance
          </button>
          <button
            onClick={handleBulkSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2.5 px-6 py-3.5 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 font-bold shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
          >
            <Users size={20} className="stroke-[2.5]" />
            Mark All Team
          </button>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex items-center gap-4 border-r border-gray-100 pr-8">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <CalendarIcon size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Tracking Date</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none p-0 text-lg font-black text-gray-900 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
            {[
              { label: 'Total', value: employees.length, color: 'text-gray-900', bg: 'bg-gray-50' },
              { label: 'Present', value: employees.filter(e => getAttendanceForEmployee(e.id || e._id)?.status === 'present').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Late', value: employees.filter(e => getAttendanceForEmployee(e.id || e._id)?.status === 'late').length, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Absent', value: employees.filter(e => getAttendanceForEmployee(e.id || e._id)?.status === 'absent').length, color: 'text-rose-600', bg: 'bg-rose-50' },
              { label: 'Pending', value: employees.filter(e => !getAttendanceForEmployee(e.id || e._id)).length, color: 'text-blue-600', bg: 'bg-blue-50' },
            ].map((s, i) => (
              <div key={i} className={`${s.bg} rounded-2xl p-4 flex flex-col items-center justify-center transition-transform hover:scale-105`}>
                <span className={`text-xl font-black ${s.color}`}>{s.value}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Employee Profile</th>
                <th className="px-8 py-5 text-center text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Check In</th>
                <th className="px-8 py-5 text-center text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Check Out</th>
                <th className="px-8 py-5 text-center text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Duration</th>
                <th className="px-8 py-5 text-center text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Status</th>
                <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map((emp: any) => {
                const empId = String(emp.id || emp._id);
                const attRecord = attendance.find((a: any) => {
                  let aId = typeof a.employeeId === 'object' ? (a.employeeId._id || a.employeeId.id) : a.employeeId;
                  return String(aId) === String(empId) && a.date === selectedDate;
                });

                return (
                  <tr key={empId} className="hover:bg-blue-50/10 transition-all duration-300 group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center font-black text-blue-700 border border-blue-200/50 shadow-sm group-hover:scale-110 transition-transform">
                          {getEmployeeName(emp).charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">{getEmployeeName(emp)}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            {typeof emp.department === 'object' ? emp.department.name : emp.department || 'Staff'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-center">
                      {attRecord?.checkIn ? (
                        <span className="text-[13px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100/50">
                          {attRecord.checkIn}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-gray-300 uppercase italic">Not Set</span>
                      )}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-center">
                      {attRecord?.checkOut ? (
                        <span className="text-[13px] font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100/50">
                          {attRecord.checkOut}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-gray-300 uppercase italic">Not Set</span>
                      )}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-center">
                      <span className="text-[13px] font-black text-gray-800">
                        {attRecord ? (Number(attRecord.hours || 0)).toFixed(1) + 'h' : '--'}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-center">
                      {attRecord ? (
                        <span
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${attRecord.status === 'present'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : attRecord.status === 'late'
                              ? 'bg-amber-50 text-amber-700 border-amber-100'
                              : attRecord.status === 'half-day'
                                ? 'bg-blue-50 text-blue-700 border-blue-100'
                                : 'bg-rose-50 text-rose-700 border-rose-100'
                            }`}
                        >
                          {attRecord.status}
                        </span>
                      ) : (
                        <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 border border-gray-100">
                          Not Marked
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => {
                            if (attRecord) handleEdit(attRecord);
                            else {
                              const name = getEmployeeName(emp);
                              setFormData({
                                employeeId: String(empId),
                                employeeName: name,
                                date: selectedDate,
                                checkIn: '09:00',
                                checkOut: '18:00',
                                status: 'present',
                                hours: 9,
                              });
                              setShowModal(true);
                            }
                          }}
                          className={`p-2.5 rounded-xl transition-all ${attRecord ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                        >
                          {attRecord ? <Pencil size={18} /> : <Plus size={18} className="stroke-[3]" />}
                        </button>
                        {attRecord && (
                          <button onClick={() => handleDelete(attRecord)} className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals - Refined for premium look */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editingAttendance ? 'Edit Record' : 'Create Record'}>
          <form onSubmit={handleSubmit} className="space-y-5 p-2">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Target Employee</label>
              <select
                value={formData.employeeId}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 font-bold transition-all"
                required
              >
                <option value="">Select Staff Member</option>
                {employees.map((emp: any) => (
                  <option key={emp.id || emp._id} value={emp.id || emp._id}>
                    {getEmployeeName(emp)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Shift Start</label>
                <input
                  type="time"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 font-bold transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Shift End</label>
                <input
                  type="time"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 font-bold transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Attendance Status</label>
              <div className="grid grid-cols-2 gap-3">
                {['present', 'late', 'half-day', 'absent'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: s as any })}
                    className={`px-4 py-3 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all border-2 ${formData.status === s ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}
                  >
                    {s.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : editingAttendance ? 'Save Changes' : 'Confirm Record'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
