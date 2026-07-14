import { VEHICLES } from "@/vehicleLists";
import { supabase } from "../SupabaseConfig";
import type { Car } from "./carSlice";

const CARS = "cars";

export const CarService = {
  async list(order: string = "-createdAt"): Promise<Car[]> {
    const ascending = !order.startsWith("-");
    const { data, error } = await supabase
      .from(CARS)
      .select("*")
      .order("created_at", { ascending });
    if (error) throw error;

    return (data ?? []).map(({ user_id, ...rest }) => rest as Car);
  },

  async create(car: Car): Promise<Car> {
    const payload = {
      make: car.make,
      model: car.model,
      year: car.year,
      license_plate: car.license_plate ?? null,
      consumption_l_100km: car.consumption_l_100km ?? null,
      fuel_efficiency: car.fuel_efficiency ?? 25,
    };

    const { data, error } = await supabase
      .from(CARS)
      .insert(payload)
      .select()
      .single();
    if (error) throw error;

    const { user_id, ...clean } = data;
    return clean as Car;
  },

  async update(id: string, car: Partial<Car>): Promise<void> {
    const { id: _ignore, ...rest } = car;
    const { error } = await supabase.from(CARS).update(rest).eq("id", id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(CARS).delete().eq("id", id);
    if (error) throw error;
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
