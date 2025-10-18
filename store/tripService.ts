// store/tripService.ts
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../FirebaseConfig';
import type { Trip } from './tripSlice';

const TRIPS = 'trips';

function userScopedCollection() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  return collection(db, 'users', uid, TRIPS);
}

// Remove all undefined values (Firestore rejects undefined)
function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  if (typeof obj !== 'object') return obj;
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    out[k] = sanitizeForFirestore(v);
  }
  return out;
}

export const TripService = {
  // READ
  async list(order: string = '-createdAt', p0: number): Promise<Trip[]> {
    const col = userScopedCollection();
    const q = query(col, orderBy('createdAt', order.startsWith('-') ? 'desc' : 'asc'));
    const snap = await getDocs(q);

    // Attach doc.id, drop Firestore timestamps from Redux
    return snap.docs.map((d) => {
      const { createdAt, updatedAt, ...rest } = d.data() as Record<string, any>;
      return { id: d.id, ...(rest as Omit<Trip, 'id'>) };
    });
  },

  // CREATE (Firestore generates id)
  async create(trip: Trip): Promise<Trip> {
    const col = userScopedCollection();

    // Ignore any id coming from the form; sanitize to remove undefined fields
    const { id: _ignore, ...rest } = trip;
    const payload = sanitizeForFirestore({
      ...rest,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const ref = await addDoc(col, payload);

    // Return Trip shaped for Redux/UI (no Timestamp objects)
    return { id: ref.id, ...(rest as Omit<Trip, 'id'>) };
  },

  // UPDATE (partial)
  async update(id: string, patch: Partial<Trip>): Promise<void> {
    const col = userScopedCollection();
    const ref = doc(col, id);
    const { id: _ignore, ...rest } = patch;
    const payload = sanitizeForFirestore({
      ...rest,
      updatedAt: serverTimestamp(),
    });
    await updateDoc(ref, payload);
  },

  // DELETE
  async delete(id: string): Promise<void> {
    const col = userScopedCollection();
    await deleteDoc(doc(col, id));
  },
};

export default TripService;

