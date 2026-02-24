import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, Image, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { useTripStore } from '../../store/useTripStore';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/colors';

const { width } = Dimensions.get('window');

const MOOD_EMOJIS: Record<string, string> = {
  relaxed: '🏖️', adventure: '🧗', spiritual: '📿',
  romantic: '💕', cultural: '🏛️', foodie: '🍽️',
};

const QUICK_ACTIONS = [
  { id: 'plan',    icon: 'add-circle',      label: 'Plan Trip',    color: Colors.primary,       route: '/plan' },
  { id: 'trips',   icon: 'map',             label: 'My Trips',     color: Colors.secondary,     route: '/(tabs)/mytrips' },
  { id: 'explore', icon: 'compass',         label: 'Explore',      color: Colors.accent,        route: '/(tabs)/explore' },
  { id: 'hotels',  icon: 'bed',             label: 'Hotels',       color: Colors.success,       route: '/plan/hotels' },
];

export default function HomeScreen() {
  const router       = useRouter();
  const user         = useAuthStore(s => s.user);
  const profile      = useAuthStore(s => s.profile);
  const savedTrips   = useTripStore(s => s.savedItineraries);
  const loadMyTrips  = useTripStore(s => s.loadMyTrips);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.uid) loadMyTrips(user.uid);
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.uid) await loadMyTrips(user.uid);
    setRefreshing(false);
  };

  const activeTrips = savedTrips.filter((t: any) => t.status === 'active');
  const greeting    = getGreeting();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header Hero */}
        <LinearGradient colors={Colors.gradients.hero as any} style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greeting}>{greeting}, {profile?.displayName?.split(' ')[0] || 'Traveler'}! 👋</Text>
              <Text style={styles.heroSub}>Where shall we explore today?</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.avatarBtn}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profile?.displayName?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatCard value={savedTrips.length}    label="Total Trips"   icon="map" />
            <StatCard value={activeTrips.length}   label="Active"        icon="navigate" />
            <StatCard value={savedTrips.filter((t: any) => t.status === 'completed').length} label="Completed" icon="checkmark-circle" />
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map(action => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon as any} size={28} color={action.color} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Plan CTA */}
        <TouchableOpacity style={styles.ctaWrap} onPress={() => router.push('/plan')}>
          <LinearGradient colors={Colors.gradients.secondary as any} style={styles.ctaCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>✨ Plan a New Trip</Text>
              <Text style={styles.ctaSub}>AI-powered itinerary in seconds</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={40} color={Colors.white} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Recent Trips */}
        {savedTrips.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Trips</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/mytrips')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {savedTrips.slice(0, 3).map((trip: any) => (
              <TripCard key={trip.id} trip={trip} onPress={() => router.push(`/trip/${trip.id}` as any)} />
            ))}
          </View>
        )}

        {/* Mood Explore */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore by Mood</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -Spacing.md }}>
            <View style={{ flexDirection: 'row', paddingHorizontal: Spacing.md }}>
              {Object.entries(MOOD_EMOJIS).map(([mood, emoji]) => (
                <TouchableOpacity
                  key={mood}
                  style={styles.moodChip}
                  onPress={() => router.push({ pathname: '/plan', params: { mood } })}
                >
                  <Text style={styles.moodEmoji}>{emoji}</Text>
                  <Text style={styles.moodLabel}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ value, label, icon }: { value: number; label: string; icon: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={18} color="rgba(255,255,255,0.8)" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TripCard({ trip, onPress }: { trip: any; onPress: () => void }) {
  const dest = trip?.itinerary?.meta?.destination || trip?.itinerary?.tripRequest?.destination || 'Trip';
  const days = trip?.itinerary?.meta?.days || '?';
  const status = trip?.status || 'planned';
  const statusColors: Record<string, string> = {
    planned: Colors.info, active: Colors.success, completed: Colors.grey,
  };
  return (
    <TouchableOpacity onPress={onPress} style={styles.tripCard}>
      <LinearGradient colors={['#F0F4FF', '#FFFFFF']} style={styles.tripGrad}>
        <View style={styles.tripLeft}>
          <Text style={styles.tripDest}>📍 {dest}</Text>
          <Text style={styles.tripDays}>{days} days</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[status] + '20' }]}>
            <Text style={[styles.statusText, { color: statusColors[status] }]}>{status}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  hero:         { padding: Spacing.lg, paddingTop: Spacing.md },
  heroTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  greeting:     { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.white },
  heroSub:      { fontSize: Fonts.sizes.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  avatarBtn:    {},
  avatar:       { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  avatarText:   { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.white },
  statsRow:     { flexDirection: 'row', gap: Spacing.sm },
  statCard:     { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center', gap: 2 },
  statValue:    { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.white },
  statLabel:    { fontSize: Fonts.sizes.xs, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  section:      { padding: Spacing.md, paddingTop: Spacing.lg },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.text },
  seeAll:       { fontSize: Fonts.sizes.sm, color: Colors.primary, fontWeight: '600' },
  actionsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionCard:   { width: (width - Spacing.md * 2 - Spacing.sm * 3) / 4, alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.md, padding: Spacing.sm, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  actionIcon:   { width: 50, height: 50, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  actionLabel:  { fontSize: Fonts.sizes.xs, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  ctaWrap:      { marginHorizontal: Spacing.md, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  ctaCard:      { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderRadius: BorderRadius.lg },
  ctaTitle:     { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.white },
  ctaSub:       { fontSize: Fonts.sizes.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  tripCard:     { marginBottom: Spacing.sm, borderRadius: BorderRadius.md, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  tripGrad:     { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  tripLeft:     { flex: 1 },
  tripDest:     { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
  tripDays:     { fontSize: Fonts.sizes.sm, color: Colors.textLight, marginTop: 2 },
  statusBadge:  { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full, marginTop: 4 },
  statusText:   { fontSize: Fonts.sizes.xs, fontWeight: '700', textTransform: 'capitalize' },
  moodChip:     { alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.md, marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.border, minWidth: 80, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  moodEmoji:    { fontSize: 28 },
  moodLabel:    { fontSize: Fonts.sizes.xs, fontWeight: '600', color: Colors.text, marginTop: 4 },
});
