// ../../store/TripService.ts
import { v4 as uuidv4 } from 'uuid';
import { Trip } from './tripSlice'; // Adjust the path as needed

// Define valid sort keys for Trip
type TripSortKey = keyof Trip;

export class TripService {
  static async list(sort?: string, limit?: number): Promise<Trip[]> {
    // Mock trip data
    const mockTrips: Trip[] = [
      {
        id: uuidv4(),
        destination: "New York",
        date: "2025-08-10",
        from_location_name: "Boston", // Explicitly set
        to_location_name: "New York", // Explicitly set
        from_location: "42.3601,-71.0589", // Example coordinates
        to_location: "40.7128,-74.0060",
        passengers: "2",
        car_id: "123e4567-e89b-12d3-a456-426614174000", // Match CarService ID
        cost: 50.0,
        savings: 20.0,
        distance: 215.0,
      },
      {
        id: uuidv4(),
        destination: "Los Angeles",
        date: "2025-08-15",
        from_location_name: "San Francisco", // Explicitly set
        to_location_name: "Los Angeles", // Explicitly set
        from_location: "37.7749,-122.4194",
        to_location: "34.0522,-118.2437",
        passengers: "1",
        car_id: "987fcdeb-54a3-21fc-b456-426614174001", // Match CarService ID
        cost: 75.0,
        savings: 30.0,
        distance: 380.0,
      },
    ];

    let sortedData = [...mockTrips];

    if (sort) {
      const sortKey = sort.replace('-', '') as TripSortKey; // Cast to TripSortKey
      sortedData.sort((a, b) => {
        const aValue = a[sortKey] !== undefined ? a[sortKey] : '';
        const bValue = b[sortKey] !== undefined ? b[sortKey] : '';
        return sort.startsWith('-') ? String(bValue).localeCompare(String(aValue)) : String(aValue).localeCompare(String(bValue));
      });
    }
    if (limit) {
      sortedData = sortedData.slice(0, limit);
    }

    return sortedData;
  }

  static async create(trip: Trip): Promise<Trip> {
    const newTrip: Trip = {
      ...trip,
      id: uuidv4(),
      cost: trip.cost || 0,
      savings: trip.savings || 0,
      distance: trip.distance || 0,
    };
    return new Promise((resolve) => setTimeout(() => resolve(newTrip), 500)); // Simulate async delay
  }

  static async update(id: string, tripData: Partial<Trip>): Promise<void> {
    return new Promise((resolve) => setTimeout(() => resolve(), 500));
  }

  static async delete(id: string): Promise<void> {
    return new Promise((resolve) => setTimeout(() => resolve(), 500));
  }
}

export default TripService;