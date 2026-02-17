import { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import clockService from '../services/clockservice';

export function ClockInOut() {
  const handleClockIn = async () => {
    if (!user || loading) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const checkInTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
      await addClockRecord({
        employeeId: user.id,
        employeeName: user.name,
        date: today,
        checkIn: checkInTime,
        status: 'present',
        hours: 0
      });
      if (!isClockActive) toggleClock();
    } catch (error) {
      console.error('Clock in failed:', error);
    } finally {
      setLoading(false);
    }
  };
  const { user } = useAuth();
  const { clockRecords, addClockRecord, updateClockRecord, isClockActive, toggleClock } = useData();
  const [loading, setLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  useEffect(() => {
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const record = clockRecords.find(
        (r) => r.employeeId === user.id && r.date === today
      );
      setTodayRecord(record);
    }
  }, [clockRecords, user]);
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  // ...existing code...
  const handleClockOut = async () => {
    if (!todayRecord || !todayRecord.checkIn) return;
    setLoading(true);
    try {
      const checkOutTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

      // Calculate hours worked
      const [inHour, inMin] = todayRecord.checkIn.split(':').map(Number);
      const [outHour, outMin] = checkOutTime.split(':').map(Number);
      let totalMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin);
      if (totalMinutes < 0) totalMinutes += 24 * 60;
      const hours = totalMinutes / 60;

      await updateClockRecord(todayRecord.id, {
        employeeId: user.id,
        checkOut: checkOutTime,
        hours: hours
      });

      // Sync with global clock
      if (isClockActive) toggleClock();
    } catch (error) {
      console.error('Clock out failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWorkingHours = (record: any) => {
    if (!record || !record.clockIn) return '0h 0m';

    const clockInTime = record.clockIn.split(':');
    const clockInDate = new Date();
    clockInDate.setHours(parseInt(clockInTime[0]), parseInt(clockInTime[1]), 0);

    let clockOutDate = new Date();
    if (record.clockOut) {
      const clockOutTime = record.clockOut.split(':');
      clockOutDate.setHours(parseInt(clockOutTime[0]), parseInt(clockOutTime[1]), 0);
    } else {
      // If not clocked out yet, use current time
      clockOutDate = new Date();
    }

    const diffMs = clockOutDate.getTime() - clockInDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHours}h ${diffMinutes}m`;
  };

  const getWeekRecords = () => {
    if (!user) return [];

    const today = new Date();
    const weekRecords = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const record = clockRecords.find(
        (r) => r.employeeId === user.id && r.date === dateStr
      );

      weekRecords.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        record: record || null,
      });
    }

    return weekRecords;
  };

  const formatTime = (time: string) => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Attendance Tracking</h2>
        <p className="text-gray-600 mt-1">Clock in and clock out to track your working hours</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clock In/Out Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Clock className="text-blue-600" size={32} />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">
              {formatTime(currentTime.toTimeString())}
            </h3>
            <p className="text-gray-600">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="space-y-4">
            {/* Button changes color and text based on checkIn/checkOut or clockIn/clockOut fields */}
            {todayRecord && (todayRecord.checkIn || todayRecord.clockIn) && !(todayRecord.checkOut || todayRecord.clockOut) ? (
              <button
                onClick={handleClockOut}
                disabled={loading}
                className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
            ) : (
              <button
                onClick={handleClockIn}
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
            )}

            {todayRecord && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Clock In:</span>
                  <span className="font-semibold text-gray-800">{todayRecord.clockIn || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Clock Out:</span>
                  <span className="font-semibold text-gray-800">{todayRecord.clockOut || '-'}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Working Hours:</span>
                  <span className="font-bold text-blue-600">{calculateWorkingHours(todayRecord)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">This Week</h3>
          </div>

          <div className="space-y-3">
            {getWeekRecords().map((item, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-3 rounded-lg ${item.record ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                  }`}
              >
                <div>
                  <p className="font-medium text-gray-800">{item.day}</p>
                  <p className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                {item.record ? (
                  <div className="text-right">
                    <p className="text-sm text-gray-800">
                      {item.record.clockIn} - {item.record.clockOut || 'Active'}
                    </p>
                    <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                      {calculateWorkingHours(item.record)}
                    </span>
                  </div>
                ) : (
                  // Show today's time spent if today, else 'No Record'
                  (item.date === new Date().toISOString().split('T')[0] && todayRecord && todayRecord.clockIn) ? (
                    <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                      {calculateWorkingHours(todayRecord)}
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                      No Record
                    </span>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Days Present</p>
            <p className="text-2xl font-bold text-blue-600">
              {getWeekRecords().filter((r) => r.record).length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Hours</p>
            <p className="text-2xl font-bold text-green-600">
              {getWeekRecords()
                .filter((r) => r.record)
                .reduce((acc, r) => {
                  const hoursResult = calculateWorkingHours(r.record);
                  const [hoursPart, minutesPart] = hoursResult.split('h ');
                  const hours = parseInt(hoursPart) || 0;
                  const minutes = parseInt(minutesPart?.replace('m', '') || '0') || 0;
                  return acc + hours + (minutes / 60);
                }, 0)
                .toFixed(1)}h
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <p className="text-2xl font-bold text-yellow-600">
              {todayRecord
                ? todayRecord.status === 'clocked-in'
                  ? 'Active'
                  : 'Completed'
                : 'Not Started'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
