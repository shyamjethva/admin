import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useData, Employee } from "../../context/DataContext";
import { Modal } from "../Modal";

type FormState = {
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  designationId: string;
  joiningDate: string;
  salary: number;
  status: "active" | "inactive";
};

const emptyForm: FormState = {
  name: "",
  email: "",
  phone: "",
  departmentId: "",
  designationId: "",
  joiningDate: "",
  salary: 0,
  status: "active",
};

export function AllEmployees() {
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    departments,
    designations,
  } = useData();

  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<FormState>(emptyForm);

  // ---------------------------
  // Helpers
  // ---------------------------
  const getEmployeeDeptName = (emp: any) => {
    // populated object
    if (emp?.departmentId && typeof emp.departmentId === "object") return emp.departmentId.name || "-";
    if (emp?.departmentName) return emp.departmentName;

    const deptId = String(emp?.departmentId || "");
    const found = departments.find((d: any) => String(d.id || d._id) === deptId);

    return found?.name || "-";
  };

  const getEmployeeDesigTitle = (emp: any) => {
    if (emp?.designationId && typeof emp.designationId === "object") return emp.designationId.name || "-";
    if (emp?.designationTitle) return emp.designationTitle;

    const desigId = String(emp?.designationId || "");
    const found: any = (designations as any[]).find((d: any) => String(d.id || d._id) === desigId);

    return found?.title || found?.name || "-";
  };


  // ---------------------------
  // Designation filter by selected departmentId
  // ---------------------------
  const filteredDesignations = useMemo(() => {
    const deptId = formData.departmentId;
    if (!deptId) return [];

    return (designations as any[]).filter((d) => {
      // expecting d.departmentId = "mongoId"
      return String(d.departmentId) === String(deptId);
    });
  }, [designations, formData.departmentId]);

  // ---------------------------
  // Search employees
  // ---------------------------
  const filteredEmployees = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return employees;

    return employees.filter((emp: any) => {
      const deptName = getEmployeeDeptName(emp).toLowerCase();
      const desigTitle = getEmployeeDesigTitle(emp).toLowerCase();

      return (
        String(emp.name || "").toLowerCase().includes(q) ||
        String(emp.email || "").toLowerCase().includes(q) ||
        deptName.includes(q) ||
        desigTitle.includes(q)
      );
    });
  }, [employees, searchTerm, departments, designations]);


  // ---------------------------
  // Actions
  // ---------------------------
  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);

    // employee can store ids; support both keys
    const deptId = String((emp as any).departmentId || emp.department || "");
    const desigId = String((emp as any).designationId || emp.designation || "");

    setFormData({
      name: emp.name || "",
      email: emp.email || "",
      phone: emp.phone || "",
      departmentId: deptId,
      designationId: desigId,
      joiningDate: emp.joiningDate || "",
      salary: Number(emp.salary || 0),
      status: (emp.status as any) || "active",
    });

    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      deleteEmployee(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Backend expects: departmentId + designationId
    const payload: any = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      departmentId: formData.departmentId,
      designationId: formData.designationId,
      joiningDate: formData.joiningDate,
      salary: formData.salary,
      status: formData.status,
    };

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, payload);
    } else {
      addEmployee(payload);
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">All Employees</h1>
          <p className="text-gray-600 mt-1">Manage your organization's employees</p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Employee
        </button>
      </div>

      {/* Table + Search */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Designation
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
              {filteredEmployees.map((emp) => {
                const deptId = String((emp as any).departmentId || emp.department || "");
                const desigId = String((emp as any).designationId || emp.designation || "");

                return (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{emp.name}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {emp.email}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {emp.phone}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {getEmployeeDeptName(emp)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {getEmployeeDesigTitle(emp)}
                    </td>


                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${emp.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {emp.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(emp)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          title={editingEmployee ? "Edit Employee" : "Add Employee"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    departmentId: e.target.value,
                    designationId: "", // ✅ reset designation on dept change
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation
              </label>
              <select
                value={formData.designationId}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, designationId: e.target.value }))
                }
                disabled={!formData.departmentId}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                required
              >
                <option value="">
                  {formData.departmentId ? "Select Designation" : "Select Department first"}
                </option>

                {filteredDesignations.map((des: any) => (
                  <option key={des.id} value={des.id}>
                    {des.title || des.name}
                  </option>
                ))}
              </select>

              {formData.departmentId && (
                <p className="text-xs text-gray-500 mt-1">
                  Showing {filteredDesignations.length} designations
                </p>
              )}
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joining Date
              </label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, joiningDate: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary
              </label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, salary: Number(e.target.value) }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, status: e.target.value as any }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingEmployee ? "Update" : "Add"} Employee
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
