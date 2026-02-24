import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useEffect } from 'react';
import { useItineraryStore } from '../../store/itineraryStore';
import { saveUserItinerary } from '../../services/itineraryApi';
import { auth } from '../../services/firebase';

export default function ScheduleScreen() {
  const {
    itineraryData,
    savedItineraryId,
    setSavedItineraryId,
    checkInStop,
    checkOutStop,
    isLoading,
    setLoading,
  } = useItineraryStore();

  useEffect(() => {
    // You can add analytics or initial load here later
  }, []);

  const handleSave = async () => {
    if (!itineraryData) {
      Alert.alert('No itinerary', 'Generate a plan first');
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Login required', 'Please login to save your itinerary');
      return;
    }

    try {
      setLoading(true);
      const res = await saveUserItinerary(user.uid, itineraryData);
      setSavedItineraryId(res.itinerary_id);
      Alert.alert('Saved', `Your itinerary has been saved. ID: ${res.itinerary_id}`);
    } catch (error: any) {
      console.error('Save itinerary error', error);
      Alert.alert('Error', error.message || 'Failed to save itinerary');
    } finally {
      setLoading(false);
    }
  };

  if (!itineraryData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No itinerary yet</Text>
        <Text style={styles.emptyText}>Go to the Plan tab and generate your trip first.</Text>
      </View>
    );
  }

  const renderItem = ({ item, index }: any) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.dayLabel}>Day {item.day} · {item.slot_name.toUpperCase()}</Text>
          <Text style={styles.timeLabel}>{item.start_time} - {item.end_time}</Text>
        </View>
        <Text style={styles.placeName}>{item.place_name}</Text>
        {item.category && <Text style={styles.metaText}>📍 {item.category}</Text>}
        {item.opening_hours && <Text style={styles.metaText}>🕐 {item.opening_hours}</Text>}
        {item.entry_fee != null && <Text style={styles.metaText}>🎟 ₹{item.entry_fee}</Text>}
        {item.is_alternate && <Text style={[styles.metaText, { color: '#9333ea' }]}>🔄 Alternate</Text>}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.badge, item.checked_in ? styles.badgeActiveIn : styles.badgeInactive]}
            onPress={() => checkInStop(index)}
          >
            <Text style={styles.badgeText}>{item.checked_in ? '✅ Checked in' : 'Check-in'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.badge, item.checked_out ? styles.badgeActiveOut : styles.badgeInactive]}
            onPress={() => checkOutStop(index)}
          >
            <Text style={styles.badgeText}>{item.checked_out ? '🚪 Checked out' : 'Check-out'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{itineraryData.meta?.destination}</Text>
        <Text style={styles.subtitle}>
          {itineraryData.meta?.days} days · {itineraryData.meta?.mood} · {itineraryData.itinerary.length} stops
        </Text>
        {savedItineraryId && (
          <Text style={styles.savedId}>Saved ID: {savedItineraryId}</Text>
        )}
      </View>

      <FlatList
        data={itineraryData.itinerary}
        keyExtractor={(item, idx) => item.slot_id + '-' + idx}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity
        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>💾 Save itinerary</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#4F46E5',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: '#e5e7eb',
    marginTop: 2,
  },
  savedId: {
    fontSize: 11,
    color: '#c7d2fe',
    marginTop: 4,
  },
  card: {
    marginHorizontal: 12,
    marginTop: 10,
    padding: 12,
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
  actionRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  badgeInactive: {
    backgroundColor: '#e5e7eb',
  },
  badgeActiveIn: {
    backgroundColor: '#22c55e',
  },
  badgeActiveOut: {
    backgroundColor: '#ef4444',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  saveButton: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    backgroundColor: '#4F46E5',
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
});
