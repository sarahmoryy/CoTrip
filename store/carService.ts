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

  async searchMakes(query: string): Promise<string[]> {
    if (!query) return [];
    const { data, error } = await supabase.rpc("vehicle_makes", { search: query });
    if (error) {
      console.error("Error searching makes:", error);
      return [];
    }
    return (data ?? []).map((r: { make: string }) => r.make);
  },

  async searchModels(make: string, query: string): Promise<string[]> {
    if (!make || !query) return [];
    const { data, error } = await supabase.rpc("vehicle_models", {
      p_make: make,
      search: query,
    });
    if (error) {
      console.error("Error searching models:", error);
      return [];
    }
    return (data ?? []).map((r: { model: string }) => r.model);
  },

  async listMakes(): Promise<string[]> {
    const { data, error } = await supabase.rpc("vehicle_makes", { search: "", max_rows: 500 });
    if (error) {
      console.error("Error listing makes:", error);
      return [];
    }
    return (data ?? []).map((r: { make: string }) => r.make);
  },

  async listModels(make: string): Promise<string[]> {
    if (!make) return [];
    const { data, error } = await supabase.rpc("vehicle_models", {
      p_make: make,
      search: "",
      max_rows: 500,
    });
    if (error) {
      console.error("Error listing models:", error);
      return [];
    }
    return (data ?? []).map((r: { model: string }) => r.model);
  },

  async listYears(make: string, model: string): Promise<number[]> {
    if (!make || !model) return [];
    const { data, error } = await supabase.rpc("vehicle_years", {
      p_make: make,
      p_model: model,
    });
    if (error) {
      console.error("Error listing years:", error);
      return [];
    }
    return (data ?? []).map((r: { year: number }) => r.year);
  },

  async fetchConsumption(make: string, model: string, year: number): Promise<number | null> {
    if (!make || !model || !year) return null;
    const { data, error } = await supabase.rpc("vehicle_consumption", {
      p_make: make,
      p_model: model,
      p_year: year,
    });
    if (error) {
      console.error("Error fetching consumption:", error);
      return null;
    }
    return (data as number | null) ?? null;
  },
};
