import { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clockService } from '../services/clockservice';

export function ClockInOut() {
  const handleClockIn = async () => {
    if (!user || loading) return;
    useEffect(() => {
      // Always check clock status on user login or user state change
      const checkClockStatus = async () => {
        if (!user) {
          setIsClockedIn(false);
          setTodayRecord(null);
          setStatusLoaded(true);
          return;
        }
        try {
          setIsClockedIn(null); // Set to loading state
          setStatusLoaded(false);
          const response = await clockService.getToday(user.id);
          if (response.success) {
            let record = null;
            if (response.data) {
              if (Array.isArray(response.data)) {
                record = response.data[0] || null;
              } else {
                record = response.data;
              }
            }
            setTodayRecord(record);
            if (record && record.checkIn && !record.checkOut) {
              setIsClockedIn(true);
            } else {
              setIsClockedIn(false);
            }
          } else {
            setIsClockedIn(false);
          }
        } catch (error) {
          setIsClockedIn(false);
        } finally {
          setStatusLoaded(true);
        }
      };
      checkClockStatus();
    }, [user]);

    setTodayRecord(record);

    if (record) {
      // If there's a checkIn but no checkOut, user is clocked in
      if (record.checkIn && !record.checkOut) {
        setIsClockedIn(true);
      } else {
        setIsClockedIn(false);
      }
    } else {
      // No record found
      setIsClockedIn(false);
    }
  } else {
    setIsClockedIn(false);
}
      } catch (error) {
  console.error('Error checking clock status:', error);
  setIsClockedIn(false);
} finally {
  setStatusLoaded(true);
}
    };

checkClockStatus();
  }, [user]);
const [currentTime, setCurrentTime] = useState(new Date());
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000);
  return () => clearInterval(timer);
}, []);
// ...existing code...
const handleClockOut = async () => {
  if (!user || !todayRecord || loading) return;
  setLoading(true);
  try {
    const response = await clockService.clockOut({
      employeeId: user.id,
    });

    if (response.success && response.data) {
      setTodayRecord(response.data);
      setIsClockedIn(false);
      console.log('✅ Clock out successful');
    }
  } catch (error) {
    console.error('Clock out failed:', error);
  } finally {
    setLoading(false);
  }
};

const calculateWorkingHours = (record: any) => {
  if (!record || !record.checkIn) return '0h 0m';

  const clockInTime = record.checkIn.split(':');
  const clockInDate = new Date();
  clockInDate.setHours(parseInt(clockInTime[0]), parseInt(clockInTime[1]), parseInt(clockInTime[2]) || 0);

  let clockOutDate = new Date();
  if (record.checkOut) {
    const clockOutTime = record.checkOut.split(':');
    clockOutDate.setHours(parseInt(clockOutTime[0]), parseInt(clockOutTime[1]), parseInt(clockOutTime[2]) || 0);
  } else {
    // If not clocked out yet, use current time
    clockOutDate = new Date();
  }

  const diffMs = clockOutDate.getTime() - clockInDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${Math.abs(diffHours)}h ${Math.abs(diffMinutes)}m`;
};

const [weekData, setWeekData] = useState([]);

useEffect(() => {
  const loadWeekData = async () => {
    if (!user) return;

    try {
      const response = await clockService.getWeekly(user.id);
      const allRecords = response.success && Array.isArray(response.data) ? response.data : [];

      const today = new Date();
      const weekRecords = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const record = allRecords.find(
          (r) => r.date === dateStr
        );

        weekRecords.push({
          date: dateStr,
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          record: record || null,
        });
      }

      setWeekData(weekRecords);
    } catch (error) {
      console.error('Error fetching weekly records:', error);
    }
  };

  loadWeekData();
}, [user]);

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
          {isClockedIn === null || !statusLoaded ? (
            // Show loading state while fetching status
            <button
              disabled={true}
              className="w-full py-3 bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Loading...</span>
            </button>
          ) : isClockedIn ? (
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
                <span className="font-semibold text-gray-800">{todayRecord.checkIn || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Clock Out:</span>
                <span className="font-semibold text-gray-800">{todayRecord.checkOut || '-'}</span>
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
          {weekData.map((item, index) => (
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
                    {item.record.checkIn} - {item.record.checkOut || 'Active'}
                  </p>
                  <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                    {calculateWorkingHours(item.record)}
                  </span>
                </div>
              ) : (
                // Show today's time spent if today, else 'No Record'
                (item.date === new Date().toISOString().split('T')[0] && todayRecord && todayRecord.checkIn) ? (
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
            {weekData.filter((r) => r.record).length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Hours</p>
          <p className="text-2xl font-bold text-green-600">
            {weekData
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
              ? isClockedIn
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
