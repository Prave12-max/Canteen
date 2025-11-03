import { MenuItem } from '../../lib/supabase';
import { CheckCircle, Circle } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  isOrdered: boolean;
  canOrder: boolean;
  onToggle: () => void;
}

export default function MenuCard({ item, isOrdered, canOrder, onToggle }: MenuCardProps) {
  return (
    <div
      onClick={canOrder ? onToggle : undefined}
      className={`bg-white rounded-xl shadow-md p-6 transition-all duration-300 ${
        canOrder ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : 'opacity-75'
      } ${isOrdered ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-bold text-gray-900">{item.name}</h4>
        {isOrdered ? (
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
        ) : (
          <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />
        )}
      </div>

      {item.description && (
        <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        {isOrdered ? (
          <span className="text-green-600 font-medium text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Confirmed
          </span>
        ) : (
          <span className="text-gray-500 text-sm">
            {canOrder ? 'Click to order' : 'Ordering closed'}
          </span>
        )}
      </div>
    </div>
  );
}
