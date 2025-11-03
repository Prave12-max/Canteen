import { useAuth, AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import EmployeeDashboard from './components/Employee/EmployeeDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import NotificationManager from './components/Notifications/NotificationManager';

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading SmartCanteen...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  return (
    <>
      {profile.role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />}
      {profile.role === 'employee' && <NotificationManager />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
