// functions/index.js
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

// Read your Google Maps key from Secret Manager
const MAPS_API_KEY = defineSecret("MAPS_API_KEY");

function setCORS(res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
}



/** AUTOCOMPLETE */
exports.autocomplete = onRequest({ secrets: [MAPS_API_KEY] }, async (req, res) => {
  setCORS(res);
  if (req.method === "OPTIONS") return res.status(204).send("");

  const input = (req.query.input || req.body?.input || "").toString();
  if (!input.trim()) return res.json({ predictions: [] });

  const url =
    "https://maps.googleapis.com/maps/api/place/autocomplete/json" +
    `?input=${encodeURIComponent(input)}&types=geocode&key=${MAPS_API_KEY.value()}`;

  const r = await fetch(url);
  const json = await r.json();

  if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
    return res.status(502).json({ error: json.error_message || json.status });
  }

  res.json({
    predictions: (json.predictions ?? []).map((p) => ({
      description: p.description,
      place_id: p.place_id,
    })),
  });
});

/** PLACE DETAILS */
exports.placeDetails = onRequest({ secrets: [MAPS_API_KEY] }, async (req, res) => {
  setCORS(res);
  if (req.method === "OPTIONS") return res.status(204).send("");

  const placeId = (req.query.placeId || req.body?.placeId || "").toString();
  if (!placeId) return res.status(400).json({ error: "Missing placeId" });

  const url =
    "https://maps.googleapis.com/maps/api/place/details/json" +
    `?place_id=${encodeURIComponent(placeId)}&fields=formatted_address,geometry/location` +
    `&key=${MAPS_API_KEY.value()}`;

  const r = await fetch(url);
  const json = await r.json();

  if (json.status !== "OK") {
    return res.status(502).json({ error: json.error_message || json.status });
  }

  res.json({
    formatted_address: json.result.formatted_address,
    location: json.result.geometry.location,
  });
});

/** GEOCODE */
exports.geocode = onRequest({ secrets: [MAPS_API_KEY] }, async (req, res) => {
  setCORS(res);
  if (req.method === "OPTIONS") return res.status(204).send("");

  const address = (req.query.address || req.body?.address || "").toString();
  if (!address) return res.status(400).json({ error: "Missing address" });

  const url =
    "https://maps.googleapis.com/maps/api/geocode/json" +
    `?address=${encodeURIComponent(address)}&key=${MAPS_API_KEY.value()}`;

  const r = await fetch(url);
  const json = await r.json();

  if (json.status !== "OK" || !json.results?.length) {
    return res.status(502).json({ error: json.error_message || json.status });
  }

  const r0 = json.results[0];
  const cityComp = (r0.address_components || []).find((c) =>
    (c.types || []).includes("locality")
  );

  res.json({
    formatted_address: r0.formatted_address,
    location: r0.geometry.location,
    city: cityComp?.long_name,
  });
});

/** DIRECTIONS */
exports.directions = onRequest({ secrets: [MAPS_API_KEY] }, async (req, res) => {
  setCORS(res);
  if (req.method === "OPTIONS") return res.status(204).send("");

  const origin = (req.query.origin || req.body?.origin || "").toString();
  const destination = (req.query.destination || req.body?.destination || "").toString();
  if (!origin || !destination) {
    return res.status(400).json({ error: "Missing origin or destination" });
  }

  const url =
    "https://maps.googleapis.com/maps/api/directions/json" +
    `?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}` +
    `&mode=driving&key=${MAPS_API_KEY.value()}`;

  const r = await fetch(url);
  const json = await r.json();

  if (json.status !== "OK") {
    return res.status(502).json({ error: json.error_message || json.status });
  }

  const leg = json.routes?.[0]?.legs?.[0];
  res.json({
    meters: leg?.distance?.value ?? 0,
    seconds: leg?.duration?.value ?? 0,
  });
});
