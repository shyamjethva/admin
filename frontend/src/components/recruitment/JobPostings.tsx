import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Briefcase } from "lucide-react";
import { useData, JobPosting } from "../../context/DataContext";
import { Modal } from "../Modal";

type FormState = {
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract";
  experience: string;
  salary: string;
  description: string;
  requirements: string[];
  postedDate: string;
  status: "open" | "closed";
};

const emptyForm = (): FormState => ({
  title: "",
  department: "",
  location: "",
  type: "full-time",
  experience: "",
  salary: "",
  description: "",
  requirements: [""],
  postedDate: new Date().toISOString().split("T")[0],
  status: "open",
});

export function JobPostings() {
  const { jobPostings, addJobPosting, updateJobPosting, deleteJobPosting, departments } = useData();

  // Debug logging
  console.log('🔄 JobPostings - jobPostings:', jobPostings);
  console.log('🔄 JobPostings - departments:', departments);

  // ✅ SAFE ARRAY (prevents undefined.map crash)
  const jobs: JobPosting[] = useMemo(() => {
    return Array.isArray(jobPostings) ? jobPostings : [];
  }, [jobPostings]);

  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm());

  const handleAdd = () => {
    setEditingJob(null);
    setFormData(emptyForm());
    setShowModal(true);
  };

  const handleEdit = (job: JobPosting) => {
    setEditingJob(job);

    setFormData({
      title: job.title || "",
      department: (job as any).department || "",
      location: job.location || "",
      type: (job.type as any) || "full-time",
      experience: job.experience || "",
      salary: job.salary || "",
      description: job.description || "",
      requirements: Array.isArray((job as any).requirements) ? (job as any).requirements : [""],
      postedDate: (job as any).postedDate || new Date().toISOString().split("T")[0],
      status: ((job as any).status as any) || "open",
    });

    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      deleteJobPosting(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedRequirements = (formData.requirements || []).map((r) => r.trim()).filter(Boolean);

    const payload = {
      ...formData,
      requirements: cleanedRequirements.length ? cleanedRequirements : [],
    };

    if (editingJob) {
      updateJobPosting(editingJob.id, payload as any);
    } else {
      addJobPosting(payload as any);
    }

    setShowModal(false);
  };

  const addRequirement = () => {
    setFormData((p) => ({ ...p, requirements: [...(p.requirements || []), ""] }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData((p) => {
      const list = [...(p.requirements || [])];
      list[index] = value;
      return { ...p, requirements: list };
    });
  };

  const removeRequirement = (index: number) => {
    setFormData((p) => ({
      ...p,
      requirements: (p.requirements || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Job Postings</h1>
          <p className="text-gray-600 mt-1">Manage job openings and positions</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Post New Job
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {jobs.map((job) => {
          const reqs = Array.isArray((job as any).requirements) ? (job as any).requirements : [];

          return (
            <div key={job.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Briefcase className="text-blue-600" size={24} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${(job as any).status === "open"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {(job as any).status || "open"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-4">
                      <span className="text-sm text-gray-600">📍 {(job as any).location || "-"}</span>
                      <span className="text-sm text-gray-600">🏢 🏢 {
                        (job as any).departmentId?.name ||
                        departments.find((d: any) => String(d.id || d._id) === String((job as any).departmentId))?.name ||
                        "-"
                      }
                      </span>
                      <span className="text-sm text-gray-600">⏰ {(job as any).type || "-"}</span>
                      <span className="text-sm text-gray-600">💼 {(job as any).experience || "-"}</span>
                      <span className="text-sm text-gray-600">💰 {(job as any).salary || "-"}</span>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{(job as any).description || "-"}</p>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
                      {reqs.length ? (
                        <ul className="list-disc list-inside space-y-1">
                          {reqs.map((r: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600">
                              {r}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No requirements added.</p>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">Posted on: {(job as any).postedDate || "-"}</p>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleEdit(job)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(job.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {jobs.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 border border-gray-200 text-center text-gray-600">
            No job postings found.
          </div>
        )}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editingJob ? "Edit Job Posting" : "Post New Job"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  {(Array.isArray(departments) ? departments : []).map((dept: any) => (
                    <option key={String(dept.id || dept._id)} value={String(dept.id || dept._id)}>
                      {dept.name}
                    </option>

                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData((p) => ({ ...p, experience: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3-5 years"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData((p) => ({ ...p, salary: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 8LPA - 12LPA"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
              {(formData.requirements || []).map((req, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter requirement"
                  />
                  {(formData.requirements || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addRequirement} className="text-sm text-blue-600 hover:text-blue-700">
                + Add Requirement
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {editingJob ? "Update" : "Post"} Job
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
