// import { useState, useEffect } from 'react';

// import {
//     Search,
//     Filter,
//     ChevronDown,
//     Bell,
//     User,
//     Settings,
//     LogOut,
//     Calendar,
//     Paperclip,
//     Eye,
//     Edit,
//     Trash2,
//     MoreVertical,
//     Users,
//     Clock,
//     Plus,
//     X,
//     Building2,
//     Tag,
//     DollarSign
// } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
// import { clientService, ClientPayload } from '../services/clientServices';

// // Types
// interface ClientTask {
//     id: string;
//     clientName: string;
//     key: string;
//     taskName: string;
//     priority: 'High' | 'Medium' | 'Low';
//     status: 'Work In Progress' | 'Waiting For Feedback' | 'Completed';
//     tags: string[];
//     loggedBy: string;
//     dueDate: string;
//     lastActivity: string;
//     attachments: number;
//     description?: string;
//     estimatedHours?: number;
//     loggedHours?: number;
//     cost?: number;
// }

// interface ClientCard {
//     id: string;
//     _id?: string; // MongoDB ID from backend
//     name: string;
//     status: 'Work In Progress' | 'Waiting For Feedback' | 'Completed';
//     tags: string[];
//     taskCounts: {
//         high: number;
//         medium: number;
//         low: number;
//     };
//     subTasks: number;
//     startDate: string;
//     teamMembers: string[];
//     industry?: string;
//     assignedEmployees?: string[];
//     costingNotes?: string;
//     // Backend fields
//     company?: string;
//     contactPerson?: string;
//     email?: string;
//     phone?: string;
//     address?: string;
//     projects?: number;
// }

// // Sample Data
// const workstreams = [
//     'All Workstreams',
//     'CSP (Service Desk)',
//     'DesignSprint Module',
//     'JG-General',
//     'Meridiene',
//     'StoryBoard (AMT)',
//     'PCB: CMS',
//     'PCB: Costing Tool',
//     'PCB: General',
//     'PRD Generator',
//     'TX Labs Website'
// ];

// const initialClientCards: ClientCard[] = [
//     {
//         id: '1',
//         name: 'Meridiene',
//         status: 'Work In Progress',
//         tags: ['#HRData', '#User', '#Animations'],
//         taskCounts: { high: 8, medium: 12, low: 5 },
//         subTasks: 45,
//         startDate: '2024-01-15',
//         teamMembers: ['HV', 'PP', 'MJ', 'RZ'],
//         industry: 'HR Technology',
//         assignedEmployees: ['Hitesh Vaghela', 'Parth Patadiya', 'Manav Jotangiya', 'Ravirajsingh Zala'],
//         costingNotes: 'Fixed monthly retainer + hourly billing for additional features'
//     },
//     {
//         id: '2',
//         name: 'StoryBoard (AMT)',
//         status: 'Work In Progress',
//         tags: ['#Design', '#UX', '#Frontend'],
//         taskCounts: { high: 15, medium: 8, low: 3 },
//         subTasks: 62,
//         startDate: '2024-02-01',
//         teamMembers: ['HV', 'MJ', 'PP'],
//         industry: 'Media & Entertainment',
//         assignedEmployees: ['Hitesh Vaghela', 'Manav Jotangiya', 'Parth Patadiya'],
//         costingNotes: 'Project-based pricing with milestone payments'
//     },
//     {
//         id: '3',
//         name: 'PCB – Costing Tool',
//         status: 'Waiting For Feedback',
//         tags: ['#Backend', '#API', '#Database'],
//         taskCounts: { high: 3, medium: 10, low: 7 },
//         subTasks: 28,
//         startDate: '2024-03-10',
//         teamMembers: ['RZ', 'PP'],
//         industry: 'Manufacturing',
//         assignedEmployees: ['Ravirajsingh Zala', 'Parth Patadiya'],
//         costingNotes: 'Time & materials basis with weekly invoicing'
//     }
// ];

// const clientTasks: ClientTask[] = [
//     {
//         id: '1',
//         clientName: 'StoryBoard (AMT)',
//         key: 'SB-101',
//         taskName: 'Storyboard 3.0',
//         priority: 'High',
//         status: 'Work In Progress',
//         tags: ['Design', 'UX', 'Frontend'],
//         loggedBy: 'Hitesh Vaghela',
//         dueDate: '31/12/2025',
//         lastActivity: '28/01/2025',
//         attachments: 5,
//         description: 'Complete redesign of Storyboard interface with new features',
//         estimatedHours: 120,
//         loggedHours: 45,
//         cost: 15000
//     },
//     {
//         id: '2',
//         clientName: 'PCB – Costing Tool',
//         key: 'PCB-205',
//         taskName: 'Warning icon appearing next to price',
//         priority: 'Medium',
//         status: 'Completed',
//         tags: ['Bug Fix', 'Frontend'],
//         loggedBy: 'Ravirajsingh Zala',
//         dueDate: '15/01/2025',
//         lastActivity: '20/01/2025',
//         attachments: 2,
//         description: 'Fix warning icon display issue in pricing module',
//         estimatedHours: 8,
//         loggedHours: 6,
//         cost: 2400
//     },
//     {
//         id: '3',
//         clientName: 'Meridiene',
//         key: 'MER-342',
//         taskName: 'HR Data Integration',
//         priority: 'High',
//         status: 'Work In Progress',
//         tags: ['Backend', 'API', 'Integration'],
//         loggedBy: 'Manav Jotangiya',
//         dueDate: '10/02/2025',
//         lastActivity: '29/01/2025',
//         attachments: 8,
//         description: 'Integrate HR data from external system',
//         estimatedHours: 80,
//         loggedHours: 32,
//         cost: 12000
//     },
//     {
//         id: '4',
//         clientName: 'Meridiene',
//         key: 'MER-345',
//         taskName: 'User Authentication Module',
//         priority: 'High',
//         status: 'Waiting For Feedback',
//         tags: ['Security', 'Backend'],
//         loggedBy: 'Parth Patadiya',
//         dueDate: '05/02/2025',
//         lastActivity: '27/01/2025',
//         attachments: 3,
//         description: 'Implement secure user authentication system',
//         estimatedHours: 60,
//         loggedHours: 55,
//         cost: 9000
//     },
//     {
//         id: '5',
//         clientName: 'StoryBoard (AMT)',
//         key: 'SB-108',
//         taskName: 'Animation Library Setup',
//         priority: 'Medium',
//         status: 'Work In Progress',
//         tags: ['Frontend', 'Animations'],
//         loggedBy: 'Hitesh Vaghela',
//         dueDate: '25/02/2025',
//         lastActivity: '30/01/2025',
//         attachments: 4,
//         description: 'Set up and configure animation library for smooth transitions',
//         estimatedHours: 40,
//         loggedHours: 15,
//         cost: 6000
//     },
//     {
//         id: '6',
//         clientName: 'PCB: CMS',
//         key: 'CMS-445',
//         taskName: 'Content Management Dashboard',
//         priority: 'High',
//         status: 'Work In Progress',
//         tags: ['Dashboard', 'Frontend', 'UX'],
//         loggedBy: 'Manav Jotangiya',
//         dueDate: '20/02/2025',
//         lastActivity: '29/01/2025',
//         attachments: 6,
//         description: 'Build comprehensive content management dashboard',
//         estimatedHours: 100,
//         loggedHours: 42,
//         cost: 16000
//     },
//     {
//         id: '7',
//         clientName: 'DesignSprint Module',
//         key: 'DS-223',
//         taskName: 'Sprint Planning Tool',
//         priority: 'Medium',
//         status: 'Completed',
//         tags: ['Planning', 'Backend'],
//         loggedBy: 'Ravirajsingh Zala',
//         dueDate: '18/01/2025',
//         lastActivity: '25/01/2025',
//         attachments: 1,
//         description: 'Develop sprint planning and tracking tool',
//         estimatedHours: 50,
//         loggedHours: 48,
//         cost: 7500
//     },
//     {
//         id: '8',
//         clientName: 'TX Labs Website',
//         key: 'TX-156',
//         taskName: 'Homepage Redesign',
//         priority: 'Low',
//         status: 'Waiting For Feedback',
//         tags: ['Design', 'Frontend'],
//         loggedBy: 'Parth Patadiya',
//         dueDate: '28/02/2025',
//         lastActivity: '26/01/2025',
//         attachments: 9,
//         description: 'Complete redesign of TX Labs homepage with modern UI',
//         estimatedHours: 70,
//         loggedHours: 62,
//         cost: 10500
//     }
// ];

