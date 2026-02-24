import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, User } from 'lucide-react';
import { useData, Candidate } from '../../context/DataContext';
import { Modal } from '../Modal';

type CandidateStatus = 'applied' | 'screening' | 'interview' | 'offered' | 'rejected';

export function Candidates() {
  const { candidates, addCandidate, updateCandidate, deleteCandidate, jobPostings } = useData();

  // Debug logging
  console.log('🔄 Candidates - candidates:', candidates);
  console.log('🔄 Candidates - jobPostings:', jobPostings);

  const [showModal, setShowModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);

  // ✅ Map: supports id/_id
  const jobTitleById = useMemo(() => {
    const map = new Map<string, string>();
    (jobPostings || []).forEach((j: any) => {
      const key = String(j?.id || j?._id || '');
      if (key) map.set(key, j?.title || '');
    });
    return map;
  }, [jobPostings]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    jobId: '',
    experience: '',
    status: 'applied' as CandidateStatus,
    appliedDate: new Date().toISOString().split('T')[0],
  });

  const handleAdd = () => {
    setEditingCandidate(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      jobId: '',
      experience: '',
      status: 'applied',
      appliedDate: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleEdit = (candidate: any) => {
    setEditingCandidate(candidate);

    // ✅ jobId can be string OR populated object
    const resolvedJobId = String(
      (typeof candidate?.jobId === 'object' ? candidate?.jobId?._id : candidate?.jobId) ||
      candidate?.job?._id ||
      candidate?.jobPostingId ||
      candidate?.positionId ||
      ''
    );

    setFormData({
      name: candidate?.name || '',
      email: candidate?.email || '',
      phone: candidate?.phone || '',
      jobId: resolvedJobId,
      experience:
        candidate?.experience ??
        candidate?.yearsOfExperience ??
        candidate?.experienceYears ??
        candidate?.exp ??
        '',
      status: (candidate?.status || 'applied') as CandidateStatus,
      appliedDate: candidate?.appliedDate || new Date().toISOString().split('T')[0],
    });

    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      deleteCandidate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.jobId) {
      alert('Please select a position (job).');
      return;
    }

    if (editingCandidate) {
      updateCandidate((editingCandidate as any).id || (editingCandidate as any)._id, formData as any);
    } else {
      addCandidate(formData as any);
    }

    setShowModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-700';
      case 'screening': return 'bg-yellow-100 text-yellow-700';
      case 'interview': return 'bg-purple-100 text-purple-700';
      case 'offered': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // ✅ THIS is the main fix
  const resolvePositionLabel = (candidate: any) => {
    // 1) if populate returns job in jobId
    if (candidate?.jobId && typeof candidate.jobId === 'object' && candidate.jobId.title) {
      return candidate.jobId.title;
    }

    // 2) if populate returns job in job
    if (candidate?.job?.title) return candidate.job.title;

    // 3) try mapping using jobId string/_id
    const jid = String(
      (typeof candidate?.jobId === 'object' ? candidate?.jobId?._id : candidate?.jobId) ||
      candidate?.job?._id ||
      ''
    );
    if (jid && jobTitleById.get(jid)) return jobTitleById.get(jid);

    // 4) fallback fields
    return candidate?.position || candidate?.jobTitle || '-';
  };

  const resolveExperience = (candidate: any) => {
    return (
      candidate?.experience ??
      candidate?.yearsOfExperience ??
      candidate?.experienceYears ??
      candidate?.exp ??
      '-'
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Candidates</h1>
          <p className="text-gray-600 mt-1">Manage job applicants and candidates</p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Candidate
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {(candidates || []).map((candidate: any) => (
                <tr key={candidate?.id || candidate?._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User size={16} className="text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{candidate?.name}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{candidate?.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{candidate?.phone}</td>

                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {resolvePositionLabel(candidate)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {resolveExperience(candidate)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate?.status)}`}>
                      {candidate?.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(candidate)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(candidate?.id || candidate?._id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editingCandidate ? 'Edit Candidate' : 'Add Candidate'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select
                value={formData.jobId}
                onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Position</option>
                {(jobPostings || [])
                  .filter((j: any) => j.status === 'open')
                  .map((job: any) => {
                    const jid = String(job?.id || job?._id || '');
                    return (
                      <option key={jid} value={jid}>
                        {job.title}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 3 years"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="interview">Interview</option>
                <option value="offered">Offered</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {editingCandidate ? 'Update' : 'Add'} Candidate
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
