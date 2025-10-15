// src/services/fuelPrice.ts
const RAPID_HOST = "gas-price.p.rapidapi.com";
const BASE = `https://${RAPID_HOST}`;

export async function fetchCanadaGasPricePerLitre(city?: string): Promise<number> {
  const headers = {
    "x-rapidapi-key": "apikey 2rnxKJKZw3s1s6vunzd4hA:1NfixGH4JsjubF13gL6ufT:1NfixGH4JsjubF13gL6ufT",
    "x-rapidapi-host": RAPID_HOST,
  };

  // try city directly
  if (city) {
    try {
      const r = await fetch(`${BASE}/canada?city=${encodeURIComponent(city)}`, { headers });
      if (r.ok) {
        const d = await r.json();
        const entry = Array.isArray(d?.result) ? d.result[0] : d?.result;
        const v = Number(entry?.gasoline);
        if (isFinite(v) && v > 0) return v;
      }
    } catch {}
  }

  // fallback: fetch list and take first (or you can search for closest city string)
  const ra = await fetch(`${BASE}/canada`, { headers });
  if (!ra.ok) throw new Error(`CollectAPI failed: ${ra.status}`);
  const da = await ra.json();
  const entry = Array.isArray(da?.result) ? da.result[0] : da?.result;
  const v = Number(entry?.gasoline);
  if (!isFinite(v)) throw new Error("No valid gasoline price in response");
  return v;
}
