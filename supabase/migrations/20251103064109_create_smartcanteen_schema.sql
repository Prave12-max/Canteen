/*
  # SmartCanteen Database Schema

  ## Overview
  Complete database schema for the SmartCanteen meal management system including users, menus, orders, and reporting.

  ## New Tables

  ### 1. profiles
  - `id` (uuid, primary key) - References auth.users
  - `email` (text, unique) - User email
  - `full_name` (text) - Employee full name
  - `role` (text) - Either 'employee' or 'admin'
  - `dietary_preferences` (text) - Optional dietary restrictions
  - `notification_enabled` (boolean) - Push notification preference
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. menu_items
  - `id` (uuid, primary key) - Unique menu item identifier
  - `meal_type` (text) - 'breakfast', 'lunch', or 'snack'
  - `name` (text) - Dish name
  - `description` (text) - Dish description
  - `date` (date) - Menu date (tomorrow's date)
  - `is_available` (boolean) - Availability status
  - `created_by` (uuid) - Admin who created the item
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. meal_orders
  - `id` (uuid, primary key) - Unique order identifier
  - `user_id` (uuid) - Employee placing the order
  - `menu_item_id` (uuid) - Selected menu item
  - `meal_type` (text) - 'breakfast', 'lunch', or 'snack'
  - `order_date` (date) - Date of the meal
  - `status` (text) - 'confirmed', 'cancelled'
  - `created_at` (timestamptz) - Order creation time
  - `updated_at` (timestamptz) - Last modification time

  ### 4. system_settings
  - `id` (uuid, primary key) - Setting identifier
  - `setting_key` (text, unique) - Setting name
  - `setting_value` (text) - Setting value
  - `updated_at` (timestamptz) - Last update time

  ## Security
  - Enable RLS on all tables
  - Profiles: Users can read all profiles, update only their own
  - Menu Items: All can read, only admins can create/update/delete
  - Meal Orders: Users can manage their own orders, admins can read all
  - System Settings: All can read, only admins can update
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'admin')),
  dietary_preferences text DEFAULT '',
  notification_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snack')),
  name text NOT NULL,
  description text DEFAULT '',
  date date NOT NULL,
  is_available boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available menu items"
  ON menu_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert menu items"
  ON menu_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update menu items"
  ON menu_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete menu items"
  ON menu_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create meal_orders table
CREATE TABLE IF NOT EXISTS meal_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snack')),
  order_date date NOT NULL,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, meal_type, order_date)
);

ALTER TABLE meal_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON meal_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON meal_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert own orders"
  ON meal_orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON meal_orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own orders"
  ON meal_orders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update settings"
  ON system_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert settings"
  ON system_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value)
VALUES ('order_deadline_hour', '21')
ON CONFLICT (setting_key) DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_menu_items_date ON menu_items(date);
CREATE INDEX IF NOT EXISTS idx_meal_orders_user_date ON meal_orders(user_id, order_date);
CREATE INDEX IF NOT EXISTS idx_meal_orders_date ON meal_orders(order_date);