// const allEmployees = ['Hitesh Vaghela', 'Parth Patadiya', 'Manav Jotangiya', 'Ravirajsingh Zala'];

// export function ClientManagementDashboard() {
//     const { user, logout } = useAuth();
//     const [selectedWorkstream, setSelectedWorkstream] = useState('All Workstreams');
//     const [showWorkstreamDropdown, setShowWorkstreamDropdown] = useState(false);
//     const [showProfileDropdown, setShowProfileDropdown] = useState(false);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [selectedTask, setSelectedTask] = useState<ClientTask | null>(null);
//     const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
//     const [editingTask, setEditingTask] = useState<ClientTask | null>(null);
//     const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
//     const [editingClient, setEditingClient] = useState<ClientCard | null>(null);
//     const [clients, setClients] = useState<ClientCard[]>([]);
//     const [selectedClientForMenu, setSelectedClientForMenu] = useState<string | null>(null);
//     const [isLoading, setIsLoading] = useState(true);

//     // Fetch clients from backend on component mount
//     useEffect(() => {
//         const fetchClients = async () => {
//             try {
//                 setIsLoading(true);

//                 const list = await clientService.getAll(); // ✅ direct array

//                 const transformedClients: ClientCard[] = list.map((client: any) => ({
//                     id: client._id,
//                     _id: client._id,

//                     name: client.company || "",
//                     company: client.company,
//                     contactPerson: client.contactPerson,
//                     email: client.email,
//                     phone: client.phone,
//                     address: client.address,
//                     industry: client.industry,
//                     projects: client.projects,

//                     status: "Work In Progress",
//                     tags: client.industry ? [`#${client.industry}`] : [],
//                     taskCounts: { high: 0, medium: 0, low: 0 },
//                     subTasks: client.projects || 0,
//                     startDate: client.createdAt
//                         ? new Date(client.createdAt).toISOString().split("T")[0]
//                         : new Date().toISOString().split("T")[0],
//                     teamMembers: [],
//                     assignedEmployees: [],
//                 }));

//                 setClients(transformedClients);
//             } catch (error) {
//                 console.error("Failed to fetch clients:", error);
//                 setClients([]); // ✅ fallback empty (dummy nahi)
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchClients();
//     }, []);


//     // New Client Form State
//     const [newClient, setNewClient] = useState({
//         name: '',
//         industry: '',
//         startDate: '',
//         tags: '',
//         assignedEmployees: [] as string[],
//         costingNotes: '',
//         email: '',
//         phone: '',
//         contactPerson: ''
//     });

//     // Check permissions
//     const canAddEditClients = user?.role === 'admin' || user?.role === 'hr';
//     const canDeleteClients = user?.role === 'admin';
//     const isEmployee = user?.role === 'employee';

//     // Filter clients based on user role
//     const filteredClients = clients.filter(client => {
//         if (isEmployee) {
//             // Employees only see clients they're assigned to
//             return client.assignedEmployees?.includes(user?.name || '');
//         }
//         return true;
//     });

//     // Filter tasks based on workstream, search, and user role
//     const filteredTasks = clientTasks.filter(task => {
//         const matchesWorkstream = selectedWorkstream === 'All Workstreams' ||
//             task.clientName === selectedWorkstream;
//         const matchesSearch = task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             task.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             task.loggedBy.toLowerCase().includes(searchTerm.toLowerCase());

//         // Employee filter - only show tasks for assigned clients
//         if (isEmployee) {
//             const assignedClient = filteredClients.find(c => c.name === task.clientName);
//             return matchesWorkstream && matchesSearch && assignedClient;
//         }

//         return matchesWorkstream && matchesSearch;
//     });

//     // Calculate stats
//     const stats = {
//         inProgress: clientTasks.filter(t => t.status === 'Work In Progress').length,
//         waitingFeedback: clientTasks.filter(t => t.status === 'Waiting For Feedback').length,
//         completed: clientTasks.filter(t => t.status === 'Completed').length
//     };

//     const handleViewTask = (task: ClientTask) => {
//         setSelectedTask(task);
//         setEditingTask(null);
//         setIsTaskModalOpen(true);
//     };

//     const handleEditTask = (task: ClientTask) => {
//         setSelectedTask(task);
//         setEditingTask({ ...task });
//         setIsTaskModalOpen(true);
//     };

//     const handleDeleteTask = (taskId: string) => {
//         if (canDeleteClients && window.confirm('Are you sure you want to delete this task?')) {
//             console.log('Delete task:', taskId);
//         }
//     };

//     const handleAddNewClient = () => {
//         setEditingClient(null);
//         setNewClient({
//             name: '',
//             industry: '',
//             startDate: '',
//             tags: '',
//             assignedEmployees: [],
//             costingNotes: '',
//             email: '',
//             phone: '',
//             contactPerson: ''
//         });
//         setIsAddClientModalOpen(true);
//     };

//     const handleEditClient = (client: ClientCard) => {
//         setEditingClient(client);
//         setNewClient({
//             name: client.name,
//             industry: client.industry || '',
//             startDate: client.startDate,
//             tags: client.tags.join(', '),
//             assignedEmployees: client.assignedEmployees || [],
//             costingNotes: client.costingNotes || '',
//             email: client.email || '',
//             phone: client.phone || '',
//             contactPerson: client.contactPerson || ''
//         });
//         setIsAddClientModalOpen(true);
//         setSelectedClientForMenu(null);
//     };

//     const handleDeleteClient = async (clientId: string) => {
//         if (!canDeleteClients) return;

//         if (window.confirm('Are you sure you want to delete this client?')) {
//             try {
//                 // Find the client to get the MongoDB _id
//                 const clientToDelete = clients.find(c => c.id === clientId);
//                 const backendId = clientToDelete?._id || clientId;

//                 console.log("🗑️ Deleting client:", backendId);
//                 await clientService.remove(backendId);
//                 console.log("✅ Client deleted");

