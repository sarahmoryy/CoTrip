import { supabase } from '../SupabaseConfig';

export interface DBConnection {
  friend_id: string;
  friend_email: string;
  friend_name: string;
}

export const ConnectionService = {
  async list(): Promise<DBConnection[]> {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) return [];
    const { data, error } = await supabase
      .from('connections')
      .select('friend_id, friend_email, friend_name')
      .eq('user_id', user.id);
    if (error) throw error;
    return (data || []) as DBConnection[];
  },

  async add(friendEmail: string): Promise<DBConnection | null> {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) return null;
    const { data: rows } = await supabase.rpc('find_profile_by_email', { lookup_email: friendEmail });
    const profile = (rows as any[])?.[0] ?? null;
    if (!profile) return null;
    const conn: DBConnection = {
      friend_id: (profile as any).id,
      friend_email: (profile as any).email,
      friend_name: (profile as any).full_name || (profile as any).email.split('@')[0],
    };
    const { error } = await supabase.from('connections').insert({
      user_id: user.id,
      ...conn,
    });
    if (error && !error.message.includes('duplicate') && error.code !== '23505') throw error;
    return conn;
  },

  async remove(friendId: string): Promise<void> {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) return;
    await supabase
      .from('connections')
      .delete()
      .eq('user_id', user.id)
      .eq('friend_id', friendId);
  },
};
