import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/colors';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
  const router   = useRouter();
  const { user, profile, logout, updateProfile, loading } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [name,    setName]    = useState(profile?.displayName || '');
  const [notify,  setNotify]  = useState(true);

  const handleSave = async () => {
    try {
      await updateProfile({ displayName: name });
      setEditing(false);
      Toast.show({ type: 'success', text1: 'Profile updated!' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.message });
    }
  };

  const confirmLogout = () =>
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);

  const menuItems = [
    { icon: 'map-outline',      label: 'My Trips',      onPress: () => router.push('/(tabs)/mytrips') },
    { icon: 'heart-outline',    label: 'Saved Places',  onPress: () => {} },
    { icon: 'star-outline',     label: 'My Reviews',    onPress: () => {} },
    { icon: 'settings-outline', label: 'Settings',      onPress: () => {} },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {} },
    { icon: 'information-circle-outline', label: 'About App', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={Colors.gradients.primary as any} style={styles.header}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {profile?.displayName?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          {editing ? (
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              autoFocus
            />
          ) : (
            <Text style={styles.profileName}>{profile?.displayName || 'Traveler'}</Text>
          )}
          <Text style={styles.profileEmail}>{user?.email}</Text>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={editing ? handleSave : () => setEditing(true)}
          >
            <Ionicons name={editing ? 'checkmark' : 'pencil'} size={14} color={Colors.primary} />
            <Text style={styles.editBtnText}>{editing ? 'Save' : 'Edit Profile'}</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <View style={styles.prefRow}>
              <Text style={styles.prefLabel}>🔔 Trip Notifications</Text>
              <Switch
                value={notify}
                onValueChange={setNotify}
                trackColor={{ false: Colors.greyMedium, true: Colors.primary + '80' }}
                thumbColor={notify ? Colors.primary : Colors.grey}
              />
            </View>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            {menuItems.map((item, i) => (
              <TouchableOpacity key={i} style={[styles.menuRow, i < menuItems.length - 1 && styles.menuBorder]} onPress={item.onPress}>
                <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.grey} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View style={{ padding: Spacing.md, paddingBottom: Spacing.xxl }}>
          <TouchableOpacity onPress={confirmLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:          { alignItems: 'center', padding: Spacing.xl, paddingBottom: Spacing.xxl },
  avatarLarge:     { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  avatarLargeText: { fontSize: Fonts.sizes.hero, fontWeight: '800', color: Colors.white },
  nameInput:       { fontSize: Fonts.sizes.xl, fontWeight: '700', color: Colors.white, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.6)', minWidth: 150, textAlign: 'center', marginBottom: 4 },
  profileName:     { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.white, marginBottom: 2 },
  profileEmail:    { fontSize: Fonts.sizes.sm, color: 'rgba(255,255,255,0.75)', marginBottom: Spacing.md },
  editBtn:         { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, paddingHorizontal: 16, paddingVertical: 6, borderRadius: BorderRadius.full, gap: 4 },
  editBtnText:     { fontSize: Fonts.sizes.sm, color: Colors.primary, fontWeight: '700' },
  section:         { padding: Spacing.md },
  sectionTitle:    { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  card:            { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, overflow: 'hidden', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  prefRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md },
  prefLabel:       { fontSize: Fonts.sizes.md, color: Colors.text },
  menuRow:         { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  menuBorder:      { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuLabel:       { flex: 1, fontSize: Fonts.sizes.md, color: Colors.text },
  logoutBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.error + '12', padding: Spacing.md, borderRadius: BorderRadius.lg, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.error + '30' },
  logoutText:      { fontSize: Fonts.sizes.md, color: Colors.error, fontWeight: '700' },
});
