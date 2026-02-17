// import { useState } from 'react';
// import { Plus, Download, DollarSign } from 'lucide-react';
// import { useData, PayrollEntry } from '../../context/DataContext';
// import { useNotifications } from '../../context/NotificationContext';
// import { Modal } from '../Modal';

// export function PayrollProcessing() {
//   const { payrollEntries, addPayrollEntry, updatePayrollEntry, employees } = useData();
//   const { addNotification } = useNotifications();
//   const [showModal, setShowModal] = useState(false);
//   const [formData, setFormData] = useState({
//     employeeId: '',
//     employeeName: '',
//     month: '',
//     basicSalary: 0,
//     allowances: 0,
//     deductions: 0,
//     netSalary: 0,
//     status: 'pending' as 'pending' | 'processed' | 'paid',
//   });

//   const handleAdd = () => {
//     setFormData({
//       employeeId: '',
//       employeeName: '',
//       month: new Date().toISOString().substring(0, 7),
//       basicSalary: 0,
//       allowances: 0,
//       deductions: 0,
//       netSalary: 0,
//       status: 'pending',
//     });
//     setShowModal(true);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const netSalary = formData.basicSalary + formData.allowances - formData.deductions;
//     addPayrollEntry({ ...formData, netSalary });
//     setShowModal(false);
//   };

//   const handleEmployeeChange = (employeeId: string) => {
//     const employee = employees.find(e => e.id === employeeId);
//     if (employee) {
//       setFormData({
//         ...formData,
//         employeeId,
//         employeeName: employee.name,
//         basicSalary: employee.salary
//       });
//     }
//   };

//   const handleProcess = (id: string) => {
//     updatePayrollEntry(id, { status: 'processed' });
//   };

//   const handleMarkPaid = (id: string) => {
//     const entry = payrollEntries.find(e => e.id === id);
//     updatePayrollEntry(id, { status: 'paid' });

