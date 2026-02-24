import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTripStore } from '../../store/useTripStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/colors';
import Toast from 'react-native-toast-message';

const SLOT_COLORS: Record<string, string> = {
  morning:   '#FF9800',
  afternoon: '#2196F3',
  evening:   '#9C27B0',
  night:     '#3F51B5',
};

export default function ResultsScreen() {
  const router     = useRouter();
  const user       = useAuthStore(s => s.user);
  const { itinerary, generating, tripRequest, saveTrip } = useTripStore();

  useEffect(() => {
    if (!itinerary && !generating) router.replace('/plan');
  }, [itinerary, generating]);

  if (generating) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: Spacing.md, fontSize: Fonts.sizes.lg, color: Colors.text, fontWeight: '700' }}>Generating your itinerary...</Text>
        <Text style={{ marginTop: 4, color: Colors.textLight, fontSize: Fonts.sizes.sm, textAlign: 'center', paddingHorizontal: Spacing.xl }}>AI is crafting the perfect trip for you 🤖</Text>
      </SafeAreaView>
    );
  }

  if (!itinerary) return null;

  const { meta, itinerary: stops, weather_warnings, unscheduled } = itinerary;

  // Group by day
  const days: Record<number, typeof stops> = {};
  stops.forEach(s => {
    if (!days[s.day]) days[s.day] = [];
    days[s.day].push(s);
  });

  const handleSave = async () => {
    if (!user) { Toast.show({ type: 'error', text1: 'Please login first' }); return; }
    try {
      const id = await saveTrip(user.uid);
      Toast.show({ type: 'success', text1: 'Trip saved! 💾' });
      router.push(`/trip/${id}` as any);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.message });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <LinearGradient colors={Colors.gradients.primary as any} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>🗺️ {meta?.destination}</Text>
          <Text style={styles.headerSub}>{meta?.days} days • {meta?.travel_type} • {meta?.mood}</Text>
        </View>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Ionicons name="bookmark" size={20} color={Colors.white} />
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Meta stats */}
        <View style={styles.metaRow}>
          <MetaBadge icon="location" label={`${meta?.total_places} places`} />
          <MetaBadge icon="cash" label={meta?.budget} />
          <MetaBadge icon="heart" label={meta?.mood} />
        </View>

        {/* Weather warnings */}
        {weather_warnings && weather_warnings.length > 0 && (
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={18} color={Colors.warning} />
            <Text style={styles.warningText}>{weather_warnings[0]}</Text>
          </View>
        )}

        {/* Per-day itinerary */}
        {Object.entries(days).map(([day, dayStops]) => (
          <View key={day} style={styles.daySection}>
            <Text style={styles.dayTitle}>Day {day}</Text>
            {dayStops.map((stop, i) => (
              <StopCard key={i} stop={stop} />
            ))}
          </View>
        ))}

        {/* Unscheduled */}
        {unscheduled && unscheduled.length > 0 && (
          <View style={styles.daySection}>
            <Text style={[styles.dayTitle, { color: Colors.warning }]}>⚠️ Unscheduled Places</Text>
            {unscheduled.map((p: any, i: number) => (
              <View key={i} style={styles.unschedCard}>
                <Text style={styles.unschedName}>{p.place_name}</Text>
                <Text style={styles.unschedSub}>{p.category}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
            onPress={() => router.push('/plan/customize')}
          >
            <Ionicons name="options" size={18} color={Colors.white} />
            <Text style={styles.actionBtnText}>Customize</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.success }]}
            onPress={handleSave}
          >
            <Ionicons name="save" size={18} color={Colors.white} />
            <Text style={styles.actionBtnText}>Save Trip</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StopCard({ stop }: { stop: any }) {
  const slotColor = SLOT_COLORS[stop.slot_name] || Colors.primary;
  return (
    <View style={styles.stopCard}>
      <View style={[styles.stopSlot, { backgroundColor: slotColor }]}>
        <Text style={styles.stopTime}>{stop.start_time}</Text>
        <Text style={styles.stopSlotName}>{stop.slot_name}</Text>
      </View>
      <View style={styles.stopBody}>
        <Text style={styles.stopName}>{stop.place_name}</Text>
        {stop.category && <Text style={styles.stopCat}>{stop.category}</Text>}
        <View style={styles.stopMeta}>
          <Text style={styles.stopMetaText}>⏱️ {stop.duration_hrs}h</Text>
          {stop.entry_fee != null && (
            <Text style={styles.stopMetaText}>🎫 ₹{stop.entry_fee}</Text>
          )}
          {stop.entry_fee === 0 && (
            <Text style={[styles.stopMetaText, { color: Colors.success }]}>Free</Text>
          )}
        </View>
        {stop.why_must_visit && (
          <Text style={styles.stopWhy} numberOfLines={2}>{stop.why_must_visit}</Text>
        )}
        {stop.tip && (
          <Text style={styles.stopTip}>💡 {stop.tip}</Text>
        )}
      </View>
    </View>
  );
}

function MetaBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.metaBadge}>
      <Ionicons name={icon as any} size={14} color={Colors.primary} />
      <Text style={styles.metaBadgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header:        { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  backBtn:       { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle:   { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.white },
  headerSub:     { fontSize: Fonts.sizes.xs, color: 'rgba(255,255,255,0.75)' },
  saveBtn:       { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, gap: 4 },
  saveBtnText:   { fontSize: Fonts.sizes.sm, color: Colors.white, fontWeight: '700' },
  metaRow:       { flexDirection: 'row', padding: Spacing.md, gap: Spacing.sm },
  metaBadge:     { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary + '12', paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full, gap: 4 },
  metaBadgeText: { fontSize: Fonts.sizes.xs, color: Colors.primary, fontWeight: '700', textTransform: 'capitalize' },
  warningBox:    { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.warning + '15', margin: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.md, gap: Spacing.sm, borderLeftWidth: 3, borderLeftColor: Colors.warning },
  warningText:   { flex: 1, fontSize: Fonts.sizes.sm, color: Colors.text },
  daySection:    { padding: Spacing.md },
  dayTitle:      { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.primary, marginBottom: Spacing.sm },
  stopCard:      { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, overflow: 'hidden', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  stopSlot:      { width: 64, alignItems: 'center', justifyContent: 'center', padding: 8 },
  stopTime:      { fontSize: Fonts.sizes.sm, fontWeight: '800', color: Colors.white },
  stopSlotName:  { fontSize: 9, color: 'rgba(255,255,255,0.85)', textTransform: 'capitalize', marginTop: 2 },
  stopBody:      { flex: 1, padding: Spacing.md },
  stopName:      { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.text },
  stopCat:       { fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: 2, textTransform: 'capitalize' },
  stopMeta:      { flexDirection: 'row', gap: Spacing.sm, marginTop: 6 },
  stopMetaText:  { fontSize: Fonts.sizes.xs, color: Colors.textLight, backgroundColor: Colors.greyLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  stopWhy:       { fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: 6, lineHeight: 16 },
  stopTip:       { fontSize: Fonts.sizes.xs, color: Colors.secondary, marginTop: 4, backgroundColor: Colors.secondary + '10', padding: 6, borderRadius: BorderRadius.sm },
  unschedCard:   { backgroundColor: Colors.warning + '10', borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderLeftWidth: 3, borderLeftColor: Colors.warning },
  unschedName:   { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
  unschedSub:    { fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: 2 },
  actionsRow:    { flexDirection: 'row', gap: Spacing.md, padding: Spacing.md },
  actionBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: BorderRadius.md, gap: Spacing.sm },
  actionBtnText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.white },
});
