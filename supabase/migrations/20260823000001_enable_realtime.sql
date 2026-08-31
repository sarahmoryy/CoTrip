-- Enable real-time change events for rides and ride_requests
alter publication supabase_realtime add table public.rides;
alter publication supabase_realtime add table public.ride_requests;
