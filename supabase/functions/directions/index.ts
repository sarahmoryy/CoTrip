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
  const origin = (url.searchParams.get("origin") || body?.origin || "").toString();
  const destination = (url.searchParams.get("destination") || body?.destination || "").toString();

  if (!origin || !destination) {
    return Response.json(
      { error: "Missing origin or destination" },
      { status: 400, headers: corsHeaders },
    );
  }

  const mapsUrl =
    "https://maps.googleapis.com/maps/api/directions/json" +
    `?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}` +
    `&mode=driving&key=${MAPS_API_KEY}`;

  const r = await fetch(mapsUrl);
  const json = await r.json();

  if (json.status !== "OK") {
    return Response.json(
      { error: json.error_message || json.status },
      { status: 502, headers: corsHeaders },
    );
  }

  const leg = json.routes?.[0]?.legs?.[0];
  return Response.json(
    {
      meters: leg?.distance?.value ?? 0,
      seconds: leg?.duration?.value ?? 0,
    },
    { headers: corsHeaders },
  );
});
