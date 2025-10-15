/**
 * generateVehicleLists.js
 *
 * Converts EPA vehicle XML data into a static TypeScript file (vehicleLists.ts)
 * with makes, models, years, and combined consumption in L/100km.
 */

const fs = require("fs");
const path = require("path");
const { XMLParser } = require("fast-xml-parser");

// Path to your XML file
const xmlFilePath = path.join(__dirname, "assets", "vehicles.xml");

// Read and parse XML
const xmlData = fs.readFileSync(xmlFilePath, "utf-8");
const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: true });
const parsed = parser.parse(xmlData);

// Extract <vehicle> entries
const vehiclesRaw = parsed.vehicles.vehicle;
const vehiclesArray = Array.isArray(vehiclesRaw) ? vehiclesRaw : [vehiclesRaw];

// Data structures
const CAR_MAKES = new Set();
const CAR_MODELS = {};
const CAR_YEARS = {};
const VEHICLES = {};

// Conversion helper: MPG → L/100 km
const mpgToLPer100km = (mpg) =>
  mpg && mpg > 0 ? Math.round((235.215 / mpg) * 10) / 10 : null;

// Populate data
vehiclesArray.forEach((v) => {
  const make = v.make ? String(v.make).trim() : "";
  const model = v.model ? String(v.model).trim() : "";
  const year = parseInt(String(v.year));
  const comb08 = parseFloat(String(v.comb08)); // combined MPG from XML
  const combinedLPer100km = mpgToLPer100km(comb08);

  if (!make || !model || isNaN(year) || combinedLPer100km == null) return;

  CAR_MAKES.add(make);

  // Models
  if (!CAR_MODELS[make]) CAR_MODELS[make] = [];
  if (!CAR_MODELS[make].includes(model)) CAR_MODELS[make].push(model);

  // Years
  if (!CAR_YEARS[make]) CAR_YEARS[make] = {};
  if (!CAR_YEARS[make][model]) CAR_YEARS[make][model] = [];
  if (!CAR_YEARS[make][model].includes(year)) CAR_YEARS[make][model].push(year);

  // Vehicles
  if (!VEHICLES[make]) VEHICLES[make] = {};
  if (!VEHICLES[make][model]) VEHICLES[make][model] = [];
  VEHICLES[make][model].push({ year, combinedLPer100km });
});

// Sort everything
const sortedMakes = Array.from(CAR_MAKES).sort();
for (const make of Object.keys(CAR_MODELS)) {
  CAR_MODELS[make].sort();
  for (const model of Object.keys(CAR_YEARS[make])) {
    CAR_YEARS[make][model].sort((a, b) => b - a); // newest first
    VEHICLES[make][model].sort((a, b) => b.year - a.year);
  }
}

// Generate TypeScript output
const tsContent = `
// ⚙️ Auto-generated from vehicles.xml
export interface VehicleEntry {
  year: number;
  combinedLPer100km: number;
}

export const CAR_MAKES: string[] = ${JSON.stringify(sortedMakes, null, 2)};

export const CAR_MODELS: Record<string, string[]> = ${JSON.stringify(CAR_MODELS, null, 2)};

export const CAR_YEARS: Record<string, Record<string, number[]>> = ${JSON.stringify(CAR_YEARS, null, 2)};

export const VEHICLES: Record<string, Record<string, VehicleEntry[]>> = ${JSON.stringify(VEHICLES, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, "vehicleLists.ts"), tsContent);
console.log("✅ vehicleLists.ts generated successfully!");
