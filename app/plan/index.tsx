import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTripStore } from '../../store/useTripStore';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/colors';
import { TRAVEL_TYPES, BUDGET_LEVELS, TRIP_MOODS, INTERESTS } from '../../constants/api';
import Toast from 'react-native-toast-message';

const MOOD_EMOJIS: Record<string, string> = {
  relaxed: '🏖️', adventure: '🧗', spiritual: '📿',
  romantic: '💕', cultural: '🏛️', foodie: '🍽️',
};
const TRAVEL_ICONS: Record<string, string> = {
  solo: '🧑', couple: '👫', family: '👨‍👩‍👧', group: '👥',
};
const BUDGET_ICONS: Record<string, string> = {
  low: '💰', medium: '💳', high: '💸',
};

export default function PlanScreen() {
  const router   = useRouter();
  const params   = useLocalSearchParams();
  const generate = useTripStore(s => s.generate);
  const generating = useTripStore(s => s.generating);

  const [dest,         setDest]         = useState((params.destination as string) || '');
  const [days,         setDays]         = useState('2');
  const [budget,       setBudget]       = useState('medium');
  const [travelType,   setTravelType]   = useState('solo');
  const [mood,         setMood]         = useState((params.mood as string) || 'cultural');
  const [interests,    setInterests]    = useState<string[]>(['temples', 'history']);
  const [travelDate,   setTravelDate]   = useState('');
  const [avoidCrowded, setAvoidCrowded] = useState(false);
  const [accessible,   setAccessible]   = useState(false);

  const toggleInterest = (i: string) =>
    setInterests(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );

  const handleGenerate = async () => {
    if (!dest.trim()) {
      Toast.show({ type: 'error', text1: 'Enter a destination' }); return;
    }
    if (parseInt(days) < 1 || parseInt(days) > 14) {
      Toast.show({ type: 'error', text1: 'Days must be 1–14' }); return;
    }
    if (interests.length === 0) {
      Toast.show({ type: 'error', text1: 'Pick at least one interest' }); return;
    }
    try {
      await generate({
        destination:         dest.trim(),
        days:                parseInt(days),
        budget:              budget as any,
        travel_type:         travelType as any,
        mood:                mood as any,
        interests,
        travel_dates:        travelDate || undefined,
        avoid_crowded:       avoidCrowded,
        accessibility_needs: accessible,
      });
      router.push('/plan/results');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed to generate', text2: e.message });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <LinearGradient colors={Colors.gradients.primary as any} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>✨ Plan Your Trip</Text>
            <Text style={styles.headerSub}>AI-powered itinerary generation</Text>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={{ padding: Spacing.md }} showsVerticalScrollIndicator={false}>

          {/* Destination */}
          <SectionCard title="📍 Destination" icon="location">
            <TextInput
              style={styles.bigInput}
              placeholder="e.g. Chennai, Kodaikanal, Madurai..."
              placeholderTextColor={Colors.textMuted}
              value={dest}
              onChangeText={setDest}
              autoCapitalize="words"
            />
          </SectionCard>

          {/* Days */}
          <SectionCard title="📅 Duration" icon="calendar">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
              <TouchableOpacity style={styles.dayBtn} onPress={() => setDays(d => String(Math.max(1, parseInt(d) - 1)))}>
                <Ionicons name="remove" size={20} color={Colors.primary} />
              </TouchableOpacity>
              <View style={styles.dayDisplay}>
                <Text style={styles.dayNumber}>{days}</Text>
                <Text style={styles.dayLabel}>days</Text>
              </View>
              <TouchableOpacity style={styles.dayBtn} onPress={() => setDays(d => String(Math.min(14, parseInt(d) + 1)))}>
                <Ionicons name="add" size={20} color={Colors.primary} />
              </TouchableOpacity>
              <TextInput
                style={styles.dateInput}
                placeholder="Start date (YYYY-MM-DD)"
                placeholderTextColor={Colors.textMuted}
                value={travelDate}
                onChangeText={setTravelDate}
              />
            </View>
          </SectionCard>

          {/* Travel Type */}
          <SectionCard title="👥 Travel Type" icon="people">
            <View style={styles.chipRow}>
              {TRAVEL_TYPES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, travelType === t && styles.chipActive]}
                  onPress={() => setTravelType(t)}
                >
                  <Text style={styles.chipEmoji}>{TRAVEL_ICONS[t]}</Text>
                  <Text style={[styles.chipText, travelType === t && styles.chipTextActive]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SectionCard>

          {/* Budget */}
          <SectionCard title="💰 Budget" icon="cash">
            <View style={styles.chipRow}>
              {BUDGET_LEVELS.map(b => (
                <TouchableOpacity
                  key={b}
                  style={[styles.chip, budget === b && styles.chipActive]}
                  onPress={() => setBudget(b)}
                >
                  <Text style={styles.chipEmoji}>{BUDGET_ICONS[b]}</Text>
                  <Text style={[styles.chipText, budget === b && styles.chipTextActive]}>
                    {b.charAt(0).toUpperCase() + b.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SectionCard>

          {/* Mood */}
          <SectionCard title="💚 Trip Mood" icon="happy">
            <View style={styles.chipRow}>
              {TRIP_MOODS.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.chip, mood === m && styles.chipActive]}
                  onPress={() => setMood(m)}
                >
                  <Text style={styles.chipEmoji}>{MOOD_EMOJIS[m]}</Text>
                  <Text style={[styles.chipText, mood === m && styles.chipTextActive]}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SectionCard>

          {/* Interests */}
          <SectionCard title="❤️ Interests" icon="heart">
            <View style={styles.chipRow}>
              {INTERESTS.map(i => (
                <TouchableOpacity
                  key={i}
                  style={[styles.chip, interests.includes(i) && styles.chipActive]}
                  onPress={() => toggleInterest(i)}
                >
                  <Text style={[styles.chipText, interests.includes(i) && styles.chipTextActive]}>
                    {i.charAt(0).toUpperCase() + i.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SectionCard>

          {/* Options */}
          <SectionCard title="⚙️ Options" icon="settings">
            <ToggleRow label="Avoid crowded places" value={avoidCrowded} onChange={setAvoidCrowded} />
            <ToggleRow label="Accessibility needs" value={accessible} onChange={setAccessible} />
          </SectionCard>

          {/* Generate */}
          <TouchableOpacity
            onPress={handleGenerate}
            disabled={generating}
            style={{ borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: Spacing.xxl }}
          >
            <LinearGradient colors={Colors.gradients.secondary as any} style={styles.generateBtn}>
              {generating ? (
                <>
                  <Ionicons name="hourglass" size={22} color={Colors.white} />
                  <Text style={styles.generateText}>Generating your trip...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="sparkles" size={22} color={Colors.white} />
                  <Text style={styles.generateText}>Generate Itinerary with AI 🤖</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SectionCard({ title, icon, children }: any) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ToggleRow({ label, value, onChange }: any) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
      <Text style={{ fontSize: Fonts.sizes.base, color: Colors.text }}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.greyMedium, true: Colors.primary + '80' }}
        thumbColor={value ? Colors.primary : Colors.grey}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header:       { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle:  { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.white },
  headerSub:    { fontSize: Fonts.sizes.xs, color: 'rgba(255,255,255,0.75)' },
  sectionCard:  { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  sectionTitle: { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  bigInput:     { fontSize: Fonts.sizes.lg, color: Colors.text, borderBottomWidth: 2, borderBottomColor: Colors.primary + '40', paddingBottom: 8, fontWeight: '600' },
  dayBtn:       { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  dayDisplay:   { alignItems: 'center' },
  dayNumber:    { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.primary },
  dayLabel:     { fontSize: Fonts.sizes.xs, color: Colors.textLight },
  dateInput:    { flex: 1, fontSize: Fonts.sizes.sm, color: Colors.text, backgroundColor: Colors.greyLight, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, height: 40 },
  chipRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Colors.greyLight, gap: 4, borderWidth: 1.5, borderColor: 'transparent' },
  chipActive:   { backgroundColor: Colors.primary + '15', borderColor: Colors.primary },
  chipEmoji:    { fontSize: 16 },
  chipText:     { fontSize: Fonts.sizes.sm, color: Colors.textLight, fontWeight: '600' },
  chipTextActive:{ color: Colors.primary, fontWeight: '700' },
  generateBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: Spacing.sm },
  generateText: { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.white },
});
