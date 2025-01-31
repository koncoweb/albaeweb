type DbRole = {
  _type: 'app_role';
  value: 'admin' | 'user';
}

// Using custom type from Supabase
export type AppRole = DbRole['value'];

export interface UserRole {
  id: string;
  role: AppRole;
  user_id: string;
}

export interface AuthUser {
  id: string;
  email: string;
  userRole?: UserRole;
}
