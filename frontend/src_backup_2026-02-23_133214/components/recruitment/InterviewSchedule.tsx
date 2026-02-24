import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Calendar, Video, Phone, MapPin } from 'lucide-react';
import { useData, Interview } from '../../context/DataContext';
import { useNotifications } from '../../context/NotificationContext';
import { Modal } from '../Modal';

type Mode = 'in-person' | 'video' | 'phone';
type Status = 'scheduled' | 'completed' | 'cancelled';

export function InterviewSchedule() {
  const { interviews, addInterview, updateInterview, deleteInterview, candidates, jobPostings } = useData();
  const { addNotification } = useNotifications();

  const [showModal, setShowModal] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);

  const [formData, setFormData] = useState({
    candidateId: '',
    candidateName: '',
    position: '',
    date: '',
    time: '',
    interviewer: '',
    mode: 'video' as Mode,
    status: 'scheduled' as Status,
  });

  // ✅ safe arrays
  const safeCandidates: any[] = useMemo(() => (Array.isArray(candidates) ? candidates : []), [candidates]);
  const safeInterviews: any[] = useMemo(() => (Array.isArray(interviews) ? interviews : []), [interviews]);
  const safeJobs: any[] = useMemo(() => (Array.isArray(jobPostings) ? jobPostings : []), [jobPostings]);

  // ✅ Job title lookup (supports id/_id)
  const jobTitleById = useMemo(() => {
    const map = new Map<string, string>();
    safeJobs.forEach((j: any) => {
      const jid = String(j?.id || j?._id || '');
      if (jid) map.set(jid, j?.title || '');
    });
    return map;
  }, [safeJobs]);

  const handleAdd = () => {
    setEditingInterview(null);
    setFormData({
      candidateId: '',
      candidateName: '',
      position: '',
      date: '',
      time: '',
      interviewer: '',
      mode: 'video',
      status: 'scheduled',
    });
    setShowModal(true);
  };

  const handleEdit = (interview: any) => {
    setEditingInterview(interview);
    setFormData({
      candidateId: String(interview?.candidateId || ''),
      candidateName: interview?.candidateName || '',
      position: interview?.position || '',
      date: interview?.date || '',
      time: interview?.time || '',
      interviewer: interview?.interviewer || '',
      mode: (interview?.mode || 'video') as Mode,
      status: (interview?.status || 'scheduled') as Status,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this interview?')) {
      deleteInterview(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.candidateId) {
      alert('Please select a candidate');
      return;
    }

    if (editingInterview) {
      updateInterview((editingInterview as any).id || (editingInterview as any)._id, formData as any);
    } else {
      addInterview(formData as any);

      addNotification({
        type: 'interview',
        title: 'Interview Scheduled',
        message: `Interview scheduled with ${formData.candidateName} for ${formData.position} on ${formData.date} at ${formData.time}`,
        priority: 'high',
        relatedId: Date.now().toString(),
        actionUrl: 'interview-schedule',
      });
    }

    setShowModal(false);
  };

  // ✅ candidateId can be id/_id, and candidate may have jobId (string or populated object)
  const handleCandidateChange = (candidateId: string) => {
    const selected = safeCandidates.find((c: any) => String(c.id || c._id) === String(candidateId));
    if (!selected) {
      setFormData((p) => ({ ...p, candidateId, candidateName: '', position: '' }));
      return;
    }

    // Prefer populated job title from candidate.jobId.title (or candidate.job.title)
    const fromPopulatedJob =
      (selected?.jobId && typeof selected.jobId === 'object' ? selected.jobId.title : '') ||
      selected?.job?.title ||
      '';

    // If candidate has jobId string/object, resolve title from jobPostings list
    const jid = String(
      (selected?.jobId && typeof selected.jobId === 'object' ? selected.jobId?._id : selected?.jobId) ||
      selected?.job?._id ||
      ''
    );

    const resolvedTitle =
      fromPopulatedJob ||
      (jid && jobTitleById.get(jid) ? jobTitleById.get(jid) : '') ||
      selected?.position || // fallback (older field)
      selected?.jobTitle ||
      '-';

    setFormData((p) => ({
      ...p,
      candidateId,
      candidateName: selected?.name || '',
      position: resolvedTitle || '',
    }));
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'video':
        return <Video size={16} />;
      case 'phone':
        return <Phone size={16} />;
      case 'in-person':
        return <MapPin size={16} />;
      default:
        return <Video size={16} />;
    }
  };

  // ✅ show ALL candidates (no status filter that can hide them)
  const candidateOptions = useMemo(() => {
    return safeCandidates.map((c: any) => {
      const cid = String(c.id || c._id || '');
      const labelPos =
        (c?.jobId && typeof c.jobId === 'object' ? c.jobId.title : '') ||
        c?.job?.title ||
        (() => {
          const jid = String(
            (c?.jobId && typeof c.jobId === 'object' ? c.jobId?._id : c?.jobId) || c?.job?._id || ''
          );
          return (jid && jobTitleById.get(jid)) || c?.position || c?.jobTitle || '-';
        })();

      return { id: cid, name: c?.name || 'Unnamed', email: c?.email || '', position: labelPos };
    });
  }, [safeCandidates, jobTitleById]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Interview Schedule</h1>
          <p className="text-gray-600 mt-1">Schedule and manage interviews</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Schedule Interview
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {safeInterviews.map((interview: any) => (
          <div key={interview.id || interview._id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{interview.candidateName}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${interview.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-700'
                      : interview.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                      }`}
                  >
                    {interview.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{interview.position}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                      <Calendar size={14} />
                      {interview.date}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="text-sm font-medium text-gray-800">{interview.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Interviewer</p>
                    <p className="text-sm font-medium text-gray-800">{interview.interviewer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mode</p>
                    <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                      {getModeIcon(interview.mode)}
                      {interview.mode}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button onClick={() => handleEdit(interview)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(interview.id || interview._id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {safeInterviews.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 border border-gray-200 text-center text-gray-600">
            No interviews scheduled yet.
          </div>
        )}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editingInterview ? 'Edit Interview' : 'Schedule Interview'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Candidate</label>
              <select
                value={formData.candidateId}
                onChange={(e) => handleCandidateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Candidate</option>
                {candidateOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.email ? `(${c.email})` : ''} - {c.position}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData((p) => ({ ...p, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interviewer</label>
              <input
                type="text"
                value={formData.interviewer}
                onChange={(e) => setFormData((p) => ({ ...p, interviewer: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interview Mode</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData((p) => ({ ...p, mode: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="video">Video Call</option>
                <option value="phone">Phone Call</option>
                <option value="in-person">In Person</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {editingInterview ? 'Update' : 'Schedule'} Interview
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
