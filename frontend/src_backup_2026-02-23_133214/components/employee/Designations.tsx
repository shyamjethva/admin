import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useData } from "../../context/DataContext";
import { Modal } from "../Modal";

type DesignationRow = any;

export function Designations() {
  const { designations, addDesignation, updateDesignation, deleteDesignation, departments } =
    useData();

  const [showModal, setShowModal] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<DesignationRow | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    departmentId: "", // ✅ store department id
    level: "",
    description: "",
  });

  // ✅ department name by id
  const deptNameById = useMemo(() => {
    const map = new Map<string, string>();
    (departments as any[]).forEach((d: any) => {
      const id = String(d.id || d._id || "");
      map.set(id, d.name || "");
    });
    return map;
  }, [departments]);

  const getDeptName = (designation: any) => {
    // if DataContext provides departmentName use it
    if (designation?.departmentName) return designation.departmentName;

    // if designation has populated departmentId
    if (designation?.departmentId && typeof designation.departmentId === "object") {
      return designation.departmentId?.name || "-";
    }

    // if designation has departmentId string
    const deptId = String(designation?.departmentId || "");
    return deptNameById.get(deptId) || "-";
  };

  const handleAdd = () => {
    setEditingDesignation(null);
    setFormData({ title: "", departmentId: "", level: "", description: "" });
    setShowModal(true);
  };

  const handleEdit = (designation: any) => {
    setEditingDesignation(designation);

    // support both: departmentId string OR populated object
    const deptId = String(designation?.departmentId?._id || designation?.departmentId || "");

    setFormData({
      title: designation.title || designation.name || "",
      departmentId: deptId,
      level: designation.level || "",
      description: designation.description || "",
    });

    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this designation?")) {
      deleteDesignation(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ backend expects: name + departmentId
    const payload = {
      title: formData.title,
      departmentId: formData.departmentId,
      level: formData.level,
      description: formData.description,
    } as any;

    if (editingDesignation) {
      updateDesignation(editingDesignation.id, payload);
    } else {
      addDesignation(payload);
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Designations</h1>
          <p className="text-gray-600 mt-1">Manage job titles and positions</p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Designation
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {(designations as any[]).map((designation: any) => (
                <tr key={designation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {designation.title || designation.name || "-"}
                    </div>
                  </td>

                  {/* ✅ Department name from departments list (or populated) */}
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {getDeptName(designation)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {designation.level}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-600">{designation.description}</td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(designation)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(designation.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {(designations as any[]).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No designations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          title={editingDesignation ? "Edit Designation" : "Add Designation"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Department</option>
                {(departments as any[]).map((d: any) => {
                  const id = String(d.id || d._id || "");
                  return (
                    <option key={id} value={id}>
                      {d.name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Level</option>
                <option value="Entry">Entry</option>
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
                <option value="Manager">Manager</option>
                <option value="Director">Director</option>
                <option value="Executive">Executive</option>
              </select>
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

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingDesignation ? "Update" : "Add"} Designation
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
