import { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Clock,
  CheckCircle2,
  AlertCircle,
  StopCircle,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Types
interface DailyTask {
  id: string;
  taskId: string;
  taskName: string;
  priority: 'High' | 'Medium' | 'Low';
  type: 'Mandatory' | 'Optional';
  estimatedTime: number; // in minutes
  timeSpent: number; // in seconds
  status: 'Idle' | 'In Progress' | 'Paused' | 'Completed';
  assignedTo: string;
}

// Demo Data
const initialTasks: DailyTask[] = [
  {
    id: '1',
    taskId: 'TXM-B-212',
    taskName: 'Meridiene Project New Design',
    priority: 'High',
    type: 'Mandatory',
    estimatedTime: 240, // 4 hours
    timeSpent: 0,
    status: 'Idle',
    assignedTo: 'Hitesh Vaghela'
  },
  {
    id: '2',
    taskId: 'TXM-B-213',
    taskName: 'Homepage UI Updates',
    priority: 'High',
    type: 'Mandatory',
    estimatedTime: 60, // 1 hour
    timeSpent: 0,
    status: 'Idle',
    assignedTo: 'Hitesh Vaghela'
  },
  {
    id: '3',
    taskId: 'TXM-B-214',
    taskName: 'Dashboard UI Polish',
    priority: 'Medium',
    type: 'Optional',
    estimatedTime: 120, // 2 hours
    timeSpent: 0,
    status: 'Idle',
    assignedTo: 'Hitesh Vaghela'
  },
  {
    id: '4',
    taskId: 'TXM-B-215',
    taskName: 'Icon Alignment Fix',
    priority: 'Medium',
    type: 'Optional',
    estimatedTime: 30, // 30 minutes
    timeSpent: 0,
    status: 'Idle',
    assignedTo: 'Hitesh Vaghela'
  }
];

export function DailyTaskManagement() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DailyTask[]>(initialTasks);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isHR = user?.role === 'hr';
  const canOverride = isAdmin || isHR;
  const isEmployee = user?.role === 'employee';

  // Filter tasks for employees - only show tasks assigned to current user
  const filteredTasks = useMemo(() => {
    if (!isEmployee || canOverride) {
      // Admin/HR see all tasks
      return tasks;
    }

    // Employees only see tasks assigned to them
    return tasks.filter(task => {
      // Handle different assignment formats
      if (!task.assignedTo) return false;

      // Direct name matching (since initialTasks use names)
      if (typeof task.assignedTo === 'string') {
        return task.assignedTo === user?.name;
      }

      // If assignedTo is an object, check name property
      if (typeof task.assignedTo === 'object' && task.assignedTo !== null) {
        return (task.assignedTo as any).name === user?.name;
      }

      return false;
    });
  }, [tasks, user, isEmployee, canOverride]);

  // Find active task
  const activeTask = filteredTasks.find(task => task.status === 'In Progress');
  const mandatoryTasks = filteredTasks.filter(task => task.type === 'Mandatory');
  const optionalTasks = filteredTasks.filter(task => task.type === 'Optional');
  const completedTasks = filteredTasks.filter(task => task.status === 'Completed');
  const allMandatoryCompleted = mandatoryTasks.every(task => task.status === 'Completed');

  // Timer effect for active task
  useEffect(() => {
    if (!activeTask) return;

    const interval = setInterval(() => {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === activeTask.id
            ? { ...task, timeSpent: task.timeSpent + 1 }
            : task
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTask?.id]);

  // Play task handler
  const handlePlay = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Check if mandatory tasks are not completed and trying to play optional task
    if (task.type === 'Optional' && !allMandatoryCompleted) {
      alert('Please complete all mandatory tasks before working on optional tasks.');
      return;
    }

    setTasks(prevTasks =>
      prevTasks.map(t => {
        if (t.id === taskId) {
          // Activate the selected task
          return { ...t, status: 'In Progress' as const };
        } else if (t.status === 'In Progress') {
          // Pause any currently active task
          return { ...t, status: 'Paused' as const };
        }
        return t;
      })
    );
  };

  // Pause task handler
  const handlePause = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: 'Paused' as const }
          : task
      )
    );
  };

  // Complete task handler
  const handleComplete = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: 'Completed' as const }
          : task
      )
    );
  };

  // Admin override to stop a task
  const handleAdminStop = (taskId: string) => {
    if (!canOverride) return;

    if (window.confirm('Are you sure you want to stop this task?')) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? { ...task, status: 'Paused' as const }
            : task
        )
      );
    }
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatEstimatedTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    }
    return `${mins}m`;
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-green-100 text-green-700';
      case 'Paused': return 'bg-yellow-100 text-yellow-700';
      case 'Completed': return 'bg-blue-100 text-blue-700';
      case 'Idle': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Check if task can be played
  const canPlayTask = (task: DailyTask) => {
    if (activeTask && activeTask.id !== task.id) return false;
    if (task.status === 'Completed') return false;
    if (task.type === 'Optional' && !allMandatoryCompleted) return false;
    return true;
  };

  // Render task card
  const renderTaskCard = (task: DailyTask) => {
    const isActive = task.status === 'In Progress';
    const isPaused = task.status === 'Paused';
    const isIdle = task.status === 'Idle';
    const isCompleted = task.status === 'Completed';
    const canPlay = canPlayTask(task);

    return (
      <div
        key={task.id}
        className={`bg-white p-5 rounded-xl border-2 transition-all ${isActive
          ? 'border-green-500 shadow-lg shadow-green-100'
          : isCompleted
            ? 'border-blue-200 opacity-75'
            : 'border-gray-200 hover:border-gray-300'
          }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-blue-600">{task.taskId}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${task.type === 'Mandatory'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                {task.type}
              </span>
            </div>
            <h4 className="text-base font-semibold text-gray-800 mb-2">{task.taskName}</h4>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className={isActive ? 'text-green-600' : 'text-gray-400'} />
                <span className={`font-medium tabular-nums ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
                  {formatTime(task.timeSpent)}
                </span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">{formatEstimatedTime(task.estimatedTime)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${isActive ? 'bg-green-500' : isPaused ? 'bg-yellow-500' : isCompleted ? 'bg-blue-500' : 'bg-gray-400'
                }`}
              style={{
                width: `${Math.min((task.timeSpent / (task.estimatedTime * 60)) * 100, 100)}%`
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!isCompleted && (
            <>
              {(isIdle || isPaused) && (
                <button
                  onClick={() => handlePlay(task.id)}
                  disabled={!canPlay}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${canPlay
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  title={!canPlay && activeTask ? 'Another task is currently running' : 'Start task'}
                >
                  <Play size={16} />
                  <span>Play</span>
                </button>
              )}

              {isActive && (
                <button
                  onClick={() => handlePause(task.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm hover:shadow-md transition-all"
                >
                  <Pause size={16} />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={() => handleComplete(task.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md transition-all"
              >
                <CheckCircle2 size={16} />
                <span>Complete</span>
              </button>

              {canOverride && isActive && (
                <button
                  onClick={() => handleAdminStop(task.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md transition-all ml-auto"
                  title="Admin: Force stop this task"
                >
                  <StopCircle size={16} />
                </button>
              )}
            </>
          )}

          {isCompleted && (
            <div className="flex items-center gap-2 text-blue-600">
              <CheckCircle2 size={18} />
              <span className="text-sm font-medium">Task Completed</span>
            </div>
          )}
        </div>

        {/* Warning for optional tasks */}
        {task.type === 'Optional' && !allMandatoryCompleted && !isCompleted && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700">
              Complete all mandatory tasks before working on optional tasks
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Today's Tasks</h2>
              <p className="text-sm text-gray-600 mt-1">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Active Task Indicator */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${activeTask
              ? 'bg-green-100 border border-green-200'
              : 'bg-gray-100 border border-gray-200'
              }`}>
              {activeTask ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-green-700">1 Task Active</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="text-sm font-medium text-gray-600">No Active Task</span>
                </>
              )}
            </div>
          </div>

          {/* Active Task Preview */}
          {activeTask && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Play size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Currently Working On:</p>
                    <p className="text-base font-bold text-gray-900">{activeTask.taskName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Time Spent</p>
                  <p className="text-2xl font-bold text-green-600 tabular-nums">
                    {formatTime(activeTask.timeSpent)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mandatory Tasks Section */}
        {mandatoryTasks.filter(t => t.status !== 'Completed').length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Mandatory Tasks</h3>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                {mandatoryTasks.filter(t => t.status !== 'Completed').length} remaining
              </span>
            </div>
            <div className="space-y-4">
              {mandatoryTasks
                .filter(task => task.status !== 'Completed')
                .sort((a, b) => {
                  if (a.status === 'In Progress') return -1;
                  if (b.status === 'In Progress') return 1;
                  if (a.status === 'Paused') return -1;
                  if (b.status === 'Paused') return 1;
                  return 0;
                })
                .map(renderTaskCard)}
            </div>
          </div>
        )}

        {/* Optional Tasks Section */}
        {optionalTasks.filter(t => t.status !== 'Completed').length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Optional Tasks</h3>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                {optionalTasks.filter(t => t.status !== 'Completed').length} available
              </span>
              {!allMandatoryCompleted && (
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium flex items-center gap-1">
                  <AlertCircle size={12} />
                  Complete mandatory tasks first
                </span>
              )}
            </div>
            <div className="space-y-4">
              {optionalTasks
                .filter(task => task.status !== 'Completed')
                .sort((a, b) => {
                  if (a.status === 'In Progress') return -1;
                  if (b.status === 'In Progress') return 1;
                  if (a.status === 'Paused') return -1;
                  if (b.status === 'Paused') return 1;
                  return 0;
                })
                .map(renderTaskCard)}
            </div>
          </div>
        )}

        {/* Completed Tasks Section */}
        {completedTasks.length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <button
              onClick={() => setShowCompletedTasks(!showCompletedTasks)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-800">Completed Tasks</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                  {completedTasks.length}
                </span>
              </div>
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform ${showCompletedTasks ? 'rotate-180' : ''}`}
              />
            </button>

            {showCompletedTasks && (
              <div className="mt-4 space-y-4">
                {completedTasks.map(renderTaskCard)}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {tasks.filter(t => t.status !== 'Completed').length === 0 && (
          <div className="bg-white p-12 rounded-xl border border-gray-200 shadow-sm text-center">
            <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">All Tasks Completed!</h3>
            <p className="text-gray-600">Great job! You've completed all your tasks for today.</p>
          </div>
        )}
      </div>
    </div>
  );
}
