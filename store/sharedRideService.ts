import { supabase } from '../SupabaseConfig';

export interface DBRide {
  id: string;
  driver_id: string;
  group_id: string | null;
  vehicle: string;
  origin: string;
  destination: string;
  departure_time: string;
  date: string;
  approximate_cost: number;
  seats_total: number;
  seats_left: number;
  status: string;
}

export interface DBRideRequest {
  id: string;
  ride_id: string;
  rider_id: string;
  pickup_point: string;
  dropoff_point: string;
  expected_total_cost: number;
  status: string;
  created_at: string;
}

export const SharedRideService = {
  async list(): Promise<DBRide[]> {
    const { data, error } = await supabase
      .from('rides')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as DBRide[];
  },

  async create(ride: Omit<DBRide, 'id' | 'status'>): Promise<DBRide> {
    const { data, error } = await supabase
      .from('rides')
      .insert({ ...ride, status: 'active' })
      .select()
      .single();
    if (error) throw error;
    return data as DBRide;
  },

  async delete(id: string): Promise<void> {
    await supabase.from('rides').delete().eq('id', id);
  },

  async listRequests(rideIds: string[]): Promise<DBRideRequest[]> {
    if (!rideIds.length) return [];
    const { data, error } = await supabase
      .from('ride_requests')
      .select('*')
      .in('ride_id', rideIds);
    if (error) throw error;
    return (data || []) as DBRideRequest[];
  },

  async createRequest(req: Omit<DBRideRequest, 'id' | 'created_at'>): Promise<DBRideRequest> {
    const { data, error } = await supabase
      .from('ride_requests')
      .insert(req)
      .select()
      .single();
    if (error) throw error;
    return data as DBRideRequest;
  },

  async updateRequestStatus(id: string, status: string): Promise<void> {
    await supabase.from('ride_requests').update({ status }).eq('id', id);
  },

  async updateSeatCount(rideId: string, seatsLeft: number): Promise<void> {
    await supabase.from('rides').update({ seats_left: seatsLeft }).eq('id', rideId);
  },
};
