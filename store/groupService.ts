import { supabase } from '../SupabaseConfig';

export interface GroupMember {
  user_id: string;
  email: string;
  display_name: string;
}

export interface DBGroup {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  members: GroupMember[];
}

export const GroupService = {
  async list(): Promise<DBGroup[]> {
    const { data, error } = await supabase
      .from('groups')
      .select(`id, name, description, owner_id, group_members(user_id, email, display_name)`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((g: any) => ({
      id: g.id,
      name: g.name,
      description: g.description || '',
      owner_id: g.owner_id,
      members: (g.group_members || []) as GroupMember[],
    }));
  },

  async create(name: string, description: string): Promise<DBGroup> {
    const { data, error } = await supabase.rpc('create_group', {
      group_name: name,
      group_description: description,
    });
    if (error) throw error;
    const row = (data as any[])?.[0];
    if (!row) throw new Error('Group creation returned no data');
    return { id: row.id, name: row.name, description: row.description, owner_id: row.owner_id, members: [] };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('groups').delete().eq('id', id);
    if (error) throw error;
  },

  async addMember(groupId: string, email: string): Promise<GroupMember | null> {
    const { data: rows } = await supabase.rpc('find_profile_by_email', { lookup_email: email });
    const profile = (rows as any[])?.[0] ?? null;
    if (!profile) return null;
    const member: GroupMember = {
      user_id: (profile as any).id,
      email: (profile as any).email,
      display_name: (profile as any).full_name || email.split('@')[0],
    };
    await supabase.from('group_members').insert({
      group_id: groupId,
      user_id: member.user_id,
      email: member.email,
      display_name: member.display_name,
    });
    return member;
  },

  async removeMember(groupId: string, userId: string): Promise<void> {
    await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);
  },
};
