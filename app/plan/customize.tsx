import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTripStore } from '../../store/useTripStore';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/colors';
import Toast from 'react-native-toast-message';

const SLOT_COLORS: Record<string, string> = {
  morning: '#FF9800', afternoon: '#2196F3', evening: '#9C27B0', night: '#3F51B5',
};

export default function CustomizeScreen() {
  const router     = useRouter();
  const { itinerary, swapStop, tripRequest } = useTripStore();

  const [swapping,   setSwapping]   = useState<any>(null);
  const [alternates, setAlternates] = useState<any[]>([]);
  const [loadingSwap, setLoadingSwap] = useState(false);
  const [showModal,  setShowModal]  = useState(false);

  if (!itinerary) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <Text style={{ fontSize: Fonts.sizes.lg, color: Colors.textLight }}>No itinerary loaded.</Text>
        <TouchableOpacity onPress={() => router.push('/plan')} style={{ marginTop: 16 }}>
          <Text style={{ color: Colors.primary, fontWeight: '700' }}>Plan a Trip</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { itinerary: stops } = itinerary;
  const days: Record<number, typeof stops> = {};
  stops.forEach(s => { if (!days[s.day]) days[s.day] = []; days[s.day].push(s); });

  const handleSwap = async (stop: any) => {
    setSwapping(stop);
    setLoadingSwap(true);
    setShowModal(true);
    try {
      const alts = await swapStop(stop, tripRequest?.destination || '');
      setAlternates(alts);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed to get alternatives', text2: e.message });
      setShowModal(false);
    } finally {
      setLoadingSwap(false);
    }
  };

  const applySwap = (alt: any) => {
    // Replace the swapped stop in itinerary
    const updated = stops.map(s =>
      s.place_name === swapping?.place_name
        ? { ...alt, day: swapping.day, slot_name: swapping.slot_name, start_time: swapping.start_time, end_time: swapping.end_time, slot_id: swapping.slot_id }
        : s
    );
    useTripStore.setState(state => ({
      itinerary: state.itinerary
        ? { ...state.itinerary, itinerary: updated }
        : state.itinerary,
    }));
    setShowModal(false);
    Toast.show({ type: 'success', text1: `Swapped to ${alt.place_name}` });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <LinearGradient colors={Colors.gradients.primary as any} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚙️ Customize Trip</Text>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => router.push('/plan/results')}
        >
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.tip}>
        <Ionicons name="information-circle" size={16} color={Colors.info} />
        <Text style={styles.tipText}>Tap 🔄 Swap to replace any stop with an AI-suggested alternative</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.md }} showsVerticalScrollIndicator={false}>
        {Object.entries(days).map(([day, dayStops]) => (
          <View key={day} style={{ marginBottom: Spacing.lg }}>
            <Text style={styles.dayTitle}>Day {day}</Text>
            {dayStops.map((stop, i) => (
              <View key={i} style={styles.stopCard}>
                <View style={[styles.slotBar, { backgroundColor: SLOT_COLORS[stop.slot_name] || Colors.primary }]} />
                <View style={{ flex: 1, padding: Spacing.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.stopName}>{stop.place_name}</Text>
                      <Text style={styles.stopMeta}>{stop.start_time} – {stop.end_time} • {stop.slot_name}</Text>
                    </View>
                    <TouchableOpacity style={styles.swapBtn} onPress={() => handleSwap(stop)}>
                      <Ionicons name="swap-horizontal" size={14} color={Colors.white} />
                      <Text style={styles.swapBtnText}>Swap</Text>
                    </TouchableOpacity>
                  </View>
                  {stop.why_must_visit && (
                    <Text style={styles.why} numberOfLines={1}>{stop.why_must_visit}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Swap Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Swap: {swapping?.place_name}</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          {loadingSwap ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={{ marginTop: 12, color: Colors.textLight }}>Finding alternatives...</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
              <Text style={styles.altHeader}>🤖 AI Suggested Alternatives</Text>
              {alternates.length === 0 ? (
                <Text style={{ color: Colors.textLight, textAlign: 'center', marginTop: 20 }}>No alternatives found for this slot.</Text>
              ) : (
                alternates.map((alt, i) => (
                  <TouchableOpacity key={i} style={styles.altCard} onPress={() => applySwap(alt)}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.altName}>{alt.place_name}</Text>
                      {alt.category && <Text style={styles.altCat}>{alt.category}</Text>}
                      {alt.why_must_visit && (
                        <Text style={styles.altWhy} numberOfLines={2}>{alt.why_must_visit}</Text>
                      )}
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                        <Text style={styles.altMeta}>⏱️ {alt.duration_hrs}h</Text>
                        {alt.entry_fee != null && <Text style={styles.altMeta}>🎫 ₹{alt.entry_fee}</Text>}
                      </View>
                    </View>
                    <Ionicons name="swap-horizontal-outline" size={22} color={Colors.primary} />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:       { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle:  { flex: 1, fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.white },
  doneBtn:      { backgroundColor: Colors.white, paddingHorizontal: 16, paddingVertical: 6, borderRadius: BorderRadius.full },
  doneBtnText:  { fontSize: Fonts.sizes.sm, color: Colors.primary, fontWeight: '800' },
  tip:          { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.info + '12', padding: Spacing.md, gap: Spacing.sm },
  tipText:      { flex: 1, fontSize: Fonts.sizes.xs, color: Colors.text },
  dayTitle:     { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.primary, marginBottom: Spacing.sm },
  stopCard:     { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, overflow: 'hidden', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  slotBar:      { width: 5 },
  stopName:     { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
  stopMeta:     { fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: 2, textTransform: 'capitalize' },
  swapBtn:      { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.secondary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.full, gap: 3 },
  swapBtnText:  { fontSize: Fonts.sizes.xs, color: Colors.white, fontWeight: '700' },
  why:          { fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: 4 },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle:   { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.text, flex: 1 },
  altHeader:    { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md },
  altCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.greyLight, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  altName:      { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
  altCat:       { fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: 2, textTransform: 'capitalize' },
  altWhy:       { fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: 4, lineHeight: 16 },
  altMeta:      { fontSize: Fonts.sizes.xs, color: Colors.textLight, backgroundColor: Colors.white, paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
});
