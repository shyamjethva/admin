import { useState } from 'react';
import { Plus, Pencil, Trash2, Clock } from 'lucide-react';
import { useData, Shift } from '../../context/DataContext';
import { Modal } from '../Modal';

export function Shifts() {
  const { shifts, addShift, updateShift, deleteShift } = useData();

  // Log for debugging
  console.log('Shifts component - shifts:', shifts);

  // Defensive programming: ensure shifts is always an array
  const safeShifts = Array.isArray(shifts) ? shifts : [];

  // Log the safe shifts
  console.log('Shifts component - safeShifts:', safeShifts);
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    description: '',
  });

  const handleAdd = () => {
    setEditingShift(null);
    setFormData({ name: '', startTime: '', endTime: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift);
    setFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      description: shift.description,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      deleteShift(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShift) {
      updateShift(editingShift.id, formData);
    } else {
      addShift(formData);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Shifts</h1>
          <p className="text-gray-600 mt-1">Manage work shifts and timings</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Shift
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeShifts.map((shift) => (
          <div key={shift.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Clock className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{shift.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{shift.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(shift)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(shift.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Start Time</span>
                <span className="text-sm font-medium text-gray-800">{shift.startTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">End Time</span>
                <span className="text-sm font-medium text-gray-800">{shift.endTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editingShift ? 'Edit Shift' : 'Add Shift'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
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
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingShift ? 'Update' : 'Add'} Shift
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
