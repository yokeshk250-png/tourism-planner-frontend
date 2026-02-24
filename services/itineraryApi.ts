import { getApiClient } from './apiClient';

// Budget level type
export type BudgetLevel = 'low' | 'medium' | 'high';

// Travel type type
export type TravelType = 'solo' | 'couple' | 'family' | 'group';

// Trip mood type
export type TripMood = 'relaxed' | 'adventure' | 'spiritual' | 'romantic' | 'cultural' | 'foodie';

// Trip request interface for generating itinerary
export interface TripRequest {
  destination: string;
  days: number;
  budget: BudgetLevel;
  travel_type: TravelType;
  mood: TripMood;
  interests: string[];
  travel_dates?: string | null;
  avoid_crowded: boolean;
  accessibility_needs: boolean;
}

// Scheduled stop interface - a place in the itinerary
export interface ScheduledStop {
  day: number;
  slot_id: string;
  slot_name: 'morning' | 'afternoon' | 'evening' | 'night';
  start_time: string;
  end_time: string;
  place_name: string;
  category?: string | null;
  priority: number;
  duration_hrs: number;
  opening_hours?: string | null;
  closed_on?: string[] | null;
  entry_fee?: number | null;
  entry_fee_foreign?: number | null;
  tip?: string | null;
  nearby_food?: string | null;
  lat?: number | null;
  lon?: number | null;
  is_alternate: boolean;
  opening_hours_unverified?: boolean;
  why_must_visit?: string | null;
  travel_mins_from_prev?: number;
  checked_in?: boolean;
  checked_out?: boolean;
}

// Time slot interface
export interface TimeSlot {
  slot_id: string;
  day: number;
  slot_name: string;
  start_time: string;
  end_time: string;
  available_mins: number;
  remaining_mins: number;
  meal_gap_after?: string | null;
}

// Itinerary metadata
export interface ItineraryMeta {
  destination: string;
  days: number;
  travel_type: string;
  budget: string;
  mood: string;
  generated_at: string;
  model_used: string;
  total_places: number;
  unscheduled_count: number;
  hours_unverified_count: number;
}

// Itinerary response from generate endpoint
export interface ItineraryResponse {
  success: boolean;
  meta?: ItineraryMeta;
  slot_template?: TimeSlot[];
  itinerary: ScheduledStop[];
  unscheduled?: any[];
  weather_warnings?: string[] | null;
}

// Place candidate for suggestions
export interface PlaceCandidate {
  place_name: string;
  category?: string | null;
  priority?: number;
  duration_hrs: number;
  best_slot?: string | null;
  opening_hours?: string | null;
  closed_on?: string[] | null;
  entry_fee?: number | null;
  entry_fee_foreign?: number | null;
  tip?: string | null;
  nearby_food?: string | null;
  lat?: number | null;
  lon?: number | null;
  is_alternate?: boolean;
}

// User rating interface
export interface UserRating {
  user_id: string;
  place_id: string;
  place_name: string;
  rating: number;
  review?: string;
}

// Hotel request types
export interface HotelPhase {
  phase: number;
  days: number[];
  hotel_name: string;
  hotel_lat: number;
  hotel_lon: number;
  distance_km: number;
  hotels_list?: any[];
}

export interface HotelSuggestRequest {
  destination: string;
  days: number;
  budget: string;
  itinerary: ScheduledStop[];
}

export interface HotelSuggestResponse {
  success: boolean;
  phases: HotelPhase[];
  note?: string;
}

export interface CheckInRequest {
  itinerary_id: string;
  phase: number;
  current_day: number;
  checkin_time: string;
}

export interface CheckOutRequest {
  itinerary_id: string;
  phase: number;
  current_day: number;
  checkout_time: string;
}

// Suggest alternates request
export interface SuggestAlternatesRequest {
  destination: string;
  slot_name: string;
  current_stop: ScheduledStop;
  scheduled_places: ScheduledStop[];
  free_slots: string[];
}

export interface SuggestAlternatesResponse {
  success: boolean;
  alternates: PlaceCandidate[];
  count: number;
}

