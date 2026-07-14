const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

const MAPS_API_KEY = Deno.env.get("MAPS_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
  const input = (url.searchParams.get("input") || body?.input || "").toString();

  if (!input.trim()) {
    return Response.json({ predictions: [] }, { headers: corsHeaders });
  }

  const mapsUrl =
    "https://maps.googleapis.com/maps/api/place/autocomplete/json" +
    `?input=${encodeURIComponent(input)}&types=geocode&key=${MAPS_API_KEY}`;

  const r = await fetch(mapsUrl);
  const json = await r.json();

  if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
    return Response.json(
      { error: json.error_message || json.status },
      { status: 502, headers: corsHeaders },
    );
  }

  return Response.json(
    {
      predictions: (json.predictions ?? []).map((p: any) => ({
        description: p.description,
        place_id: p.place_id,
      })),
    },
    { headers: corsHeaders },
  );
});
