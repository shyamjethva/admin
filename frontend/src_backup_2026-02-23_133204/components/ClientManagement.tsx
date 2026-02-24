// import { useState } from 'react';
// import { Plus, Edit2, Trash2, Search, Building2, Mail, Phone, MapPin, User, Calendar } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';

// interface Client {
//   id: string;
//   companyName: string;
//   contactPerson: string;
//   email: string;
//   phone: string;
//   address: string;
//   industry: string;
//   status: 'active' | 'inactive';
//   projects: number;
//   joinedDate: string;
// }

// const demoClients: Client[] = [];

// export function ClientManagement() {
//   const { user } = useAuth();
//   const [clients, setClients] = useState<Client[]>(demoClients);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [editingClient, setEditingClient] = useState<Client | null>(null);

//   const isAdmin = user?.role === 'admin';
//   const canEdit = isAdmin || user?.role === 'hr';

//   // Filter clients based on search and status
//   const filteredClients = clients.filter(client => {
//     const matchesSearch =
//       client.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       client.email.toLowerCase().includes(searchQuery.toLowerCase());

//     const matchesStatus = filterStatus === 'all' || client.status === filterStatus;

//     return matchesSearch && matchesStatus;
//   });

//   const handleAddClient = (newClient: Omit<Client, 'id'>) => {
//     const client: Client = {
//       ...newClient,
//       id: Date.now().toString(),
//     };
//     setClients([...clients, client]);
//     setShowAddModal(false);
//   };

//   const handleEditClient = (updatedClient: Client) => {
//     setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
//     setEditingClient(null);
//   };

//   const handleDeleteClient = (id: string) => {
//     if (window.confirm('Are you sure you want to delete this client?')) {
//       setClients(clients.filter(c => c.id !== id));
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">Client Management</h2>
//           <p className="text-gray-600 mt-1">Manage all your clients and their details</p>
//         </div>
//         {canEdit && (
//           <button
//             onClick={() => setShowAddModal(true)}
//             className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             <Plus size={20} />
//             Add Client
//           </button>
//         )}
//       </div>

