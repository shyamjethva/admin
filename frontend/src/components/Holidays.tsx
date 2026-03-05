import React, { useState, useEffect } from 'react';
import { Calendar, PartyPopper, Plus, Trash2, Edit } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import api from '../services/api';

interface Holiday {
    id: string;
    title: string;
    date: string;
    description: string;
    type: string;
}

export function Holidays() {
    const { user } = useAuth();
    const { holidays, employees, departments } = useData();
    const [showModal, setShowModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [localHolidays, setLocalHolidays] = useState([]);
    const [editingHoliday, setEditingHoliday] = useState(null);

    // Fetch holidays directly when refreshKey changes
    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                const result = await api.get('/celebrations?type=holiday');

                // Handle different response structures - API returns data wrapper
                const holidayData = result?.data?.items || result?.items || result?.data || [];
                setLocalHolidays(holidayData);
            } catch (error) {
                console.error('Error fetching holidays:', error);
            }
        };
        fetchHolidays();
    }, [refreshKey]);

    const displayHolidays = Array.isArray(localHolidays) && localHolidays.length > 0 ? localHolidays : holidays;
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        description: '',
        employeeName: '',
        department: '',
    });

    const today = new Date();
    const nextThreeMonths = new Date();
    nextThreeMonths.setMonth(today.getMonth() + 3);

    // Show all holidays (not just upcoming) - for debugging
    const filteredHolidays = displayHolidays;

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

    const handleAdd = () => {
        setFormData({
            title: '',
            date: '',
            description: '',
            employeeName: '',
            department: '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        try {
            const payload = {
                title: formData.title,
                date: formData.date,
                type: 'holiday',
                description: formData.description,
                employeeName: formData.employeeName,
                department: formData.department,
            };

            console.log('Submitting holiday:', payload);

            let result;
            if (editingHoliday) {
                // Update existing holiday
                result = await api.put(`/celebrations/${editingHoliday._id || editingHoliday.id}`, payload);
                console.log('Update holiday result:', result);
            } else {
                // Create new holiday
                result = await api.post('/celebrations', payload);
                console.log('Create holiday result:', result);
            }

            if (result && result.data?.success) {
                setShowModal(false);
                setEditingHoliday(null);
                setFormData({ title: '', date: '', description: '', employeeName: '', department: '' });
                setRefreshKey(prev => prev + 1);
                alert(editingHoliday ? 'Holiday updated successfully!' : 'Holiday added successfully!');
            } else {
                alert('Error saving holiday: ' + (result?.data?.message || 'Unknown error'));
            }
        } catch (error: any) {
            console.error('Error saving holiday:', error);
            alert('Error saving holiday: ' + (error?.message || 'Network error'));
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this holiday?')) return;

        try {
            const result = await api.delete(`/celebrations/${id}`);

            if (result.data?.success) {
                setRefreshKey(prev => prev + 1);
            } else {
                alert('Error deleting holiday: ' + (result.data?.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error deleting holiday:', error);
            alert('Error deleting holiday');
        }
    };

    const handleEdit = (holiday: any) => {
        setEditingHoliday(holiday);
        setFormData({
            title: holiday.title,
            date: holiday.date.split('T')[0], // Format date for input
            description: holiday.description || '',
            employeeName: holiday.employeeName || '',
            department: holiday.department || '',
        });
        setShowModal(true);
    }; return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Holidays</h2>
                    <p className="text-gray-600 mt-1">Upcoming holidays and observances</p>
                </div>
                {(user?.role === 'admin' || user?.role === 'hr') && (
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={20} />
                        Add Holiday
                    </button>
                )}
            </div>

            {/* Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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
            </div>

            {/* Holidays List */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6">
                    {filteredHolidays.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">No upcoming holidays</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredHolidays.map((holiday: any) => (
                                <div
                                    key={holiday._id || holiday.id}
                                    className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                            <PartyPopper className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{holiday.title}</h3>
                                            <p className="text-sm text-gray-600">{holiday.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">{formatDate(holiday.date)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                                            {getDaysUntil(holiday.date)}
                                        </span>
                                        <p className="text-xs text-gray-500 mt-2 capitalize">{holiday.type} Holiday</p>
                                        <div className="flex gap-2 mt-2">
                                            {(user?.role === 'admin' || user?.role === 'hr') && (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(holiday)}
                                                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                                        title="Edit holiday"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(holiday._id || holiday.id)}
                                                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                                        title="Delete holiday"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Holiday Modal */}
            {showModal && (
                <Modal
                    onClose={() => {
                        setShowModal(false);
                        setEditingHoliday(null);
                        setFormData({ title: '', date: '', description: '', employeeName: '', department: '' });
                    }}
                    title={editingHoliday ? "Edit Holiday" : "Add New Holiday"}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Holiday Name
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Employee
                            </label>
                            <select
                                value={formData.employeeName}
                                onChange={(e) => {
                                    const selectedEmpName = e.target.value;
                                    setFormData({ ...formData, employeeName: selectedEmpName });

                                    // Auto-fill department when employee is selected
                                    if (selectedEmpName) {
                                        const selectedEmployee = employees.find(emp =>
                                            emp.name === selectedEmpName
                                        );
                                        if (selectedEmployee && selectedEmployee.department) {
                                            setFormData(prev => ({
                                                ...prev,
                                                employeeName: selectedEmpName,
                                                department: selectedEmployee.department
                                            }));
                                        }
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            >
                                <option value="">Select Employee (optional)</option>
                                {employees.map((emp: any) => (
                                    <option key={emp.id || emp._id} value={emp.name}>
                                        {emp.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Department
                            </label>
                            <select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            >
                                <option value="">Select Department (optional)</option>
                                {departments.map((dept: any) => (
                                    <option key={dept.id} value={dept.name}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>

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
                                {editingHoliday ? "Update Holiday" : "Add Holiday"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}