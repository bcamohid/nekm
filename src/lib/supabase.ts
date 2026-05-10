import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'farmer' | 'agriculture_student';

export interface Profile {
  id: string;
  full_name: string;
  mobile_number: string;
  email_address: string;
  address: string;
  role: UserRole;
  is_admin: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  is_active: boolean;
  display_order: number;
  updated_at: string;
}

export interface Training {
  id: string;
  title: string;
  description: string;
  duration: string;
  mode: 'online' | 'offline' | 'hybrid';
  image_url: string;
  is_active: boolean;
  display_order: number;
  updated_at: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock_quantity: number;
  is_active: boolean;
  display_order: number;
  updated_at: string;
}

export interface ContactInfo {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'email' | 'phone' | 'address' | 'url';
  is_active: boolean;
  display_order: number;
}

export interface AboutContent {
  id: string;
  title: string;
  body: string;
  image_url: string;
  is_active: boolean;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  created_at: string;
  // This optional property is for when we join the tables to get the product details!
  shop_items?: ShopItem; 
}

export interface TrainingEnrollment {
  id: string;
  user_id: string;
  training_id: string;
  full_name: string;
  mobile_number: string;
  email_address: string;
  address: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  trainings?: Training; // For joined queries
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
export interface Order {
  id: string;
  user_id: string;
  full_name: string;
  mobile_number: string;
  address: string;
  total_amount: number;
  payment_method: 'QR_CODE' | 'COD';
  status: 'pending' | 'accepted' | 'rejected' | 'delivered';
  items: any; // Stores the JSON array of products
  created_at: string;
}
export interface HelpMessage {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'resolved';
  created_at: string;
}