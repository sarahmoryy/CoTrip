// store/carService.ts
import {
  addDoc, collection, deleteDoc, doc, getDocs,
  orderBy, query, serverTimestamp, updateDoc
} from 'firebase/firestore';
import { auth, db } from '../FirebaseConfig';
import type { Car } from './carSlice'; // you already import Car in your files

const CARS = 'cars';

function userScopedCollection() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  // cars are stored under /users/{uid}/cars
  return collection(db, 'users', uid, CARS);
}

export const CarService = {
  async list(order: string = '-createdAt'): Promise<Car[]> {
    const col = userScopedCollection();
    const q = query(col, orderBy('createdAt', order.startsWith('-') ? 'desc' : 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Car[];
  },

  async create(car: Car): Promise<Car> {
    const col = userScopedCollection();
    // Normalize fields you use in UI
    const payload = {
      make: car.make,
      model: car.model,
      year: car.year,
      license_plate: car.license_plate ?? null,
      consumption_l_100km: car.consumption_l_100km ?? null,
      fuel_efficiency: car.fuel_efficiency ?? 25, // mpg fallback if you use it elsewhere
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(col, payload);
    return { id: ref.id, ...payload } as unknown as Car;
  },

  async update(id: string, car: Partial<Car>): Promise<void> {
    const col = userScopedCollection();
    const ref = doc(col, id);
    await updateDoc(ref, { ...car, updatedAt: serverTimestamp() } as any);
  },

  async delete(id: string): Promise<void> {
    const col = userScopedCollection();
    await deleteDoc(doc(col, id));
  },

  // Optional: lightweight estimator so your consumption modal shows up
  async fetchConsumption(make: string, model: string, year: number): Promise<number | null> {
    // super simple defaults (L/100km) – replace with a real API later
    const base = 8.5; // generic compact
    const adjustByMake: Record<string, number> = {
      'Toyota': -0.5, 'Honda': -0.4, 'Mazda': -0.3,
      'BMW': +0.8, 'Mercedes-Benz': +0.9, 'Audi': +0.7,
      'Ford': +0.3, 'Chevrolet': +0.4, 'Hyundai': -0.2, 'Kia': -0.2, 'Subaru': +0.2, 'Volkswagen': -0.1, 'Volvo': +0.5,
    };
    const ageAdj = Math.max(0, Math.min(1.2, (year >= 2020 ? -0.3 : year >= 2015 ? 0 : 0.5)));
    const val = base + (adjustByMake[make] ?? 0) + ageAdj;
    return Number(val.toFixed(1));
  },
};
