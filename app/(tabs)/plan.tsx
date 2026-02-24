import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { generateItinerary, TripRequest, BudgetLevel, TravelType, TripMood } from '../../services/itineraryApi';
import { useItineraryStore } from '../../store/itineraryStore';

const BUDGETS: BudgetLevel[] = ['low', 'medium', 'high'];
const TRAVEL_TYPES: TravelType[] = ['solo', 'couple', 'family', 'group'];
const MOODS: TripMood[] = ['relaxed', 'adventure', 'spiritual', 'romantic', 'cultural', 'foodie'];

export default function PlanScreen() {
  const router = useRouter();
  const { setItineraryData, setLoading, isLoading, setError } = useItineraryStore();

  const [destination, setDestination] = useState('Chennai');
  const [days, setDays] = useState('2');
  const [budget, setBudget] = useState<BudgetLevel>('medium');
  const [travelType, setTravelType] = useState<TravelType>('solo');
  const [mood, setMood] = useState<TripMood>('cultural');
  const [travelDates, setTravelDates] = useState('');
  const [avoidCrowded, setAvoidCrowded] = useState(false);
  const [accessibilityNeeds, setAccessibilityNeeds] = useState(false);

  const handleGenerate = async () => {
    if (!destination || !days) {
      Alert.alert('Missing info', 'Please enter destination and number of days');
      return;
    }

    const numDays = Number(days);
    if (isNaN(numDays) || numDays < 1 || numDays > 14) {
      Alert.alert('Invalid days', 'Days should be between 1 and 14');
      return;
    }

    const payload: TripRequest = {
      destination,
      days: numDays,
      budget,
      travel_type: travelType,
      mood,
      interests: ['temples', 'nature', 'food', 'history'],
      travel_dates: travelDates || null,
      avoid_crowded: avoidCrowded,
      accessibility_needs: accessibilityNeeds,
    };

    try {
      setLoading(true);
      setError(null);
      const data = await generateItinerary(payload);
      if (!data.success) {
        Alert.alert('Failed', 'Could not generate itinerary. Try again.');
        return;
      }
      setItineraryData(data);
      Alert.alert('Itinerary ready', `Planned ${data.itinerary.length} stops`, [
        { text: 'View schedule', onPress: () => router.push('/(tabs)/schedule') },
      ]);
    } catch (error: any) {
      console.error('Generate itinerary error', error);
      setError(error.message || 'Unknown error');
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const Chip = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Plan your trip 🗺️</Text>
        <Text style={styles.subheading}>Tell us about your trip and we will build a day-by-day schedule.</Text>

        <Text style={styles.label}>Destination</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Chennai, Kodaikanal"
          value={destination}
          onChangeText={setDestination}
        />

        <Text style={styles.label}>Days</Text>
        <TextInput
          style={styles.input}
          placeholder="2"
          keyboardType="number-pad"
          value={days}
          onChangeText={setDays}
        />

        <Text style={styles.label}>Travel dates (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD (start date)"
          value={travelDates}
          onChangeText={setTravelDates}
        />

        <Text style={styles.label}>Budget</Text>
        <View style={styles.rowWrap}>
          {BUDGETS.map((b) => (
            <Chip key={b} label={b} selected={budget === b} onPress={() => setBudget(b)} />
          ))}
        </View>

        <Text style={styles.label}>Travel type</Text>
        <View style={styles.rowWrap}>
          {TRAVEL_TYPES.map((t) => (
            <Chip key={t} label={t} selected={travelType === t} onPress={() => setTravelType(t)} />
          ))}
        </View>

        <Text style={styles.label}>Trip mood</Text>
        <View style={styles.rowWrap}>
          {MOODS.map((m) => (
            <Chip key={m} label={m} selected={mood === m} onPress={() => setMood(m)} />
          ))}
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Avoid crowded places</Text>
            <Text style={styles.switchHint}>Prefer calm, less busy spots.</Text>
          </View>
          <Switch value={avoidCrowded} onValueChange={setAvoidCrowded} />
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Accessibility needs</Text>
            <Text style={styles.switchHint}>Wheelchair/stroller friendly locations.</Text>
          </View>
          <Switch value={accessibilityNeeds} onValueChange={setAccessibilityNeeds} />
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Generate itinerary ✨</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#f8f9ff',
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    fontSize: 15,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  chipSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  switchLabel: {
    fontWeight: '600',
    color: '#111827',
  },
  switchHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  button: {
    marginTop: 24,
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
});