//                 // ✅ Refresh the entire client list from backend
//                 await refreshClients();
//                 setSelectedClientForMenu(null);
//             } catch (error) {
//                 console.error('Failed to delete client:', error);
//                 alert('Failed to delete client. Please try again.');
//             }
//         }
//     };

//     const handleSaveClient = async () => {
//         if (!newClient.name || !newClient.email || !newClient.phone || !newClient.contactPerson) {
//             alert('Please fill in all required fields (Name, Email, Phone, Contact Person)');
//             return;
//         }

//         const tagsArray = newClient.tags.split(',').map(t => t.trim()).filter(t => t);
//         const teamInitials = newClient.assignedEmployees.map(emp => {
//             const parts = emp.split(' ');
//             return parts.map(p => p[0]).join('');
//         });

//         try {
//             // Prepare payload for backend
//             const payload: ClientPayload = {
//                 company: newClient.name,
//                 contactPerson: newClient.contactPerson,
//                 email: newClient.email,
//                 phone: newClient.phone,
//                 industry: newClient.industry,
//                 address: '',
//                 status: 'active',
//             };

//             if (editingClient) {
//                 // Update existing client via API
//                 console.log("📝 Updating client:", editingClient.id, "with payload:", payload);
//                 const backendId = editingClient._id || editingClient.id;
//                 await clientService.update(backendId, payload);
//                 console.log("✅ Client updated");

//                 // ✅ Refresh the entire client list from backend
//                 await refreshClients();
//             } else {
//                 // Create new client via API
//                 console.log("💾 Creating new client with payload:", payload);
//                 const createdClient = await clientService.create(payload);
//                 console.log("✅ Client created, response:", createdClient);

//                 // ✅ Refresh the entire client list from backend
//                 await refreshClients();
//             }

//             // ✅ Close modal and reset form
//             setIsAddClientModalOpen(false);
//             setEditingClient(null);
//             setNewClient({
//                 name: '',
//                 industry: '',
//                 startDate: '',
//                 tags: '',
//                 assignedEmployees: [],
//                 costingNotes: '',
//                 email: '',
//                 phone: '',
//                 contactPerson: ''
//             });
//         } catch (error) {
//             console.error('Failed to save client:', error);
//             alert('Failed to save client. Please try again.');
//         }
//     };

//     // ✅ Move refreshClients outside handleSaveClient so it can be reused
//     const refreshClients = async () => {
//         try {
//             console.log("🔄 Refreshing clients from backend...");
//             const list = await clientService.getAll();
//             console.log("📥 Received clients:", list);

//             const transformed: ClientCard[] = list.map((client: any) => ({
//                 id: client._id,
//                 _id: client._id,
//                 name: client.company || "",
//                 company: client.company,
//                 contactPerson: client.contactPerson,
//                 email: client.email,
//                 phone: client.phone,
//                 address: client.address,
//                 industry: client.industry,
//                 projects: client.projects,
//                 status: "Work In Progress",
//                 tags: client.industry ? [`#${client.industry}`] : [],
//                 taskCounts: { high: 0, medium: 0, low: 0 },
//                 subTasks: client.projects || 0,
//                 startDate: client.createdAt
//                     ? new Date(client.createdAt).toISOString().split("T")[0]
//                     : new Date().toISOString().split("T")[0],
//                 teamMembers: [],
//                 assignedEmployees: [],
//             }));

//             console.log("✅ Transformed clients:", transformed);
//             setClients(transformed);
//         } catch (error) {
//             console.error("❌ Failed to refresh clients:", error);
//         }
//     };

//     const toggleEmployeeAssignment = (employee: string) => {
//         setNewClient({
//             ...newClient,
//             assignedEmployees: newClient.assignedEmployees.includes(employee)
//                 ? newClient.assignedEmployees.filter(e => e !== employee)
//                 : [...newClient.assignedEmployees, employee]
//         });
//     };

//     const getPriorityColor = (priority: string) => {
//         switch (priority) {
//             case 'High': return 'bg-red-100 text-red-700 border-red-200';
//             case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
//             case 'Low': return 'bg-green-100 text-green-700 border-green-200';
//             default: return 'bg-gray-100 text-gray-700 border-gray-200';
//         }
//     };

//     const getStatusColor = (status: string) => {
//         switch (status) {
//             case 'Work In Progress': return 'bg-blue-100 text-blue-700';
//             case 'Waiting For Feedback': return 'bg-orange-100 text-orange-700';
//             case 'Completed': return 'bg-green-100 text-green-700';
//             default: return 'bg-gray-100 text-gray-700';
//         }
//     };

//     const getStatusIcon = (status: string) => {
//         switch (status) {
//             case 'Work In Progress': return 'bg-red-500';
//             case 'Waiting For Feedback': return 'bg-orange-500';
//             case 'Completed': return 'bg-green-500';
//             default: return 'bg-gray-500';
//         }
//     };

//     return (
//         <div className="min-h-screen bg-white">
//             {/* Header */}
//             <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
//                 <div className="flex items-center justify-between">
//                     {/* Left - Logo & Title */}
//                     <div className="flex items-center gap-8">
//                         <div>
//                             <h1 className="text-2xl font-bold text-blue-600">Error Infotech</h1>
//                             <p className="text-xs text-gray-500">Client Management</p>
//                         </div>
//                     </div>

//                     {/* Right - Notifications and Profile */}
//                     <div className="flex items-center gap-4">
//                         <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
//                             <Bell size={20} />
//                             <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
//                         </button>

//                         <div className="relative">
//                             <button
//                                 onClick={() => setShowProfileDropdown(!showProfileDropdown)}
//                                 className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
//                             >
//                                 <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
//                                     <User size={20} />
//                                 </div>
//                                 <div className="text-left">
//                                     <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
//                                     <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
//                                 </div>
//                                 <ChevronDown size={16} className="text-gray-400" />
//                             </button>

//                             {showProfileDropdown && (
//                                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
//                                     <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
//                                         <User size={16} className="text-blue-600" />
//                                         My Profile
//                                     </button>
//                                     <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
//                                         <Settings size={16} className="text-gray-400" />
//                                         Settings
//                                     </button>
//                                     <div className="border-t border-gray-100 my-1"></div>
//                                     <button
//                                         onClick={logout}
//                                         className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//                                     >
//                                         <LogOut size={16} />
//                                         Sign Out
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </header>

//             {/* Main Content */}
//             <div className="p-6 space-y-6">
//                 {/* Filter Bar */}
//                 <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-4">
//                         {/* Workstream Dropdown */}
//                         <div className="relative">
//                             <button
//                                 onClick={() => setShowWorkstreamDropdown(!showWorkstreamDropdown)}
//                                 className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
//                             >
//                                 <span className="font-medium text-gray-700">{selectedWorkstream}</span>
//                                 <ChevronDown size={20} className="text-gray-400" />
//                             </button>

//                             {showWorkstreamDropdown && (
//                                 <div className="absolute top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10 max-h-96 overflow-y-auto">
//                                     {workstreams.map((workstream) => (
//                                         <button
//                                             key={workstream}
//                                             onClick={() => {
//                                                 setSelectedWorkstream(workstream);
//                                                 setShowWorkstreamDropdown(false);
//                                             }}
//                                             className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedWorkstream === workstream ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
//                                                 }`}
//                                         >
//                                             {workstream}
//                                         </button>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>

