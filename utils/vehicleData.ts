// utils/vehicleData.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy"; // legacy import restores documentDirectory
import { XMLParser } from "fast-xml-parser";

interface Vehicle {
  make: string;
  model: string;
  year: number;
  comb08: number; // combined MPG
}

let vehicleData: Vehicle[] | null = null;

// Path in the document directory (temporary copy of asset)
const FILE_NAME = "vehicles.xml";
const FILE_PATH = FileSystem.documentDirectory + FILE_NAME;

// Copy XML from assets to documentDirectory if not exists
async function ensureFileAvailable(): Promise<string> {
  const fileInfo = await FileSystem.getInfoAsync(FILE_PATH);
  if (fileInfo.exists) return FILE_PATH;

  const asset = Asset.fromModule(require("../assets/vehicles.xml"));
  await asset.downloadAsync();

  await FileSystem.copyAsync({
    from: asset.localUri!,
    to: FILE_PATH,
  });

  return FILE_PATH;
}

// Load vehicle data with AsyncStorage caching
export async function loadVehicleData(): Promise<Vehicle[]> {
  if (vehicleData) return vehicleData;

  try {
    // Try loading from AsyncStorage first
    const cached = await AsyncStorage.getItem("vehicleData");
    if (cached) {
      vehicleData = JSON.parse(cached) as Vehicle[];
      return vehicleData;
    }

    // Read XML file
    const filePath = await ensureFileAvailable();
    const xmlString = await FileSystem.readAsStringAsync(filePath, { encoding: "utf8" });

    // Parse XML
    const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: true });
    const parsed = parser.parse(xmlString);

    const vehiclesRaw = parsed.vehicles.vehicle;
    const vehiclesArray = Array.isArray(vehiclesRaw) ? vehiclesRaw : [vehiclesRaw];

    // Map to typed Vehicle array
    vehicleData = vehiclesArray.map((v: any) => ({
      make: v.make,
      model: v.model,
      year: parseInt(v.year),
      comb08: parseFloat(v.comb08),
    }));

    // Cache in AsyncStorage
    await AsyncStorage.setItem("vehicleData", JSON.stringify(vehicleData));

    return vehicleData;
  } catch (err) {
    console.error("❌ Error loading XML:", err);
    return [];
  }
}

// Get unique makes
export async function getVehicleMakes(): Promise<string[]> {
  const data = await loadVehicleData();
  return Array.from(new Set(data.map((v) => v.make))).sort();
}

// Get unique models for a specific make
export async function getVehicleModels(make: string): Promise<string[]> {
  const data = await loadVehicleData();
  const models = Array.from(new Set(data.filter((v) => v.make === make).map((v) => v.model)));
  return models.sort();
}

// Get years for a specific make + model
export async function getVehicleYears(make: string, model: string): Promise<number[]> {
  const data = await loadVehicleData();
  const years = Array.from(
    new Set(data.filter((v) => v.make === make && v.model === model).map((v) => v.year))
  );
  return years.sort((a, b) => b - a);
}

// Get combined L/100km consumption
export async function getCombinedConsumption(
  make: string,
  model: string,
  year: number
): Promise<number | null> {
  const data = await loadVehicleData();
  const match = data.find((v) => v.make === make && v.model === model && v.year === year);
  if (!match) return null;

  const combinedMPG = match.comb08;
  if (isNaN(combinedMPG) || combinedMPG <= 0) return null;

  const combinedLPer100km = 235.2 / combinedMPG;
  return Math.round(combinedLPer100km * 10) / 10;
}
