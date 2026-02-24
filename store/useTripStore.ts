import { create } from 'zustand';
import { generateItinerary, suggestAlternates, validatePlace } from '../services/api';
import {
  saveItinerary, getUserItineraries, updateItinerary,
  deleteItinerary, getItinerary,
} from '../services/firebase';
import type { TripRequest, ScheduledStop, ItineraryResponse } from '../services/api';

interface TripState {
  // current trip planning
  tripRequest:     TripRequest | null;
  itinerary:       ItineraryResponse | null;
  savedItineraries:any[];
  activeItinerary: any | null;
  activeCheckins:  Record<string, string>;  // placeName → checkinId
  loading:         boolean;
  generating:      boolean;
  error:           string | null;
  // actions
  setTripRequest:  (req: TripRequest) => void;
  generate:        (req: TripRequest) => Promise<void>;
  saveTrip:        (uid: string) => Promise<string>;
  loadMyTrips:     (uid: string) => Promise<void>;
  loadTrip:        (id: string) => Promise<void>;
  updateTrip:      (id: string, patch: any) => Promise<void>;
  deleteTrip:      (id: string) => Promise<void>;
  swapStop:        (stop: ScheduledStop, destination: string) => Promise<any[]>;
  validate:        (params: any) => Promise<any>;
  reorderStops:    (day: number, newOrder: ScheduledStop[]) => void;
  clearItinerary:  () => void;
  clearError:      () => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  tripRequest:     null,
  itinerary:       null,
  savedItineraries:[],
  activeItinerary: null,
  activeCheckins:  {},
  loading:         false,
  generating:      false,
  error:           null,

  setTripRequest: (req) => set({ tripRequest: req }),

  generate: async (req) => {
    set({ generating: true, error: null, itinerary: null });
    try {
      const result = await generateItinerary(req);
      set({ itinerary: result, tripRequest: req, generating: false });
    } catch (e: any) {
      set({ error: e.message, generating: false });
      throw e;
    }
  },

  saveTrip: async (uid) => {
    const { itinerary, tripRequest } = get();
    if (!itinerary) throw new Error('No itinerary to save');
    set({ loading: true });
    try {
      const id = await saveItinerary(uid, { ...itinerary, tripRequest });
      set({ loading: false });
      return id;
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  loadMyTrips: async (uid) => {
    set({ loading: true });
    try {
      const trips = await getUserItineraries(uid);
      set({ savedItineraries: trips, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  loadTrip: async (id) => {
    set({ loading: true });
    try {
      const trip = await getItinerary(id);
      set({ activeItinerary: trip, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  updateTrip: async (id, patch) => {
    set({ loading: true });
    try {
      await updateItinerary(id, patch);
      set({ loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  deleteTrip: async (id) => {
    set({ loading: true });
    try {
      await deleteItinerary(id);
      const trips = get().savedItineraries.filter((t: any) => t.id !== id);
      set({ savedItineraries: trips, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  swapStop: async (stop, destination) => {
    const { itinerary } = get();
    const scheduled = itinerary?.itinerary || [];
    const result = await suggestAlternates({
      destination,
      slot_name:        stop.slot_name,
      current_stop:     stop,
      scheduled_places: scheduled,
      free_slots:       [stop.slot_name],
    });
    return result.alternates || [];
  },

  validate: async (params) => {
    return await validatePlace(params);
  },

  reorderStops: (day, newOrder) => {
    const { itinerary } = get();
    if (!itinerary) return;
    const others = itinerary.itinerary.filter(s => s.day !== day);
    set({ itinerary: { ...itinerary, itinerary: [...others, ...newOrder] } });
  },

  clearItinerary: () => set({ itinerary: null, tripRequest: null }),
  clearError:     () => set({ error: null }),
}));
