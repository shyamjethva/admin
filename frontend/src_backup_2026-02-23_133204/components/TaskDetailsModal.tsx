import { X, Clock, User, Calendar, AlertCircle, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useState } from 'react';

interface Task {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  timeSpent: string;
  estimatedTime: string;
  assignedTo: string;
  assignedToInitials: string;
  status: 'completed' | 'in-progress' | 'pending';
  day: string;
  startDate?: string;
  dueDate?: string;
  notes?: string;
}

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onSave?: (updatedTask: Task) => void;
  onDelete?: (taskId: string) => void;
  isReadOnly: boolean;
  userRole: 'admin' | 'hr' | 'employee';
}

export function TaskDetailsModal({ task, onClose, onSave, onDelete, isReadOnly, userRole }: TaskDetailsModalProps) {
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [isEditing, setIsEditing] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editedTask);
    }
    setIsEditing(false);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
      onClose();
    }
  };

  const handleStatusChange = (newStatus: 'pending' | 'in-progress' | 'completed') => {
    const updatedTask = { ...task, status: newStatus };
    if (onSave) {
      onSave(updatedTask);
    }
  };

  const canEdit = !isReadOnly && (userRole === 'admin' || userRole === 'hr');
  const canDelete = userRole === 'admin';
  const canChangeStatus = userRole === 'employee';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Task Details</h2>
            <p className="text-sm text-gray-500 mt-1">{task.taskId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title
            </label>
            {isEditing && canEdit ? (
              <Input
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="w-full"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900">{task.title}</p>
            )}
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            {isEditing && canEdit ? (
              <Textarea
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                className="w-full min-h-[100px]"
                placeholder="Enter task description..."
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {task.description || 'This task involves working on the Meridiene project, focusing on creating new design mockups and implementing UI improvements based on client feedback. The design should follow the latest brand guidelines and ensure consistency across all platforms.'}
              </p>
            )}
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              {isEditing && canEdit ? (
                <select
                  value={editedTask.status}
                  onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              ) : canChangeStatus ? (
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              ) : (
                <Badge className={`${getStatusColor(task.status)} capitalize`} variant="outline">
                  {task.status.replace('-', ' ')}
                </Badge>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              {isEditing && canEdit ? (
                <select
                  value={editedTask.priority}
                  onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              ) : (
                <Badge className={getPriorityColor(task.priority)} variant="outline">
                  {task.priority}
                </Badge>
              )}
            </div>
          </div>

          {/* Time Tracking */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time Spent
              </label>
              {isEditing && canEdit ? (
                <Input
                  value={editedTask.timeSpent}
                  onChange={(e) => setEditedTask({ ...editedTask, timeSpent: e.target.value })}
                  placeholder="e.g., 4h 17m"
                />
              ) : (
                <p className="text-gray-900 font-medium">{task.timeSpent}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Estimated Time
              </label>
              {isEditing && canEdit ? (
                <Input
                  value={editedTask.estimatedTime}
                  onChange={(e) => setEditedTask({ ...editedTask, estimatedTime: e.target.value })}
                  placeholder="e.g., 4h"
                />
              ) : (
                <p className="text-gray-900 font-medium">{task.estimatedTime}</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Start Date
              </label>
              {isEditing && canEdit ? (
                <Input
                  type="date"
                  value={editedTask.startDate || '2026-01-27'}
                  onChange={(e) => setEditedTask({ ...editedTask, startDate: e.target.value })}
                />
              ) : (
                <p className="text-gray-900">{task.startDate || 'January 27, 2026'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </label>
              {isEditing && canEdit ? (
                <Input
                  type="date"
                  value={editedTask.dueDate || '2026-01-27'}
                  onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                />
              ) : (
                <p className="text-gray-900">{task.dueDate || 'January 27, 2026'}</p>
              )}
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Assigned To
            </label>
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-blue-500 text-white">
                  {task.assignedToInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">{task.assignedTo}</p>
                <p className="text-sm text-gray-500">UI / Frontend Developer</p>
              </div>
            </div>
          </div>

          {/* Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Day
            </label>
            {isEditing && canEdit ? (
              <select
                value={editedTask.day}
                onChange={(e) => setEditedTask({ ...editedTask, day: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
            ) : (
              <p className="text-gray-900">{task.day}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notes
            </label>
            {isEditing && canEdit ? (
              <Textarea
                value={editedTask.notes || ''}
                onChange={(e) => setEditedTask({ ...editedTask, notes: e.target.value })}
                className="w-full min-h-[80px]"
                placeholder="Add any additional notes..."
              />
            ) : (
              <p className="text-gray-700">
                {task.notes || 'Task is progressing as planned. Client feedback has been incorporated. Next steps include final review and deployment preparation.'}
              </p>
            )}
          </div>

          {/* Alert for Read-Only Users */}
          {canChangeStatus && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Employee Mode</p>
                <p className="text-sm text-blue-700 mt-1">
                  You can view task details and update the status. Contact your admin or HR for other modifications.
                </p>
              </div>
            </div>
          )}
          
          {isReadOnly && !canChangeStatus && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">View Only Mode</p>
                <p className="text-sm text-blue-700 mt-1">
                  You can view task details but cannot make changes. Contact your admin or HR for task modifications.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            {canDelete && !isEditing && (
              <Button
                onClick={handleDelete}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Delete Task
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {canEdit && !isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Edit Task
              </Button>
            )}
            
            {isEditing && (
              <>
                <Button
                  onClick={() => {
                    setEditedTask(task);
                    setIsEditing(false);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Changes
                </Button>
              </>
            )}
            
            {!isEditing && (
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}