// Validate place request
export interface ValidatePlaceRequest {
  place: PlaceCandidate;
  target_day: number;
  target_slot: string;
  day_date?: string | null;
  slot_stops: ScheduledStop[];
  prev_stop?: ScheduledStop | null;
  next_stop?: ScheduledStop | null;
  all_stops: ScheduledStop[];
  budget?: string;
  accessibility_needs?: boolean;
}

export interface ValidationConflict {
  type: string;
  severity: 'error' | 'warning';
  message: string;
  detail: string;
}

export interface ValidatePlaceResponse {
  valid: boolean;
  place_name: string;
  target_slot: string;
  target_day: number;
  conflicts: ValidationConflict[];
  warnings: ValidationConflict[];
  estimated_start?: string | null;
  estimated_end?: string | null;
  remaining_mins_in_slot?: number | null;
}

// Saved itinerary from backend
export interface SavedItinerary {
  id: string;
  user_id: string;
  itinerary: ItineraryResponse;
  created_at: string;
  updated_at: string;
}

// API Functions

/**
 * Generate a new itinerary
 */
export async function generateItinerary(req: TripRequest): Promise<ItineraryResponse> {
  const { data } = await getApiClient().post<ItineraryResponse>('/api/itinerary/generate', req);
  return data;
}

/**
 * Suggest alternate places for swapping
 */
export async function suggestAlternates(req: SuggestAlternatesRequest): Promise<SuggestAlternatesResponse> {
  const { data } = await getApiClient().post<SuggestAlternatesResponse>('/api/itinerary/suggest', req);
  return data;
}

/**
 * Validate if a place can fit in a slot
 */
export async function validatePlace(req: ValidatePlaceRequest): Promise<ValidatePlaceResponse> {
  const { data } = await getApiClient().post<ValidatePlaceResponse>('/api/itinerary/validate-place', req);
  return data;
}

/**
 * Save itinerary to backend
 */
export async function saveUserItinerary(userId: string, itinerary: ItineraryResponse): Promise<{ success: boolean; itinerary_id: string }> {
  const { data } = await getApiClient().post('/api/itinerary/save', 
    { itinerary, saved_at: new Date().toISOString() },
    { params: { user_id: userId } }
  );
  return data;
}

/**
 * Update existing itinerary
 */
export async function updateItinerary(itineraryId: string, patch: { itinerary: ScheduledStop[] }): Promise<{ success: boolean; itinerary_id: string; updated: boolean }> {
  const { data } = await getApiClient().patch(`/api/itinerary/update/${itineraryId}`, patch);
  return data;
}

/**
 * Get all itineraries for a user
 */
export async function getUserItineraries(userId: string): Promise<{ success: boolean; itineraries: SavedItinerary[]; count: number }> {
  const { data } = await getApiClient().get(`/api/itinerary/user/${userId}`);
  return data;
}

/**
 * Get a specific itinerary by ID
 */
export async function getItinerary(itineraryId: string): Promise<{ success: boolean; itinerary: ItineraryResponse }> {
  const { data } = await getApiClient().get(`/api/itinerary/${itineraryId}`);
  return data;
}

/**
 * Rate a place
 */
export async function ratePlace(payload: UserRating): Promise<{ success: boolean; message: string }> {
  const { data } = await getApiClient().post('/api/itinerary/rate', payload);
  return data;
}

// Hotel API Functions

/**
 * Suggest hotels for itinerary phases
 */
export async function suggestHotels(req: HotelSuggestRequest): Promise<HotelSuggestResponse> {
  const { data } = await getApiClient().post<HotelSuggestResponse>('/api/hotels/suggest', req);
  return data;
}

/**
 * Check in to hotel (replan current day if late)
 */
export async function checkInHotel(req: CheckInRequest): Promise<any> {
  const { data } = await getApiClient().post('/api/hotels/checkin', req);
  return data;
}

/**
 * Check out from hotel (replan next phase if late)
 */
export async function checkOutHotel(req: CheckOutRequest): Promise<any> {
  const { data } = await getApiClient().post('/api/hotels/checkout', req);
  return data;
}

export default {
  generateItinerary,
  suggestAlternates,
  validatePlace,
  saveUserItinerary,
  updateItinerary,
  getUserItineraries,
  getItinerary,
  ratePlace,
  suggestHotels,
  checkInHotel,
  checkOutHotel,
};
