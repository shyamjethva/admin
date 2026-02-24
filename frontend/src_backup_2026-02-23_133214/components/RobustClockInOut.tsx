import { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, Calendar, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function RobustClockInOut() {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [todayRecord, setTodayRecord] = useState<any>(null);
    const [weeklyRecords, setWeeklyRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
    const [lastActionTime, setLastActionTime] = useState<number>(0);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Check clock status on load and periodically
    useEffect(() => {
        if (user) {
            checkClockStatus();
            fetchWeeklyAttendance();
            // Refresh every 30 seconds to sync with server
            const interval = setInterval(() => {
                checkClockStatus();
                fetchWeeklyAttendance();
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4000);
    };

    const checkClockStatus = async () => {
        if (!user) return;

        try {
            const today = new Date().toISOString().split('T')[0];

            // Fetch all attendance records for today
            const response = await fetch(`http://localhost:5000/api/attendance?date=${today}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const rawData = await response.json();
                const records = Array.isArray(rawData) ? rawData : rawData.data || [];

                // Find records for this specific employee
                const employeeRecords = records.filter((r: any) =>
                    r.employeeId === user.id ||
                    (r.employeeId && r.employeeId._id === user.id) ||
                    r.employeeName === user.name
                );

                // Sort by creation time, get the most recent
                const sortedRecords = employeeRecords.sort((a: any, b: any) =>
                    new Date(b.createdAt || b.updatedAt || 0).getTime() -
                    new Date(a.createdAt || a.updatedAt || 0).getTime()
                );

                const latestRecord = sortedRecords[0];

                if (latestRecord) {
                    console.log('🔍 Found latest record:', latestRecord);

                    // Check if currently clocked in
                    if (latestRecord.checkIn && !latestRecord.checkOut) {
                        setIsClockedIn(true);
                        setTodayRecord(latestRecord);
                        showMessage('info', `Resumed session - Clocked in at ${latestRecord.checkIn}`);
                    } else if (latestRecord.checkOut) {
                        setIsClockedIn(false);
                        setTodayRecord(latestRecord);
                    }
                } else {
                    // No record found for today
                    setIsClockedIn(false);
                    setTodayRecord(null);
                }
            }
        } catch (error) {
            console.error('Failed to check clock status:', error);
        }
    };

    const handleClockIn = async () => {
        if (!user || loading) return;

        // Prevent rapid consecutive clicks (debounce)
        const now = Date.now();
        if (now - lastActionTime < 2000) {
            showMessage('error', 'Please wait 2 seconds between actions');
            return;
        }
        setLastActionTime(now);

        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const clockInTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

            // First, check if there's already an incomplete record
            await checkClockStatus();

            if (isClockedIn) {
                showMessage('error', 'You are already clocked in!');
                setLoading(false);
                return;
            }

            // Create new attendance record
            const response = await fetch('http://localhost:5000/api/attendance', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    employeeId: user.id,
                    employeeName: user.name,
                    date: today,
                    checkIn: clockInTime,
                    status: 'present',
                    hours: 0,
                    notes: `Clocked in at ${new Date().toLocaleString()}`
                })
            });

            const result = await response.json();

            if (response.ok) {
                setIsClockedIn(true);
                setTodayRecord(result);
                showMessage('success', `✅ Successfully clocked in at ${clockInTime}`);

                // Force refresh to ensure data consistency
                setTimeout(() => checkClockStatus(), 1000);
            } else {
                throw new Error(result.message || 'Failed to clock in');
            }
        } catch (error: any) {
            console.error('Clock in error:', error);
            showMessage('error', `❌ ${error.message || 'Network error - please try again'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleClockOut = async () => {
        if (!user || !todayRecord || loading) return;

        // Prevent rapid consecutive clicks
        const now = Date.now();
        if (now - lastActionTime < 2000) {
            showMessage('error', 'Please wait 2 seconds between actions');
            return;
        }
        setLastActionTime(now);

        setLoading(true);
        try {
            const clockOutTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

            // Double-check we have a valid record
            if (!todayRecord._id) {
                throw new Error('No valid attendance record found');
            }

            // Calculate hours worked
            const [inHour, inMin] = todayRecord.checkIn.split(':').map(Number);
            const [outHour, outMin] = clockOutTime.split(':').map(Number);

            let totalMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin);

            // Handle overnight shifts
            if (totalMinutes < 0) {
                totalMinutes += 24 * 60;
            }

            const hours = Math.max(0, totalMinutes / 60);

            // Update the existing record
            const response = await fetch(`http://localhost:5000/api/attendance/${todayRecord._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    checkOut: clockOutTime,
                    hours: hours,
                    notes: `${todayRecord.notes || ''} | Clocked out at ${new Date().toLocaleString()}`
                })
            });

            const result = await response.json();

            if (response.ok) {
                setIsClockedIn(false);
                setTodayRecord({
                    ...todayRecord,
                    checkOut: clockOutTime,
                    hours: hours
                });
                showMessage('success', `✅ Successfully clocked out at ${clockOutTime} (${hours.toFixed(1)} hours worked)`);

                // Force refresh
                setTimeout(() => checkClockStatus(), 1000);
            } else {
                throw new Error(result.message || 'Failed to clock out');
            }
        } catch (error: any) {
            console.error('Clock out error:', error);
            showMessage('error', `❌ ${error.message || 'Network error - please try again'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        checkClockStatus().finally(() => setLoading(false));
        showMessage('info', '🔄 Data refreshed from server');
    };

    const calculateLiveHours = () => {
        if (!todayRecord || !todayRecord.checkIn || todayRecord.checkOut) {
            return todayRecord?.hours?.toFixed(1) || '0.0';
        }

        // Calculate live hours if still clocked in
        const [inHour, inMin] = todayRecord.checkIn.split(':').map(Number);
        const now = new Date();
        const nowHour = now.getHours();
        const nowMin = now.getMinutes();

        let totalMinutes = (nowHour * 60 + nowMin) - (inHour * 60 + inMin);
        if (totalMinutes < 0) totalMinutes += 24 * 60;

        return (totalMinutes / 60).toFixed(1);
    };

    const fetchWeeklyAttendance = async () => {
        if (!user) return;

        try {
            console.log('🔄 Fetching weekly attendance for user:', user.id);
            const response = await fetch(`http://localhost:5000/api/clock/weekly/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📥 Weekly attendance response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('📥 Weekly attendance data received:', data);
                console.log('📊 Data structure:', {
                    isArray: Array.isArray(data.data),
                    length: data.data?.length,
                    sample: data.data?.[0]
                });
                setWeeklyRecords(Array.isArray(data.data) ? data.data : []);
            } else {
                console.error('❌ Failed to fetch weekly attendance:', response.status, await response.text());
            }
        } catch (error) {
            console.error('❌ Failed to fetch weekly attendance:', error);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
                    <p className="mt-2 text-gray-600">Please login to use clock functionality</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Status Message */}
            {message && (
                <div className={`mb-4 p-3 rounded-lg flex items-center ${message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : message.type === 'error'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                    {message.type === 'success' ?
                        <CheckCircle className="w-5 h-5 mr-2" /> :
                        message.type === 'error' ?
                            <AlertCircle className="w-5 h-5 mr-2" /> :
                            <RefreshCw className="w-5 h-5 mr-2" />
                    }
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Clock Panel */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <Clock className="text-blue-600" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Attendance Clock</h2>
                        <div className="text-3xl font-mono font-bold text-gray-700">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <p className="text-gray-600 mt-1">
                            {currentTime.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {!isClockedIn ? (
                            <button
                                onClick={handleClockIn}
                                disabled={loading}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Clocking In...
                                    </>
                                ) : (
                                    <>
                                        <LogIn size={24} />
                                        Clock In
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleClockOut}
                                disabled={loading}
                                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Clocking Out...
                                    </>
                                ) : (
                                    <>
                                        <LogOut size={24} />
                                        Clock Out
                                    </>
                                )}
                            </button>
                        )}

                        {/* Current Status Card */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-gray-600 font-medium">Current Status:</span>
                                <span className={`font-bold text-lg px-3 py-1 rounded-full ${isClockedIn
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {isClockedIn ? '🟢 Clocked In' : '🔴 Clocked Out'}
                                </span>
                            </div>

                            {todayRecord && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Clock In Time:</span>
                                        <span className="font-semibold text-gray-800">{todayRecord.checkIn || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Clock Out Time:</span>
                                        <span className="font-semibold text-gray-800">
                                            {todayRecord.checkOut || (isClockedIn ? 'Active Session' : '-')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                                        <span className="text-gray-600 font-medium">Working Hours:</span>
                                        <span className="font-bold text-blue-600 text-lg">
                                            {calculateLiveHours()} hours
                                        </span>
                                    </div>

                                    {todayRecord.notes && (
                                        <div className="pt-2 border-t border-gray-300">
                                            <p className="text-xs text-gray-500">Notes: {todayRecord.notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-4 pt-3 border-t border-gray-300">
                                <button
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    className="w-full py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                    Refresh Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weekly Overview */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Calendar className="text-blue-600" size={24} />
                            <h3 className="text-xl font-bold text-gray-800">This Week</h3>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                            const date = new Date();
                            date.setDate(date.getDate() - date.getDay() + index);
                            const dateStr = date.toISOString().split('T')[0];
                            const isToday = dateStr === new Date().toISOString().split('T')[0];

                            // Find attendance record for this date
                            const dayRecord = weeklyRecords.find(record => record.date === dateStr);
                            const hasRecord = !!dayRecord;
                            const hours = dayRecord?.hours?.toFixed(1) || '0.0';

                            return (
                                <div
                                    key={index}
                                    className={`flex justify-between items-center p-3 rounded-lg ${isToday
                                        ? 'bg-blue-50 border-2 border-blue-300'
                                        : hasRecord
                                            ? 'bg-green-50 border border-green-200'
                                            : 'bg-gray-50 border border-gray-200'
                                        }`}
                                >
                                    <div>
                                        <p className={`font-medium ${isToday ? 'text-blue-800' : 'text-gray-800'}`}>
                                            {day}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-800">
                                            {hasRecord ? `${hours}h` : 'No Record'}
                                        </p>
                                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${isToday
                                            ? 'bg-blue-100 text-blue-700'
                                            : hasRecord
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {isToday ? 'Today' : hasRecord ? 'Completed' : 'Absent'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="bg-yellow-50 rounded-lg p-3">
                            <p className="text-xs text-yellow-700">
                                💡 Note: Weekly data syncs with server every 30 seconds
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}