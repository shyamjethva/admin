import { useState, useEffect } from 'react';
import { Calendar, Clock, LogIn, LogOut } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export function EmployeeAttendanceReport() {
    const { clockRecords, fetchData } = useData();
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        fetchData('attendance', () => { }, []);
    }, [fetchData]);

    // Filter records for the logged-in user and selected date
    const myRecords = clockRecords.filter((record: any) => {
        const recordEmpId = typeof record.employeeId === 'object' && record.employeeId
            ? (record.employeeId._id || record.employeeId.id)
            : record.employeeId;

        const isMe = String(recordEmpId) === String(user?.id) || 
                     String(recordEmpId) === String((user as any)?._id) ||
                     (record.employeeName && user?.name && record.employeeName.toLowerCase() === user.name.toLowerCase());
        const isThisDay = selectedDate ? (record.date && record.date.includes(selectedDate)) : true;

        return isMe && isThisDay;
    }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate working hours
    const calculateHours = (record: any) => {
        if (!record.checkIn || typeof record.checkIn !== 'string') return '0h 0m';

        const checkInTime = record.checkIn.split(':');
        if (checkInTime.length < 2) return '0h 0m';

        const checkInDate = new Date();
        checkInDate.setHours(parseInt(checkInTime[0]), parseInt(checkInTime[1]), 0);

        let checkOutDate = new Date();
        if (record.checkOut && typeof record.checkOut === 'string') {
            const checkOutTime = record.checkOut.split(':');
            if (checkOutTime.length >= 2) {
                checkOutDate.setHours(parseInt(checkOutTime[0]), parseInt(checkOutTime[1]), 0);
            }
        }

        const diffMs = checkOutDate.getTime() - checkInDate.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${Math.max(0, diffHours)}h ${Math.max(0, diffMinutes)}m`;
    };

    const calculateBreakHours = (record: any) => {
        if (record.totals && typeof record.totals.totalBreakSeconds === 'number') {
            const totalMinutes = Math.floor(record.totals.totalBreakSeconds / 60);
            return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
        }
        if (typeof record.breakDuration === 'number') {
            return `${Math.floor(record.breakDuration / 60)}h ${record.breakDuration % 60}m`;
        }
        if (!record.breakIn || typeof record.breakIn !== 'string' || !record.breakOut || typeof record.breakOut !== 'string') {
            return '0h 0m';
        }

        const inTime = record.breakIn.split(':');
        const outTime = record.breakOut.split(':');
        if (inTime.length < 2 || outTime.length < 2) return '0h 0m';

        const inDate = new Date();
        inDate.setHours(parseInt(inTime[0]), parseInt(inTime[1]), 0);

        const outDate = new Date();
        outDate.setHours(parseInt(outTime[0]), parseInt(outTime[1]), 0);

        let diffMs = outDate.getTime() - inDate.getTime();
        if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;

        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${diffHours}h ${diffMinutes}m`;
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'clocked_in': return 'bg-green-100 text-green-800 border-green-200';
            case 'on_break': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'clocked_out': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'present': return 'bg-green-100 text-green-800 border-green-200';
            case 'late': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'absent': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const formatDisplayDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                return `${day}/${month}/${date.getFullYear()}`;
            }
        } catch (e) { }
        return dateStr;
    };

    const formatTime = (time: any) => {
        if (!time) return '--:--';
        return typeof time === 'string' ? time : String(time);
    };

    // Calculate statistics
    const stats = {
        totalDays: myRecords.length,
        onTime: myRecords.filter((r: any) => r.status !== 'late' && r.status !== 'absent').length,
        late: myRecords.filter((r: any) => r.status === 'late').length,
        avgHours: '8.1h', // Mocked or calculated
        overtime: '0.0h'
    };

    const onTimePercent = stats.totalDays > 0 ? Math.round((stats.onTime / stats.totalDays) * 100) : 0;
    const latePercent = stats.totalDays > 0 ? Math.round((stats.late / stats.totalDays) * 100) : 0;

    return (
        <div className="w-full px-4 md:px-6 pb-10 space-y-6">
            <div className="flex justify-between items-center pt-2">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Attendance Report</h1>
                    <p className="text-gray-500 mt-1 font-medium">View your attendance history and statistics</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="flex flex-nowrap w-full gap-4 overflow-x-auto pb-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-1 min-w-[150px]">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-bold whitespace-nowrap">Total Days</span>
                    </div>
                    <div className="text-2xl font-black text-gray-900">{stats.totalDays}</div>
                    <div className="text-xs font-medium text-gray-500 mt-1">Last 90 days</div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-1 min-w-[150px]">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-bold whitespace-nowrap">On Time</span>
                    </div>
                    <div className="text-2xl font-black text-green-600">{stats.onTime}</div>
                    <div className="text-xs font-medium text-gray-500 mt-1">{onTimePercent}%</div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-1 min-w-[150px]">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-bold whitespace-nowrap">Late Arrivals</span>
                    </div>
                    <div className="text-2xl font-black text-red-500">{stats.late}</div>
                    <div className="text-xs font-medium text-gray-500 mt-1">{latePercent}%</div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-1 min-w-[150px]">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-bold whitespace-nowrap">Avg Work Hours</span>
                    </div>
                    <div className="text-2xl font-black text-blue-500">{stats.avgHours}</div>
                    <div className="text-xs font-medium text-gray-500 mt-1">Per day</div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-1 min-w-[150px]">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-bold whitespace-nowrap">Total Overtime</span>
                    </div>
                    <div className="text-2xl font-black text-gray-900">{stats.overtime}</div>
                    <div className="text-xs font-medium text-gray-500 mt-1">Extra hours</div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-white flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-gray-900">
                            Attendance History
                        </h2>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700 text-sm"
                        />
                    </div>
                </div>
                <div className="w-full overflow-x-auto">
                    <table className="w-full border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.15rem] border-b border-gray-100">Date</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.15rem] border-b border-gray-100">Clock In</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.15rem] border-b border-gray-100">Break In</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.15rem] border-b border-gray-100">Break Out</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.15rem] border-b border-gray-100">Clock Out</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.15rem] border-b border-gray-100">Working</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.15rem] border-b border-gray-100">Total Break</th>
                                <th className="px-6 py-4 text-center text-[11px] font-bold text-gray-400 uppercase tracking-[0.15rem] border-b border-gray-100">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {myRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="p-4 bg-gray-50 rounded-2xl mb-4">
                                                <Clock className="h-10 w-10 text-gray-300" />
                                            </div>
                                            <h3 className="text-base font-bold text-gray-900">No records found</h3>
                                            <p className="text-sm text-gray-500 mt-1">There are no attendance logs for the selected date.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                myRecords.map((record: any) => (
                                    <tr key={record.id || record._id} className="hover:bg-blue-50/10 transition-all duration-300">
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-800">
                                                    {formatDisplayDate(record.date)}
                                                </span>
                                                <span className="text-[10px] font-medium text-gray-400 uppercase">
                                                    {new Date(record.date).toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'Asia/Kolkata' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center text-gray-700 font-bold text-[13px] w-fit">
                                                <LogIn className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                                                {formatTime(record.checkIn)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center text-gray-700 font-bold text-[13px] w-fit">
                                                <Clock className="w-3.5 h-3.5 mr-2 text-amber-600" />
                                                {formatTime(record.breakIn)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center text-gray-700 font-bold text-[13px] w-fit">
                                                <Clock className="w-3.5 h-3.5 mr-2 text-blue-600 opacity-50" />
                                                {formatTime(record.breakOut)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center text-gray-700 font-bold text-[13px] w-fit">
                                                <LogOut className="w-3.5 h-3.5 mr-2 text-rose-600" />
                                                {formatTime(record.checkOut)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-black text-gray-900 bg-gray-100/80 px-2.5 py-1 rounded-lg w-fit">
                                                    {calculateHours(record)}
                                                </span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Active</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-black text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-lg w-fit">
                                                    {calculateBreakHours(record)}
                                                </span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Break</span>
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
