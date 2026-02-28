import { useState } from 'react';
import { Plus, Pencil, Trash2, Megaphone, AlertCircle } from 'lucide-react';
import { useData, Announcement } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Modal } from '../Modal';

export function Announcements() {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement, departments } = useData();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'company-wide' as 'company-wide' | 'department' | 'hr-updates' | 'events' | 'alerts' | 'achievements' | 'policy',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    department: '',
    createdBy: user?.name || '',
    createdAt: new Date().toISOString().split('T')[0],
    expiresAt: '',
  });

  const canManage = user?.role === 'admin' || user?.role === 'hr';

  // Employees should see relevant announcements based on audience and department
  const filteredAnnouncements = announcements.filter(a => {
    // For employees, only show announcements intended for them
    if (!canManage) {
      // Check audience targeting
      const audience = a.audience || 'all';
      if (audience === 'hr' && user?.role !== 'hr') {
        return false;
      }

      // Check department targeting
      if (a.category === 'department' && a.department && a.department !== user?.department) {
        return false;
      }

      // For general/company-wide announcements, show to all employees
      if (audience === 'all' || a.category === 'company-wide' || a.type === 'general') {
        return true;
      }
    }

    // Category filtering logic - handle both frontend and backend category formats
    if (filterCategory !== 'all') {
      const announcementCategory = a.category || a.type || 'general';
      const normalizedAnnouncementCategory = announcementCategory.toLowerCase();
      const normalizedFilter = filterCategory.toLowerCase();

      // Backend to frontend mapping
      const backendToFrontendMap: Record<string, string> = {
        'hr': 'hr-updates',
        'event': 'events',
        'alert': 'alerts',
        'achievement': 'achievements',
        'general': 'company-wide',
        'policy': 'policy',
        'department': 'department'
      };

      if (normalizedAnnouncementCategory === normalizedFilter) return true;
      const mappedCategory = backendToFrontendMap[normalizedAnnouncementCategory];
      if (mappedCategory === normalizedFilter) return true;
      if (normalizedFilter === 'company-wide' && normalizedAnnouncementCategory === 'general') return true;
      return false;
    }

    // For 'all' category, show everything
    return true;
  });

  const handleAdd = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      category: 'company-wide',
      priority: 'medium',
      department: '',
      createdBy: user?.name || '',
      createdAt: new Date().toISOString().split('T')[0],
      expiresAt: '',
    });
    setShowModal(true);
  };

  const handleEdit = (announcement: Announcement) => {
    console.log('✏️ Editing announcement:', announcement);
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category || 'company-wide',
      priority: announcement.priority || 'medium',
      department: announcement.department || '',
      createdBy: announcement.createdBy || user?.name || '',
      createdAt: announcement.createdAt || new Date().toISOString().split('T')[0],
      expiresAt: announcement.expiresAt || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      console.log('🗑️ Deleting announcement ID:', id);
      deleteAnnouncement(id)
        .then(() => {
          console.log('✅ Delete successful');
        })
        .catch((error: any) => {
          console.error('❌ Delete failed:', error);
          // Error is already handled in DataContext
        });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanData = {
      ...formData,
      department: formData.category === 'department' ? formData.department : undefined,
      expiresAt: formData.expiresAt || undefined,
    };

    console.log('📋 Submitting announcement data:', cleanData);
    console.log('✏️ Editing mode:', !!editingAnnouncement);

    if (editingAnnouncement) {
      console.log('🔄 Updating announcement ID:', editingAnnouncement.id);
      updateAnnouncement(editingAnnouncement.id, cleanData)
        .then(() => {
          console.log('✅ Update successful');
          setShowModal(false);
        })
        .catch((error: any) => {
          console.error('❌ Update failed:', error);
          // Error is already handled in DataContext
        });
    } else {
      console.log('➕ Creating new announcement');
      addAnnouncement(cleanData)
        .then(() => {
          console.log('✅ Creation successful');
          // Send notification about new announcement
          addNotification({
            type: 'announcement',
            title: 'New Announcement',
            message: formData.title,
            priority: formData.priority,
            relatedId: Date.now().toString(),
            actionUrl: 'announcements',
          });
          setShowModal(false);
        })
        .catch((error: any) => {
          console.error('❌ Creation failed:', error);
          // Error is already handled in DataContext
        });
    }
  };

  const getCategoryInfo = (category: string) => {
    console.log('🔍 getCategoryInfo called with category:', category, 'typeof:', typeof category);

    // Handle both frontend categories and backend types
    const categoryMapping: Record<string, { label: string; color: string }> = {
      // Frontend categories
      'company-wide': { label: 'Company-Wide', color: 'bg-blue-100 text-blue-700' },
      'department': { label: 'Department', color: 'bg-purple-100 text-purple-700' },
      'hr-updates': { label: 'HR Updates', color: 'bg-green-100 text-green-700' },
      'events': { label: 'Events', color: 'bg-pink-100 text-pink-700' },
      'alerts': { label: 'Alerts', color: 'bg-red-100 text-red-700' },
      'achievements': { label: 'Achievements', color: 'bg-yellow-100 text-yellow-700' },
      'policy': { label: 'Policy', color: 'bg-indigo-100 text-indigo-700' },
      'general': { label: 'General', color: 'bg-gray-100 text-gray-700' },

      // Backend types (mapped to frontend display)
      'hr': { label: 'HR Updates', color: 'bg-green-100 text-green-700' },
      'event': { label: 'Events', color: 'bg-pink-100 text-pink-700' },
      'alert': { label: 'Alerts', color: 'bg-red-100 text-red-700' },
      'achievement': { label: 'Achievements', color: 'bg-yellow-100 text-yellow-700' },
    };

    // Normalize the category value
    const normalizedCategory = category?.toLowerCase() || '';

    // Try direct mapping first
    let result = categoryMapping[normalizedCategory];

    // If not found, try to map backend types to frontend categories
    if (!result) {
      // Map backend types to equivalent frontend display
      const backendToFrontendMap: Record<string, string> = {
        'hr': 'hr-updates',
        'event': 'events',
        'alert': 'alerts',
        'achievement': 'achievements'
      };

      const frontendEquivalent = backendToFrontendMap[normalizedCategory];
      if (frontendEquivalent) {
        result = categoryMapping[frontendEquivalent];
      }
    }

    // Fallback to showing the actual category value
    if (!result) {
      result = {
        label: category || 'General',
        color: 'bg-gray-100 text-gray-700'
      };
    }

    console.log('📊 Category mapping result:', result);
    return result;
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'urgent' || priority === 'high') {
      return <AlertCircle size={20} className="text-red-600" />;
    }
    return <Megaphone size={20} className="text-gray-600" />;
  };

  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (!Number.isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}/${month}/${date.getFullYear()}`;
      }
    } catch (e) { }
    return dateStr;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Announcements</h1>
          <p className="text-gray-600 mt-1">Company-wide and department announcements</p>
        </div>
        {canManage && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            New Announcement
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'company-wide', 'department', 'hr-updates', 'events', 'alerts', 'achievements', 'policy'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filterCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {cat === 'all' ? 'All' : getCategoryInfo(cat).label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => {
          console.log('📢 Rendering announcement:', announcement);

          // Handle both category and type fields from backend
          const categoryValue = announcement.category || announcement.type || 'general';
          const categoryInfo = getCategoryInfo(categoryValue);

          // Handle createdBy - could be string, object, or null
          const createdByDisplay = typeof announcement.createdBy === 'object' && announcement.createdBy !== null
            ? (announcement.createdBy?.name || announcement.createdBy?.email || 'Unknown User')
            : announcement.createdBy || 'Unknown User';

          return (
            <div key={announcement.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    {getPriorityIcon(announcement.priority)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{announcement.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${announcement.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        announcement.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                        {announcement.priority}
                      </span>
                    </div>
                    {announcement.department && (
                      <p className="text-sm text-gray-600 mb-2">Department: {announcement.department}</p>
                    )}
                    <p className="text-gray-700 mb-3">{announcement.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Posted by {createdByDisplay}</span>
                      <span>•</span>
                      <span>{formatDisplayDate(announcement.createdAt)}</span>
                      {announcement.expiresAt && (
                        <>
                          <span>•</span>
                          <span>Expires: {formatDisplayDate(announcement.expiresAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {canManage && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="company-wide">Company-Wide</option>
                  <option value="department">Department</option>
                  <option value="hr-updates">HR Updates</option>
                  <option value="events">Events</option>
                  <option value="alerts">Alerts</option>
                  <option value="achievements">Achievements</option>
                  <option value="policy">Policy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            {formData.category === 'department' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expires On (Optional)</label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingAnnouncement ? 'Update' : 'Post'} Announcement
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