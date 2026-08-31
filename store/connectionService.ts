import { supabase } from '../SupabaseConfig';

export interface DBConnection {
  friend_id: string;
  friend_email: string;
  friend_name: string;
}

export interface DBFriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  sender_name?: string;
  sender_email?: string;
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

  async sendRequest(friendEmail: string): Promise<'sent' | 'already_friends' | 'not_found' | 'already_sent'> {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) return 'not_found';

    const { data: rows } = await supabase.rpc('find_profile_by_email', { lookup_email: friendEmail });
    const profile = (rows as any[])?.[0] ?? null;
    if (!profile) return 'not_found';

    // Check if already friends
    const { data: existing } = await supabase
      .from('connections')
      .select('friend_id')
      .eq('user_id', user.id)
      .eq('friend_id', profile.id)
      .maybeSingle();
    if (existing) return 'already_friends';

    // Check if request already sent
    const { data: existingReq } = await supabase
      .from('friend_requests')
      .select('id')
      .eq('sender_id', user.id)
      .eq('receiver_id', profile.id)
      .maybeSingle();
    if (existingReq) return 'already_sent';

    const { error } = await supabase.from('friend_requests').insert({
      sender_id: user.id,
      receiver_id: profile.id,
      status: 'pending',
    });
    if (error && error.code !== '23505') throw error;
    return 'sent';
  },

  async listIncoming(): Promise<DBFriendRequest[]> {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) return [];
    const { data } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('receiver_id', user.id)
      .eq('status', 'pending');
    if (!data || data.length === 0) return [];

    // Enrich with sender names
    const senderIds = data.map((r: any) => r.sender_id);
    const { data: profiles } = await supabase.rpc('get_profiles_by_ids', { ids: senderIds });
    const profileMap: Record<string, any> = {};
    for (const p of (profiles || [])) profileMap[p.id] = p;

    return data.map((r: any) => ({
      id: r.id,
      sender_id: r.sender_id,
      receiver_id: r.receiver_id,
      status: r.status,
      created_at: r.created_at,
      sender_name: profileMap[r.sender_id]?.full_name || profileMap[r.sender_id]?.email?.split('@')[0] || 'Unknown',
      sender_email: profileMap[r.sender_id]?.email || '',
    }));
  },

  async accept(requestId: string): Promise<void> {
    const { error } = await supabase.rpc('accept_friend_request', { request_id: requestId });
    if (error) throw error;
  },

  async decline(requestId: string): Promise<void> {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'declined' })
      .eq('id', requestId);
    if (error) throw error;
  },

  async remove(friendId: string): Promise<void> {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) return;
    await supabase.from('connections').delete().eq('user_id', user.id).eq('friend_id', friendId);
  },
};