//                         {/* Search Input */}
//                         <div className="relative">
//                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                             <input
//                                 type="text"
//                                 placeholder="Search clients..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
//                             />
//                         </div>

//                         {/* Filter Icon */}
//                         <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//                             <Filter size={18} className="text-gray-600" />
//                         </button>
//                     </div>

//                     {/* Add New Client Button (Admin & HR Only) */}
//                     {canAddEditClients && (
//                         <button
//                             onClick={handleAddNewClient}
//                             className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
//                         >
//                             <Plus size={18} />
//                             <span>Add New Client</span>
//                         </button>
//                     )}
//                 </div>

//                 {/* Status Summary Cards */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-gray-600 mb-1">Work In Progress</p>
//                                 <p className="text-3xl font-bold text-red-600">{stats.inProgress}</p>
//                             </div>
//                             <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
//                                 <Clock className="w-6 h-6 text-red-600" />
//                             </div>
//                         </div>
//                     </div>

//                     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-gray-600 mb-1">Waiting For Feedback</p>
//                                 <p className="text-3xl font-bold text-yellow-600">{stats.waitingFeedback}</p>
//                             </div>
//                             <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
//                                 <Users className="w-6 h-6 text-yellow-600" />
//                             </div>
//                         </div>
//                     </div>

//                     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-gray-600 mb-1">Completed</p>
//                                 <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
//                             </div>
//                             <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//                                 <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                 </svg>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Projects / Clients Section */}
//                 <div>
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Projects / Clients</h3>

//                     {isLoading ? (
//                         <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
//                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                             <p className="text-gray-500">Loading clients...</p>
//                         </div>
//                     ) : (
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                             {filteredClients.map((client) => (
//                                 <div key={client.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
//                                     <div className="flex items-start justify-between mb-4">
//                                         <div>
//                                             <h4 className="text-lg font-semibold text-gray-800">{client.name}</h4>
//                                             <div className="flex items-center gap-2 mt-1">
//                                                 <div className={`w-2 h-2 rounded-full ${getStatusIcon(client.status)}`}></div>
//                                                 <span className="text-xs text-gray-600">{client.status}</span>
//                                             </div>
//                                         </div>
//                                         {/* 3-dot menu only for Admin & HR */}
//                                         {canAddEditClients && (
//                                             <div className="relative">
//                                                 <button
//                                                     onClick={() => setSelectedClientForMenu(selectedClientForMenu === client.id ? null : client.id)}
//                                                     className="p-1 hover:bg-gray-100 rounded"
//                                                 >
//                                                     <MoreVertical size={18} className="text-gray-400" />
//                                                 </button>
//                                                 {selectedClientForMenu === client.id && (
//                                                     <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
//                                                         <button
//                                                             onClick={() => handleEditClient(client)}
//                                                             className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                                                         >
//                                                             <Edit size={14} />
//                                                             Edit Client
//                                                         </button>
//                                                         {canDeleteClients && (
//                                                             <button
//                                                                 onClick={() => handleDeleteClient(client.id)}
//                                                                 className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//                                                             >
//                                                                 <Trash2 size={14} />
//                                                                 Delete Client
//                                                             </button>
//                                                         )}
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         )}
//                                     </div>

//                                     <div className="flex flex-wrap gap-2 mb-4">
//                                         {client.tags.map((tag, idx) => (
//                                             <span key={idx} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded">
//                                                 {tag}
//                                             </span>
//                                         ))}
//                                     </div>

//                                     <div className="space-y-3 mb-4">
//                                         <div className="flex items-center justify-between text-sm">
//                                             <span className="text-gray-600">Client Tasks</span>
//                                             <div className="flex items-center gap-2">
//                                                 <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
//                                                     {client.taskCounts.high}
//                                                 </span>
//                                                 <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
//                                                     {client.taskCounts.medium}
//                                                 </span>
//                                                 <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
//                                                     {client.taskCounts.low}
//                                                 </span>
//                                             </div>
//                                         </div>

//                                         <div className="flex items-center justify-between text-sm">
//                                             <span className="text-gray-600">Sub Tasks</span>
//                                             <span className="font-medium text-gray-800">{client.subTasks}</span>
//                                         </div>

//                                         <div className="flex items-center justify-between text-sm">
//                                             <span className="text-gray-600">Start Date</span>
//                                             <span className="text-gray-800">{client.startDate}</span>
//                                         </div>
//                                     </div>

//                                     <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
//                                         <span className="text-xs text-gray-600">Team:</span>
//                                         <div className="flex -space-x-2">
//                                             {client.teamMembers.map((member, idx) => (
//                                                 <div
//                                                     key={idx}
//                                                     className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
//                                                     title={client.assignedEmployees?.[idx]}
//                                                 >
//                                                     {member}
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}

//                     {!isLoading && filteredClients.length === 0 && (
//                         <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
//                             <p>No clients found. {canAddEditClients ? 'Click "Add New Client" to get started.' : 'Contact your administrator for access.'}</p>
//                         </div>
//                     )}
//                 </div>

//                 {/* Current Client Log Table */}
//                 <div>
//                     <div className="flex items-center justify-between mb-4">
//                         <h3 className="text-lg font-semibold text-gray-800">Current Client Log</h3>
//                     </div>

//                     <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//                         <div className="overflow-x-auto">
//                             <table className="w-full">
//                                 <thead className="bg-gray-50 border-b border-gray-200">
//                                     <tr>
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Client Name</th>
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Key</th>
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Task Name</th>
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Priority</th>
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Topic Tags</th>
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Logged By</th>
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Due Date</th>
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Last Activity</th>
//                                         <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Attachments</th>
//                                         <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-200">
//                                     {filteredTasks.map((task) => (
//                                         <tr key={task.id} className="hover:bg-gray-50 transition-colors">
//                                             <td className="px-4 py-4 text-sm font-medium text-gray-800">{task.clientName}</td>
//                                             <td className="px-4 py-4 text-sm text-blue-600 font-medium">{task.key}</td>
//                                             <td className="px-4 py-4 text-sm text-gray-800">{task.taskName}</td>
//                                             <td className="px-4 py-4">
//                                                 <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getPriorityColor(task.priority)}`}>
//                                                     {task.priority}
//                                                 </span>
//                                             </td>
//                                             <td className="px-4 py-4">
//                                                 <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(task.status)}`}>
//                                                     {task.status}
//                                                 </span>
//                                             </td>
//                                             <td className="px-4 py-4">
//                                                 <div className="flex flex-wrap gap-1">
//                                                     {task.tags.map((tag, idx) => (
//                                                         <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
//                                                             {tag}
//                                                         </span>
//                                                     ))}
//                                                 </div>
//                                             </td>
//                                             <td className="px-4 py-4 text-sm text-gray-700">{task.loggedBy}</td>
//                                             <td className="px-4 py-4 text-sm text-gray-700">{task.dueDate}</td>
//                                             <td className="px-4 py-4 text-sm text-gray-600">{task.lastActivity}</td>
//                                             <td className="px-4 py-4 text-center">
//                                                 <div className="flex items-center justify-center gap-1">
//                                                     <Paperclip size={14} className="text-gray-400" />
//                                                     <span className="text-sm text-gray-600">{task.attachments}</span>
//                                                 </div>
//                                             </td>
//                                             <td className="px-4 py-4">
//                                                 <div className="flex items-center justify-center gap-2">
//                                                     <button
//                                                         onClick={() => handleViewTask(task)}
//                                                         className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
//                                                         title="View"
//                                                     >
//                                                         <Eye size={16} />
//                                                     </button>
//                                                     {canAddEditClients && (
//                                                         <>
//                                                             <button
//                                                                 onClick={() => handleEditTask(task)}
//                                                                 className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
//                                                                 title="Edit"
//                                                             >
//                                                                 <Edit size={16} />
//                                                             </button>
//                                                             {canDeleteClients && (
//                                                                 <button
//                                                                     onClick={() => handleDeleteTask(task.id)}
//                                                                     className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
//                                                                     title="Delete"
//                                                                 >
//                                                                     <Trash2 size={16} />
//                                                                 </button>
//                                                             )}
//                                                         </>
//                                                     )}
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>

