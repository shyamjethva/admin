import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, AlertCircle, List, Eye, Play, Pause, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';

// localStorage key for active timers
const ACTIVE_TIMERS_KEY = 'activeTaskTimers';

export function TaskManagement() {
	const { user } = useAuth();
	const { tasks, addTask, updateTask, deleteTask, employees } = useData();
	const { addNotification } = useNotifications();

	// State for view modal
	const [viewingTask, setViewingTask] = useState<any>(null);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);

	// State for add task modal
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [newTask, setNewTask] = useState({
		title: '',
		description: '',
		assignedTo: '',
		status: 'pending',
		priority: 'medium',
		dueDate: '',
		category: 'General'
	});


	// Timer state - now persisted in localStorage
	const [activeTimers, setActiveTimers] = useState<Record<string, { startTime: number; elapsed: number }>>(() => {
		// Load from localStorage on initial render
		try {
			const saved = localStorage.getItem(ACTIVE_TIMERS_KEY);
			return saved ? JSON.parse(saved) : {};
		} catch (error) {
			console.error('Failed to load timers from localStorage:', error);
			return {};
		}
	});
	const [currentTime, setCurrentTime] = useState(Date.now());

	// Simple debugging
	console.log('=== TASK MANAGEMENT DEBUG ===');
	console.log('User:', user);
	console.log('All tasks:', tasks);
	console.log('User role:', user?.role);
	console.log('Is employee:', user?.role === 'employee');
	console.log('Active timers:', activeTimers);
	console.log('============================');

	// Simple filtering - show all tasks for now to test
	const filteredTasks = tasks || [];

	// Save timers to localStorage whenever they change
	useEffect(() => {
		try {
			localStorage.setItem(ACTIVE_TIMERS_KEY, JSON.stringify(activeTimers));
		} catch (error) {
			console.error('Failed to save timers to localStorage:', error);
		}
	}, [activeTimers]);

	// Update current time every second for live timers
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(Date.now());
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	// Handle view task button click
	const handleViewTask = (task: any) => {
		setViewingTask(task);
		setIsViewModalOpen(true);
	};

	// Handle close view modal
	const handleCloseViewModal = () => {
		setIsViewModalOpen(false);
		setViewingTask(null);
	};

	// Handle open add task modal
	const handleOpenAddModal = () => {
		setNewTask({
			title: '',
			description: '',
			assignedTo: '',
			status: 'pending',
			priority: 'medium',
			dueDate: '',
			category: 'General'
		});
		setIsAddModalOpen(true);
	};

	// Handle close add task modal
	const handleCloseAddModal = () => {
		setIsAddModalOpen(false);
		setNewTask({
			title: '',
			description: '',
			assignedTo: '',
			status: 'pending',
			priority: 'medium',
			dueDate: '',
			category: 'General'
		});
	};

	// Handle form input changes
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setNewTask(prev => ({
			...prev,
			[name]: value
		}));
	};

	// Handle add task submission
	const handleAddTask = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!newTask.title.trim() || !newTask.assignedTo) {
			addNotification({
				type: 'task',
				title: 'Validation Error',
				message: 'Please fill in required fields (title and assignee)',
				priority: 'high'
			});
			return;
		}

		try {
			const taskData = {
				...newTask,
				timeSpent: 0,
				isRunning: false,
				timerStartTime: null,
				assignedBy: user?.id, // Add the assigner ID
				assignedByName: user?.name // Add the assigner name
			};

			await addTask(taskData);

			addNotification({
				type: 'task',
				title: 'Task Created',
				message: 'Task added successfully',
				priority: 'medium'
			});

			handleCloseAddModal();
		} catch (error) {
			addNotification({
				type: 'task',
				title: 'Creation Error',
				message: 'Failed to create task',
				priority: 'high'
			});
		}
	};

	// Handle play/pause timer
	const handleToggleTimer = async (task: any) => {
		const taskId = task._id || task.id;

		if (activeTimers[taskId]) {
			// Pause timer
			const timer = activeTimers[taskId];
			const newElapsed = timer.elapsed + (Date.now() - timer.startTime);

			try {
				await updateTask(taskId, {
					...task,
					timeSpent: (task.timeSpent || 0) + (newElapsed / 1000), // Add to existing time
					isRunning: false,
					timerStartTime: null
				});

				// Update local state
				const newTimers = { ...activeTimers };
				delete newTimers[taskId];
				setActiveTimers(newTimers);

				addNotification({
					type: 'task',
					title: 'Timer Paused',
					message: 'Timer paused successfully',
					priority: 'medium'
				});
			} catch (error) {
				addNotification({
					type: 'task',
					title: 'Timer Error',
					message: 'Failed to pause timer',
					priority: 'high'
				});
			}
		} else {
			// Start timer
			// First, update task status to 'in-progress' if it's pending
			let updatedTask = { ...task };
			if (task.status === 'pending') {
				updatedTask = { ...task, status: 'in-progress' };
			}

			try {
				await updateTask(taskId, {
					...updatedTask,
					isRunning: true,
					timerStartTime: new Date().toISOString()
				});

				// Update local state
				setActiveTimers(prev => ({
					...prev,
					[taskId]: {
						startTime: Date.now(),
						elapsed: 0 // Start fresh when beginning new timer session
					}
				}));

				addNotification({
					type: 'task',
					title: 'Timer Started',
					message: 'Timer started successfully',
					priority: 'medium'
				});
			} catch (error) {
				addNotification({
					type: 'task',
					title: 'Timer Error',
					message: 'Failed to start timer',
					priority: 'high'
				});
			}
		}
	};

	// Handle mark as completed
	const handleMarkCompleted = async (task: any) => {
		const taskId = task._id || task.id;

		// Stop timer if running and add final time
		let finalTimeSpent = task.timeSpent || 0;
		if (activeTimers[taskId]) {
			const timer = activeTimers[taskId];
			const additionalTime = timer.elapsed + (Date.now() - timer.startTime);
			finalTimeSpent += additionalTime / 1000; // Convert to seconds

			const newTimers = { ...activeTimers };
			delete newTimers[taskId];
			setActiveTimers(newTimers);
		}

		try {
			await updateTask(taskId, {
				...task,
				timeSpent: finalTimeSpent,
				status: 'completed',
				isRunning: false,
				timerStartTime: null
			});

			addNotification({
				type: 'task',
				title: 'Task Completed',
				message: 'Task marked as completed',
				priority: 'medium'
			});
		} catch (error) {
			addNotification({
				type: 'task',
				title: 'Update Error',
				message: 'Failed to update task status',
				priority: 'high'
			});
		}
	};

	// Format time for display
	const formatTime = (seconds: number) => {
		const hrs = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = Math.floor(seconds % 60);
		return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	// Get current time for a task (including active timer if running)
	const getCurrentTime = (task: any) => {
		const taskId = task._id || task.id;
		const timer = activeTimers[taskId];

		let totalTime = task.timeSpent || 0;

		if (timer) {
			// Add currently running time
			const currentSessionTime = timer.elapsed + (Date.now() - timer.startTime);
			totalTime += currentSessionTime / 1000; // Convert to seconds
		}

		return totalTime;
	};

	// Clean up expired timers (optional safety check)
	useEffect(() => {
		const cleanupInterval = setInterval(() => {
			const now = Date.now();
			let hasExpired = false;
			const cleanedTimers = { ...activeTimers };

			// Check for timers that might have issues
			Object.keys(cleanedTimers).forEach(taskId => {
				const timer = cleanedTimers[taskId];
				// Remove timers that seem invalid (older than 24 hours)
				if (now - timer.startTime > 24 * 60 * 60 * 1000) {
					delete cleanedTimers[taskId];
					hasExpired = true;
				}
			});

			if (hasExpired) {
				setActiveTimers(cleanedTimers);
			}
		}, 60000); // Check every minute

		return () => clearInterval(cleanupInterval);
	}, [activeTimers]);

	// Check if user is admin or HR
	const isAdminOrHR = user?.role === 'admin' || user?.role === 'hr';

	return (
		<div className="space-y-6">
			{/* Very obvious debug header */}
			<div className="bg-blue-500 text-white p-4 rounded">
				<h1 className="text-2xl font-bold">TASK MANAGEMENT</h1>
				<p>User: {user?.name} ({user?.role})</p>
				<p>Total Assigned Tasks: {tasks?.length || 0}</p>
				<p>Tasks to display: {filteredTasks.length}</p>
				{Object.keys(activeTimers).length > 0 && (
					<p className="text-sm">Running tasks: {Object.keys(activeTimers).join(', ')}</p>
				)}
			</div>

			{/* Task Management Header with Add Button */}
			<div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg">
				<div className="flex items-center gap-2 text-white">
					<List size={20} />
					<h2 className="text-lg font-semibold uppercase tracking-wider">Task Management</h2>
				</div>
				{isAdminOrHR && (
					<button
						onClick={handleOpenAddModal}
						className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2 hover:bg-blue-600 transition-colors font-medium"
					>
						<Plus size={18} />
						Add Task
					</button>
				)}
			</div>

			{/* Simple task list - no complex filtering */}
			<div className="bg-white rounded-lg shadow">
				<div className="p-4 border-b">
					<h2 className="text-xl font-bold">All Tasks ({filteredTasks.length})</h2>
				</div>

				{filteredTasks.length === 0 ? (
					<div className="p-8 text-center">
						<AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
						<p className="text-gray-500 text-lg">No tasks available</p>
						<p className="text-sm text-gray-400 mt-2">
							Tasks fetched: {tasks?.length || 0}
						</p>
					</div>
				) : (
					<div className="divide-y">
						{filteredTasks.map((task) => {
							const taskId = task._id || task.id;
							const isTimerActive = !!activeTimers[taskId];
							const currentTimeSpent = getCurrentTime(task);
							const isCompleted = task.status === 'completed';
							const canStartTimer = user?.role === 'employee' && !isCompleted;

							return (
								<div key={taskId} className="p-4 hover:bg-gray-50">
									<div className="flex justify-between items-start">
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2">
												<h3 className="font-semibold text-lg">
													{task.title || 'Untitled Task'}
												</h3>
												<span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${task.status === 'completed' ? 'bg-green-100 text-green-700' :
													task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
														'bg-orange-100 text-orange-700'
													}`}>
													{task.status || 'pending'}
												</span>
												{isTimerActive && (
													<span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">
														RUNNING
													</span>
												)}
											</div>
											<p className="text-gray-600 mb-3">
												{task.description || 'No description'}
											</p>
											<div className="flex gap-4 text-sm text-gray-500">
												<span>Priority: {task.priority || 'Medium'}</span>
												{task.dueDate && (
													<span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
												)}
												<div className="flex items-center gap-1">
													<Clock size={14} />
													<span>{formatTime(currentTimeSpent)}</span>
												</div>
												{task.assignedByName && (
													<span>Assigned by: {task.assignedByName}</span>
												)}
											</div>
										</div>
										<div className="flex gap-2">
											<button
												onClick={() => handleViewTask(task)}
												className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
											>
												<Eye size={16} />
												View
											</button>

											{canStartTimer && (
												<>
													<button
														onClick={() => handleToggleTimer(task)}
														className={`px-3 py-1 rounded flex items-center gap-1 ${isTimerActive
															? 'bg-red-500 hover:bg-red-600 text-white'
															: 'bg-green-500 hover:bg-green-600 text-white'
															}`}
													>
														{isTimerActive ? <Pause size={16} /> : <Play size={16} />}
														{isTimerActive ? 'Pause' : 'Start'}
													</button>

													{task.status === 'in-progress' && (
														<button
															onClick={() => handleMarkCompleted(task)}
															className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-1"
														>
															<CheckCircle size={16} />
															Complete
														</button>
													)}
												</>
											)}

											{(user?.role === 'admin' || user?.role === 'hr') && (
												<>
													<button className="px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 flex items-center gap-1">
														<Edit size={16} />
														Edit
													</button>
													<button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1">
														<Trash2 size={16} />
														Delete
													</button>
												</>
											)}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Add Task Modal */}
			{isAddModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between p-6 border-b border-gray-200">
							<h2 className="text-xl font-bold text-gray-800">Add New Task</h2>
							<button
								onClick={handleCloseAddModal}
								className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
							>
								<X size={24} />
							</button>
						</div>
						<form onSubmit={handleAddTask} className="p-6 space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<label className="block text-sm font-semibold text-gray-700">
										Task Title *
									</label>
									<input
										type="text"
										name="title"
										value={newTask.title}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										placeholder="Enter task title"
										required
									/>
								</div>

								<div className="space-y-2">
									<label className="block text-sm font-semibold text-gray-700">
										Assign To *
									</label>
									<select
										name="assignedTo"
										value={newTask.assignedTo}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										required
									>
										<option value="">Select employee</option>
										{employees?.map((employee: any) => (
											<option key={employee._id || employee.id} value={employee._id || employee.id}>
												{employee.name}
											</option>
										))}
									</select>
								</div>

								<div className="space-y-2">
									<label className="block text-sm font-semibold text-gray-700">
										Priority
									</label>
									<select
										name="priority"
										value={newTask.priority}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									>
										<option value="low">Low</option>
										<option value="medium">Medium</option>
										<option value="high">High</option>
									</select>
								</div>

								<div className="space-y-2">
									<label className="block text-sm font-semibold text-gray-700">
										Due Date
									</label>
									<input
										type="date"
										name="dueDate"
										value={newTask.dueDate}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<label className="block text-sm font-semibold text-gray-700">
									Description
								</label>
								<textarea
									name="description"
									value={newTask.description}
									onChange={handleInputChange}
									rows={4}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									placeholder="Enter task description"
								/>
							</div>

							<div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
								<button
									type="button"
									onClick={handleCloseAddModal}
									className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm"
								>
									Add Task
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* View Task Modal */}
			{isViewModalOpen && viewingTask && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between p-6 border-b border-gray-200">
							<h2 className="text-xl font-bold text-gray-800">Task Details</h2>
							<button
								onClick={handleCloseViewModal}
								className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
							>
								<X size={24} />
							</button>
						</div>
						<div className="p-6">
							<div className="space-y-6">
								{/* Task Header */}
								<div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
									<h3 className="text-xl font-bold text-gray-900 mb-2">
										{viewingTask.title || 'Untitled Task'}
									</h3>
									<p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
										{viewingTask.description || 'No description provided'}
									</p>
								</div>

								{/* Task Details Grid */}
								<div className="grid grid-cols-2 gap-y-6 gap-x-8">
									<div className="space-y-1">
										<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
											Status
										</span>
										<div className="flex items-center gap-2">
											<span className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase ${viewingTask.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
												viewingTask.status === 'in-progress' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
													'bg-orange-100 text-orange-700 border border-orange-200'
												}`}>
												{viewingTask.status || 'pending'}
											</span>
											{activeTimers[viewingTask._id || viewingTask.id] && (
												<span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">
													RUNNING
												</span>
											)}
										</div>
									</div>

									<div className="space-y-1">
										<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
											Priority
										</span>
										<div className="flex items-center gap-2">
											<span className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase ${viewingTask.priority === 'high' ? 'bg-red-100 text-red-700 border border-red-200' :
												viewingTask.priority === 'medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
													'bg-slate-100 text-slate-700 border border-slate-200'
												}`}>
												{viewingTask.priority || 'medium'}
											</span>
										</div>
									</div>

									<div className="space-y-1">
										<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
											Due Date
										</span>
										<div className="flex items-center gap-2 text-gray-900 font-medium">
											<Calendar size={16} className="text-blue-500" />
											{viewingTask.dueDate ? new Date(viewingTask.dueDate).toLocaleDateString() : 'No due date'}
										</div>
									</div>

									<div className="space-y-1">
										<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
											Category
										</span>
										<div className="text-gray-900 font-medium">
											{viewingTask.category || 'General'}
										</div>
									</div>

									<div className="space-y-1">
										<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
											Assigned To
										</span>
										<div className="text-gray-900 font-semibold">
											{typeof viewingTask.assignedTo === 'object' ?
												viewingTask.assignedTo.name :
												viewingTask.assignedToName || 'Unknown'
											}
										</div>
									</div>

									<div className="space-y-1">
										<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
											Assigned By
										</span>
										<div className="text-gray-900 font-semibold">
											{viewingTask.assignedByName || viewingTask.assignedBy || 'System'}
										</div>
									</div>

									<div className="space-y-1">
										<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
											Time Spent
										</span>
										<div className="flex items-center gap-2 text-gray-900 font-medium">
											<Clock size={16} className="text-blue-500" />
											{formatTime(getCurrentTime(viewingTask))}
										</div>
									</div>
								</div>

								{/* Timer Controls in Modal */}
								{user?.role === 'employee' && viewingTask.status !== 'completed' && (
									<div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
										<h4 className="font-semibold text-blue-900 mb-3">Task Timer</h4>
										<div className="flex items-center gap-4">
											<div className="text-2xl font-mono text-blue-800">
												{formatTime(getCurrentTime(viewingTask))}
											</div>
											<button
												onClick={() => {
													handleToggleTimer(viewingTask);
													// Update the viewing task to reflect changes
													setViewingTask(prev => ({
														...prev,
														status: activeTimers[viewingTask._id || viewingTask.id] ? 'in-progress' : prev?.status,
														timeSpent: getCurrentTime(viewingTask)
													}));
												}}
												className={`px-4 py-2 rounded font-medium flex items-center gap-2 ${activeTimers[viewingTask._id || viewingTask.id]
													? 'bg-red-500 hover:bg-red-600 text-white'
													: 'bg-green-500 hover:bg-green-600 text-white'
													}`}
											>
												{activeTimers[viewingTask._id || viewingTask.id] ? (
													<>
														<Pause size={18} />
														Pause Timer
													</>
												) : (
													<>
														<Play size={18} />
														Start Timer
													</>
												)}
											</button>

											{viewingTask.status === 'in-progress' && (
												<button
													onClick={() => {
														handleMarkCompleted(viewingTask);
														handleCloseViewModal();
													}}
													className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded font-medium flex items-center gap-2"
												>
													<CheckCircle size={18} />
													Mark Completed
												</button>
											)}
										</div>
									</div>
								)}

								{/* Close Button */}
								<div className="flex justify-end pt-4 border-t border-gray-100">
									<button
										onClick={handleCloseViewModal}
										className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm"
									>
										Close
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}