//     // Send notification to employee
//     if (entry) {
//       addNotification({
//         type: 'payroll',
//         title: 'Salary Processed',
//         message: `Your salary for ${entry.month} has been processed (₹${entry.netSalary.toLocaleString()})`,
//         priority: 'medium',
//         relatedId: id,
//         actionUrl: 'payroll-processing',
//       });
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Payroll Processing</h1>
//           <p className="text-gray-600 mt-1">Process and manage employee salaries</p>
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={() => alert('Report downloaded!')}
//             className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//           >
//             <Download size={20} />
//             Export
//           </button>
//           <button
//             onClick={handleAdd}
//             className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             <Plus size={20} />
//             Process Payroll
//           </button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="bg-blue-100 p-3 rounded-lg">
//               <DollarSign className="text-blue-600" size={24} />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Total Payroll</p>
//               <p className="text-2xl font-bold text-gray-800">
//                 ${payrollEntries.reduce((sum, p) => sum + p.netSalary, 0).toLocaleString()}
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="bg-yellow-100 p-3 rounded-lg">
//               <DollarSign className="text-yellow-600" size={24} />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Pending</p>
//               <p className="text-2xl font-bold text-gray-800">
//                 {payrollEntries.filter(p => p.status === 'pending').length}
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="bg-green-100 p-3 rounded-lg">
//               <DollarSign className="text-green-600" size={24} />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Paid</p>
//               <p className="text-2xl font-bold text-gray-800">
//                 {payrollEntries.filter(p => p.status === 'paid').length}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow border border-gray-200">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Salary</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allowances</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {payrollEntries.map((entry) => (
//                 <tr key={entry.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="font-medium text-gray-900">{entry.employeeName}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-gray-600">{entry.month}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-gray-600">${entry.basicSalary.toLocaleString()}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-green-600">${entry.allowances.toLocaleString()}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-red-600">${entry.deductions.toLocaleString()}</td>
//                   <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${entry.netSalary.toLocaleString()}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${entry.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
//                       entry.status === 'processed' ? 'bg-blue-100 text-blue-700' :
//                         'bg-green-100 text-green-700'
//                       }`}>
//                       {entry.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {entry.status === 'pending' && (
//                       <button
//                         onClick={() => handleProcess(entry.id)}
//                         className="text-sm text-blue-600 hover:text-blue-700"
//                       >
//                         Process
//                       </button>
//                     )}
//                     {entry.status === 'processed' && (
//                       <button
//                         onClick={() => handleMarkPaid(entry.id)}
//                         className="text-sm text-green-600 hover:text-green-700"
//                       >
//                         Mark Paid
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {showModal && (
//         <Modal onClose={() => setShowModal(false)} title="Process Payroll">
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
//               <select
//                 value={formData.employeeId}
//                 onChange={(e) => handleEmployeeChange(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               >
//                 <option value="">Select Employee</option>
//                 {employees.map((emp) => (
//                   <option key={emp.id} value={emp.id}>{emp.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
//               <input
//                 type="month"
//                 value={formData.month}
//                 onChange={(e) => setFormData({ ...formData, month: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary</label>
//               <input
//                 type="number"
//                 value={formData.basicSalary}
//                 onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Allowances</label>
//               <input
//                 type="number"
//                 value={formData.allowances}
//                 onChange={(e) => setFormData({ ...formData, allowances: Number(e.target.value) })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Deductions</label>
//               <input
//                 type="number"
//                 value={formData.deductions}
//                 onChange={(e) => setFormData({ ...formData, deductions: Number(e.target.value) })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <div className="flex justify-between items-center">
//                 <span className="text-sm font-medium text-gray-700">Net Salary</span>
//                 <span className="text-xl font-bold text-gray-900">
//                   ${(formData.basicSalary + formData.allowances - formData.deductions).toLocaleString()}
//                 </span>
//               </div>
//             </div>
//             <div className="flex gap-3 pt-4">
//               <button
//                 type="submit"
//                 className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//               >
//                 Process Payroll
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setShowModal(false)}
//                 className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}
//     </div>
//   );
// }



// src/components/payroll/PayrollProcessing.tsx
import { useMemo, useState } from "react";
import { Plus, Download, DollarSign } from "lucide-react";
import { useData } from "../../context/DataContext";
import { useNotifications } from "../../context/NotificationContext";
import { Modal } from "../Modal";
import * as XLSX from 'xlsx';

type PayrollStatus = "pending" | "processed" | "paid";

export function PayrollProcessing() {
  const { payrollEntries, addPayrollEntry, updatePayrollEntry, employees } = useData();
  const { addNotification } = useNotifications();

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    month: new Date().toISOString().substring(0, 7), // YYYY-MM
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
    netSalary: 0,
    status: "pending" as PayrollStatus,
  });

  const totals = useMemo(() => {
    const totalPayroll = payrollEntries.reduce((sum: number, p: any) => sum + (Number(p.netSalary) || 0), 0);
    const pending = payrollEntries.filter((p: any) => p.status === "pending").length;
    const paid = payrollEntries.filter((p: any) => p.status === "paid").length;
    return { totalPayroll, pending, paid };
  }, [payrollEntries]);

  const resetForm = () => {
    setFormData({
      employeeId: "",
      employeeName: "",
      month: new Date().toISOString().substring(0, 7),
      basicSalary: 0,
      allowances: 0,
      deductions: 0,
      netSalary: 0,
      status: "pending",
    });
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees.find((e: any) => e.id === employeeId);
    if (!employee) return;

    setFormData((prev) => ({
      ...prev,
      employeeId,
      employeeName: employee.name,
      basicSalary: Number(employee.salary) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!formData.employeeId) {
      alert("Please select employee");
      return;
    }
    if (!formData.month) {
      alert("Please select month");
      return;
    }

    // ✅ Net Salary
    const netSalary = Number(formData.basicSalary) + Number(formData.allowances) - Number(formData.deductions);

    // ✅ Frontend duplicate check (employeeId + month)
    // const exists = payrollEntries.some(
    //   (p: any) => p.employeeId === formData.employeeId && p.month === formData.month
    // );

    const exists = payrollEntries.some((p: any) => {
      const pid = p.employeeId || p.employee?._id || p.employee?.id;
      return pid === formData.employeeId && p.month === formData.month;
    });

    if (exists) {
      alert("Is employee ka is month ka payroll already added hai.");
      return;
    }

    setSubmitting(true);
    try {
      // addPayrollEntry should be async and return boolean (true=created, false=409 already exists)
      const created = await addPayrollEntry({ ...formData, netSalary });

      if (created === false) {
        alert("Payroll already exists for this employee & month.");
      }

      setShowModal(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to create payroll.");
      console.error(err?.response?.data || err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcess = async (id: string) => {
    try {
      await updatePayrollEntry(id, { status: "processed" });
    } catch (err) {
      console.error(err);
      alert("Failed to process payroll.");
    }
  };

  const handleMarkPaid = async (id: string) => {
    const entry = payrollEntries.find((e: any) => e.id === id);
    try {
      await updatePayrollEntry(id, { status: "paid" });

      // Send notification to employee
      if (entry) {
        addNotification({
          type: "payroll",
          title: "Salary Processed",
          message: `Your salary for ${entry.month} has been processed (₹${Number(entry.netSalary || 0).toLocaleString()})`,
          priority: "medium",
          relatedId: id,
          actionUrl: "payroll-processing",
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to mark payroll paid.");
    }
  };

  const liveNetSalary = useMemo(() => {
    return Number(formData.basicSalary) + Number(formData.allowances) - Number(formData.deductions);
  }, [formData.basicSalary, formData.allowances, formData.deductions]);

  const handleExport = () => {
    // Prepare data for export
    const exportData = payrollEntries.map((entry: any) => ({
      'Employee Name': entry.employeeName,
      'Month': entry.month,
      'Basic Salary': `₹${Number(entry.basicSalary || 0).toLocaleString()}`,
      'Allowances': `₹${Number(entry.allowances || 0).toLocaleString()}`,
      'Deductions': `₹${Number(entry.deductions || 0).toLocaleString()}`,
      'Net Salary': `₹${Number(entry.netSalary || 0).toLocaleString()}`,
      'Status': entry.status
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll Data");

    // Generate filename with current date
    const fileName = `Payroll_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;

    // Download the file
    XLSX.writeFile(wb, fileName);

    // Show success message
    alert("Payroll report exported successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Payroll Processing</h1>
          <p className="text-gray-600 mt-1">Process and manage employee salaries</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download size={20} />
            Export
          </button>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Process Payroll
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Payroll</p>
              <p className="text-2xl font-bold text-gray-800">
                ₹{Number(totals.totalPayroll).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <DollarSign className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-800">{totals.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-gray-800">{totals.paid}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Basic Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allowances
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deductions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {payrollEntries.map((entry: any) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{entry.employeeName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{entry.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    ₹{Number(entry.basicSalary || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600">
                    ₹{Number(entry.allowances || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600">
                    ₹{Number(entry.deductions || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    ₹{Number(entry.netSalary || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${entry.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : entry.status === "processed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                        }`}
                    >
                      {entry.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.status === "pending" && (
                      <button
                        onClick={() => handleProcess(entry.id)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Process
                      </button>
                    )}

                    {entry.status === "processed" && (
                      <button
                        onClick={() => handleMarkPaid(entry.id)}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {payrollEntries.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={8}>
                    No payroll entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal onClose={() => (submitting ? null : setShowModal(false))} title="Process Payroll">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select
                value={formData.employeeId}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={submitting}
              >
                <option value="">Select Employee</option>
                {employees.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <input
                type="month"
                value={formData.month}
                onChange={(e) => setFormData((p) => ({ ...p, month: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary</label>
              <input
                type="number"
                value={formData.basicSalary}
                onChange={(e) => setFormData((p) => ({ ...p, basicSalary: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allowances</label>
              <input
                type="number"
                value={formData.allowances}
                onChange={(e) => setFormData((p) => ({ ...p, allowances: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deductions</label>
              <input
                type="number"
                value={formData.deductions}
                onChange={(e) => setFormData((p) => ({ ...p, deductions: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={submitting}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Net Salary</span>
                <span className="text-xl font-bold text-gray-900">₹{Number(liveNetSalary).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 px-4 py-2 rounded-lg text-white ${submitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
              >
                {submitting ? "Processing..." : "Process Payroll"}
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg ${submitting
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
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