//                         {filteredTasks.length === 0 && (
//                             <div className="text-center py-12 text-gray-500">
//                                 <p>No tasks found matching your criteria.</p>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Add/Edit Client Modal */}
//             {isAddClientModalOpen && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//                         <div className="p-6 border-b border-gray-200">
//                             <div className="flex items-center justify-between">
//                                 <h3 className="text-xl font-semibold text-gray-800">
//                                     {editingClient ? 'Edit Client' : 'Add New Client'}
//                                 </h3>
//                                 <button
//                                     onClick={() => setIsAddClientModalOpen(false)}
//                                     className="p-1 hover:bg-gray-100 rounded"
//                                 >
//                                     <X size={20} className="text-gray-400" />
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="p-6 space-y-6">
//                             {/* Client Name */}
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Client Name <span className="text-red-500">*</span>
//                                 </label>
//                                 <div className="relative">
//                                     <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                                     <input
//                                         type="text"
//                                         value={newClient.name}
//                                         onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
//                                         className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                         placeholder="Enter client name"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Contact Person */}
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Contact Person <span className="text-red-500">*</span>
//                                 </label>
//                                 <div className="relative">
//                                     <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                                     <input
//                                         type="text"
//                                         value={newClient.contactPerson}
//                                         onChange={(e) => setNewClient({ ...newClient, contactPerson: e.target.value })}
//                                         className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                         placeholder="Enter contact person name"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Email */}
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Email <span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                     type="email"
//                                     value={newClient.email}
//                                     onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     placeholder="Enter email address"
//                                 />
//                             </div>

//                             {/* Phone */}
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Phone <span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                     type="tel"
//                                     value={newClient.phone}
//                                     onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     placeholder="Enter phone number"
//                                 />
//                             </div>

//                             {/* Industry */}
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Industry
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={newClient.industry}
//                                     onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     placeholder="e.g., Technology, Healthcare, Finance"
//                                 />
//                             </div>

//                             {/* Start Date */}
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Start Date
//                                 </label>
//                                 <div className="relative">
//                                     <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                                     <input
//                                         type="date"
//                                         value={newClient.startDate}
//                                         onChange={(e) => setNewClient({ ...newClient, startDate: e.target.value })}
//                                         className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Tags */}
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Tags
//                                 </label>
//                                 <div className="relative">
//                                     <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                                     <input
//                                         type="text"
//                                         value={newClient.tags}
//                                         onChange={(e) => setNewClient({ ...newClient, tags: e.target.value })}
//                                         className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                         placeholder="Enter tags separated by commas (e.g., Design, UX, Frontend)"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Assigned Employees */}
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Assigned Employees
//                                 </label>
//                                 <div className="grid grid-cols-2 gap-2">
//                                     {allEmployees.map((employee) => (
//                                         <button
//                                             key={employee}
//                                             onClick={() => toggleEmployeeAssignment(employee)}
//                                             className={`px-4 py-2 rounded-lg text-sm border transition-colors ${newClient.assignedEmployees.includes(employee)
//                                                 ? 'bg-blue-50 border-blue-500 text-blue-700'
//                                                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
//                                                 }`}
//                                         >
//                                             {employee}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>

//                             {/* Costing Notes (Admin & HR Only) */}
//                             {canAddEditClients && (
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Costing Rules & Notes
//                                     </label>
//                                     <div className="relative">
//                                         <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
//                                         <textarea
//                                             value={newClient.costingNotes}
//                                             onChange={(e) => setNewClient({ ...newClient, costingNotes: e.target.value })}
//                                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
//                                             placeholder="Enter billing rates, payment terms, and costing notes..."
//                                         />
//                                     </div>
//                                     <p className="text-xs text-gray-500 mt-1">
//                                         This information is only visible to Admin and HR
//                                     </p>
//                                 </div>
//                             )}
//                         </div>

//                         <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
//                             <button
//                                 onClick={() => setIsAddClientModalOpen(false)}
//                                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleSaveClient}
//                                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                             >
//                                 {editingClient ? 'Update Client' : 'Add Client'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Task Details Modal */}
//             {isTaskModalOpen && selectedTask && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
//                         <div className="p-6 border-b border-gray-200">
//                             <div className="flex items-center justify-between">
//                                 <h3 className="text-xl font-semibold text-gray-800">
//                                     {editingTask ? 'Edit Task' : 'Task Details'}
//                                 </h3>
//                                 <button
//                                     onClick={() => {
//                                         setIsTaskModalOpen(false);
//                                         setSelectedTask(null);
//                                         setEditingTask(null);
//                                     }}
//                                     className="p-1 hover:bg-gray-100 rounded"
//                                 >
//                                     <X size={20} className="text-gray-400" />
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="p-6 space-y-4">
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-600 mb-1">Client Name</label>
//                                     <p className="text-gray-900">{selectedTask.clientName}</p>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-600 mb-1">Task Key</label>
//                                     <p className="text-blue-600 font-medium">{selectedTask.key}</p>
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-600 mb-1">Task Name</label>
//                                 {editingTask ? (
//                                     <input
//                                         type="text"
//                                         value={editingTask.taskName}
//                                         onChange={(e) => setEditingTask({ ...editingTask, taskName: e.target.value })}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     />
//                                 ) : (
//                                     <p className="text-gray-900">{selectedTask.taskName}</p>
//                                 )}
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
//                                 {editingTask ? (
//                                     <textarea
//                                         value={editingTask.description || ''}
//                                         onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
//                                     />
//                                 ) : (
//                                     <p className="text-gray-900">{selectedTask.description}</p>
//                                 )}
//                             </div>

//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-600 mb-1">Priority</label>
//                                     {editingTask ? (
//                                         <select
//                                             value={editingTask.priority}
//                                             onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as any })}
//                                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                         >
//                                             <option value="High">High</option>
//                                             <option value="Medium">Medium</option>
//                                             <option value="Low">Low</option>
//                                         </select>
//                                     ) : (
//                                         <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getPriorityColor(selectedTask.priority)}`}>
//                                             {selectedTask.priority}
//                                         </span>
//                                     )}
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
//                                     {editingTask ? (
//                                         <select
//                                             value={editingTask.status}
//                                             onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as any })}
//                                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                         >
//                                             <option value="Work In Progress">Work In Progress</option>
//                                             <option value="Waiting For Feedback">Waiting For Feedback</option>
//                                             <option value="Completed">Completed</option>
//                                         </select>
//                                     ) : (
//                                         <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
//                                             {selectedTask.status}
//                                         </span>
//                                     )}
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-600 mb-1">Due Date</label>
//                                     <p className="text-gray-900">{selectedTask.dueDate}</p>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-600 mb-1">Logged By</label>
//                                     <p className="text-gray-900">{selectedTask.loggedBy}</p>
//                                 </div>
//                             </div>

