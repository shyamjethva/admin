import React, { useState, useEffect } from 'react';
import { Cake, Plus, Trash2, Edit } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import api from '../services/api';

export function Birthdays() {
    const { user } = useAuth();
    const { birthdays, employees, departments } = useData();
    console.log('Birthdays component - departments:', departments);
    const [showModal, setShowModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [localBirthdays, setLocalBirthdays] = useState([]);
    const [editingBirthday, setEditingBirthday] = useState(null);

    // Fetch birthdays directly when refreshKey changes
    useEffect(() => {
        const fetchBirthdays = async () => {
            try {
                console.log('Fetching birthdays with refreshKey:', refreshKey);
                const result = await api.get('/celebrations?type=birthday');
                console.log('Fetch birthdays result:', result);

                // Handle different response structures - API returns data wrapper
                const birthdayData = result?.data?.items || result?.items || result?.data || [];
                console.log('Setting localBirthdays:', birthdayData);
                setLocalBirthdays(birthdayData);
            } catch (error) {
                console.error('Error fetching birthdays:', error);
            }
        };
        fetchBirthdays();
    }, [refreshKey]);

    const displayBirthdays = Array.isArray(localBirthdays) && localBirthdays.length > 0 ? localBirthdays : birthdays;
    const [formData, setFormData] = useState({
        employeeId: '',
        department: '',
        date: '',
    });

    const today = new Date();
    const nextThreeMonths = new Date();
    nextThreeMonths.setMonth(today.getMonth() + 3);

    const filterUpcoming = (dateStr: string) => {
        const date = new Date(dateStr);
        return date >= today && date <= nextThreeMonths;
    };

    // Temporarily show all birthdays to debug
    const filteredBirthdays = displayBirthdays;
    // const filteredBirthdays = birthdays.filter((b: any) => filterUpcoming(b.date));

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
            employeeId: '',
            department: '',
            date: '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        try {
            // Get employee name from selected employeeId
            const selectedEmployee = employees.find(emp => emp.id === formData.employeeId || emp._id === formData.employeeId);
            const employeeName = selectedEmployee ? selectedEmployee.name : '';

            const payload = {
                title: `Birthday - ${employeeName}`,
                date: formData.date,
                type: 'birthday',
                description: `${employeeName}'s birthday`,
                employeeName: employeeName,
                employeeId: formData.employeeId,
                department: formData.department,
            };

            console.log('Submitting birthday:', payload);

            let result;
            if (editingBirthday) {
                // Update existing birthday
                result = await api.put(`/celebrations/${editingBirthday._id || editingBirthday.id}`, payload);
                console.log('Update birthday result:', result);
            } else {
                // Create new birthday
                result = await api.post('/celebrations', payload);
                console.log('Create birthday result:', result);
            }

            if (result && result.data?.success) {
                setShowModal(false);
                setEditingBirthday(null);
                setFormData({ employeeId: '', department: '', date: '' });
                setRefreshKey(prev => prev + 1);
                alert(editingBirthday ? 'Birthday updated successfully!' : 'Birthday added successfully!');
            } else {
                alert('Error saving birthday: ' + (result?.data?.message || 'Unknown error'));
            }
        } catch (error: any) {
            console.error('Error saving birthday:', error);
            alert('Error saving birthday: ' + (error?.message || 'Network error'));
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this birthday?')) return;

        try {
            const result = await api.delete(`/celebrations/${id}`);

            if (result.data?.success) {
                setRefreshKey(prev => prev + 1);
            } else {
                alert('Error deleting birthday: ' + (result.data?.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error deleting birthday:', error);
            alert('Error deleting birthday');
        }
    };

    const handleEdit = (birthday: any) => {
        setEditingBirthday(birthday);
        setFormData({
            employeeId: birthday.employeeId || '',
            department: birthday.department || '',
            date: birthday.date.split('T')[0], // Format date for input
        });
        setShowModal(true);
    };
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Birthdays</h2>
                    <p className="text-gray-600 mt-1">Upcoming employee birthdays</p>
                </div>
                {(user?.role === 'admin' || user?.role === 'hr') && (
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={20} />
                        Add Birthday
                    </button>
                )}
            </div>

            {/* Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Upcoming Birthdays</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">{filteredBirthdays.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Cake className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Birthdays List */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6">
                    {filteredBirthdays.length === 0 ? (
                        <div className="text-center py-12">
                            <Cake size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">No upcoming birthdays</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredBirthdays.map((birthday: any) => (
                                <div
                                    key={birthday._id || birthday.id}
                                    className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                            <Cake className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{birthday.employeeName}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{birthday.department}</p>
                                            <p className="text-xs text-gray-500 mt-1">{formatDate(birthday.date)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                                            {getDaysUntil(birthday.date)}
                                        </span>
                                        <div className="flex gap-2 mt-2">
                                            {(user?.role === 'admin' || user?.role === 'hr') && (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(birthday)}
                                                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                                        title="Edit birthday"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(birthday._id || birthday.id)}
                                                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                                        title="Delete birthday"
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

            {/* Add/Edit Birthday Modal */}
            {showModal && (
                <Modal
                    onClose={() => {
                        setShowModal(false);
                        setEditingBirthday(null);
                        setFormData({ employeeId: '', department: '', date: '' });
                    }}
                    title={editingBirthday ? "Edit Birthday" : "Add New Birthday"}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Employee
                            </label>
                            <select
                                value={formData.employeeId}
                                onChange={(e) => {
                                    const selectedEmpId = e.target.value;
                                    setFormData({ ...formData, employeeId: selectedEmpId });

                                    // Auto-fill department when employee is selected
                                    if (selectedEmpId) {
                                        const selectedEmployee = employees.find(emp =>
                                            emp.id === selectedEmpId || emp._id === selectedEmpId
                                        );
                                        if (selectedEmployee && selectedEmployee.department) {
                                            setFormData(prev => ({
                                                ...prev,
                                                employeeId: selectedEmpId,
                                                department: selectedEmployee.department
                                            }));
                                        }
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Employee</option>
                                {employees.map((emp: any) => (
                                    <option key={emp.id || emp._id} value={emp.id || emp._id}>
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
                                required
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept: any) => (
                                    <option key={dept.id} value={dept.name}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                required
                            />
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
                                {editingBirthday ? "Update Birthday" : "Add Birthday"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}