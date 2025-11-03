import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase, MenuItem, MealOrder } from '../../lib/supabase';
import { getTomorrowDate, formatDate, isBeforeDeadline, getDeadlineMessage } from '../../utils/dateUtils';
import { LogOut, User, Clock, CheckCircle, XCircle, Coffee, Soup, Cookie } from 'lucide-react';
import MenuCard from './MenuCard';
import ProfileSettings from './ProfileSettings';

export default function EmployeeDashboard() {
  const { profile, signOut } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<MealOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const tomorrowDate = getTomorrowDate();
  const canOrder = isBeforeDeadline();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [menuResult, ordersResult] = await Promise.all([
        supabase
          .from('menu_items')
          .select('*')
          .eq('date', tomorrowDate)
          .eq('is_available', true)
          .order('meal_type'),
        supabase
          .from('meal_orders')
          .select('*')
          .eq('order_date', tomorrowDate)
          .eq('status', 'confirmed')
      ]);

      if (menuResult.data) setMenuItems(menuResult.data);
      if (ordersResult.data) setOrders(ordersResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderToggle = async (menuItem: MenuItem) => {
    if (!canOrder) return;

    const existingOrder = orders.find(
      o => o.meal_type === menuItem.meal_type && o.order_date === tomorrowDate
    );

    try {
      if (existingOrder) {
        await supabase
          .from('meal_orders')
          .delete()
          .eq('id', existingOrder.id);
        setOrders(orders.filter(o => o.id !== existingOrder.id));
      } else {
        const { data, error } = await supabase
          .from('meal_orders')
          .insert({
            user_id: profile!.id,
            menu_item_id: menuItem.id,
            meal_type: menuItem.meal_type,
            order_date: tomorrowDate,
            status: 'confirmed'
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setOrders([...orders, data]);
      }
    } catch (error) {
      console.error('Error toggling order:', error);
    }
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return <Coffee className="w-5 h-5" />;
      case 'lunch':
        return <Soup className="w-5 h-5" />;
      case 'snack':
        return <Cookie className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getMealsByType = (type: string) => {
    return menuItems.filter(item => item.meal_type === type);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showProfile) {
    return <ProfileSettings onBack={() => setShowProfile(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile?.full_name}</h1>
              <p className="text-sm text-gray-600 mt-1">Employee Dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-orange-500 to-green-600 rounded-2xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Tomorrow's Menu</h2>
              <p className="text-orange-100">{formatDate(tomorrowDate)}</p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg">
              <Clock className="w-5 h-5" />
              <span className="font-medium">{getDeadlineMessage()}</span>
            </div>
          </div>
        </div>

        {!canOrder && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-medium">
              Order deadline has passed. You can no longer modify your meal selections for tomorrow.
            </p>
          </div>
        )}

        <div className="space-y-8">
          {['breakfast', 'lunch', 'snack'].map((mealType) => {
            const meals = getMealsByType(mealType);
            if (meals.length === 0) return null;

            return (
              <div key={mealType}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {getMealIcon(mealType)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 capitalize">{mealType}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {meals.map((item) => {
                    const isOrdered = orders.some(
                      o => o.menu_item_id === item.id && o.status === 'confirmed'
                    );
                    return (
                      <MenuCard
                        key={item.id}
                        item={item}
                        isOrdered={isOrdered}
                        canOrder={canOrder}
                        onToggle={() => handleOrderToggle(item)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {menuItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Soup className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Menu Available</h3>
            <p className="text-gray-600">
              The menu for tomorrow hasn't been published yet. Check back later!
            </p>
          </div>
        )}

        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Your Orders Summary</h3>
          <div className="space-y-3">
            {['breakfast', 'lunch', 'snack'].map((mealType) => {
              const order = orders.find(o => o.meal_type === mealType);
              const menuItem = menuItems.find(m => m.id === order?.menu_item_id);

              return (
                <div key={mealType} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {getMealIcon(mealType)}
                    <span className="font-medium capitalize text-gray-700">{mealType}</span>
                  </div>
                  {order && menuItem ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>{menuItem.name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                      <XCircle className="w-5 h-5" />
                      <span>Not ordered</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
