import { useState, useEffect } from 'react';
import { supabase, MenuItem } from '../../lib/supabase';
import { getTomorrowDate, formatDate } from '../../utils/dateUtils';
import { Plus, Trash2, Edit2, Coffee, Soup, Cookie, Calendar } from 'lucide-react';
import MenuForm from './MenuForm';

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const tomorrowDate = getTomorrowDate();

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('date', tomorrowDate)
        .order('meal_type')
        .order('created_at');

      if (error) throw error;
      if (data) setMenuItems(data);
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMenuItems(menuItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
    loadMenuItems();
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return <Coffee className="w-5 h-5 text-orange-600" />;
      case 'lunch':
        return <Soup className="w-5 h-5 text-green-600" />;
      case 'snack':
        return <Cookie className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getMealsByType = (type: string) => {
    return menuItems.filter(item => item.meal_type === type);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading menu...</p>
      </div>
    );
  }

  if (showForm) {
    return <MenuForm item={editingItem} onClose={handleFormClose} />;
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-orange-500 to-green-600 rounded-xl shadow-lg p-6 mb-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Tomorrow's Menu</h2>
            <div className="flex items-center gap-2 text-orange-100">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(tomorrowDate)}</span>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-orange-50 transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Menu Item
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {['breakfast', 'lunch', 'snack'].map((mealType) => {
          const meals = getMealsByType(mealType);

          return (
            <div key={mealType}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {getMealIcon(mealType)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 capitalize">
                  {mealType} ({meals.length})
                </h3>
              </div>

              {meals.length === 0 ? (
                <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                  <p className="text-gray-500">No items added for {mealType} yet</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-2 text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Add your first item
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {meals.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-bold text-gray-900">{item.name}</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {item.description && (
                        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                      )}

                      <div className="pt-3 border-t border-gray-100">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.is_available
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
