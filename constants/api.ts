// ─── Backend API Base URL ──────────────────────────────────────
// Replace with your deployed backend URL or local dev URL
export const API_BASE_URL = 'http://localhost:8000';

// ─── API Endpoints ────────────────────────────────────────────
export const ENDPOINTS = {
  // Itinerary
  GENERATE:       `${API_BASE_URL}/api/itinerary/generate`,
  SUGGEST:        `${API_BASE_URL}/api/itinerary/suggest`,
  ENRICH:         `${API_BASE_URL}/api/itinerary/enrich`,
  SAVE_ITINERARY: `${API_BASE_URL}/api/itinerary/save`,
  UPDATE_ITINERARY:(id: string) => `${API_BASE_URL}/api/itinerary/update/${id}`,
  GET_ITINERARY:  (id: string) => `${API_BASE_URL}/api/itinerary/${id}`,
  USER_ITINERARIES:(uid: string) => `${API_BASE_URL}/api/itinerary/user/${uid}`,
  VALIDATE_PLACE: `${API_BASE_URL}/api/itinerary/validate-place`,
  RATE_PLACE:     `${API_BASE_URL}/api/itinerary/rate`,
  // Places
  SEARCH_PLACES:  `${API_BASE_URL}/api/places/search`,
  GEOCODE_PLACE:  `${API_BASE_URL}/api/places/geocode`,
  // Weather
  WEATHER:        `${API_BASE_URL}/api/weather`,
  // Hotels
  HOTELS:         `${API_BASE_URL}/api/hotels/search`,
  // Health
  HEALTH:         `${API_BASE_URL}/health`,
};

// ─── TripRequest defaults ─────────────────────────────────────
export const TRAVEL_TYPES = ['solo', 'couple', 'family', 'group'];
export const BUDGET_LEVELS = ['low', 'medium', 'high'];
export const TRIP_MOODS = [
  'relaxed', 'adventure', 'spiritual', 'romantic', 'cultural', 'foodie',
];
export const INTERESTS = [
  'temples', 'beach', 'history', 'nature', 'food',
  'shopping', 'art', 'nightlife', 'adventure', 'wildlife',
  'waterfalls', 'trekking', 'photography', 'architecture',
];
