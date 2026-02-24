import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';

// ─── Firebase Config ───────────────────────────────────────────
// Replace with your Firebase project config
const firebaseConfig = {
  apiKey:            'YOUR_API_KEY',
  authDomain:        'YOUR_AUTH_DOMAIN',
  projectId:         'YOUR_PROJECT_ID',
  storageBucket:     'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId:             'YOUR_APP_ID',
};

// ─── Init ─────────────────────────────────────────────────────
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db   = getFirestore(app);

// ─────────────────────────────────────────────────────────────
// AUTH FUNCTIONS
// ─────────────────────────────────────────────────────────────
export const registerUser = async (
  email: string, password: string, displayName: string
) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  // Create user profile in Firestore
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid:         cred.user.uid,
    email,
    displayName,
    photoURL:    null,
    preferences: { budget: 'medium', travelType: 'solo', mood: 'cultural' },
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
  });
  return cred.user;
};

export const loginUser = async (email: string, password: string) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

export const logoutUser = () => signOut(auth);

export const resetPassword = (email: string) =>
  sendPasswordResetEmail(auth, email);

export const onAuthChange = (cb: (user: User | null) => void) =>
  onAuthStateChanged(auth, cb);

// ─────────────────────────────────────────────────────────────
// USER PROFILE
// ─────────────────────────────────────────────────────────────
export const getUserProfile = async (uid: string) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

export const updateUserProfile = async (uid: string, data: Record<string, any>) => {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
};

// ─────────────────────────────────────────────────────────────
// ITINERARY CRUD
// ─────────────────────────────────────────────────────────────
export const saveItinerary = async (uid: string, itinerary: Record<string, any>) => {
  const ref = await addDoc(collection(db, 'itineraries'), {
    userId:    uid,
    itinerary,
    status:    'planned',  // planned | active | completed
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const getItinerary = async (id: string) => {
  const snap = await getDoc(doc(db, 'itineraries', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateItinerary = async (id: string, patch: Record<string, any>) => {
  await updateDoc(doc(db, 'itineraries', id), { ...patch, updatedAt: serverTimestamp() });
};

export const deleteItinerary = async (id: string) => {
  await deleteDoc(doc(db, 'itineraries', id));
};

export const getUserItineraries = async (uid: string) => {
  const q = query(
    collection(db, 'itineraries'),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const subscribeToItinerary = (
  id: string,
  cb: (data: any) => void
) => onSnapshot(doc(db, 'itineraries', id), snap => {
  if (snap.exists()) cb({ id: snap.id, ...snap.data() });
});

// ─────────────────────────────────────────────────────────────
// CHECK-IN / CHECK-OUT
// ─────────────────────────────────────────────────────────────
export const checkInPlace = async (
  uid: string, itineraryId: string, stopData: Record<string, any>
) => {
  const ref = await addDoc(collection(db, 'checkins'), {
    userId:      uid,
    itineraryId,
    placeName:   stopData.place_name,
    placeData:   stopData,
    checkinAt:   serverTimestamp(),
    checkoutAt:  null,
    status:      'checked-in',
    notes:       '',
    photos:      [],
    rating:      null,
  });
  // update itinerary stop status
  await updateItinerary(itineraryId, {
    [`stop_status.${stopData.place_name}`]: 'checked-in',
  });
  return ref.id;
};

export const checkOutPlace = async (
  checkinId: string, itineraryId: string,
  placeName: string, notes: string, rating: number
) => {
  await updateDoc(doc(db, 'checkins', checkinId), {
    checkoutAt: serverTimestamp(),
    status:     'completed',
    notes,
    rating,
  });
  await updateItinerary(itineraryId, {
    [`stop_status.${placeName}`]: 'completed',
  });
};

export const getCheckins = async (uid: string, itineraryId: string) => {
  const q = query(
    collection(db, 'checkins'),
    where('userId',      '==', uid),
    where('itineraryId', '==', itineraryId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─────────────────────────────────────────────────────────────
// RATINGS
// ─────────────────────────────────────────────────────────────
export const savePlaceRating = async (
  uid: string, placeId: string, placeName: string,
  rating: number, review: string
) => {
  await addDoc(collection(db, 'ratings'), {
    userId:    uid,
    placeId,
    placeName,
    rating,
    review,
    createdAt: serverTimestamp(),
  });
};
