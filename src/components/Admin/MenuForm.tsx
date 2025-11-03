import { useState } from 'react';
import { supabase, MenuItem } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { getTomorrowDate } from '../../utils/dateUtils';
import { ArrowLeft, Save } from 'lucide-react';

interface MenuFormProps {
  item: MenuItem | null;
  onClose: () => void;
}

export default function MenuForm({ item, onClose }: MenuFormProps) {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    meal_type: item?.meal_type || 'breakfast',
    name: item?.name || '',
    description: item?.description || '',
    is_available: item?.is_available ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (item) {
        const { error } = await supabase
          .from('menu_items')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert({
            ...formData,
            date: getTomorrowDate(),
            created_by: profile!.id,
          });

        if (error) throw error;
      }

      onClose();
    } catch (err) {
      setError('Error saving menu item');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Menu
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {item ? 'Edit Menu Item' : 'Add New Menu Item'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Type
            </label>
            <select
              value={formData.meal_type}
              onChange={(e) => setFormData({ ...formData, meal_type: e.target.value as any })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              required
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dish Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="e.g., Pancakes with Maple Syrup"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Describe the dish, ingredients, or special notes"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Available</p>
              <p className="text-sm text-gray-600">Make this item available for ordering</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_available: !formData.is_available })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.is_available ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.is_available ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-green-600 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : item ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
