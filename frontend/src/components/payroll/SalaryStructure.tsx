import { useState } from 'react';
import { Plus, Pencil, Trash2, DollarSign } from 'lucide-react';
import { useData, SalaryComponent } from '../../context/DataContext';
import { Modal } from '../Modal';

export function SalaryStructure() {
  const { salaryComponents, addSalaryComponent, updateSalaryComponent, deleteSalaryComponent } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState<SalaryComponent | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'allowance' as 'allowance' | 'deduction',
    amount: 0,
    isPercentage: false,
    description: '',
  });

  const handleAdd = () => {
    setEditingComponent(null);
    setFormData({ name: '', type: 'allowance', amount: 0, isPercentage: false, description: '' });
    setShowModal(true);
  };

  const handleEdit = (component: SalaryComponent) => {
    setEditingComponent(component);
    setFormData({
      name: component.name,
      type: component.type,
      amount: component.amount,
      isPercentage: component.isPercentage,
      description: component.description,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this component?')) {
      deleteSalaryComponent(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingComponent) {
      updateSalaryComponent(editingComponent.id, formData);
    } else {
      addSalaryComponent(formData);
    }
    setShowModal(false);
  };

  const allowances = (salaryComponents || []).filter(c => c.type === 'allowance');
  const deductions = (salaryComponents || []).filter(c => c.type === 'deduction');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Salary Structure</h1>
          <p className="text-gray-600 mt-1">Configure salary components and benefits</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Component
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Allowances</h2>
          <div className="space-y-3">
            {allowances.map((component) => (
              <div key={component.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <DollarSign className="text-green-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{component.name}</h3>
                      <p className="text-sm text-gray-600">{component.description}</p>
                      <p className="text-sm font-medium text-green-600 mt-1">
                        {component.isPercentage ? `${component.amount}%` : `$${component.amount}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(component)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(component.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Deductions</h2>
          <div className="space-y-3">
            {deductions.map((component) => (
              <div key={component.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <DollarSign className="text-red-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{component.name}</h3>
                      <p className="text-sm text-gray-600">{component.description}</p>
                      <p className="text-sm font-medium text-red-600 mt-1">
                        {component.isPercentage ? `${component.amount}%` : `$${component.amount}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(component)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(component.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editingComponent ? 'Edit Component' : 'Add Component'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Component Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'allowance' | 'deduction' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="allowance">Allowance</option>
                <option value="deduction">Deduction</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPercentage"
                checked={formData.isPercentage}
                onChange={(e) => setFormData({ ...formData, isPercentage: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPercentage" className="text-sm font-medium text-gray-700">Is Percentage</label>
            </div>
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
                {editingComponent ? 'Update' : 'Add'} Component
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
