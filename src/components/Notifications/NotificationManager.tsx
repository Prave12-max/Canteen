import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isBeforeDeadline } from '../../utils/dateUtils';
import { Bell, X } from 'lucide-react';

export default function NotificationManager() {
  const { profile } = useAuth();
  const [showNotification, setShowNotification] = useState(false);
  const [hasShownToday, setHasShownToday] = useState(false);

  useEffect(() => {
    if (!profile?.notification_enabled || hasShownToday) return;

    const checkAndNotify = () => {
      const now = new Date();
      const currentHour = now.getHours();

      if (currentHour >= 17 && currentHour < 21 && isBeforeDeadline()) {
        setShowNotification(true);
        setHasShownToday(true);
      }
    };

    checkAndNotify();
    const interval = setInterval(checkAndNotify, 60000);

    return () => clearInterval(interval);
  }, [profile, hasShownToday]);

  if (!showNotification) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl p-6 max-w-sm animate-slide-up z-50 border-l-4 border-orange-500">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
          <Bell className="w-6 h-6 text-orange-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 mb-1">Meal Order Reminder</h4>
          <p className="text-sm text-gray-600">
            Don't forget to confirm your meal preferences for tomorrow before 9:00 PM!
          </p>
        </div>
        <button
          onClick={() => setShowNotification(false)}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
