// Converts Firestore Timestamp, Date, number (ms), or ISO string
// → milliseconds (number)*/
export const toMillis = (t: any): number | null => {
  if (!t) return null;

  if (t instanceof Date) return t.getTime();
  if (typeof t === "number") return t; // already ms

  if (typeof t === "string") {
    const num = Number(t);
    return Number.isNaN(num) ? Date.parse(t) || null : num;
  }

  // Firestore Timestamp object
  if (typeof t === "object" && "seconds" in t && "nanoseconds" in t) {
    return t.seconds * 1000 + Math.floor(t.nanoseconds / 1e6);
  }

  return null;
};

// Converts Firestore Timestamp, milliseconds, or string → JS Date*/
export const toDate = (t: any): Date | null => {
  if (!t) return null;

  if (t instanceof Date) return t;
  if (typeof t === "number") return new Date(t);
  if (typeof t === "string") return new Date(t);

  if (typeof t === "object" && "seconds" in t && "nanoseconds" in t) {
    return new Date(t.seconds * 1000 + t.nanoseconds / 1e6);
  }

  return null;
};

//Converts Firestore Timestamp or Date → ISO string (for logs/UI)*/
export const toIsoString = (t: any): string | null => {
  const date = toDate(t);
  return date ? date.toISOString() : null;
};
