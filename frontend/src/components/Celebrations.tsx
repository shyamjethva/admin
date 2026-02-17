import React, { useState, useEffect } from 'react';
import { Calendar, Cake, Award, Gift, PartyPopper, MapPin, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Modal } from './Modal';
import api from '../services/api';

// Interfaces (keeping them for type safety)
interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'national' | 'company';
  description: string;
}

interface Birthday {
  id: string;
  employeeName: string;
  department: string;
  date: string;
  age?: number;
}

interface WorkAnniversary {
  id: string;
  employeeName: string;
  department: string;
  date: string;
  yearsCompleted: number;
  joinDate: string;
}

export function Celebrations() {
  const { user } = useAuth();
  const { holidays, birthdays } = useData();
  const [activeTab, setActiveTab] = useState('holidays');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [anniversaries, setAnniversaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: 'holiday' as 'holiday' | 'birthday' | 'anniversary',
    description: '',
    employeeName: '',
    department: '',
    yearsCompleted: 1,
    joinDate: '',
  });

  const today = new Date();
  const nextThreeMonths = new Date();
  nextThreeMonths.setMonth(today.getMonth() + 3);

  const filterUpcoming = (dateStr: string) => {
    const date = new Date(dateStr);
    return date >= today && date <= nextThreeMonths;
  };

  const filteredHolidays = holidays.filter((h: any) => filterUpcoming(h.date));
  const filteredBirthdays = birthdays.filter((b: any) => filterUpcoming(b.date));
  const filteredAnniversaries = anniversaries.filter((a: any) => filterUpcoming(a.date));

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `in ${diffDays} days`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Fetch anniversaries
  useEffect(() => {
    const fetchAnniversaries = async () => {
      setLoading(true);
      try {
        const response = await api.get('/celebrations?type=anniversary');
        setAnniversaries(response.data.items || []);
      } catch (error) {
        console.error('Error fetching anniversaries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnniversaries();
  }, []);

  const handleAdd = (type: 'holiday' | 'birthday' | 'anniversary') => {
    setEditingItem(null);
    setFormData({
      title: '',
      date: '',
      type,
      description: '',
      employeeName: '',
      department: '',
      yearsCompleted: 1,
      joinDate: '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const payload: any = {
        title: formData.title,
        date: formData.date,
        type: formData.type,
        description: formData.description,
      };

      // Add employee-specific fields
      if (formData.type === 'birthday' || formData.type === 'anniversary') {
        payload.employeeName = formData.employeeName;
        payload.department = formData.department;
      }

      if (formData.type === 'anniversary') {
        payload.yearsCompleted = formData.yearsCompleted;
        payload.joinDate = formData.joinDate;
      }

      const result = await api.post('/celebrations', payload);

      if (result.data?.success) {
        // Refresh data
        window.location.reload();
      } else {
        alert('Error saving celebration: ' + result.data?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error saving celebration:', error);
      alert('Error saving celebration');
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Celebrations</h2>
          <p className="text-gray-600 mt-1">Upcoming holidays, birthdays, and work anniversaries</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'hr') && (
          <div className="flex gap-2">
            <button
              onClick={() => handleAdd('holiday')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Add Holiday
            </button>
            <button
              onClick={() => handleAdd('birthday')}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
            >
              <Plus size={20} />
              Add Birthday
            </button>
            <button
              onClick={() => handleAdd('anniversary')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus size={20} />
              Add Anniversary
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming Holidays</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{filteredHolidays.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming Birthdays</p>
              <p className="text-3xl font-bold text-pink-600 mt-1">{filteredBirthdays.length}</p>
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <Cake className="text-pink-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Work Anniversaries</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{filteredAnniversaries.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('holidays')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'holidays'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar size={18} />
              Holidays ({filteredHolidays.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('birthdays')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'birthdays'
              ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-600'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Cake size={18} />
              Birthdays ({filteredBirthdays.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('anniversaries')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'anniversaries'
              ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Award size={18} />
              Anniversaries ({filteredAnniversaries.length})
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Holidays Tab */}
          {activeTab === 'holidays' && (
            <div className="space-y-4">
              {filteredHolidays.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No upcoming holidays</p>
                </div>
              ) : (
                filteredHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                        <PartyPopper className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{holiday.name}</h3>
                        <p className="text-sm text-gray-600">{holiday.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(holiday.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                        {getDaysUntil(holiday.date)}
                      </span>
                      <p className="text-xs text-gray-500 mt-2 capitalize">{holiday.type} Holiday</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Birthdays Tab */}
          {activeTab === 'birthdays' && (
            <div className="space-y-4">
              {filteredBirthdays.length === 0 ? (
                <div className="text-center py-12">
                  <Cake size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No upcoming birthdays</p>
                </div>
              ) : (
                filteredBirthdays.map((birthday) => (
                  <div
                    key={birthday.id}
                    className="flex items-center justify-between p-4 bg-pink-50 rounded-lg border border-pink-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
                        <Cake className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{birthday.employeeName}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <MapPin size={14} />
                          {birthday.department}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(birthday.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-pink-600 text-white text-sm rounded-full">
                        {getDaysUntil(birthday.date)}
                      </span>
                      {birthday.age && (
                        <p className="text-xs text-gray-500 mt-2">Turning {birthday.age}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Anniversaries Tab */}
          {activeTab === 'anniversaries' && (
            <div className="space-y-4">
              {filteredAnniversaries.length === 0 ? (
                <div className="text-center py-12">
                  <Award size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No work anniversaries</p>
                </div>
              ) : (
                filteredAnniversaries.map((anniversary) => (
                  <div
                    key={anniversary.id}
                    className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Award className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{anniversary.employeeName}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <MapPin size={14} />
                          {anniversary.department}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Joined: {formatDate(anniversary.joinDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
                        {getDaysUntil(anniversary.date)}
                      </span>
                      <p className="text-xs text-gray-500 mt-2">
                        {anniversary.yearsCompleted} {anniversary.yearsCompleted === 1 ? 'Year' : 'Years'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          title={`${editingItem ? 'Edit' : 'Add'} ${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title/Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.type === 'holiday' ? 'Holiday Name' : 'Employee Name'}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Date Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Employee-specific fields */}
            {(formData.type === 'birthday' || formData.type === 'anniversary') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </>
            )}

            {/* Anniversary-specific fields */}
            {formData.type === 'anniversary' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years Completed</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.yearsCompleted}
                    onChange={(e) => setFormData({ ...formData, yearsCompleted: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                  <input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingItem ? 'Update' : 'Add'} {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
