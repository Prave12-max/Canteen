import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'employee' | 'admin';
  dietary_preferences: string;
  notification_enabled: boolean;
  created_at: string;
};

export type MenuItem = {
  id: string;
  meal_type: 'breakfast' | 'lunch' | 'snack';
  name: string;
  description: string;
  date: string;
  is_available: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MealOrder = {
  id: string;
  user_id: string;
  menu_item_id: string;
  meal_type: 'breakfast' | 'lunch' | 'snack';
  order_date: string;
  status: 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
};
