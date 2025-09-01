// ../../store/carService.ts
import 'react-native-get-random-values'; // Ensure this is included
import { v4 as uuidv4 } from 'uuid';
import { Car } from './carSlice';
import { UserService } from './userService';

export class CarService {
  static async list(sort?: string, limit?: number): Promise<Car[]> {
    const mockCars: Car[] = [
      {
        id: uuidv4(),
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        license_plate: 'ABC123',
        consumption_l_100km: 7.5,
        fuel_efficiency: 31.3,
      },
      {
        id: uuidv4(),
        make: 'Honda',
        model: 'Civic',
        year: 2019,
        license_plate: 'XYZ789',
        consumption_l_100km: 6.8,
        fuel_efficiency: 34.6,
      },
    ];

    let sortedData = [...mockCars];

    if (sort) {
      const sortKey = sort.replace('-', '');
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

  static async create(car: Car): Promise<Car> {
    const mockCar: Car = {
      ...car,
      id: uuidv4(),
      fuel_efficiency: car.fuel_efficiency || 25,
    };
    return new Promise((resolve) => setTimeout(() => resolve(mockCar), 500)); // Simulate async delay
  }

  static async fetchConsumption(make: string, model: string, year: number): Promise<number> {
    // Mock API call to fetch consumption based on make, model, and year
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate different consumption values based on car data
        if (make === "BMW" && model === "228i" && year === 2016) {
          resolve(8.0); // Example consumption for Audi 228i 2016
        } else if (make === "Toyota" && model === "Camry" && year === 2020) {
          resolve(7.5);
        } else {
          resolve(7.0); // Default consumption
        }
      }, 500); // Simulate API delay
    });
  }

  static async update(id: string, carData: Partial<Car>): Promise<void> {
    const token = await UserService.getAuthToken();
    if (!token) throw new Error('No authentication token');
    const response = await fetch(`https://your-api-endpoint/cars/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(carData),
    });
    if (!response.ok) throw new Error('Failed to update car');
  }

  static async delete(id: string): Promise<void> {
    const token = await UserService.getAuthToken();
    if (!token) throw new Error('No authentication token');
    const response = await fetch(`https://your-api-endpoint/cars/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete car');
  }
}

export default CarService;