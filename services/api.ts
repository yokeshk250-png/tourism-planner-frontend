import axios from 'axios';
import { ENDPOINTS } from '../constants/api';

const apiClient = axios.create({
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Types ────────────────────────────────────────────────────
export interface TripRequest {
  destination:         string;
  days:                number;
  budget:              'low' | 'medium' | 'high';
  travel_type:         'solo' | 'couple' | 'family' | 'group';
  mood:                'relaxed'|'adventure'|'spiritual'|'romantic'|'cultural'|'foodie';
  interests:           string[];
  travel_dates?:       string;
  avoid_crowded:       boolean;
  accessibility_needs: boolean;
}

export interface ScheduledStop {
  day:                  number;
  slot_id:              string;
  slot_name:            string;
  start_time:           string;
  end_time:             string;
  place_name:           string;
  category?:            string;
  priority:             number;
  duration_hrs:         number;
  travel_mins_from_prev:number;
  opening_hours?:       string;
  closed_on?:           string[];
  entry_fee?:           number;
  entry_fee_foreign?:   number;
  nearby_food?:         string;
  tip?:                 string;
  lat?:                 number;
  lon?:                 number;
  why_must_visit?:      string;
  is_alternate:         boolean;
  opening_hours_unverified: boolean;
}

export interface ItineraryResponse {
  success:          boolean;
  meta:             any;
  slot_template:    any[];
  itinerary:        ScheduledStop[];
  unscheduled?:     any[];
  weather_warnings?:string[];
}

// ─── Generate Itinerary ───────────────────────────────────────
export const generateItinerary = async (req: TripRequest): Promise<ItineraryResponse> => {
  const { data } = await apiClient.post(ENDPOINTS.GENERATE, req);
  return data;
};

// ─── Suggest Alternates ───────────────────────────────────────
export const suggestAlternates = async (params: {
  destination: string;
  slot_name: string;
  current_stop: ScheduledStop;
  scheduled_places: ScheduledStop[];
  free_slots?: string[];
}) => {
  const { data } = await apiClient.post(ENDPOINTS.SUGGEST, params);
  return data;
};

// ─── Validate Place for Slot ──────────────────────────────────
export const validatePlace = async (params: Record<string, any>) => {
  const { data } = await apiClient.post(ENDPOINTS.VALIDATE_PLACE, params);
  return data;
};

// ─── Enrich Place ─────────────────────────────────────────────
export const enrichPlace = async (place_name: string, city: string) => {
  const { data } = await apiClient.post(ENDPOINTS.ENRICH, { place_name, city });
  return data;
};

// ─── Save Itinerary (Backend Firebase) ───────────────────────
export const saveItineraryBackend = async (
  user_id: string, itinerary: Record<string, any>
) => {
  const { data } = await apiClient.post(
    `${ENDPOINTS.SAVE_ITINERARY}?user_id=${user_id}`, itinerary
  );
  return data;
};

// ─── Get Weather ──────────────────────────────────────────────
export const getWeather = async (destination: string, days: number) => {
  const { data } = await apiClient.get(
    `${ENDPOINTS.WEATHER}?destination=${encodeURIComponent(destination)}&days=${days}`
  );
  return data;
};

// ─── Get Hotels ───────────────────────────────────────────────
export const getHotels = async (destination: string, budget: string) => {
  const { data } = await apiClient.get(
    `${ENDPOINTS.HOTELS}?destination=${encodeURIComponent(destination)}&budget=${budget}`
  );
  return data;
};

// ─── Rate Place ───────────────────────────────────────────────
export const ratePlaceApi = async (params: {
  user_id: string; place_id: string; place_name: string;
  rating: number; review?: string;
}) => {
  const { data } = await apiClient.post(ENDPOINTS.RATE_PLACE, params);
  return data;
};

// ─── Health Check ─────────────────────────────────────────────
export const checkHealth = async () => {
  const { data } = await apiClient.get(ENDPOINTS.HEALTH);
  return data;
};