//                             {canAddEditClients && (
//                                 <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-600 mb-1">Estimated Hours</label>
//                                         <p className="text-gray-900">{selectedTask.estimatedHours || 0}h</p>
//                                     </div>
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-600 mb-1">Logged Hours</label>
//                                         <p className="text-gray-900">{selectedTask.loggedHours || 0}h</p>
//                                     </div>
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-600 mb-1">Cost</label>
//                                         <p className="text-gray-900">${selectedTask.cost?.toLocaleString() || 0}</p>
//                                     </div>
//                                 </div>
//                             )}

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-600 mb-1">Tags</label>
//                                 <div className="flex flex-wrap gap-2">
//                                     {selectedTask.tags.map((tag, idx) => (
//                                         <span key={idx} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded">
//                                             {tag}
//                                         </span>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
//                             {editingTask ? (
//                                 <>
//                                     <button
//                                         onClick={() => {
//                                             setEditingTask(null);
//                                         }}
//                                         className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//                                     >
//                                         Cancel
//                                     </button>
//                                     <button
//                                         onClick={() => {
//                                             console.log('Save task:', editingTask);
//                                             setIsTaskModalOpen(false);
//                                             setEditingTask(null);
//                                         }}
//                                         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                                     >
//                                         Save Changes
//                                     </button>
//                                 </>
//                             ) : (
//                                 <button
//                                     onClick={() => setIsTaskModalOpen(false)}
//                                     className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//                                 >
//                                     Close
//                                 </button>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }


import { useState } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  Bell,
  User,
  Settings,
  LogOut,
  Calendar,
  Paperclip,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Users,
  Clock,
  Plus,
  X,
  Building2,
  Tag,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Types
interface ClientTask {
  id: string;
  clientName: string;
  key: string;
  taskName: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Work In Progress' | 'Waiting For Feedback' | 'Completed';
  tags: string[];
  loggedBy: string;
  dueDate: string;
  lastActivity: string;
  attachments: number;
  description?: string;
  estimatedHours?: number;
  loggedHours?: number;
  cost?: number;
}

interface ClientCard {
  id: string;
  name: string;
  status: 'Work In Progress' | 'Waiting For Feedback' | 'Completed';
  tags: string[];
  taskCounts: {
    high: number;
    medium: number;
    low: number;
  };
  subTasks: number;
  startDate: string;
  teamMembers: string[];
  industry?: string;
  assignedEmployees?: string[];
  costingNotes?: string;
}

// Sample Data
const workstreams = [
  'All Workstreams',
  'CSP (Service Desk)',
  'DesignSprint Module',
  'JG-General',
  'Meridiene',
  'StoryBoard (AMT)',
  'PCB: CMS',
  'PCB: Costing Tool',
  'PCB: General',
  'PRD Generator',
  'TX Labs Website'
];

const initialClientCards: ClientCard[] = [
  {
    id: '1',
    name: 'Meridiene',
    status: 'Work In Progress',
    tags: ['#HRData', '#User', '#Animations'],
    taskCounts: { high: 8, medium: 12, low: 5 },
    subTasks: 45,
    startDate: '2024-01-15',
    teamMembers: ['HV', 'PP', 'MJ', 'RZ'],
    industry: 'HR Technology',
    assignedEmployees: ['Hitesh Vaghela', 'Parth Patadiya', 'Manav Jotangiya', 'Ravirajsingh Zala'],
    costingNotes: 'Fixed monthly retainer + hourly billing for additional features'
  },
  {
    id: '2',
    name: 'StoryBoard (AMT)',
    status: 'Work In Progress',
    tags: ['#Design', '#UX', '#Frontend'],
    taskCounts: { high: 15, medium: 8, low: 3 },
    subTasks: 62,
    startDate: '2024-02-01',
    teamMembers: ['HV', 'MJ', 'PP'],
    industry: 'Media & Entertainment',
    assignedEmployees: ['Hitesh Vaghela', 'Manav Jotangiya', 'Parth Patadiya'],
    costingNotes: 'Project-based pricing with milestone payments'
  },
  {
    id: '3',
    name: 'PCB – Costing Tool',
    status: 'Waiting For Feedback',
    tags: ['#Backend', '#API', '#Database'],
    taskCounts: { high: 3, medium: 10, low: 7 },
    subTasks: 28,
    startDate: '2024-03-10',
    teamMembers: ['RZ', 'PP'],
    industry: 'Manufacturing',
    assignedEmployees: ['Ravirajsingh Zala', 'Parth Patadiya'],
    costingNotes: 'Time & materials basis with weekly invoicing'
  }
];

