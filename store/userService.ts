import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../FirebaseConfig';

export interface UserState {
  full_name: string;
  email: string;
  phone: string;
  address: string;
}

export class UserService {

  /** LOGIN */
  static async login(email: string, password: string): Promise<UserState> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return await UserService.getUserData(user.uid);
  }

  /** SIGNUP */
  static async signup(fullName: string, email: string, password: string, confirmPassword: string): Promise<UserState> {
    if (password !== confirmPassword) throw new Error('Passwords do not match');

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update displayName in Firebase Auth
    await updateProfile(user, { displayName: fullName });

    // Create user document in Firestore
    const userData: UserState = {
      full_name: fullName,
      email: email,
      phone: '',
      address: '',
    };
    await setDoc(doc(db, 'users', user.uid), userData);

    return userData;
  }

  /** GET CURRENT USER DATA */
  static async me(): Promise<UserState> {
    const user = auth.currentUser;
    if (!user) throw new Error('No user is currently logged in');
    return await UserService.getUserData(user.uid);
  }

  /** UPDATE USER DATA */
  static async updateMyUserData(userData: Partial<UserState>): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No user is currently logged in');

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, userData);

    // Optionally update displayName in Firebase Auth if full_name changes
    if (userData.full_name) {
      await updateProfile(user, { displayName: userData.full_name });
    }
  }

  /** LOGOUT */
  static async logout(): Promise<void> {
    await signOut(auth);
  }

  /** HELPER: Get user data from Firestore */
  private static async getUserData(uid: string): Promise<UserState> {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) throw new Error('User data not found in Firestore');
    return docSnap.data() as UserState;
  }
}

export default UserService;
