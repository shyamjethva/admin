import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { FileText } from 'lucide-react';

export function EmployeeLeaveTypes() {
    const { leaveTypes } = useData();
    const { user } = useAuth();

    // Defensive programming: ensure leaveTypes is always an array
    const safeLeaveTypes = Array.isArray(leaveTypes) ? leaveTypes : [];

    // Only show this component to employees
    if (user?.role === 'admin' || user?.role === 'hr') {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-800">Access Restricted</h2>
                    <p className="text-gray-600 mt-2">This page is only available for employees.</p>
                    <p className="text-gray-500 text-sm mt-1">Admin and HR users should use the Leave Types section instead.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Leave Types</h1>
                    <p className="text-gray-600 mt-1">View available leave types and their details</p>
                </div>
            </div>

            {safeLeaveTypes.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-200">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No leave types available</h3>
                    <p className="mt-2 text-gray-500">Contact your HR department to configure leave types.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {safeLeaveTypes.map((leaveType: any) => (
                        <div key={leaveType.id || leaveType._id} className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-100 p-3 rounded-lg">
                                        <FileText className="text-purple-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">{leaveType.name}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{leaveType.description || 'No description provided'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Days Allowed</span>
                                    <span className="text-sm font-medium text-gray-800">
                                        {(leaveType as any).maxDays || leaveType.daysAllowed || 0} days
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Code</span>
                                    <span className="text-sm font-medium text-gray-800">
                                        {(leaveType as any).code || 'N/A'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Type</span>
                                    <span className={`text-sm font-medium ${(leaveType as any).isPaid !== undefined
                                        ? (leaveType as any).isPaid
                                            ? 'text-green-600'
                                            : 'text-gray-600'
                                        : leaveType.paidLeave
                                            ? 'text-green-600'
                                            : 'text-gray-600'
                                        }`}>
                                        {(leaveType as any).isPaid !== undefined
                                            ? (leaveType as any).isPaid
                                                ? 'Paid Leave'
                                                : 'Unpaid Leave'
                                            : leaveType.paidLeave
                                                ? 'Paid Leave'
                                                : 'Unpaid Leave'}
                                    </span>
                                </div>

                                {(leaveType as any).eligibilityCriteria && (
                                    <div className="pt-3 border-t border-gray-100">
                                        <span className="text-sm text-gray-600 block mb-1">Eligibility</span>
                                        <p className="text-sm text-gray-800">{(leaveType as any).eligibilityCriteria}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                    Last updated: {leaveType.updatedAt
                                        ? new Date(leaveType.updatedAt).toLocaleDateString()
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                        <FileText className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-blue-800 mb-1">Need to apply for leave?</h4>
                        <p className="text-sm text-blue-700">
                            Visit the "Leave Requests" section to submit your leave application using these leave types.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}