const clientTasks: ClientTask[] = [
  {
    id: '1',
    clientName: 'StoryBoard (AMT)',
    key: 'SB-101',
    taskName: 'Storyboard 3.0',
    priority: 'High',
    status: 'Work In Progress',
    tags: ['Design', 'UX', 'Frontend'],
    loggedBy: 'Hitesh Vaghela',
    dueDate: '31/12/2025',
    lastActivity: '28/01/2025',
    attachments: 5,
    description: 'Complete redesign of Storyboard interface with new features',
    estimatedHours: 120,
    loggedHours: 45,
    cost: 15000
  },
  {
    id: '2',
    clientName: 'PCB – Costing Tool',
    key: 'PCB-205',
    taskName: 'Warning icon appearing next to price',
    priority: 'Medium',
    status: 'Completed',
    tags: ['Bug Fix', 'Frontend'],
    loggedBy: 'Ravirajsingh Zala',
    dueDate: '15/01/2025',
    lastActivity: '20/01/2025',
    attachments: 2,
    description: 'Fix warning icon display issue in pricing module',
    estimatedHours: 8,
    loggedHours: 6,
    cost: 2400
  },
  {
    id: '3',
    clientName: 'Meridiene',
    key: 'MER-342',
    taskName: 'HR Data Integration',
    priority: 'High',
    status: 'Work In Progress',
    tags: ['Backend', 'API', 'Integration'],
    loggedBy: 'Manav Jotangiya',
    dueDate: '10/02/2025',
    lastActivity: '29/01/2025',
    attachments: 8,
    description: 'Integrate HR data from external system',
    estimatedHours: 80,
    loggedHours: 32,
    cost: 12000
  },
  {
    id: '4',
    clientName: 'Meridiene',
    key: 'MER-345',
    taskName: 'User Authentication Module',
    priority: 'High',
    status: 'Waiting For Feedback',
    tags: ['Security', 'Backend'],
    loggedBy: 'Parth Patadiya',
    dueDate: '05/02/2025',
    lastActivity: '27/01/2025',
    attachments: 3,
    description: 'Implement secure user authentication system',
    estimatedHours: 60,
    loggedHours: 55,
    cost: 9000
  },
  {
    id: '5',
    clientName: 'StoryBoard (AMT)',
    key: 'SB-108',
    taskName: 'Animation Library Setup',
    priority: 'Medium',
    status: 'Work In Progress',
    tags: ['Frontend', 'Animations'],
    loggedBy: 'Hitesh Vaghela',
    dueDate: '25/02/2025',
    lastActivity: '30/01/2025',
    attachments: 4,
    description: 'Set up and configure animation library for smooth transitions',
    estimatedHours: 40,
    loggedHours: 15,
    cost: 6000
  },
  {
    id: '6',
    clientName: 'PCB: CMS',
    key: 'CMS-445',
    taskName: 'Content Management Dashboard',
    priority: 'High',
    status: 'Work In Progress',
    tags: ['Dashboard', 'Frontend', 'UX'],
    loggedBy: 'Manav Jotangiya',
    dueDate: '20/02/2025',
    lastActivity: '29/01/2025',
    attachments: 6,
    description: 'Build comprehensive content management dashboard',
    estimatedHours: 100,
    loggedHours: 42,
    cost: 16000
  },
  {
    id: '7',
    clientName: 'DesignSprint Module',
    key: 'DS-223',
    taskName: 'Sprint Planning Tool',
    priority: 'Medium',
    status: 'Completed',
    tags: ['Planning', 'Backend'],
    loggedBy: 'Ravirajsingh Zala',
    dueDate: '18/01/2025',
    lastActivity: '25/01/2025',
    attachments: 1,
    description: 'Develop sprint planning and tracking tool',
    estimatedHours: 50,
    loggedHours: 48,
    cost: 7500
  },
  {
    id: '8',
    clientName: 'TX Labs Website',
    key: 'TX-156',
    taskName: 'Homepage Redesign',
    priority: 'Low',
    status: 'Waiting For Feedback',
    tags: ['Design', 'Frontend'],
    loggedBy: 'Parth Patadiya',
    dueDate: '28/02/2025',
    lastActivity: '26/01/2025',
    attachments: 9,
    description: 'Complete redesign of TX Labs homepage with modern UI',
    estimatedHours: 70,
    loggedHours: 62,
    cost: 10500
  }
];

const allEmployees = ['Hitesh Vaghela', 'Parth Patadiya', 'Manav Jotangiya', 'Ravirajsingh Zala'];

