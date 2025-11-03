import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { getTomorrowDate, formatDate } from '../../utils/dateUtils';
import { Users, TrendingUp, Coffee, Soup, Cookie, Download, Calendar } from 'lucide-react';

interface OrderStats {
  meal_type: string;
  menu_item_name: string;
  order_count: number;
}

export default function Reports() {
  const [stats, setStats] = useState<OrderStats[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTomorrowDate());

  useEffect(() => {
    loadReports();
  }, [selectedDate]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const { data: orders, error } = await supabase
        .from('meal_orders')
        .select(`
          *,
          menu_items:menu_item_id (
            name,
            meal_type
          )
        `)
        .eq('order_date', selectedDate)
        .eq('status', 'confirmed');

      if (error) throw error;

      const statsMap = new Map<string, OrderStats>();

      orders?.forEach((order: any) => {
        const key = `${order.menu_items.meal_type}-${order.menu_items.name}`;
        if (statsMap.has(key)) {
          const existing = statsMap.get(key)!;
          existing.order_count++;
        } else {
          statsMap.set(key, {
            meal_type: order.menu_items.meal_type,
            menu_item_name: order.menu_items.name,
            order_count: 1,
          });
        }
      });

      const statsArray = Array.from(statsMap.values()).sort((a, b) => {
        const mealOrder = { breakfast: 0, lunch: 1, snack: 2 };
        return mealOrder[a.meal_type as keyof typeof mealOrder] - mealOrder[b.meal_type as keyof typeof mealOrder];
      });

      setStats(statsArray);
      setTotalOrders(orders?.length || 0);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
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

  const exportToCSV = () => {
    const headers = ['Meal Type', 'Item Name', 'Order Count'];
    const rows = stats.map(stat => [
      stat.meal_type,
      stat.menu_item_name,
      stat.order_count.toString()
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meal-orders-${selectedDate}.csv`;
    a.click();
  };

  const getStatsByMealType = (mealType: string) => {
    return stats.filter(s => s.meal_type === mealType);
  };

  const getTotalByMealType = (mealType: string) => {
    return getStatsByMealType(mealType).reduce((sum, stat) => sum + stat.order_count, 0);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading reports...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-orange-500 to-green-600 rounded-xl shadow-lg p-6 mb-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Order Reports</h2>
            <div className="flex items-center gap-2 text-orange-100">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(selectedDate)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 rounded-lg text-gray-900 font-medium"
            />
            <button
              onClick={exportToCSV}
              disabled={stats.length === 0}
              className="flex items-center gap-2 bg-white text-orange-600 px-6 py-2 rounded-lg font-medium hover:bg-orange-50 transition-all shadow-md disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Coffee className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Breakfast</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{getTotalByMealType('breakfast')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Soup className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Lunch</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{getTotalByMealType('lunch')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Cookie className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Snacks</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{getTotalByMealType('snack')}</p>
        </div>
      </div>

      {stats.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
          <p className="text-gray-600">
            There are no orders for the selected date.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {['breakfast', 'lunch', 'snack'].map((mealType) => {
            const mealStats = getStatsByMealType(mealType);
            if (mealStats.length === 0) return null;

            return (
              <div key={mealType} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  {getMealIcon(mealType)}
                  <h3 className="text-xl font-bold text-gray-900 capitalize">{mealType}</h3>
                  <span className="ml-auto text-sm text-gray-600">
                    {getTotalByMealType(mealType)} total orders
                  </span>
                </div>

                <div className="space-y-3">
                  {mealStats.map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{stat.menu_item_name}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-48 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-green-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${(stat.order_count / getTotalByMealType(mealType)) * 100}%`
                            }}
                          />
                        </div>
                        <span className="font-bold text-gray-900 w-12 text-right">
                          {stat.order_count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
