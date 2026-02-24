import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import { useItineraryStore } from '../../store/itineraryStore';
import { suggestAlternates, validatePlace, updateItinerary, ScheduledStop, SlotName } from '../../services/itineraryApi';
import { auth } from '../../services/firebase';

interface AlternatePlace {
  place_name: string;
  category?: string | null;
  duration_hrs: number;
  opening_hours?: string | null;
  entry_fee?: number | null;
  lat?: number | null;
  lon?: number | null;
}

export default function CustomizeScreen() {
  const {
    itineraryData,
    savedItineraryId,
    setSavedItineraryId,
    updateStop,
    setItineraryData,
  } = useItineraryStore();

  const [swappingIndex, setSwappingIndex] = useState<number | null>(null);
  const [suggesting, setSuggesting] = useState<number | null>(null);
  const [alternates, setAlternates] = useState<AlternatePlace[]>([]);
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);

  const handleSuggest = async (index: number) => {
    if (!itineraryData) return;
    const stop = itineraryData.itinerary[index];

    try {
      setSuggesting(index);
      const res = await suggestAlternates({
        destination: itineraryData.meta?.destination || '',
        slot_name: stop.slot_name as SlotName,
        current_stop: stop,
        scheduled_places: itineraryData.itinerary,
        free_slots: [stop.slot_name as SlotName],
      });

      if (!res.success || !res.alternates || res.alternates.length === 0) {
        Alert.alert('No alternates', 'No alternative places found for this stop');
        return;
      }

      setAlternates(res.alternates);
      setSwappingIndex(index);
    } catch (error: any) {
      console.error('Suggest error', error);
      Alert.alert('Error', error.message || 'Failed to suggest alternates');
    } finally {
      setSuggesting(null);
    }
  };

  const handleSelectAlternate = async (alt: AlternatePlace) => {
    if (!itineraryData || swappingIndex === null) return;
    
    const stop = itineraryData.itinerary[swappingIndex];

    try {
      setValidating(true);
      // First validate the new place
      const slotStops = itineraryData.itinerary.filter(
        (s: ScheduledStop) => s.day === stop.day && s.slot_name === stop.slot_name && s.slot_id !== stop.slot_id
      );
      
      const prevStop = swappingIndex > 0 ? itineraryData.itinerary[swappingIndex - 1] : null;
      const nextStop = swappingIndex < itineraryData.itinerary.length - 1 ? itineraryData.itinerary[swappingIndex + 1] : null;

      const validateRes = await validatePlace({
        place: alt,
        target_day: stop.day,
        target_slot: stop.slot_name as SlotName,
        slot_stops: slotStops,
        prev_stop: prevStop,
        next_stop: nextStop,
        all_stops: itineraryData.itinerary,
        budget: itineraryData.meta?.budget as any || 'medium',
        accessibility_needs: false,
      });

      if (!validateRes.valid) {
        const conflictMsg = validateRes.conflicts.map((c: any) => c.message).join('\n');
        Alert.alert('Validation failed', conflictMsg || 'This place cannot be placed here');
        return;
      }

      // If valid, update the stop in the store
      updateStop(swappingIndex, {
        place_name: alt.place_name,
        category: alt.category,
        duration_hrs: alt.duration_hrs,
        opening_hours: alt.opening_hours,
        entry_fee: alt.entry_fee,
        lat: alt.lat,
        lon: alt.lon,
        is_alternate: true,
      });

      setSwappingIndex(null);
      setAlternates([]);
      Alert.alert('Updated', `Replaced with ${alt.place_name}`);
    } catch (error: any) {
      console.error('Validate error', error);
      Alert.alert('Error', error.message || 'Failed to validate place');
    } finally {
      setValidating(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!savedItineraryId || !itineraryData) {
      Alert.alert('Save first', 'Please save the itinerary from the Schedule tab first');
      return;
    }

    try {
      setSaving(true);
      const res = await updateItinerary(savedItineraryId, { itinerary: itineraryData.itinerary });
      if (res.success) {
        Alert.alert('Saved', 'Your changes have been saved to the backend');
      }
    } catch (error: any) {
      console.error('Update error', error);
      Alert.alert('Error', error.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (!itineraryData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No itinerary</Text>
        <Text style={styles.emptyText}>Generate an itinerary first from the Plan tab to customize it.</Text>
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: ScheduledStop; index: number }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.dayLabel}>Day {item.day} · {item.slot_name.toUpperCase()}</Text>
        <Text style={styles.timeLabel}>{item.start_time} - {item.end_time}</Text>
      </View>
      <Text style={styles.placeName}>{item.place_name}</Text>
      {item.category && <Text style={styles.metaText}>📍 {item.category}</Text>}
      {item.opening_hours && <Text style={styles.metaText}>🕐 {item.opening_hours}</Text>}
      {item.is_alternate && <Text style={[styles.metaText, { color: '#9333ea' }]}>🔄 Alternate</Text>}

      <TouchableOpacity
        style={styles.swapButton}
        onPress={() => handleSuggest(index)}
        disabled={suggesting === index}
      >
        {suggesting === index ? (
          <ActivityIndicator color="#4F46E5" size="small" />
        ) : (
          <Text style={styles.swapText}>🔀 Swap place</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Customize your trip 🔧</Text>

      <FlatList
        data={itineraryData.itinerary}
        keyExtractor={(item, idx) => item.slot_id + '-' + idx}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSaveChanges}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>💾 Save changes to backend</Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={swappingIndex !== null}
        transparent
        animationType="slide"
        onRequestClose={() => { setSwappingIndex(null); setAlternates([]); }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose an alternate</Text>
            <Text style={styles.modalSubtitle}>Tap a place to validate and swap</Text>

            {validating ? (
              <ActivityIndicator size="large" color="#4F46E5" style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={alternates}
                keyExtractor={(a, i) => a.place_name + i}
                renderItem={({ item }: { item: AlternatePlace }) => (
                  <TouchableOpacity
                    style={styles.alternateCard}
                    onPress={() => handleSelectAlternate(item)}
                  >
                    <Text style={styles.alternateName}>{item.place_name}</Text>
                    {item.category && <Text style={styles.alternateMeta}>📍 {item.category}</Text>}
                    <Text style={styles.alternateMeta}>⏱ {item.duration_hrs} hrs</Text>
                    {item.opening_hours && <Text style={styles.alternateMeta}>🕐 {item.opening_hours}</Text>}
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => { setSwappingIndex(null); setAlternates([]); }}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
    paddingTop: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    paddingHorizontal: 16,
    marginBottom: 12,
    color: '#111827',
  },
  card: {
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
  },
  timeLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  placeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 2,
  },
  swapButton: {
    marginTop: 12,
    backgroundColor: '#eff6ff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  swapText: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  alternateCard: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    marginBottom: 10,
  },
  alternateName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  alternateMeta: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
});
