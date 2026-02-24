import { create } from 'zustand';
import { ItineraryResponse, ScheduledStop } from '../services/itineraryApi';

interface ItineraryState {
  // Current itinerary being viewed/edited
  currentItinerary: ItineraryResponse | null;
  savedItineraryId: string | null;
  
  // Loading states
  isGenerating: boolean;
  isSaving: boolean;
  
  // Actions
  setCurrentItinerary: (itinerary: ItineraryResponse | null) => void;
  setSavedItineraryId: (id: string | null) => void;
  updateStop: (index: number, updates: Partial<ScheduledStop>) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  reset: () => void;
}

export const useItineraryStore = create<ItineraryState>((set) => ({
  currentItinerary: null,
  savedItineraryId: null,
  isGenerating: false,
  isSaving: false,

  setCurrentItinerary: (itinerary) => set({ currentItinerary: itinerary }),
  
  setSavedItineraryId: (id) => set({ savedItineraryId: id }),
  
  updateStop: (index, updates) => set((state) => {
    if (!state.currentItinerary) return state;
    const updatedStops = [...state.currentItinerary.itinerary];
    updatedStops[index] = { ...updatedStops[index], ...updates };
    return {
      currentItinerary: {
        ...state.currentItinerary,
        itinerary: updatedStops,
      },
    };
  }),
  
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  
  setIsSaving: (isSaving) => set({ isSaving }),
  
  reset: () => set({ 
    currentItinerary: null, 
    savedItineraryId: null,
    isGenerating: false,
    isSaving: false,
  }),
}));

export default useItineraryStore;
