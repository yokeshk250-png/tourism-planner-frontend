import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { useTripStore } from '../../store/useTripStore';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/colors';
import { format } from 'date-fns';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  planned:   { label: 'Planned',   color: Colors.info,    icon: 'calendar' },
  active:    { label: 'Active',    color: Colors.success, icon: 'navigate' },
  completed: { label: 'Completed', color: Colors.grey,    icon: 'checkmark-circle' },
};

const FILTERS = ['all', 'planned', 'active', 'completed'];

export default function MyTripsScreen() {
  const router      = useRouter();
  const user        = useAuthStore(s => s.user);
  const { savedItineraries, loading, loadMyTrips, deleteTrip } = useTripStore();
  const [filter, setFilter]     = useState('all');
  const [refreshing, setRefresh] = useState(false);

  useEffect(() => {
    if (user?.uid) loadMyTrips(user.uid);
  }, [user]);

  const onRefresh = async () => {
    setRefresh(true);
    if (user?.uid) await loadMyTrips(user.uid);
    setRefresh(false);
  };

  const filtered = filter === 'all'
    ? savedItineraries
    : savedItineraries.filter((t: any) => t.status === filter);

  const confirmDelete = (id: string) =>
    Alert.alert('Delete Trip', 'Are you sure you want to delete this trip?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTrip(id) },
    ]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <LinearGradient colors={Colors.gradients.primary as any} style={styles.header}>
        <Text style={styles.headerTitle}>🗺 My Trips</Text>
        <TouchableOpacity onPress={() => router.push('/plan')} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: Spacing.md }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filtered.length === 0 ? (
            <EmptyState onPlan={() => router.push('/plan')} />
          ) : (
            filtered.map((trip: any) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onPress={() => router.push(`/trip/${trip.id}` as any)}
                onDelete={() => confirmDelete(trip.id)}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function TripCard({ trip, onPress, onDelete }: any) {
  const dest  = trip?.itinerary?.meta?.destination || trip?.itinerary?.tripRequest?.destination || 'Unknown';
  const days  = trip?.itinerary?.meta?.days || '?';
  const stops = trip?.itinerary?.itinerary?.length || 0;
  const mood  = trip?.itinerary?.meta?.mood || trip?.itinerary?.tripRequest?.mood || 'cultural';
  const cfg   = STATUS_CONFIG[trip.status] || STATUS_CONFIG.planned;
  const date  = trip.createdAt?.toDate ? format(trip.createdAt.toDate(), 'dd MMM yyyy') : '—';

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={[styles.cardStatus, { backgroundColor: cfg.color }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardDest}>📍 {dest}</Text>
          <View style={[styles.badge, { backgroundColor: cfg.color + '20' }]}>
            <Ionicons name={cfg.icon as any} size={12} color={cfg.color} />
            <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>
        <View style={styles.cardMeta}>
          <Chip icon="sunny" label={`${days} days`} />
          <Chip icon="location" label={`${stops} places`} />
          <Chip icon="happy" label={mood} />
        </View>
        <Text style={styles.cardDate}>📅 Created {date}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
            <Ionicons name="eye" size={14} color={Colors.primary} />
            <Text style={[styles.actionText, { color: Colors.primary }]}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: Colors.error }]} onPress={onDelete}>
            <Ionicons name="trash-outline" size={14} color={Colors.error} />
            <Text style={[styles.actionText, { color: Colors.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function Chip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.greyLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full, marginRight: 6 }}>
      <Ionicons name={icon as any} size={12} color={Colors.textLight} />
      <Text style={{ fontSize: Fonts.sizes.xs, color: Colors.textLight, marginLeft: 3 }}>{label}</Text>
    </View>
  );
}

function EmptyState({ onPlan }: { onPlan: () => void }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 60 }}>
      <Text style={{ fontSize: 64 }}>🧳</Text>
      <Text style={{ fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.text, marginTop: Spacing.md }}>No Trips Yet</Text>
      <Text style={{ fontSize: Fonts.sizes.sm, color: Colors.textLight, marginTop: 4, textAlign: 'center' }}>
        Plan your first AI-powered trip!
      </Text>
      <TouchableOpacity onPress={onPlan} style={{ marginTop: Spacing.lg, borderRadius: BorderRadius.md, overflow: 'hidden' }}>
        <LinearGradient colors={Colors.gradients.primary as any} style={{ paddingHorizontal: Spacing.xl, paddingVertical: 14 }}>
          <Text style={{ color: Colors.white, fontWeight: '700', fontSize: Fonts.sizes.md }}>Plan a Trip</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg },
  headerTitle: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.white },
  addBtn:      { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  filterBar:   { backgroundColor: Colors.white, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, maxHeight: 52 },
  filterChip:  { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full, marginRight: Spacing.sm, backgroundColor: Colors.greyLight },
  filterChipActive: { backgroundColor: Colors.primary },
  filterText:  { fontSize: Fonts.sizes.sm, color: Colors.textLight, fontWeight: '600' },
  filterTextActive: { color: Colors.white },
  card:        { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: BorderRadius.lg, marginBottom: Spacing.md, overflow: 'hidden', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  cardStatus:  { width: 4 },
  cardBody:    { flex: 1, padding: Spacing.md },
  cardTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardDest:    { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.text, flex: 1 },
  badge:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full, gap: 3 },
  badgeText:   { fontSize: Fonts.sizes.xs, fontWeight: '700' },
  cardMeta:    { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.sm, gap: 4 },
  cardDate:    { fontSize: Fonts.sizes.xs, color: Colors.textMuted, marginBottom: Spacing.sm },
  cardActions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.primary, gap: 4 },
  actionText:  { fontSize: Fonts.sizes.xs, fontWeight: '700' },
});
