import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/colors';

const POPULAR_DESTINATIONS = [
  { name: 'Chennai',    emoji: '🏔️', tag: 'Temples & Beach' },
  { name: 'Kodaikanal', emoji: '⛰️',    tag: 'Hill Station' },
  { name: 'Madurai',    emoji: '🕍',    tag: 'Culture' },
  { name: 'Ooty',       emoji: '🌿',    tag: 'Nature' },
  { name: 'Coimbatore', emoji: '🏙️',  tag: 'City' },
  { name: 'Munnar',     emoji: '🍵',    tag: 'Tea Gardens' },
];

export default function ExploreScreen() {
  const router  = useRouter();
  const [search, setSearch] = useState('');

  const filtered = POPULAR_DESTINATIONS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <LinearGradient colors={Colors.gradients.primary as any} style={styles.header}>
        <Text style={styles.headerTitle}>🧭 Explore</Text>
        <Text style={styles.headerSub}>Discover amazing destinations</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.grey} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search destination..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
        <Text style={styles.sectionTitle}>Popular Destinations</Text>
        <View style={styles.grid}>
          {filtered.map(dest => (
            <TouchableOpacity
              key={dest.name}
              style={styles.destCard}
              onPress={() => router.push({ pathname: '/plan', params: { destination: dest.name } })}
            >
              <Text style={styles.destEmoji}>{dest.emoji}</Text>
              <Text style={styles.destName}>{dest.name}</Text>
              <Text style={styles.destTag}>{dest.tag}</Text>
              <View style={styles.planBtn}>
                <Text style={styles.planBtnText}>Plan Trip</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:      { padding: Spacing.lg, paddingBottom: Spacing.xl },
  headerTitle: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.white },
  headerSub:   { fontSize: Fonts.sizes.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2, marginBottom: Spacing.md },
  searchBox:   { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, height: 46, gap: Spacing.sm },
  searchInput: { flex: 1, fontSize: Fonts.sizes.md, color: Colors.text },
  sectionTitle:{ fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  destCard:    { width: '48%', backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  destEmoji:   { fontSize: 40, marginBottom: 6 },
  destName:    { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.text },
  destTag:     { fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: 2, marginBottom: Spacing.sm },
  planBtn:     { backgroundColor: Colors.primary + '15', paddingHorizontal: 14, paddingVertical: 5, borderRadius: BorderRadius.full },
  planBtnText: { fontSize: Fonts.sizes.xs, color: Colors.primary, fontWeight: '700' },
});
