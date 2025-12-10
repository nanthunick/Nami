import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for our database schema
export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
};

export type Transaction = {
  id: string;
  created_at: string;
  amount: number;
  description: string;
  date: string;
  category_id: string;
  user_id: string;
  amount_encrypted?: string;
  description_encrypted?: string;
  is_encrypted?: boolean;
};

export type TransactionTemplate = {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  category_id: string;
  amount_encrypted: string;
  description_encrypted: string;
  is_encrypted: boolean;
};

