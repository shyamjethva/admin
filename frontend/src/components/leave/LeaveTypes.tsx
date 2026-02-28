import { useState } from 'react';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Modal } from '../Modal';
import { useAuth } from '../../context/AuthContext';

export function LeaveTypes() {
  const { leaveTypes, addLeaveType, updateLeaveType, deleteLeaveType } = useData();
  const { user } = useAuth(); // Get current user to check role
  const [showModal, setShowModal] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    maxDays: 0,
    description: '',
    isPaid: true,
  });

  const handleAdd = () => {
    setEditingLeaveType(null);
    setFormData({ name: '', code: '', maxDays: 0, description: '', isPaid: true });
    setShowModal(true);
  };

  const handleEdit = (leaveType: any) => {
    setEditingLeaveType(leaveType);
    setFormData({
      name: leaveType.name,
      code: (leaveType as any).code || '',
      maxDays: (leaveType as any).maxDays || leaveType.daysAllowed || 0,
      description: leaveType.description,
      isPaid: (leaveType as any).isPaid !== undefined ? (leaveType as any).isPaid : leaveType.paidLeave,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this leave type?')) {
      deleteLeaveType(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLeaveType) {
      updateLeaveType(editingLeaveType.id, formData);
    } else {
      addLeaveType(formData);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Leave Types</h1>
          <p className="text-gray-600 mt-1">Configure different types of leaves</p>
        </div>
        {/* Only show Add Leave Type button for admin and HR, not for employees */}
        {user?.role !== 'employee' && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Leave Type
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {leaveTypes.map((leaveType: any) => (
          <div key={leaveType.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FileText className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{leaveType.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{leaveType.description}</p>
                </div>
              </div>
              {/* Only show edit/delete buttons for admin and HR, not for employees */}
              {user?.role !== 'employee' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(leaveType)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(leaveType.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Days Allowed</span>
                <span className="text-sm font-medium text-gray-800">{(leaveType as any).maxDays || leaveType.daysAllowed || 0} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Type</span>
                <span className="text-sm font-medium text-gray-800">{(leaveType as any).code || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                {/* <span className="text-sm text-gray-600">Type</span> */}
                <span className={`text-sm font-medium ${(leaveType as any).isPaid !== undefined ? (leaveType as any).isPaid : leaveType.paidLeave ? 'text-green-600' : 'text-gray-600'}`}>
                  {(leaveType as any).isPaid !== undefined ? (leaveType as any).isPaid : leaveType.paidLeave ? 'Paid Leave' : 'Unpaid Leave'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editingLeaveType ? 'Edit Leave Type' : 'Add Leave Type'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              {/* <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., CL, PL, SL"
                required
              /> */}

              <select
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Leave Type</option>
                <option value="CL">CL - Casual Leave Type</option>
                <option value="PL">PL - Paid Leave Type</option>
                <option value="SL">SL - Sick Leave Type</option>
                <option value="LOP">LOP - Loss of Pay</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Days Allowed</label>
              <input
                type="number"
                value={formData.maxDays}
                onChange={(e) => setFormData({ ...formData, maxDays: Number(e.target.value) })}
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="paidLeave"
                checked={formData.isPaid}
                onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="paidLeave" className="text-sm font-medium text-gray-700">Paid Leave</label>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingLeaveType ? 'Update' : 'Add'} Leave Type
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}