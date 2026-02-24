import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { signOut, User } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { getUserItineraries } from '../../services/itineraryApi';
import { useItineraryStore } from '../../store/itineraryStore';

interface SavedItinerary {
  id: string;
  itinerary: {
    meta?: {
      destination?: string;
      days?: number;
      mood?: string;
      travel_type?: string;
    };
    itinerary?: any[];
  };
  created_at?: string;
}

export default function ProfileScreen() {
  const user = auth.currentUser;
  const [trips, setTrips] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { clearItinerary, setItineraryData, setSavedItineraryId } = useItineraryStore();

  const loadTrips = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await getUserItineraries(user.uid);
      if (res.success) {
        setTrips(res.itineraries || []);
      }
    } catch (error: any) {
      console.error('Load trips error', error);
      Alert.alert('Error', error.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadTrips();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            clearItinerary();
            await signOut(auth);
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const handleLoadTrip = (trip: SavedItinerary) => {
    if (trip.itinerary) {
      setItineraryData(trip.itinerary as any);
      setSavedItineraryId(trip.id);
      Alert.alert('Loaded', `${trip.itinerary.meta?.destination || 'Trip'} loaded successfully`);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Unknown date';
    return new Date(dateStr).toLocaleDateString();
  };

  const renderTrip = ({ item }: { item: SavedItinerary }) => (
    <TouchableOpacity style={styles.tripCard} onPress={() => handleLoadTrip(item)}>
      <View style={styles.tripHeader}>
        <Text style={styles.tripDestination}>
          {item.itinerary?.meta?.destination || 'Trip'}
        </Text>
        <Text style={styles.tripDate}>{formatDate(item.created_at)}</Text>
      </View>
      <Text style={styles.tripMeta}>
        {item.itinerary?.meta?.days || 0} days · {item.itinerary?.meta?.mood || 'cultural'} · {item.itinerary?.meta?.travel_type || 'solo'}
      </Text>
      <Text style={styles.tripStops}>
        {item.itinerary?.itinerary?.length || 0} stops planned
      </Text>
      <Text style={styles.tapHint}>Tap to load this trip</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.displayName || 'Traveller'} 👋</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{trips.length}</Text>
          <Text style={styles.statLabel}>Saved trips</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Your trips</Text>

      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#4F46E5" size="large" />
      ) : trips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No saved trips yet.</Text>
          <Text style={styles.emptySubtext}>Go to the Plan tab to create your first itinerary!</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={renderTrip}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
          }
        />
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loading}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
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
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: '#c7d2fe',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4F46E5',
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tripCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tripDestination: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  tripDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  tripMeta: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  tripStops: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 2,
  },
  tapHint: {
    fontSize: 12,
    color: '#4F46E5',
    marginTop: 8,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  logoutButton: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
