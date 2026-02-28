import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Filter, Search, LogIn, LogOut } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export function EmployeeClockRecords() {
    const { clockRecords, employees, fetchData } = useData();
    const { user } = useAuth();
    const [filteredRecords, setFilteredRecords] = useState<any[]>([]);
    const [dateFilter, setDateFilter] = useState('');
    const [employeeFilter, setEmployeeFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch clock records on component mount
    useEffect(() => {
        if (user?.role === 'admin' || user?.role === 'hr') {
            fetchData('attendance', (data: any) => {
                // This will update the clockRecords in DataContext
            }, []);
        }
    }, [user, fetchData]);

    // Filter records based on filters
    useEffect(() => {
        let records = [...clockRecords];

        // Date filter
        if (dateFilter) {
            records = records.filter(record => record.date === dateFilter);
        }

        // Employee filter
        if (employeeFilter) {
            records = records.filter(record => {
                // Handle case where record.employeeId might be an object
                let recordEmployeeId = record.employeeId;
                if (typeof record.employeeId === 'object' && record.employeeId) {
                    recordEmployeeId = record.employeeId._id || record.employeeId.id || record.employeeId;
                }

                const matchingEmployee = employees.find(e => {
                    const empId = e.id || e._id;
                    return empId === employeeFilter;
                });

                return String(recordEmployeeId) === String(employeeFilter) ||
                    record.employeeName === matchingEmployee?.name;
            });
        }

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            records = records.filter(record => {
                // Extract employee name safely
                const empName = typeof record.employeeName === 'string' ?
                    record.employeeName :
                    getEmployeeName(record.employeeId);

                // Extract status safely
                const status = typeof record.status === 'string' ?
                    record.status :
                    String(record.status || '');

                return (empName && empName.toLowerCase().includes(term)) ||
                    status.toLowerCase().includes(term);
            });
        }

        // Sort by date (newest first)
        records.sort((a, b) => {
            // Ensure dates are valid before creating Date objects
            const dateA = new Date(typeof a.date === 'string' ? a.date : '');
            const dateB = new Date(typeof b.date === 'string' ? b.date : '');

            // Check if dates are valid
            const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
            const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();

            if (timeA !== timeB) {
                return timeB - timeA;
            }
            // If same date, sort by check-in time
            return (typeof b.checkIn === 'string' ? b.checkIn : '').localeCompare(
                typeof a.checkIn === 'string' ? a.checkIn : ''
            );
        });

        setFilteredRecords(records);
    }, [clockRecords, dateFilter, employeeFilter, searchTerm, employees]);

    // Get employee name by ID
    const getEmployeeName = (employeeId: any) => {
        // Handle case where employeeId is already an object
        if (employeeId && typeof employeeId === 'object') {
            // If employeeId is a populated object, return its name
            return employeeId.name || employeeId._id || employeeId.email || 'Unknown Employee';
        }

        // If employeeId is a string ID, find the employee
        const employee = employees.find(emp => {
            const empId = emp.id || emp._id;
            return empId === employeeId;
        });
        return employee ? (employee.name || employee._id || employee.email || 'Unknown Employee') : 'Unknown Employee';
    };

    // Format time display
    const formatTime = (time: any) => {
        if (!time) return '--:--';
        return typeof time === 'string' ? time : String(time);
    };

    // Calculate working hours
    const calculateHours = (record: any) => {
        // Check if record.checkIn exists and is a string
        if (!record.checkIn || typeof record.checkIn !== 'string') return '0h 0m';

        const checkInTime = record.checkIn.split(':');
        if (checkInTime.length < 2) return '0h 0m';

        const checkInDate = new Date();
        const hours = parseInt(checkInTime[0]);
        const minutes = parseInt(checkInTime[1]);

        if (isNaN(hours) || isNaN(minutes)) return '0h 0m';

        checkInDate.setHours(hours, minutes, 0);

        let checkOutDate = new Date();
        if (record.checkOut && typeof record.checkOut === 'string') {
            const checkOutTime = record.checkOut.split(':');
            if (checkOutTime.length >= 2) {
                const outHours = parseInt(checkOutTime[0]);
                const outMinutes = parseInt(checkOutTime[1]);

                if (!isNaN(outHours) && !isNaN(outMinutes)) {
                    checkOutDate.setHours(outHours, outMinutes, 0);
                }
            }
        } else {
            // If not clocked out yet, use current time
            checkOutDate = new Date();
        }

        const diffMs = checkOutDate.getTime() - checkInDate.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${Math.max(0, diffHours)}h ${Math.max(0, diffMinutes)}m`;
    };

    // Get status badge color
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'clocked_in':
                return 'bg-green-100 text-green-800 border border-green-200';
            case 'on_break':
                return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'clocked_out':
                return 'bg-gray-100 text-gray-800 border border-gray-200';
            case 'present':
                return 'bg-green-100 text-green-800 border border-green-200';
            case 'late':
                return 'bg-orange-100 text-orange-800 border border-orange-200';
            case 'absent':
                return 'bg-red-100 text-red-800 border border-red-200';
            default:
                return 'bg-blue-100 text-blue-800 border border-blue-200';
        }
    };

    return (
        <div className="w-full px-4 md:px-6 pb-10 space-y-6">
            <div className="flex justify-between items-center pt-2">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Employee Clock Records</h1>
                    <p className="text-gray-500 mt-1 font-medium">Real-time attendance tracking and break management</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            Filter Date
                        </label>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-700"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                            By Employee
                        </label>
                        <select
                            value={employeeFilter}
                            onChange={(e) => setEmployeeFilter(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1.2em] font-medium text-gray-700"
                        >
                            <option value="">All Employees</option>
                            {employees.map((employee: any) => (
                                <option key={employee.id || employee._id} value={employee.id || employee._id}>
                                    {employee.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="flex items-center gap-2 text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                            <Search className="w-3.5 h-3.5 text-blue-600" />
                            Search Records
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="     Search by name, status or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-2 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-700"
                            />
                            {/* <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" /> */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Records Table */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Attendance Logs
                        </h2>
                        <span className="px-2.5 py-1 text-xs font-bold bg-blue-100/50 text-blue-700 rounded-lg border border-blue-200/50">
                            {filteredRecords.length} Records
                        </span>
                    </div>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="w-full border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.15rem] border-b border-gray-100">Employee</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.15rem] border-b border-gray-100">Date</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.15rem] border-b border-gray-100">Clock In</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.15rem] border-b border-gray-100">Break In</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.15rem] border-b border-gray-100">Break Out</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.15rem] border-b border-gray-100">Clock Out</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.15rem] border-b border-gray-100">Working</th>
                                <th className="px-6 py-4 text-center text-[11px] font-bold text-gray-400 uppercase tracking-[0.15rem] border-b border-gray-100">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="p-4 bg-gray-50 rounded-2xl mb-4">
                                                <Clock className="h-10 w-10 text-gray-300" />
                                            </div>
                                            <h3 className="text-base font-bold text-gray-900">No records found</h3>
                                            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => (
                                    <tr key={record.id || record._id} className="hover:bg-blue-50/10 transition-all duration-300 group">
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="h-11 w-11 flex-shrink-0 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-700 font-extrabold border border-blue-200/50 shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                                                    {(record.employeeName && typeof record.employeeName === 'string' ? record.employeeName : getEmployeeName(record.employeeId)).charAt(0)}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                                        {record.employeeName && typeof record.employeeName === 'string' ?
                                                            record.employeeName :
                                                            getEmployeeName(record.employeeId)}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 tracking-wider flex items-center gap-1.5 uppercase">
                                                        <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                                                        {(typeof record.employeeId === 'object' && record.employeeId ?
                                                            (record.employeeId._id || record.employeeId.id || 'N/A') :
                                                            String(record.employeeId || 'N/A')).substring(0, 10)}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-800">
                                                    {record.date ? new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                </span>
                                                <span className="text-[10px] font-medium text-gray-400 uppercase">{new Date(record.date).toLocaleDateString('en-GB', { weekday: 'long' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center text-emerald-600 font-bold text-[13px] bg-emerald-50 px-2.5 py-1.5 rounded-xl w-fit border border-emerald-100/50 shadow-sm ring-2 ring-transparent group-hover:ring-emerald-200/20 transition-all">
                                                <LogIn className="w-3.5 h-3.5 mr-2" />
                                                {formatTime(record.checkIn)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center text-amber-600 font-bold text-[13px] bg-amber-50 px-2.5 py-1.5 rounded-xl w-fit border border-amber-100/50 shadow-sm ring-2 ring-transparent group-hover:ring-amber-200/20 transition-all">
                                                <Clock className="w-3.5 h-3.5 mr-2" />
                                                {formatTime(record.breakIn)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center text-blue-600 font-bold text-[13px] bg-blue-50 px-2.5 py-1.5 rounded-xl w-fit border border-blue-100/50 shadow-sm ring-2 ring-transparent group-hover:ring-blue-200/20 transition-all">
                                                <Clock className="w-3.5 h-3.5 mr-2 opacity-50" />
                                                {formatTime(record.breakOut)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center text-rose-600 font-bold text-[13px] bg-rose-50 px-2.5 py-1.5 rounded-xl w-fit border border-rose-100/50 shadow-sm ring-2 ring-transparent group-hover:ring-rose-200/20 transition-all">
                                                <LogOut className="w-3.5 h-3.5 mr-2" />
                                                {formatTime(record.checkOut)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-black text-gray-900 bg-gray-100/80 px-2.5 py-1 rounded-lg w-fit">
                                                    {calculateHours(record)}
                                                </span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Total Active Time</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-center">
                                            <span className={`px-4 py-1.5 inline-flex text-[10px] leading-4 font-black uppercase tracking-[0.1em] rounded-full shadow-sm border ${getStatusColor(record.status)}`}>
                                                {String(record.status || 'ABSENT').replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}