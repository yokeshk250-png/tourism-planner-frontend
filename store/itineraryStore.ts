import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ItineraryResponse, ScheduledStop } from '../services/itineraryApi';

interface ItineraryState {
  // Current itinerary data
  itineraryData: ItineraryResponse | null;
  savedItineraryId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setItineraryData: (data: ItineraryResponse) => void;
  updateStop: (index: number, patch: Partial<ScheduledStop>) => void;
  addStop: (stop: ScheduledStop) => void;
  removeStop: (index: number) => void;
  reorderStops: (newOrder: ScheduledStop[]) => void;
  setSavedItineraryId: (id: string) => void;
  clearItinerary: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Check-in/out helpers
  checkInStop: (index: number) => void;
  checkOutStop: (index: number) => void;
  getCheckedInStops: () => ScheduledStop[];
  getCheckedOutStops: () => ScheduledStop[];
  
  // Validation helpers
  getStopBySlot: (day: number, slotName: string) => ScheduledStop | undefined;
  getStopsByDay: (day: number) => ScheduledStop[];
}

export const useItineraryStore = create<ItineraryState>()(
  persist(
    (set, get) => ({
      itineraryData: null,
      savedItineraryId: null,
      isLoading: false,
      error: null,
      
      setItineraryData: (data) => set({ itineraryData: data, error: null }),
      
      updateStop: (index, patch) => {
        const { itineraryData } = get();
        if (!itineraryData) return;
        
        const updatedStops = [...itineraryData.itinerary];
        updatedStops[index] = { ...updatedStops[index], ...patch };
        
        set({
          itineraryData: {
            ...itineraryData,
            itinerary: updatedStops,
          },
        });
      },
      
      addStop: (stop) => {
        const { itineraryData } = get();
        if (!itineraryData) return;
        
        set({
          itineraryData: {
            ...itineraryData,
            itinerary: [...itineraryData.itinerary, stop],
            meta: {
              ...itineraryData.meta!,
              total_places: (itineraryData.meta?.total_places || 0) + 1,
            },
          },
        });
      },
      
      removeStop: (index) => {
        const { itineraryData } = get();
        if (!itineraryData) return;
        
        const updatedStops = itineraryData.itinerary.filter((_, i) => i !== index);
        
        set({
          itineraryData: {
            ...itineraryData,
            itinerary: updatedStops,
            meta: {
              ...itineraryData.meta!,
              total_places: updatedStops.length,
            },
          },
        });
      },
      
      reorderStops: (newOrder) => {
        const { itineraryData } = get();
        if (!itineraryData) return;
        
        set({
          itineraryData: {
            ...itineraryData,
            itinerary: newOrder,
          },
        });
      },
      
      setSavedItineraryId: (id) => set({ savedItineraryId: id }),
      
      clearItinerary: () => set({ 
        itineraryData: null, 
        savedItineraryId: null, 
        error: null 
      }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      checkInStop: (index) => {
        const { updateStop } = get();
        updateStop(index, { checked_in: true, checked_out: false });
      },
      
      checkOutStop: (index) => {
        const { updateStop } = get();
        updateStop(index, { checked_out: true });
      },
      
      getCheckedInStops: () => {
        const { itineraryData } = get();
        return itineraryData?.itinerary.filter(s => s.checked_in) || [];
      },
      
      getCheckedOutStops: () => {
        const { itineraryData } = get();
        return itineraryData?.itinerary.filter(s => s.checked_out) || [];
      },
      
      getStopBySlot: (day, slotName) => {
        const { itineraryData } = get();
        return itineraryData?.itinerary.find(
          s => s.day === day && s.slot_name === slotName
        );
      },
      
      getStopsByDay: (day) => {
        const { itineraryData } = get();
        return itineraryData?.itinerary.filter(s => s.day === day) || [];
      },
    }),
    {
      name: 'itinerary-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        itineraryData: state.itineraryData,
        savedItineraryId: state.savedItineraryId,
      }),
    }
  )
);
