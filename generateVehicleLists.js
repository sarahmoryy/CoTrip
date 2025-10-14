// generateVehicleLists.js
const fs = require("fs");
const { XMLParser } = require("fast-xml-parser");
const path = require("path");

// Path to your XML
const xmlFilePath = path.join(__dirname, "assets", "vehicles.xml");

// Read XML
const xmlData = fs.readFileSync(xmlFilePath, "utf-8");

// Parse XML
const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: true });
const parsed = parser.parse(xmlData);

// Ensure vehicles array
const vehiclesRaw = parsed.vehicles.vehicle;
const vehiclesArray = Array.isArray(vehiclesRaw) ? vehiclesRaw : [vehiclesRaw];

// Data structures
const CAR_MAKES = new Set();
const CAR_MODELS = {};
const CAR_YEARS = {};
const VEHICLES = {};

// Populate
vehiclesArray.forEach((v) => {
  const make = v.make ? String(v.make).trim() : "";
  const model = v.model ? String(v.model).trim() : "";
  const year = parseInt(String(v.year));
  const combinedLPer100km = parseFloat(String(v.combUmpk));

  if (!make || !model || isNaN(year) || isNaN(combinedLPer100km)) return;

  CAR_MAKES.add(make);

  // Models
  if (!CAR_MODELS[make]) CAR_MODELS[make] = [];
  if (!CAR_MODELS[make].includes(model)) CAR_MODELS[make].push(model);

  // Years
  if (!CAR_YEARS[make]) CAR_YEARS[make] = {};
  if (!CAR_YEARS[make][model]) CAR_YEARS[make][model] = [];
  if (!CAR_YEARS[make][model].includes(year)) CAR_YEARS[make][model].push(year);

  // Full vehicle info
  if (!VEHICLES[make]) VEHICLES[make] = {};
  if (!VEHICLES[make][model]) VEHICLES[make][model] = [];
  VEHICLES[make][model].push({ year, combinedLPer100km });
});

// Sort arrays
const sortedMakes = Array.from(CAR_MAKES).sort();
for (const make of Object.keys(CAR_MODELS)) {
  CAR_MODELS[make].sort();
  for (const model of Object.keys(CAR_YEARS[make])) {
    CAR_YEARS[make][model].sort((a, b) => b - a); // latest year first
    VEHICLES[make][model].sort((a, b) => b.year - a.year);
  }
}

// Generate TypeScript content
const tsContent = `
// Auto-generated from vehicles.xml
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
