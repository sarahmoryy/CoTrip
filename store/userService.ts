import { supabase } from '../SupabaseConfig';

export interface UserState {
  full_name: string;
  email: string;
  phone: string;
  address: string;
}

export class UserService {

  /** LOGIN */
  static async login(email: string, password: string): Promise<UserState> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return await UserService.getUserData(data.user.id);
  }

  /** SIGNUP */
  static async signup(fullName: string, email: string, password: string, confirmPassword: string): Promise<UserState> {
    if (password !== confirmPassword) throw new Error('Passwords do not match');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    if (!data.user) throw new Error('Signup did not return a user');

    // profiles row is created by the on_auth_user_created trigger
    return {
      full_name: fullName,
      email,
      phone: '',
      address: '',
    };
  }

  /** GET CURRENT USER DATA */
  static async me(): Promise<UserState> {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!data.user) throw new Error('No user is currently logged in');
    return await UserService.getUserData(data.user.id);
  }

  /** UPDATE USER DATA */
  static async updateMyUserData(userData: Partial<UserState>): Promise<void> {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!data.user) throw new Error('No user is currently logged in');

    const { error: updateError } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', data.user.id);
    if (updateError) throw updateError;
  }

  /** LOGOUT */
  static async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /** HELPER: Get user data from profiles table */
  private static async getUserData(uid: string): Promise<UserState> {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, email, phone, address')
      .eq('id', uid)
      .single();
    if (error) throw error;
    if (!data) throw new Error('User data not found');
    return data as UserState;
  }
}

export default UserService;
