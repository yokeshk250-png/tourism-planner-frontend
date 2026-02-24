import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useItineraryStore } from '../../store/itineraryStore';
import { suggestHotels, checkInHotel, checkOutHotel, ScheduledStop } from '../../services/itineraryApi';

export default function HotelsScreen() {
  const { itineraryData, savedItineraryId, setItineraryData, getStopsByDay } = useItineraryStore();
  
  const [phase, setPhase] = useState('1');
  const [currentDay, setCurrentDay] = useState('1');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedHotels, setSuggestedHotels] = useState<any[]>([]);

  const handleSuggestHotels = async () => {
    if (!itineraryData) {
      Alert.alert('No itinerary', 'Generate a plan first');
      return;
    }

    try {
      setLoading(true);
      const res = await suggestHotels({
        destination: itineraryData.meta?.destination || '',
        days: itineraryData.meta?.days || 2,
        budget: itineraryData.meta?.budget || 'medium',
        itinerary: itineraryData.itinerary,
      });
      
      if (res.success) {
        setSuggestedHotels(res.hotels || []);
        if (res.hotels?.length === 0) {
          Alert.alert('No hotels', 'No hotels found for this itinerary');
        }
      } else {
        Alert.alert('Error', 'Failed to get hotel suggestions');
      }
    } catch (error: any) {
      console.error('Suggest hotels error', error);
      Alert.alert('Error', error.message || 'Failed to get hotel suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!savedItineraryId || !checkInTime) {
      Alert.alert('Missing info', 'Make sure you have a saved itinerary and enter check-in time');
      return;
    }

    try {
      setLoading(true);
      const res = await checkInHotel({
        itinerary_id: savedItineraryId,
        phase: parseInt(phase),
        current_day: parseInt(currentDay),
        checkin_time: checkInTime,
      });

      if (res.success) {
        // Update the current itinerary with the replanned data if provided
        if (res.updated_stops) {
          const updatedItinerary = {
            ...itineraryData!,
            itinerary: res.updated_stops,
          };
          setItineraryData(updatedItinerary);
        }
        Alert.alert('Checked in', res.message || 'Check-in recorded successfully');
      } else {
        Alert.alert('Check-in failed', res.message || 'Could not process check-in');
      }
    } catch (error: any) {
      console.error('Check-in error', error);
      Alert.alert('Error', error.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!savedItineraryId || !checkOutTime) {
      Alert.alert('Missing info', 'Make sure you have a saved itinerary and enter check-out time');
      return;
    }

    try {
      setLoading(true);
      const res = await checkOutHotel({
        itinerary_id: savedItineraryId,
        phase: parseInt(phase),
        current_day: parseInt(currentDay),
        checkout_time: checkOutTime,
      });

      if (res.success) {
        // Update the current itinerary with the replanned data if provided
        if (res.updated_stops) {
          const updatedItinerary = {
            ...itineraryData!,
            itinerary: res.updated_stops,
          };
          setItineraryData(updatedItinerary);
        }
        Alert.alert('Checked out', res.message || 'Check-out recorded successfully');
      } else {
        Alert.alert('Check-out failed', res.message || 'Could not process check-out');
      }
    } catch (error: any) {
      console.error('Check-out error', error);
      Alert.alert('Error', error.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  if (!itineraryData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No itinerary</Text>
        <Text style={styles.emptyText}>Generate an itinerary first from the Plan tab.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.heading}>Hotels & Check-in 🏨</Text>
      <Text style={styles.subheading}>Find hotels and handle dynamic replanning</Text>

      {/* Suggest Hotels */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Find Hotels</Text>
        <Text style={styles.hint}>Get hotel suggestions based on your itinerary</Text>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSuggestHotels}
          disabled={loading}
        >
          {loading && !checkInTime ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Suggest Hotels</Text>
          )}
        </TouchableOpacity>

        {suggestedHotels.length > 0 && (
          <View style={styles.hotelsList}>
            <Text style={styles.hotelsTitle}>Suggested Hotels:</Text>
            {suggestedHotels.map((hotel, idx) => (
              <View key={idx} style={styles.hotelCard}>
                <Text style={styles.hotelName}>{hotel.name || hotel.place_name || 'Hotel'}</Text>
                {hotel.address && <Text style={styles.hotelMeta}>📍 {hotel.address}</Text>}
                {hotel.rating && <Text style={styles.hotelMeta}>⭐ {hotel.rating}</Text>}
                {hotel.price && <Text style={styles.hotelMeta}>💰 {hotel.price}</Text>}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Check-in / Check-out Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Dynamic Replanning</Text>
        <Text style={styles.hint}>Check-in late or check-out early to replan your schedule</Text>

        <Text style={styles.label}>Phase (hotel stay number)</Text>
        <TextInput
          style={styles.input}
          value={phase}
          onChangeText={setPhase}
          keyboardType="number-pad"
          placeholder="1"
        />

        <Text style={styles.label}>Current Day</Text>
        <TextInput
          style={styles.input}
          value={currentDay}
          onChangeText={setCurrentDay}
          keyboardType="number-pad"
          placeholder="1"
        />

        <Text style={styles.label}>Check-in Time (HH:MM)</Text>
        <TextInput
          style={styles.input}
          value={checkInTime}
          onChangeText={setCheckInTime}
          placeholder="14:00"
        />

        <TouchableOpacity
          style={[styles.button, styles.checkinButton, loading && styles.buttonDisabled]}
          onPress={handleCheckIn}
          disabled={loading}
        >
          {loading && checkInTime && !checkOutTime ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Record Check-in</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Check-out Time (HH:MM)</Text>
        <TextInput
          style={styles.input}
          value={checkOutTime}
          onChangeText={setCheckOutTime}
          placeholder="11:00"
        />

        <TouchableOpacity
          style={[styles.button, styles.checkoutButton, loading && styles.buttonDisabled]}
          onPress={handleCheckOut}
          disabled={loading}
        >
          {loading && checkOutTime ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Record Check-out</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Current Schedule Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Schedule Preview</Text>
        <Text style={styles.hint}>Day {currentDay} stops:</Text>
        {getStopsByDay(parseInt(currentDay) || 1).map((stop, idx) => (
          <View key={idx} style={styles.stopPreview}>
            <Text style={styles.stopTime}>{stop.start_time} - {stop.end_time}</Text>
            <Text style={styles.stopName}>{stop.place_name}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingTop: 16,
    color: '#111827',
  },
  subheading: {
    fontSize: 14,
    color: '#6b7280',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  checkinButton: {
    backgroundColor: '#22c55e',
    marginBottom: 16,
  },
  checkoutButton: {
    backgroundColor: '#f59e0b',
  },
  hotelsList: {
    marginTop: 16,
  },
  hotelsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  hotelCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  hotelName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  hotelMeta: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  stopPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  stopTime: {
    fontSize: 13,
    color: '#6b7280',
    fontVariant: ['tabular-nums'],
  },
  stopName: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
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
});
