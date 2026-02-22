import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Filter, Search } from 'lucide-react';
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
            case 'present':
                return 'bg-green-100 text-green-800';
            case 'late':
                return 'bg-yellow-100 text-yellow-800';
            case 'absent':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Employee Clock Records</h1>
                    <p className="text-gray-600 mt-1">View all employee clock in/out records</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Calendar className="inline w-4 h-4 mr-1" />
                            Date
                        </label>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <User className="inline w-4 h-4 mr-1" />
                            Employee
                        </label>
                        <select
                            value={employeeFilter}
                            onChange={(e) => setEmployeeFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Employees</option>
                            {employees.map((employee: any) => {
                                const empId = employee.id || employee._id;
                                const empName = typeof employee.name === 'string' ? employee.name :
                                    typeof employee.name === 'object' ? employee.name.name || employee.name._id || employee.name.email || 'Unknown Employee' :
                                        'Unknown Employee';
                                return (
                                    <option key={empId} value={empId}>
                                        {empName}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Search className="inline w-4 h-4 mr-1" />
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search by employee name or status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Records Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Clock Records ({filteredRecords.length})
                    </h2>
                </div>

                {filteredRecords.length === 0 ? (
                    <div className="p-8 text-center">
                        <Clock className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {dateFilter || employeeFilter || searchTerm
                                ? 'Try adjusting your filters'
                                : 'No clock records available'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Employee
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Clock In
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Clock Out
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hours Worked
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRecords.map((record) => (
                                    <tr key={record.id || record._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {record.employeeName && typeof record.employeeName === 'string' ?
                                                            record.employeeName :
                                                            getEmployeeName(record.employeeId)}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {typeof record.employeeId === 'object' && record.employeeId ?
                                                            (record.employeeId._id || record.employeeId.id || 'N/A') :
                                                            record.employeeId || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatTime(record.checkIn)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatTime(record.checkOut)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {calculateHours(record)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(typeof record.status === 'string' ? record.status : 'unknown')}`}>
                                                {typeof record.status === 'string' ? record.status : 'Unknown'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}