import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/colors';
import Toast from 'react-native-toast-message';

export default function ForgotScreen() {
  const router         = useRouter();
  const forgotPassword = useAuthStore(s => s.forgotPassword);
  const loading        = useAuthStore(s => s.loading);
  const [email, setEmail] = useState('');
  const [sent,  setSent]  = useState(false);

  const handleReset = async () => {
    if (!email) { Toast.show({ type: 'error', text1: 'Enter your email' }); return; }
    try {
      await forgotPassword(email.trim());
      setSent(true);
      Toast.show({ type: 'success', text1: 'Reset email sent!', text2: 'Check your inbox.' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed', text2: e.message });
    }
  };

  return (
    <LinearGradient colors={Colors.gradients.hero as any} style={{ flex: 1, justifyContent: 'center', padding: Spacing.lg }}>

      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: Spacing.xl }}>
        <Ionicons name="arrow-back" size={28} color={Colors.white} />
      </TouchableOpacity>

      <Text style={{ fontSize: Fonts.sizes.xxxl, fontWeight: '800', color: Colors.white, marginBottom: 8 }}>Forgot Password?</Text>
      <Text style={{ fontSize: Fonts.sizes.base, color: 'rgba(255,255,255,0.75)', marginBottom: Spacing.xl }}>
        Enter your email and we'll send you a reset link.
      </Text>

      <View style={{ backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg }}>
        {sent ? (
          <View style={{ alignItems: 'center', paddingVertical: Spacing.lg }}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
            <Text style={{ fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text, marginTop: Spacing.md }}>Email Sent!</Text>
            <Text style={{ fontSize: Fonts.sizes.sm, color: Colors.textLight, marginTop: 4, textAlign: 'center' }}>
              Check your inbox and follow the link to reset your password.
            </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={{ marginTop: Spacing.lg }}>
              <Text style={{ color: Colors.primary, fontWeight: '700' }}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.greyLight, borderRadius: BorderRadius.md, marginBottom: Spacing.lg, paddingHorizontal: Spacing.md, borderWidth: 1, borderColor: Colors.border }}>
              <Ionicons name="mail-outline" size={20} color={Colors.grey} style={{ marginRight: Spacing.sm }} />
              <TextInput
                style={{ flex: 1, height: 52, fontSize: Fonts.sizes.md, color: Colors.text }}
                placeholder="your@email.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity onPress={handleReset} disabled={loading} style={{ borderRadius: BorderRadius.md, overflow: 'hidden' }}>
              <LinearGradient colors={Colors.gradients.primary as any} style={{ paddingVertical: 16, alignItems: 'center' }}>
                <Text style={{ color: Colors.white, fontSize: Fonts.sizes.md, fontWeight: '700' }}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </View>
    </LinearGradient>
  );
}
