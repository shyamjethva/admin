import { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clockService } from '../services/clockservice';

export function SimpleClockInOut() {
    const { user } = useAuth();
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [clockInTime, setClockInTime] = useState<Date | null>(null);
    const [liveHours, setLiveHours] = useState(0);
    const [loading, setLoading] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [todayRecord, setTodayRecord] = useState<any>(null);

    // Update current date/time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDate(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch today's attendance record on load and periodically
    useEffect(() => {
        if (!user) return;

        const fetchTodayRecord = async () => {
            try {
                const response = await clockService.getToday(user.id);
                if (response.success && response.data && !Array.isArray(response.data)) {
                    setTodayRecord(response.data);

                    // Set local state based on database record
                    const record = response.data;
                    if (record.checkIn && !record.checkOut) {
                        // Currently clocked in
                        setIsClockedIn(true);
                        // Use checkInTimestamp if available, otherwise create from checkIn time
                        if (record.checkInTimestamp) {
                            setClockInTime(new Date(record.checkInTimestamp));
                        } else {
                            // Parse checkIn time (HH:MM format)
                            const [hours, minutes] = record.checkIn.split(':').map(Number);
                            const today = new Date();
                            today.setHours(hours, minutes, 0, 0);
                            setClockInTime(today);
                        }
                    } else {
                        // Not clocked in or already clocked out
                        setIsClockedIn(false);
                        setClockInTime(null);
                        setLiveHours(0);
                    }
                } else {
                    // No record found - not clocked in
                    setIsClockedIn(false);
                    setClockInTime(null);
                    setLiveHours(0);
                    setTodayRecord(null);
                }
            } catch (error) {
                console.error('Failed to fetch today\'s attendance:', error);
            }
        };

        fetchTodayRecord();

        // Refresh every 30 seconds
        const interval = setInterval(fetchTodayRecord, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Timer effect - runs every second when clocked in
    useEffect(() => {
        let timer: any;

        console.log('⏱️ Timer effect - isClockedIn:', isClockedIn);

        if (isClockedIn && clockInTime) {
            console.log('⏱️ STARTING TIMER with clockInTime:', clockInTime);

            const updateTimer = () => {
                const now = new Date();
                const diffMs = now.getTime() - clockInTime.getTime();
                const hours = diffMs / (1000 * 60 * 60);
                console.log('⏱️ Timer update - hours:', hours);
                setLiveHours(hours);
            };

            // Initial update
            updateTimer();
            // Update every second
            timer = setInterval(updateTimer, 1000);
        } else {
            console.log('⏱️ STOPPING TIMER');
            setLiveHours(0);
        }

        return () => {
            if (timer) {
                console.log('⏱️ Cleaning up timer');
                clearInterval(timer);
            }
        };
    }, [isClockedIn, clockInTime]); // Simple dependencies

    const formatTime = (hours: number) => {
        const totalSeconds = Math.floor(hours * 3600);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleClockIn = async () => {
        if (!user || loading) return;

        console.log('🔵 CLOCK IN CLICKED');
        setLoading(true);

        try {
            // API call first
            const response = await clockService.clockIn({
                employeeId: user.id,
                employeeName: user.name
            });

            console.log('✅ Clock in API response:', response);

            if (response.success) {
                // Set local state after successful API call
                const now = new Date();
                setIsClockedIn(true);
                setClockInTime(now);
                setLiveHours(0);
                setTodayRecord(response.data);
                console.log('🔵 Set state - isClockedIn: true, clockInTime:', now);
            }

        } catch (error) {
            console.error('Clock in error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClockOut = async () => {
        if (!user || loading || !clockInTime) return;

        console.log('🔴 CLOCK OUT CLICKED');
        setLoading(true);

        try {
            // API call first
            const response = await clockService.clockOut({
                employeeId: user.id
            });

            console.log('✅ Clock out API response:', response);

            if (response.success) {
                // Set local state after successful API call
                setIsClockedIn(false);
                setClockInTime(null);
                setLiveHours(0);
                setTodayRecord(response.data);
                console.log('🔴 Set state - isClockedIn: false');
            }

        } catch (error) {
            console.error('Clock out error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <Clock className="text-blue-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Attendance Clock</h2>
                    <div className="text-3xl font-mono font-bold text-gray-700 mb-1">
                        {currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <p className="text-gray-600">
                        {currentDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>

                <div className="mt-6 space-y-4">
                    {!isClockedIn ? (
                        <button
                            onClick={handleClockIn}
                            disabled={loading}
                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Clocking In...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    <span>Clock In</span>
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleClockOut}
                            disabled={loading}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Clocking Out...</span>
                                </>
                            ) : (
                                <>
                                    <LogOut size={20} />
                                    <span>Clock Out</span>
                                </>
                            )}
                        </button>
                    )}

                    {isClockedIn && (
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className="text-sm text-gray-600 mb-1">Current Session</div>
                            <div className="text-2xl font-mono font-bold text-blue-600">
                                {formatTime(liveHours)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Since {clockInTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}