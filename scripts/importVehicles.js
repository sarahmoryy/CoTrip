/**
 * importVehicles.js
 *
 * Loads the EPA fuel-economy CSV (fueleconomy.gov "vehicles.csv" export)
 * into the public.vehicle_reference table in Supabase.
 *
 * Requires:
 *   EXPO_PUBLIC_SUPABASE_URL      (already in .env)
 *   SUPABASE_SERVICE_ROLE_KEY     (service role key, NOT the anon key -
 *                                  put it in .env.local, never commit it)
 *
 * Usage:
 *   node scripts/importVehicles.js /path/to/vehiclesdata.csv
 */

const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local"), override: true });

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: node scripts/importVehicles.js /path/to/vehiclesdata.csv");
  process.exit(1);
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Add SUPABASE_SERVICE_ROLE_KEY to a local .env.local file (gitignored) and retry.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const mpgToLPer100km = (mpg) =>
  mpg && mpg > 0 ? Math.round((235.215 / mpg) * 10) / 10 : null;

async function main() {
  const csvText = fs.readFileSync(csvPath, "utf-8");
  const { data, errors } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  if (errors.length) {
    console.warn(`${errors.length} row(s) had parse warnings (showing first 3):`, errors.slice(0, 3));
  }

  const rows = [];
  for (const r of data) {
    const make = (r.make || "").trim();
    const model = (r.model || "").trim();
    const year = parseInt(r.year, 10);
    const combMpg = parseFloat(r.comb08);
    const combinedLPer100km = mpgToLPer100km(combMpg);
    if (!make || !model || !Number.isFinite(year) || combinedLPer100km == null) continue;
    rows.push({ make, model, year, comb_mpg: combMpg, combined_l_100km: combinedLPer100km });
  }

  console.log(`Parsed ${data.length} CSV rows -> ${rows.length} valid vehicle rows.`);

  console.log("Clearing existing vehicle_reference rows...");
  const { error: delError } = await supabase.from("vehicle_reference").delete().gte("id", 0);
  if (delError) throw delError;

  const BATCH_SIZE = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("vehicle_reference").insert(batch);
    if (error) throw error;
    inserted += batch.length;
    process.stdout.write(`\rInserted ${inserted}/${rows.length}`);
  }
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("\nImport failed:", err);
  process.exit(1);
});
