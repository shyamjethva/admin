import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface EditClockRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: any;
}

export function EditClockRecordModal({ isOpen, onClose, record }: EditClockRecordModalProps) {
    const { updateAttendance } = useData();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        checkIn: '',
        checkOut: '',
        breakIn: '',
        breakOut: '',
        status: '',
    });

    useEffect(() => {
        if (record && isOpen) {
            setFormData({
                checkIn: record.checkIn || '',
                checkOut: record.checkOut || '',
                breakIn: record.breakIn || '',
                breakOut: record.breakOut || '',
                status: record.status || '',
            });
        }
    }, [record, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateAttendance(record.id || record._id, {
                ...record,
                checkIn: formData.checkIn,
                checkOut: formData.checkOut,
                breakIn: formData.breakIn,
                breakOut: formData.breakOut,
                status: formData.status,
            });
            onClose();
        } catch (error) {
            console.error('Failed to update attendance record:', error);
            alert('Failed to update record. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl transform transition-all duration-300">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Edit Clock Record</h2>
                        <p className="text-sm font-medium text-gray-500 mt-1">
                            {record?.employeeName} - {new Date(record?.date).toLocaleDateString()}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Clock In</label>
                            <input
                                type="time"
                                name="checkIn"
                                value={formData.checkIn}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Clock Out</label>
                            <input
                                type="time"
                                name="checkOut"
                                value={formData.checkOut}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-700"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Break In</label>
                            <input
                                type="time"
                                name="breakIn"
                                value={formData.breakIn}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Break Out</label>
                            <input
                                type="time"
                                name="breakOut"
                                value={formData.breakOut}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-700 appearance-none"
                        >
                            <option value="clocked_in">Clocked In</option>
                            <option value="on_break">On Break</option>
                            <option value="clocked_out">Clocked Out</option>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="late">Late</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-95 rounded-xl transition-all"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
