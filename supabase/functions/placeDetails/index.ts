const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

const MAPS_API_KEY = Deno.env.get("MAPS_SECRET_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
  const placeId = (url.searchParams.get("placeId") || body?.placeId || "").toString();

  if (!placeId) {
    return Response.json({ error: "Missing placeId" }, { status: 400, headers: corsHeaders });
  }

  const mapsUrl =
    "https://maps.googleapis.com/maps/api/place/details/json" +
    `?place_id=${encodeURIComponent(placeId)}&fields=formatted_address,geometry/location` +
    `&key=${MAPS_API_KEY}`;

  const r = await fetch(mapsUrl);
  const json = await r.json();

  if (json.status !== "OK") {
    return Response.json(
      { error: json.error_message || json.status },
      { status: 502, headers: corsHeaders },
    );
  }

  return Response.json(
    {
      formatted_address: json.result.formatted_address,
      location: json.result.geometry.location,
    },
    { headers: corsHeaders },
  );
});
