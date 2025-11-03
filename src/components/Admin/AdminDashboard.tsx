import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu, BarChart3, Settings } from 'lucide-react';
import MenuManagement from './MenuManagement';
import Reports from './Reports';

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'menu' | 'reports'>('menu');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome, {profile?.full_name}</p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
                activeTab === 'menu'
                  ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Menu className="w-5 h-5" />
              Menu Management
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
                activeTab === 'reports'
                  ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Reports
            </button>
          </div>
        </div>

        {activeTab === 'menu' ? <MenuManagement /> : <Reports />}
      </div>
    </div>
  );
}