export function ClientManagementDashboard() {
  const { user, logout } = useAuth();
  const [selectedWorkstream, setSelectedWorkstream] = useState('All Workstreams');
  const [showWorkstreamDropdown, setShowWorkstreamDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<ClientTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ClientTask | null>(null);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientCard | null>(null);
  const [clients, setClients] = useState<ClientCard[]>(initialClientCards);
  const [selectedClientForMenu, setSelectedClientForMenu] = useState<string | null>(null);

  // New Client Form State
  const [newClient, setNewClient] = useState({
    name: '',
    industry: '',
    startDate: '',
    tags: '',
    assignedEmployees: [] as string[],
    costingNotes: ''
  });

  // Check permissions
  const canAddEditClients = user?.role === 'admin' || user?.role === 'hr';
  const canDeleteClients = user?.role === 'admin';
  const isEmployee = user?.role === 'employee';

  // Filter clients based on user role
  const filteredClients = clients.filter(client => {
    if (isEmployee) {
      // Employees only see clients they're assigned to
      return client.assignedEmployees?.includes(user?.name || '');
    }
    return true;
  });

  // Filter tasks based on workstream, search, and user role
  const filteredTasks = clientTasks.filter(task => {
    const matchesWorkstream = selectedWorkstream === 'All Workstreams' ||
      task.clientName === selectedWorkstream;
    const matchesSearch = task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.loggedBy.toLowerCase().includes(searchTerm.toLowerCase());

    // Employee filter - only show tasks for assigned clients
    if (isEmployee) {
      const assignedClient = filteredClients.find(c => c.name === task.clientName);
      return matchesWorkstream && matchesSearch && assignedClient;
    }

    return matchesWorkstream && matchesSearch;
  });

  // Calculate stats
  const stats = {
    inProgress: clientTasks.filter(t => t.status === 'Work In Progress').length,
    waitingFeedback: clientTasks.filter(t => t.status === 'Waiting For Feedback').length,
    completed: clientTasks.filter(t => t.status === 'Completed').length
  };

  const handleViewTask = (task: ClientTask) => {
    setSelectedTask(task);
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: ClientTask) => {
    setSelectedTask(task);
    setEditingTask({ ...task });
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (canDeleteClients && window.confirm('Are you sure you want to delete this task?')) {
      console.log('Delete task:', taskId);
    }
  };

  const handleAddNewClient = () => {
    setEditingClient(null);
    setNewClient({
      name: '',
      industry: '',
      startDate: '',
      tags: '',
      assignedEmployees: [],
      costingNotes: ''
    });
    setIsAddClientModalOpen(true);
  };

  const handleEditClient = (client: ClientCard) => {
    setEditingClient(client);
    setNewClient({
      name: client.name,
      industry: client.industry || '',
      startDate: client.startDate,
      tags: client.tags.join(', '),
      assignedEmployees: client.assignedEmployees || [],
      costingNotes: client.costingNotes || ''
    });
    setIsAddClientModalOpen(true);
    setSelectedClientForMenu(null);
  };

  const handleDeleteClient = (clientId: string) => {
    if (canDeleteClients && window.confirm('Are you sure you want to delete this client?')) {
      setClients(clients.filter(c => c.id !== clientId));
      setSelectedClientForMenu(null);
    }
  };

  const handleSaveClient = () => {
    if (!newClient.name || !newClient.startDate) {
      alert('Please fill in all required fields');
      return;
    }

    const tagsArray = newClient.tags.split(',').map(t => t.trim()).filter(t => t);
    const teamInitials = newClient.assignedEmployees.map(emp => {
      const parts = emp.split(' ');
      return parts.map(p => p[0]).join('');
    });

    if (editingClient) {
      // Update existing client
      setClients(clients.map(c =>
        c.id === editingClient.id
          ? {
            ...c,
            name: newClient.name,
            industry: newClient.industry,
            startDate: newClient.startDate,
            tags: tagsArray.map(t => t.startsWith('#') ? t : `#${t}`),
            assignedEmployees: newClient.assignedEmployees,
            teamMembers: teamInitials,
            costingNotes: newClient.costingNotes
          }
          : c
      ));
    } else {
      // Add new client
      const newClientData: ClientCard = {
        id: Date.now().toString(),
        name: newClient.name,
        status: 'Work In Progress',
        tags: tagsArray.map(t => t.startsWith('#') ? t : `#${t}`),
        taskCounts: { high: 0, medium: 0, low: 0 },
        subTasks: 0,
        startDate: newClient.startDate,
        teamMembers: teamInitials,
        industry: newClient.industry,
        assignedEmployees: newClient.assignedEmployees,
        costingNotes: newClient.costingNotes
      };
      setClients([...clients, newClientData]);
    }

    setIsAddClientModalOpen(false);
  };

  const toggleEmployeeAssignment = (employee: string) => {
    setNewClient({
      ...newClient,
      assignedEmployees: newClient.assignedEmployees.includes(employee)
        ? newClient.assignedEmployees.filter(e => e !== employee)
        : [...newClient.assignedEmployees, employee]
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Work In Progress': return 'bg-blue-100 text-blue-700';
      case 'Waiting For Feedback': return 'bg-orange-100 text-orange-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Work In Progress': return 'bg-red-500';
      case 'Waiting For Feedback': return 'bg-orange-500';
      case 'Completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Left - Logo & Title */}
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">Error Infotech</h1>
              <p className="text-xs text-gray-500">Client Management</p>
            </div>
          </div>

          {/* Right - Notifications and Profile */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  <User size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <User size={16} className="text-blue-600" />
                    My Profile
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Settings size={16} className="text-gray-400" />
                    Settings
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Filter Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Workstream Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowWorkstreamDropdown(!showWorkstreamDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                <span className="font-medium text-gray-700">{selectedWorkstream}</span>
                <ChevronDown size={20} className="text-gray-400" />
              </button>

              {showWorkstreamDropdown && (
                <div className="absolute top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10 max-h-96 overflow-y-auto">
                  {workstreams.map((workstream) => (
                    <button
                      key={workstream}
                      onClick={() => {
                        setSelectedWorkstream(workstream);
                        setShowWorkstreamDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedWorkstream === workstream ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                    >
                      {workstream}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>

            {/* Filter Icon */}
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={18} className="text-gray-600" />
            </button>
          </div>

          {/* Add New Client Button (Admin & HR Only) */}
          {canAddEditClients && (
            <button
              onClick={handleAddNewClient}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={18} />
              <span>Add New Client</span>
            </button>
          )}
        </div>

        {/* Status Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Work In Progress</p>
                <p className="text-3xl font-bold text-red-600">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Waiting For Feedback</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.waitingFeedback}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Projects / Clients Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Projects / Clients</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <div key={client.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">{client.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusIcon(client.status)}`}></div>
                      <span className="text-xs text-gray-600">{client.status}</span>
                    </div>
                  </div>
                  {/* 3-dot menu only for Admin & HR */}
                  {canAddEditClients && (
                    <div className="relative">
                      <button
                        onClick={() => setSelectedClientForMenu(selectedClientForMenu === client.id ? null : client.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical size={18} className="text-gray-400" />
                      </button>
                      {selectedClientForMenu === client.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
                          <button
                            onClick={() => handleEditClient(client)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit size={14} />
                            Edit Client
                          </button>
                          {canDeleteClients && (
                            <button
                              onClick={() => handleDeleteClient(client.id)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                              Delete Client
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {client.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Client Tasks</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                        {client.taskCounts.high}
                      </span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                        {client.taskCounts.medium}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        {client.taskCounts.low}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sub Tasks</span>
                    <span className="font-medium text-gray-800">{client.subTasks}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Start Date</span>
                    <span className="text-gray-800">{client.startDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-600">Team:</span>
                  <div className="flex -space-x-2">
                    {client.teamMembers.map((member, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                        title={client.assignedEmployees?.[idx]}
                      >
                        {member}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
              <p>No clients found. {canAddEditClients ? 'Click "Add New Client" to get started.' : 'Contact your administrator for access.'}</p>
            </div>
          )}
        </div>

        {/* Current Client Log Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Current Client Log</h3>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Client Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Key</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Task Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Topic Tags</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Logged By</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Last Activity</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Attachments</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-sm font-medium text-gray-800">{task.clientName}</td>
                      <td className="px-4 py-4 text-sm text-blue-600 font-medium">{task.key}</td>
                      <td className="px-4 py-4 text-sm text-gray-800">{task.taskName}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">{task.loggedBy}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{task.dueDate}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{task.lastActivity}</td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Paperclip size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600">{task.attachments}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewTask(task)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          {canAddEditClients && (
                            <>
                              <button
                                onClick={() => handleEditTask(task)}
                                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              {canDeleteClients && (
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTasks.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No tasks found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Client Modal */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingClient ? 'Edit Client' : 'Add New Client'}
                </h3>
                <button
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Client Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter client name"
                  />
                </div>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  value={newClient.industry}
                  onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Technology, Healthcare, Finance"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    value={newClient.startDate}
                    onChange={(e) => setNewClient({ ...newClient, startDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={newClient.tags}
                    onChange={(e) => setNewClient({ ...newClient, tags: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter tags separated by commas (e.g., Design, UX, Frontend)"
                  />
                </div>
              </div>

              {/* Assigned Employees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Employees
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {allEmployees.map((employee) => (
                    <button
                      key={employee}
                      onClick={() => toggleEmployeeAssignment(employee)}
                      className={`px-4 py-2 rounded-lg text-sm border transition-colors ${newClient.assignedEmployees.includes(employee)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {employee}
                    </button>
                  ))}
                </div>
              </div>

              {/* Costing Notes (Admin & HR Only) */}
              {canAddEditClients && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Costing Rules & Notes
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                    <textarea
                      value={newClient.costingNotes}
                      onChange={(e) => setNewClient({ ...newClient, costingNotes: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                      placeholder="Enter billing rates, payment terms, and costing notes..."
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This information is only visible to Admin and HR
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setIsAddClientModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveClient}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingClient ? 'Update Client' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {isTaskModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingTask ? 'Edit Task' : 'Task Details'}
                </h3>
                <button
                  onClick={() => {
                    setIsTaskModalOpen(false);
                    setSelectedTask(null);
                    setEditingTask(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Client Name</label>
                  <p className="text-gray-900">{selectedTask.clientName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Task Key</label>
                  <p className="text-blue-600 font-medium">{selectedTask.key}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Task Name</label>
                {editingTask ? (
                  <input
                    type="text"
                    value={editingTask.taskName}
                    onChange={(e) => setEditingTask({ ...editingTask, taskName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{selectedTask.taskName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                {editingTask ? (
                  <textarea
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  />
                ) : (
                  <p className="text-gray-900">{selectedTask.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Priority</label>
                  {editingTask ? (
                    <select
                      value={editingTask.priority}
                      onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getPriorityColor(selectedTask.priority)}`}>
                      {selectedTask.priority}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                  {editingTask ? (
                    <select
                      value={editingTask.status}
                      onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Work In Progress">Work In Progress</option>
                      <option value="Waiting For Feedback">Waiting For Feedback</option>
                      <option value="Completed">Completed</option>
                    </select>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
                      {selectedTask.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Due Date</label>
                  <p className="text-gray-900">{selectedTask.dueDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Logged By</label>
                  <p className="text-gray-900">{selectedTask.loggedBy}</p>
                </div>
              </div>

              {canAddEditClients && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Estimated Hours</label>
                    <p className="text-gray-900">{selectedTask.estimatedHours || 0}h</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Logged Hours</label>
                    <p className="text-gray-900">{selectedTask.loggedHours || 0}h</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Cost</label>
                    <p className="text-gray-900">${selectedTask.cost?.toLocaleString() || 0}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {selectedTask.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              {editingTask ? (
                <>
                  <button
                    onClick={() => {
                      setEditingTask(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      console.log('Save task:', editingTask);
                      setIsTaskModalOpen(false);
                      setEditingTask(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
