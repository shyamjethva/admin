// import { useState } from 'react';
// import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
// import { useData } from '../context/DataContext';
// import { Modal } from './Modal';

// export function Clients() {
//   const { clients, addClient, updateClient, deleteClient } = useData();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingClient, setEditingClient] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');

//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     company: '',
//     address: '',
//     status: 'active' as 'active' | 'inactive',
//   });

//   const handleOpenModal = (clientId?: string) => {
//     if (clientId) {
//       const client = clients.find((c) => c._id === clientId);
//       if (client) {
//         setFormData({
//           name: client.name,
//           email: client.email,
//           phone: client.phone,
//           company: client.company,
//           address: client.address,
//           status: client.status,
//         });
//         setEditingClient(clientId);
//       }
//     } else {
//       setFormData({
//         name: '',
//         email: '',
//         phone: '',
//         company: '',
//         address: '',
//         status: 'active',
//       });
//       setEditingClient(null);
//     }
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setEditingClient(null);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     const payload = {
//       company: formData.company,          // ✅ backend field
//       contactPerson: formData.name,       // ✅ name ko contactPerson me bhejo
//       email: formData.email,
//       phone: formData.phone,
//       address: formData.address,
//       industry: "general",                // ✅ default (ya input add kar lo)
//       projects: 0,                        // ✅ default (ya input add kar lo)
//       status: formData.status,
//     };

//     if (editingClient) {
//       updateClient(editingClient, payload);
//     } else {
//       addClient(payload);
//     }

//     handleCloseModal();
//   };


//   const handleDelete = (id: string) => {
//     if (window.confirm('Are you sure you want to delete this client?')) {
//       deleteClient(id);
//     }
//   };

//   const safe = (v: any) => String(v || "").toLowerCase();

//   const filteredClients = clients.filter(client =>
//     safe(client.contactPerson).includes(safe(searchTerm)) ||
//     safe(client.company).includes(safe(searchTerm)) ||
//     safe(client.email).includes(safe(searchTerm)) ||
//     safe(client.phone).includes(safe(searchTerm))
//   );


//   return (
//     <div className="space-y-6">
//       {/* Header Section */}
//       <div>
//         <h2>Clients</h2>
//         <p className="text-gray-600 mt-1">Manage all client details in one place</p>
//       </div>

//       {/* Search Bar and Add Button */}
//       <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
//         <div className="flex flex-col sm:flex-row gap-4 items-center">
//           <div className="relative flex-1 w-full">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
//             <input
//               type="text"
//               placeholder="Search clients by name, email, phone, or company"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//           <button
//             onClick={() => handleOpenModal()}
//             className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm hover:shadow-md whitespace-nowrap"
//           >
//             <Plus size={20} />
//             Add New Client
//           </button>
//         </div>

//         {/* Client Table */}
//         <div className="overflow-x-auto rounded-lg border border-gray-200">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Client Name</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Company Name</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone Number</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Address</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
//                 <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredClients.map((client) => (
//                 <tr key={client.id} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-6 py-4 text-sm text-gray-900 font-medium">
//                     {client.contactPerson || client.name}
//                   </td>

//                   <td className="px-6 py-4 text-sm text-gray-700">{client.company}</td>
//                   <td className="px-6 py-4 text-sm text-blue-600">{client.email}</td>
//                   <td className="px-6 py-4 text-sm text-gray-700">{client.phone}</td>
//                   <td className="px-6 py-4 text-sm text-gray-700">{client.address}</td>
//                   <td className="px-6 py-4 text-sm">
//                     <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${client.status === 'active'
//                       ? 'bg-green-100 text-green-700'
//                       : 'bg-gray-100 text-gray-700'
//                       }`}>
//                       {client.status === 'active' ? 'Active' : 'Inactive'}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 text-sm">
//                     <div className="flex items-center justify-center gap-2">
//                       <button
//                         onClick={() => handleOpenModal(client._id)}
//                         className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
//                         title="View/Edit"
//                       >
//                         <Eye size={18} />
//                       </button>
//                       <button
//                         onClick={() => handleOpenModal(client._id)}
//                         className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
//                         title="Edit"
//                       >
//                         <Edit size={18} />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(client._id)}
//                         className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
//                         title="Delete"
//                       >
//                         <Trash2 size={18} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {filteredClients.length === 0 && (
//             <div className="text-center py-12 text-gray-500 bg-white">
//               <p>No clients found matching your search.</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Add/Edit Client Modal */}
//       <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingClient ? 'Edit Client' : 'Add New Client'}>
//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
//               <input
//                 type="text"
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Enter client name"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
//               <input
//                 type="text"
//                 value={formData.company}
//                 onChange={(e) => setFormData({ ...formData, company: e.target.value })}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Enter company name"
//                 required
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
//               <input
//                 type="email"
//                 value={formData.email}
//                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="example@company.com"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
//               <input
//                 type="tel"
//                 value={formData.phone}
//                 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Enter phone number"
//                 required
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
//             <input
//               type="text"
//               value={formData.address}
//               onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//               className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Enter address"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
//             <select
//               value={formData.status}
//               onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
//               className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//             </select>
//           </div>

//           <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
//             <button
//               type="button"
//               onClick={handleCloseModal}
//               className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
//             >
//               {editingClient ? 'Update Client' : 'Save Client'}
//             </button>
//           </div>
//         </form>
//       </Modal>
//     </div>
//   );
// }


import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Modal } from './Modal';

export function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    status: 'active' as 'active' | 'inactive',
  });

  const handleOpenModal = (clientId?: string) => {
    if (clientId) {
      const client = clients.find((c) => c._id === clientId);
      if (client) {
        setFormData({
          name: client.name,
          email: client.email,
          phone: client.phone,
          company: client.company,
          address: client.address,
          status: client.status,
        });
        setEditingClient(clientId);
      }
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        status: 'active',
      });
      setEditingClient(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      company: formData.company,          // ✅ backend field
      contactPerson: formData.name,       // ✅ name ko contactPerson me bhejo
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      industry: "general",                // ✅ default (ya input add kar lo)
      projects: 0,                        // ✅ default (ya input add kar lo)
      status: formData.status,
    };

    if (editingClient) {
      updateClient(editingClient, payload);
    } else {
      addClient(payload);
    }

    handleCloseModal();
  };


  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      deleteClient(id);
    }
  };

  const safe = (v: any) => String(v || "").toLowerCase();

  const filteredClients = clients.filter(client =>
    safe(client.contactPerson).includes(safe(searchTerm)) ||
    safe(client.company).includes(safe(searchTerm)) ||
    safe(client.email).includes(safe(searchTerm)) ||
    safe(client.phone).includes(safe(searchTerm))
  );


  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h2>Clients</h2>
        <p className="text-gray-600 mt-1">Manage all client details in one place</p>
      </div>

      {/* Search Bar and Add Button */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search clients by name, email, phone, or company"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm hover:shadow-md whitespace-nowrap"
          >
            <Plus size={20} />
            Add New Client
          </button>
        </div>

        {/* Client Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Client Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Company Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone Number</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Address</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {client.contactPerson || client.name}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">{client.company}</td>
                  <td className="px-6 py-4 text-sm text-blue-600">{client.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{client.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{client.address}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${client.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                      }`}>
                      {client.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(client._id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View/Edit"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenModal(client._id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(client._id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredClients.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white">
              <p>No clients found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Client Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingClient ? 'Edit Client' : 'Add New Client'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter client name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter company name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="example@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
            >
              {editingClient ? 'Update Client' : 'Save Client'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}