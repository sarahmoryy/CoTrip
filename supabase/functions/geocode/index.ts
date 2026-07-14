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
  const address = (url.searchParams.get("address") || body?.address || "").toString();

  if (!address) {
    return Response.json({ error: "Missing address" }, { status: 400, headers: corsHeaders });
  }

  const mapsUrl =
    "https://maps.googleapis.com/maps/api/geocode/json" +
    `?address=${encodeURIComponent(address)}&key=${MAPS_API_KEY}`;

  const r = await fetch(mapsUrl);
  const json = await r.json();

  if (json.status !== "OK" || !json.results?.length) {
    return Response.json(
      { error: json.error_message || json.status },
      { status: 502, headers: corsHeaders },
    );
  }

  const r0 = json.results[0];
  const cityComp = (r0.address_components || []).find((c: any) =>
    (c.types || []).includes("locality"),
  );

  return Response.json(
    {
      formatted_address: r0.formatted_address,
      location: r0.geometry.location,
      city: cityComp?.long_name,
    },
    { headers: corsHeaders },
  );
});
