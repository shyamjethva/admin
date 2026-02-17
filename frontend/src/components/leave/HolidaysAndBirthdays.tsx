import { useState } from 'react';
import { Plus, Pencil, Trash2, Calendar, Cake } from 'lucide-react';
import { useData, Holiday, Birthday } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../Modal';

export function HolidaysAndBirthdays() {
  const { user } = useAuth();
  const { holidays, addHoliday, updateHoliday, deleteHoliday, birthdays, addBirthday, updateBirthday, deleteBirthday } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Holiday | Birthday | null>(null);
  const [activeTab, setActiveTab] = useState<'holidays' | 'birthdays'>('holidays');

  // Only allow admin and HR to perform edit/delete operations
  const canEdit = user?.role === 'admin' || user?.role === 'hr';
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'public' as 'public' | 'optional',
    description: '',
  });
  const [birthdayFormData, setBirthdayFormData] = useState({
    employeeName: '',
    employeeId: '',
    date: '',
    department: '',
  });

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', date: '', type: 'public', description: '' });
    setShowModal(true);
  };

  const handleAddBirthday = () => {
    setEditingItem(null);
    setBirthdayFormData({ employeeName: '', employeeId: '', date: '', department: '' });
    setShowModal(true);
  };

  const handleEdit = (holiday: Holiday) => {
    setEditingItem(holiday);
    setFormData({
      name: holiday.name,
      date: holiday.date,
      type: holiday.type,
      description: holiday.description,
    });
    setShowModal(true);
  };

  const handleEditBirthday = (birthday: Birthday) => {
    setEditingItem(birthday);
    setBirthdayFormData({
      employeeName: birthday.employeeName || '',
      employeeId: birthday.employeeId || '',
      date: birthday.date || '',
      department: birthday.department || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      deleteHoliday(id);
    }
  };

  const handleDeleteBirthday = (id: string) => {
    if (window.confirm('Are you sure you want to delete this birthday?')) {
      deleteBirthday(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'holidays') {
      if (editingItem) {
        updateHoliday(editingItem.id, formData);
      } else {
        addHoliday(formData);
      }
    } else {
      if (editingItem) {
        updateBirthday(editingItem.id, birthdayFormData);
      } else {
        addBirthday(birthdayFormData);
      }
    }
    setShowModal(false);
  };

  const upcomingBirthdays = birthdays
    .map(b => {
      const today = new Date();
      const birthDate = new Date(b.date);
      const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1);
      }
      const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...b, daysUntil, displayDate: `${birthDate.getMonth() + 1}/${birthDate.getDate()}` };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Holidays & Birthdays</h1>
          <p className="text-gray-600 mt-1">
            {canEdit ? 'Manage holidays and celebrate birthdays' : 'View upcoming holidays and birthdays'}
          </p>
        </div>
        {canEdit && (
          <>
            {activeTab === 'holidays' ? (
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
                Add Holiday
              </button>
            ) : (
              <button
                onClick={handleAddBirthday}
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                <Plus size={20} />
                Add Birthday
              </button>
            )}
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('holidays')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'holidays'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Holidays
          </button>
          <button
            onClick={() => setActiveTab('birthdays')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'birthdays'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Birthdays
          </button>
        </div>
      </div>

      {activeTab === 'holidays' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {holidays.map((holiday) => (
            <div key={holiday.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Calendar className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{holiday.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{holiday.description}</p>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(holiday)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(holiday.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date</span>
                  <span className="text-sm font-medium text-gray-800">{holiday.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${holiday.type === 'public' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                    {holiday.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Birthday</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Until</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingBirthdays.map((birthday) => (
                  <tr key={birthday.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Cake className="text-pink-500" size={20} />
                        <span className="font-medium text-gray-900">{birthday.employeeName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{birthday.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{birthday.displayDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${birthday.daysUntil <= 7 ? 'text-pink-600' : 'text-gray-600'
                        }`}>
                        {birthday.daysUntil === 0 ? 'Today!' : `${birthday.daysUntil} days`}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditBirthday(birthday)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteBirthday(birthday.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                    {!canEdit && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-400 text-sm">View only</span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={activeTab === 'holidays' ? (editingItem ? 'Edit Holiday' : 'Add Holiday') : (editingItem ? 'Edit Birthday' : 'Add Birthday')}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'holidays' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'public' | 'optional' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="public">Public Holiday</option>
                    <option value="optional">Optional Holiday</option>
                  </select>
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
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                  <input
                    type="text"
                    value={birthdayFormData.employeeName}
                    onChange={(e) => setBirthdayFormData({ ...birthdayFormData, employeeName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={birthdayFormData.employeeId}
                    onChange={(e) => setBirthdayFormData({ ...birthdayFormData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={birthdayFormData.department}
                    onChange={(e) => setBirthdayFormData({ ...birthdayFormData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birthday Date</label>
                  <input
                    type="date"
                    value={birthdayFormData.date}
                    onChange={(e) => setBirthdayFormData({ ...birthdayFormData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
              </>
            )}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingItem ? 'Update' : 'Add'} {activeTab === 'holidays' ? 'Holiday' : 'Birthday'}
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
