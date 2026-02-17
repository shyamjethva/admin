// WeeklyWorkPlan.tsx (READY FILE - fixed for MongoDB _id + assignedTo ObjectId + UI show)
// ✅ Task add ke baad instantly UI me dikhega (agar DataContext addTask setTasks karta hai ya refetch karta hai)
// ✅ assignedTo ab employee ObjectId jayega (naam nahi) -> MongoDB me save hoga
// ✅ id/_id mismatch fix (MongoDB returns _id)

import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  User,
  AlertCircle,
  Play,
  Pause,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

// ---- Types (flexible for backend shapes) ----
type AssignedTo =
  | string
  | {
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
  }
  | null
  | undefined;

interface Task {
  _id?: string;
  id?: string;

  title: string;
  description: string;

  assignedTo: AssignedTo;

  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';

  dueDate: string; // ISO or yyyy-mm-dd
  category: string;

  timeSpent: number; // seconds
  isRunning: boolean;
  timerStartTime?: string | null;
}

type Employee = {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
};



const getTaskId = (t: any) => (t?._id || t?.id) as string;

export function WeeklyWorkPlan() {
  const { user } = useAuth();
  // Removed excessive logging that was causing performance issues
  // console.log('🔄 WeeklyWorkPlan - User data:', user);

  // ✅ IMPORTANT: employees yaha se lena hai (agar tumhare DataContext me employees nahi hai,
  // to ye undefined rahega, but code crash nahi karega)
  const { tasks, addTask, updateTask, deleteTask, employees } = useData() as any;

  // Removed the useEffect that was causing infinite re-renders
  // useEffect(() => {
  //   console.log("WeeklyWorkPlan mounted, tasks:", tasks);
  // }, [tasks]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  const isAdmin = user?.role === 'admin';
  const isHR = user?.role === 'hr';
  const canEdit = isAdmin || isHR;

  // Helper function to check if task is assigned to current user
  const isTaskAssignedToUser = (task: any, currentUser: any): boolean => {
    if (!currentUser || !task) return false;
    let assignedToId = task.assignedTo;
    if (!assignedToId) return false;
    if (typeof assignedToId === 'object') {
      assignedToId = assignedToId._id || assignedToId.id;
    }
    return String(assignedToId) === String(currentUser.id);
  };

  // Update current time every second for live timer
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const safeTasks: Task[] = Array.isArray(tasks) ? tasks : [];

  // Filter tasks
  const filteredTasks = useMemo(() => {
    const result = safeTasks.filter((task: any) => {
      // For employees: only show tasks assigned to them
      // For admin/HR: show all tasks
      const userMatch = canEdit || isTaskAssignedToUser(task, user);

      const statusMatch = filterStatus === 'all' || task.status === filterStatus;
      const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;

      return userMatch && statusMatch && priorityMatch;
    });

    return result;
  }, [safeTasks, filterStatus, filterPriority, user, canEdit, employees]);

  // Format time from seconds to readable format
  const formatTimeSpent = (seconds: number, isRunning: boolean, startTime?: string | null): string => {
    let totalSeconds = seconds || 0;

    if (isRunning && startTime) {
      const start = new Date(startTime).getTime();
      const now = currentTime.getTime();
      const currentSessionSeconds = Math.floor((now - start) / 1000);
      totalSeconds += Math.max(0, currentSessionSeconds);
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${totalSeconds}s`;
  };

  const resolveAssignedToLabel = (assignedTo: AssignedTo): string => {
    // populated object
    if (assignedTo && typeof assignedTo === 'object') {
      return assignedTo.name || assignedTo.email || 'Unassigned';
    }

    // string can be ObjectId or legacy name
    const val = (assignedTo || '').toString().trim();
    if (!val) return 'Unassigned';

    // try map ObjectId -> employee name
    const emps: Employee[] = Array.isArray(employees) ? employees : [];
    const emp = emps.find((e) => (e._id || e.id) === val);
    return emp?.name || val;
  };

  const resolveAssignedToId = (assignedTo: AssignedTo): string => {
    if (assignedTo && typeof assignedTo === 'object') return (assignedTo._id || assignedTo.id || '') as string;
    return (assignedTo || '').toString();
  };

  const safeDateLabel = (dueDate: any) => {
    if (!dueDate) return 'N/A';
    const d = new Date(dueDate);
    if (Number.isNaN(d.getTime())) return String(dueDate);
    return d.toLocaleDateString();
  };

  // Play button handler - update task status and timer
  const handlePlay = async (taskId: string) => {
    const task = safeTasks.find((t: any) => getTaskId(t) === taskId);
    if (!task) return;

    const nextStatus = task.status === 'pending' ? 'in-progress' : task.status;

    await updateTask(taskId, {
      isRunning: true,
      timerStartTime: new Date().toISOString(),
      status: nextStatus,
    });
  };

  // Pause button handler - stop timer and save time
  const handlePause = async (taskId: string) => {
    const task = safeTasks.find((t: any) => getTaskId(t) === taskId);
    if (!task || !task.isRunning || !task.timerStartTime) return;

    const start = new Date(task.timerStartTime).getTime();
    const now = Date.now();
    const sessionSeconds = Math.floor((now - start) / 1000);

    await updateTask(taskId, {
      isRunning: false,
      timeSpent: (task.timeSpent || 0) + Math.max(0, sessionSeconds),
      timerStartTime: null,
    });
  };

  const handleAddTask = async (newTask: any) => {
    // ✅ ensure payload has required defaults (backend expects assignedTo ObjectId)
    await addTask({
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo, // ✅ employee _id
      status: newTask.status || 'pending',
      priority: newTask.priority || 'medium',
      dueDate: newTask.dueDate,
      category: newTask.category?.trim() || "",
      timeSpent: newTask.timeSpent || 0,
      isRunning: false,
      timerStartTime: null,
    });

    setShowAddModal(false);
  };


  const handleEditTask = async (updatedTask: any) => {
    const id = getTaskId(updatedTask);
    if (!id) return;

    // ✅ update only fields
    await updateTask(id, {
      title: updatedTask.title,
      description: updatedTask.description,
      assignedTo: updatedTask.assignedTo,
      status: updatedTask.status,
      priority: updatedTask.priority,
      dueDate: updatedTask.dueDate,
      category: updatedTask.category,
      timeSpent: updatedTask.timeSpent || 0,
      isRunning: !!updatedTask.isRunning,
      timerStartTime: updatedTask.timerStartTime || null,
    });

    setEditingTask(null);
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
    }
  };

  const toggleTaskStatus = async (id: string) => {
    const task = safeTasks.find((t: any) => getTaskId(t) === id);
    if (!task) return;

    const newStatus =
      task.status === 'completed' ? 'pending' : task.status === 'pending' ? 'in-progress' : 'completed';

    await updateTask(id, { status: newStatus });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Task Management</h2>
          <p className="text-gray-600 mt-1">Manage and track all tasks</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task: any) => {
          const id = getTaskId(task);
          return (
            <div
              key={id}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow relative"
            >
              {/* Time Spent - Top Left */}
              <div className="absolute top-4 left-4 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className={task.isRunning ? 'text-blue-600 animate-pulse' : 'text-blue-600'} />
                  <span className={`text-sm font-bold ${task.isRunning ? 'text-blue-600' : 'text-gray-700'}`}>
                    {formatTimeSpent(task.timeSpent || 0, !!task.isRunning, task.timerStartTime)}
                  </span>
                </div>
              </div>

              {/* Priority and Status Badges */}
              <div className="flex justify-end items-start mb-4 mt-8">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                    {(task.priority || 'medium').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                    {(task.status || 'pending').replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Edit/Delete Buttons */}
              {canEdit && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setEditingTask(task)}
                    className="text-blue-600 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(id)}
                    className="text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              <h3 className="text-lg font-semibold text-gray-800 mb-2">{task.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{task.description}</p>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <User size={16} />
                  <span>{resolveAssignedToLabel(task.assignedTo)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span>Due: {safeDateLabel(task.dueDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <AlertCircle size={16} />
                  <span>{task.category || '-'}</span>
                </div>
              </div>

              {/* Play/Pause and Toggle Status Buttons */}
              <div className="flex gap-2">
                {!task.isRunning ? (
                  <button
                    onClick={() => handlePlay(id)}
                    disabled={task.status === 'completed'}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${task.status === 'completed'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md'
                      }`}
                  >
                    <Play size={16} className="fill-current" />
                    Play
                  </button>
                ) : (
                  <button
                    onClick={() => handlePause(id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
                  >
                    <Pause size={16} />
                    Pause
                  </button>
                )}

                <button
                  onClick={() => toggleTaskStatus(id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  {task.status === 'completed' ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No tasks found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingTask) && (
        <TaskModal
          task={editingTask}
          employees={Array.isArray(employees) ? employees : []}
          onSave={editingTask ? handleEditTask : handleAddTask}
          onClose={() => {
            setShowAddModal(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}

// -------------------- Task Modal Component --------------------
function TaskModal({
  task,
  employees,
  onSave,
  onClose,
}: {
  task: any | null;
  employees: Employee[];
  onSave: (task: any) => void;
  onClose: () => void;
}) {
  // For edit: if assignedTo is populated object, keep its id in form
  const initialAssignedTo = task ? (typeof task.assignedTo === 'object' ? task.assignedTo?._id || task.assignedTo?.id || '' : task.assignedTo || '') : '';

  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignedTo: initialAssignedTo || '', // ✅ must be ObjectId string
    status: task?.status || 'pending',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? String(task.dueDate).slice(0, 10) : '', // keep yyyy-mm-dd
    category: task?.category || '',
    timeSpent: task?.timeSpent || 0,
    isRunning: task?.isRunning || false,
    timerStartTime: task?.timerStartTime || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Basic guard: assignedTo must be selected
    if (!formData.assignedTo) {
      alert('Please select an employee for Assigned To');
      return;
    }

    if (task) onSave({ ...task, ...formData });
    else onSave(formData);
  };

  const hasEmployees = Array.isArray(employees) && employees.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{task ? 'Edit Task' : 'Add New Task'}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>

            {/* ✅ MAIN FIX: dropdown sends employee _id */}
            {hasEmployees ? (
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp._id || emp.id} value={emp._id || emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            ) : (
              // fallback (if employees not available in context yet)
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste Employee ObjectId"
                required
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {task ? 'Update' : 'Add'} Task
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
