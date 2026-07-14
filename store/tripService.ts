// store/tripService.ts
import { supabase } from '../SupabaseConfig';
import type { Trip } from './tripSlice';

const TRIPS = 'trips';

export const TripService = {
  // READ
  async list(order: string = '-createdAt', p0: number = 0): Promise<Trip[]> {
    const ascending = !order.startsWith('-');
    const { data, error } = await supabase
      .from(TRIPS)
      .select('*')
      .order('created_at', { ascending });
    if (error) throw error;

    return (data ?? []).map(({ user_id, created_at, updated_at, ...rest }) => rest as Trip);
  },

  // CREATE (Postgres generates id)
  async create(trip: Trip): Promise<Trip> {
    const { id: _ignore, ...rest } = trip;
    const { data, error } = await supabase
      .from(TRIPS)
      .insert(rest)
      .select()
      .single();
    if (error) throw error;

    const { user_id, created_at, updated_at, ...clean } = data;
    return clean as Trip;
  },

  // UPDATE (partial)
  async update(id: string, patch: Partial<Trip>): Promise<void> {
    const { id: _ignore, ...rest } = patch;
    const { error } = await supabase.from(TRIPS).update(rest).eq('id', id);
    if (error) throw error;
  },

  // DELETE
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TRIPS).delete().eq('id', id);
    if (error) throw error;
  },
};

export default TripService;
