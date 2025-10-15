import { VEHICLES } from "@/vehicleLists";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../FirebaseConfig";
import type { Car } from "./carSlice";

const CARS = "cars";

function userScopedCollection() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Not signed in");
  return collection(db, "users", uid, CARS);
}

export const CarService = {
  async list(order: string = "-createdAt"): Promise<Car[]> {
    const col = userScopedCollection();
    const q = query(col, orderBy("createdAt", order.startsWith("-") ? "desc" : "asc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Car[];
  },

  async create(car: Car): Promise<Car> {
    const col = userScopedCollection();

    const payload = {
      make: car.make,
      model: car.model,
      year: car.year,
      license_plate: car.license_plate ?? null,
      consumption_l_100km: car.consumption_l_100km ?? null,
      fuel_efficiency: car.fuel_efficiency ?? 25,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const ref = await addDoc(col, payload);
    return { id: ref.id, ...payload } as Car;
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

  async fetchConsumption(make: string, model: string, year: number): Promise<number | null> {
    try {
      if (!make || !model || !year) return null;

      const makeData = VEHICLES[make];
      if (!makeData) return null;

      const modelData = makeData[model];
      if (!modelData) return null;

      const entry = modelData.find((v) => v.year === year);
      if (!entry || !entry.combinedLPer100km) return null;

      return entry.combinedLPer100km;
    } catch (err) {
      console.error("Error fetching consumption:", err);
      return null;
    }
  },
};
