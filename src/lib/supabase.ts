import { createClient } from '@supabase/supabase-js';
import type { AppRole, UserRole } from '../types/auth';

// Create Supabase client with proper options
function createSupabaseClient() {
  const client = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  );

  return client;
}

export const supabase = createSupabaseClient();

// Helper function to check if user is admin
export const isAdmin = async (userId: string): Promise<boolean> => {
  console.log(`Checking admin status for userId: ${userId}`);

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user role:', error);
    return false;
  }

  console.log('Role data fetched:', data);
  
  return data?.role === 'admin';
};

// Helper function to get user role with detailed logging
export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    console.log('Getting role for user:', userId);

    const { data, error } = await supabase
      .from('user_roles')
      .select('id, role, user_id')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    if (!data) {
      console.log('No role found for user');
      return null;
    }

    console.log('Raw role data:', JSON.stringify(data, null, 2));
    
    // Handle both object and direct value cases
    const roleValue = typeof data.role === 'object' ? data.role.value : data.role;
    console.log('Extracted role value:', roleValue);

    return {
      id: data.id,
      role: roleValue as AppRole,
      user_id: data.user_id
    };
  } catch (error) {
    console.error('getUserRole error:', error);
    return null;
  }
}

// Function for admin product operations that respect RLS
export const productService = {
  // List all products for admin (including inactive)
  async listAll() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // List only active products (public access)
  async listActive() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create new product
  async create(product: any) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update product
  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete product
  async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};