//       {/* Filters */}
//       <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row gap-4">
//         <div className="flex-1 relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
//           <input
//             type="text"
//             placeholder="Search by company name, contact person, or email..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//         <div>
//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="all">All Clients</option>
//             <option value="active">Active</option>
//             <option value="inactive">Inactive</option>
//           </select>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-white p-6 rounded-lg border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Total Clients</p>
//               <p className="text-3xl font-bold text-gray-800 mt-1">{clients.length}</p>
//             </div>
//             <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//               <Building2 className="text-blue-600" size={24} />
//             </div>
//           </div>
//         </div>
//         <div className="bg-white p-6 rounded-lg border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Active Clients</p>
//               <p className="text-3xl font-bold text-green-600 mt-1">
//                 {clients.filter(c => c.status === 'active').length}
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//               <User className="text-green-600" size={24} />
//             </div>
//           </div>
//         </div>
//         <div className="bg-white p-6 rounded-lg border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Total Projects</p>
//               <p className="text-3xl font-bold text-purple-600 mt-1">
//                 {clients.reduce((sum, c) => sum + c.projects, 0)}
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
//               <Calendar className="text-purple-600" size={24} />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Clients Table */}
//       <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Company
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Contact Person
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Contact Info
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Industry
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Projects
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 {canEdit && (
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 )}
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredClients.map((client) => (
//                 <tr key={client.id} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
//                         <Building2 className="text-blue-600" size={20} />
//                       </div>
//                       <div className="ml-4">
//                         <div className="text-sm font-medium text-gray-900">{client.companyName}</div>
//                         <div className="text-xs text-gray-500">Since {new Date(client.joinedDate).toLocaleDateString()}</div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">{client.contactPerson}</div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex flex-col gap-1">
//                       <div className="flex items-center gap-2 text-sm text-gray-600">
//                         <Mail size={14} />
//                         {client.email}
//                       </div>
//                       <div className="flex items-center gap-2 text-sm text-gray-600">
//                         <Phone size={14} />
//                         {client.phone}
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
//                       {client.industry}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm font-medium text-gray-900">{client.projects}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span
//                       className={`px-2 py-1 text-xs font-medium rounded ${client.status === 'active'
//                         ? 'bg-green-100 text-green-700'
//                         : 'bg-gray-100 text-gray-700'
//                         }`}
//                     >
//                       {client.status.toUpperCase()}
//                     </span>
//                   </td>
//                   {canEdit && (
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => setEditingClient(client)}
//                           className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
//                         >
//                           <Edit2 size={16} />
//                         </button>
//                         {isAdmin && (
//                           <button
//                             onClick={() => handleDeleteClient(client.id)}
//                             className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   )}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Empty State */}
//         {filteredClients.length === 0 && (
//           <div className="text-center py-12">
//             <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
//             <p className="text-gray-600">No clients found</p>
//           </div>
//         )}
//       </div>

//       {/* Add/Edit Modal */}
//       {(showAddModal || editingClient) && (
//         <ClientModal
//           client={editingClient}
//           onSave={editingClient ? handleEditClient : handleAddClient}
//           onClose={() => {
//             setShowAddModal(false);
//             setEditingClient(null);
//           }}
//         />
//       )}
//     </div>
//   );
// }

// // Client Modal Component
// function ClientModal({
//   client,
//   onSave,
//   onClose,
// }: {
//   client: Client | null;
//   onSave: (client: any) => void;
//   onClose: () => void;
// }) {
//   const [formData, setFormData] = useState<Omit<Client, 'id'>>({
//     companyName: client?.companyName || '',
//     contactPerson: client?.contactPerson || '',
//     email: client?.email || '',
//     phone: client?.phone || '',
//     address: client?.address || '',
//     industry: client?.industry || '',
//     status: client?.status || 'active',
//     projects: client?.projects || 0,
//     joinedDate: client?.joinedDate || new Date().toISOString().split('T')[0],
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (client) {
//       onSave({ ...client, ...formData });
//     } else {
//       onSave(formData);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//         <h3 className="text-xl font-bold text-gray-800 mb-6">
//           {client ? 'Edit Client' : 'Add New Client'}
//         </h3>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
//               <input
//                 type="text"
//                 value={formData.companyName}
//                 onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
//               <input
//                 type="text"
//                 value={formData.contactPerson}
//                 onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
//               <input
//                 type="email"
//                 value={formData.email}
//                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
//               <input
//                 type="tel"
//                 value={formData.phone}
//                 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
//               <input
//                 type="text"
//                 value={formData.address}
//                 onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
//               <input
//                 type="text"
//                 value={formData.industry}
//                 onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Number of Projects</label>
//               <input
//                 type="number"
//                 min="0"
//                 value={formData.projects}
//                 onChange={(e) => setFormData({ ...formData, projects: parseInt(e.target.value) || 0 })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//               <select
//                 value={formData.status}
//                 onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="active">Active</option>
//                 <option value="inactive">Inactive</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Joined Date</label>
//               <input
//                 type="date"
//                 value={formData.joinedDate}
//                 onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>
//           <div className="flex gap-2 pt-4">
//             <button
//               type="submit"
//               className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               {client ? 'Update' : 'Add'} Client
//             </button>
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }



import { useState, useEffect, FormEvent } from 'react';
import { Plus, Edit2, Trash2, Search, Building2, Mail, Phone, MapPin, User, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  status: 'active' | 'inactive';
  projects: number;
  joinedDate: string;
}

const demoClients: Client[] = [];

export function ClientManagement() {
  const { user } = useAuth();
  const { clients, addClient, updateClient, deleteClient } = useData();
  const [localClients, setLocalClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const isAdmin = user?.role === 'admin';
  const canEdit = isAdmin || user?.role === 'hr';

  // Update local state when context clients change
  useEffect(() => {
    if (clients && clients.length > 0) {
      const mapped = clients.map(c => ({
        id: c._id,
        companyName: c.company,
        contactPerson: c.contactPerson,
        email: c.email,
        phone: c.phone,
        address: c.address || '',
        industry: c.industry || '',
        status: c.status,
        projects: c.projects || 0,
        joinedDate: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      }));
      setLocalClients(mapped);
    } else {
      setLocalClients([]);
    }
  }, [clients]);

  // Filter clients based on search and status
  const filteredClients = localClients.filter(client => {
    const matchesSearch =
      client.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleAddClient = async (newClient: Omit<Client, 'id'>) => {
    try {
      // Map frontend fields to backend fields
      const payload = {
        company: newClient.companyName,
        contactPerson: newClient.contactPerson,
        email: newClient.email,
        phone: newClient.phone,
        address: newClient.address || '',
        industry: newClient.industry || '',
        status: newClient.status,
        projects: newClient.projects || 0,
      };

      await addClient(payload);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add client:', error);
      alert('Failed to add client. Please try again.');
    }
  };

  const handleEditClient = async (updatedClient: Client) => {
    try {
      const payload = {
        company: updatedClient.companyName,
        contactPerson: updatedClient.contactPerson,
        email: updatedClient.email,
        phone: updatedClient.phone,
        address: updatedClient.address || '',
        industry: updatedClient.industry || '',
        status: updatedClient.status,
        projects: updatedClient.projects || 0,
      };

      await updateClient(updatedClient.id, payload);
      setEditingClient(null);
    } catch (error) {
      console.error('Failed to update client:', error);
      alert('Failed to update client. Please try again.');
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(id);
      } catch (error) {
        console.error('Failed to delete client:', error);
        alert('Failed to delete client. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Client Management</h2>
          <p className="text-gray-600 mt-1">Manage all your clients and their details</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add Client
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by company name, contact person, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Clients</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{localClients.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Clients</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {localClients.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <User className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Projects</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {localClients.reduce((sum, c) => sum + c.projects, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Person
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Industry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {canEdit && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="text-blue-600" size={20} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{client.companyName}</div>
                        <div className="text-xs text-gray-500">Since {new Date(client.joinedDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.contactPerson}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} />
                        {client.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} />
                        {client.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                      {client.industry}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{client.projects}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${client.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                      {client.status.toUpperCase()}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingClient(client)}
                          className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                        >
                          <Edit2 size={16} />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No clients found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingClient) && (
        <ClientModal
          client={editingClient}
          onSave={editingClient ? handleEditClient : handleAddClient}
          onClose={() => {
            setShowAddModal(false);
            setEditingClient(null);
          }}
        />
      )}
    </div>
  );
}

// Client Modal Component
function ClientModal({
  client,
  onSave,
  onClose,
}: {
  client: Client | null;
  onSave: (client: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<Omit<Client, 'id'>>({
    companyName: client?.companyName || '',
    contactPerson: client?.contactPerson || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    industry: client?.industry || '',
    status: client?.status || 'active',
    projects: client?.projects || 0,
    joinedDate: client?.joinedDate || new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (client) {
      onSave({ ...client, ...formData });
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          {client ? 'Edit Client' : 'Add New Client'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Projects</label>
              <input
                type="number"
                min="0"
                value={formData.projects}
                onChange={(e) => setFormData({ ...formData, projects: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Joined Date</label>
              <input
                type="date"
                value={formData.joinedDate}
                onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {client ? 'Update' : 'Add'} Client
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
