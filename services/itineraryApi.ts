import { getApiClient } from './apiClient';

export type BudgetLevel = 'low' | 'medium' | 'high';
export type TravelType = 'solo' | 'couple' | 'family' | 'group';
export type TripMood = 'relaxed' | 'adventure' | 'spiritual' | 'romantic' | 'cultural' | 'foodie';
export type SlotName = 'morning' | 'afternoon' | 'evening' | 'night';

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

export interface ScheduledStop {
  day: number;
  slot_id: string;
  slot_name: SlotName;
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
  nearby_food?: string | null;
  tip?: string | null;
  lat?: number | null;
  lon?: number | null;
  is_alternate: boolean;
  opening_hours_unverified?: boolean;
  why_must_visit?: string | null;
  travel_mins_from_prev?: number;
  checked_in?: boolean;
  checked_out?: boolean;
}

export interface TimeSlot {
  slot_id: string;
  day: number;
  slot_name: SlotName;
  start_time: string;
  end_time: string;
  available_mins: number;
  remaining_mins: number;
  meal_gap_after?: string | null;
}

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

export interface ItineraryResponse {
  success: boolean;
  meta?: ItineraryMeta;
  slot_template?: TimeSlot[];
  itinerary: ScheduledStop[];
  unscheduled?: PlaceCandidate[];
  weather_warnings?: string[] | null;
}

export interface PlaceCandidate {
  place_name: string;
  category?: string | null;
  priority: number;
  duration_hrs: number;
  best_slot?: SlotName | null;
  why_must_visit?: string | null;
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

export interface ValidatePlaceRequest {
  place: PlaceCandidate;
  target_day: number;
  target_slot: SlotName;
  day_date?: string | null;
  slot_stops: ScheduledStop[];
  prev_stop?: ScheduledStop | null;
  next_stop?: ScheduledStop | null;
  all_stops: ScheduledStop[];
  budget?: BudgetLevel;
  accessibility_needs?: boolean;
}

export interface ValidatePlaceResponse {
  valid: boolean;
  place_name: string;
  target_slot: SlotName;
  target_day: number;
  conflicts: ValidationConflict[];
  warnings: ValidationWarning[];
  estimated_start?: string | null;
  estimated_end?: string | null;
  remaining_mins_in_slot?: number | null;
}

export interface ValidationConflict {
  type: string;
  severity: 'error' | 'warning';
  message: string;
  detail: string;
}

export interface ValidationWarning {
  type: string;
  message: string;
  detail: string;
}

export interface HotelSuggestRequest {
  destination: string;
  days: number;
  budget?: string;
  itinerary: ScheduledStop[];
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

export interface UserRating {
  user_id: string;
  place_id: string;
  place_name: string;
  rating: number;
  review?: string;
}

// API Functions
export async function generateItinerary(req: TripRequest): Promise<ItineraryResponse> {
  const { data } = await getApiClient().post<ItineraryResponse>('/api/itinerary/generate', req);
  return data;
}

export async function suggestAlternates(payload: {
  destination: string;
  slot_name: SlotName;
  current_stop: ScheduledStop;
  scheduled_places: ScheduledStop[];
  free_slots: SlotName[];
}) {
  const { data } = await getApiClient().post('/api/itinerary/suggest', payload);
  return data;
}

export async function validatePlace(payload: ValidatePlaceRequest): Promise<ValidatePlaceResponse> {
  const { data } = await getApiClient().post<ValidatePlaceResponse>('/api/itinerary/validate-place', payload);
  return data;
}

export async function saveUserItinerary(userId: string, itinerary: ItineraryResponse) {
  const { data } = await getApiClient().post('/api/itinerary/save', { itinerary }, { params: { user_id: userId } });
  return data as { success: boolean; itinerary_id: string };
}

export async function updateItinerary(itineraryId: string, patch: { itinerary: ScheduledStop[] }) {
  const { data } = await getApiClient().patch(`/api/itinerary/update/${itineraryId}`, patch);
  return data as { success: boolean; itinerary_id: string; updated: boolean };
}

export async function getUserItineraries(userId: string) {
  const { data } = await getApiClient().get(`/api/itinerary/user/${userId}`);
  return data as { success: boolean; itineraries: any[]; count: number };
}

export async function getItinerary(itineraryId: string) {
  const { data } = await getApiClient().get(`/api/itinerary/${itineraryId}`);
  return data as { success: boolean; itinerary: ItineraryResponse };
}

export async function ratePlace(payload: UserRating) {
  const { data } = await getApiClient().post('/api/itinerary/rate', payload);
  return data as { success: boolean; message: string };
}

// Hotel API Functions
export async function suggestHotels(payload: HotelSuggestRequest) {
  const { data } = await getApiClient().post('/api/hotels/suggest', payload);
  return data;
}

export async function checkInHotel(payload: CheckInRequest) {
  const { data } = await getApiClient().post('/api/hotels/checkin', payload);
  return data;
}

export async function checkOutHotel(payload: CheckOutRequest) {
  const { data } = await getApiClient().post('/api/hotels/checkout', payload);
  return data;
}
