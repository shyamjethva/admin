import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useData, Department } from "../../context/DataContext";
import { Modal } from "../Modal";

export function Departments() {
  const { departments, addDepartment, updateDepartment, deleteDepartment } = useData();

  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    headOfDepartment: "",
    employeeCount: 0,
  });

  const handleAdd = () => {
    setEditingDepartment(null);
    setFormData({ name: "", description: "", headOfDepartment: "", employeeCount: 0 });
    setShowModal(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name || "",
      description: department.description || "",
      headOfDepartment: department.headOfDepartment || "",
      employeeCount: Number(department.employeeCount || 0),
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      deleteDepartment(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ normalize payload (backend required fields)
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      headOfDepartment: formData.headOfDepartment.trim(),
      employeeCount: Number(formData.employeeCount || 0),
    };
    console.log("Submitting payload:", payload);


    if (editingDepartment) {
      updateDepartment(editingDepartment.id, payload);
    } else {
      addDepartment(payload as any);
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Departments</h1>
          <p className="text-gray-600 mt-1">Manage organizational departments</p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department) => (
          <div key={department.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{department.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{department.description}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(department)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Pencil size={16} />
                </button>

                <button
                  onClick={() => handleDelete(department.id)}
                  className="p-1 text-red-600 hover:bg-blue-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Head of Department</span>
                <span className="text-sm font-medium text-gray-800">
                  {department.headOfDepartment || "-"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Employees</span>
                <span className="text-sm font-medium text-gray-800">
                  {Number(department.employeeCount || 0)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          title={editingDepartment ? "Edit Department" : "Add Department"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Description */}
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

            {/* Head */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Head of Department
              </label>
              <input
                type="text"
                value={formData.headOfDepartment}
                onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Employee Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Count</label>
              <input
                type="number"
                value={formData.employeeCount}
                onChange={(e) =>
                  setFormData({ ...formData, employeeCount: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingDepartment ? "Update" : "Add"} Department
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
