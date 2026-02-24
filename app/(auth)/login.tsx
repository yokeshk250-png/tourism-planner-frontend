import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Image, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/colors';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const router  = useRouter();
  const login   = useAuthStore(s => s.login);
  const loading = useAuthStore(s => s.loading);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' });
      return;
    }
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Login failed', text2: e.message });
    }
  };

  return (
    <LinearGradient colors={Colors.gradients.hero as any} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <Ionicons name="airplane" size={40} color={Colors.white} />
            </View>
            <Text style={styles.appName}>🗺️ AI Tourism Planner</Text>
            <Text style={styles.tagline}>Your AI-powered travel companion</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back!</Text>
            <Text style={styles.cardSub}>Sign in to continue your journey</Text>

            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={20} color={Colors.grey} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.grey} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => router.push('/(auth)/forgot')} style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
              <LinearGradient colors={Colors.gradients.primary as any} style={styles.loginGrad}>
                {loading
                  ? <Text style={styles.loginBtnText}>Signing in...</Text>
                  : <Text style={styles.loginBtnText}>Sign In →</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerText}>
                Don't have an account? <Text style={styles.registerLink}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  scroll:      { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg },
  logoWrap:    { alignItems: 'center', marginBottom: Spacing.xl },
  logoCircle:  { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  appName:     { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.white, letterSpacing: 0.5 },
  tagline:     { fontSize: Fonts.sizes.base, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  card:        { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  cardTitle:   { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  cardSub:     { fontSize: Fonts.sizes.sm, color: Colors.textLight, marginBottom: Spacing.lg },
  inputWrap:   { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.greyLight, borderRadius: BorderRadius.md, marginBottom: Spacing.md, paddingHorizontal: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  inputIcon:   { marginRight: Spacing.sm },
  input:       { flex: 1, height: 52, fontSize: Fonts.sizes.md, color: Colors.text },
  eyeBtn:      { padding: Spacing.sm },
  forgotBtn:   { alignSelf: 'flex-end', marginBottom: Spacing.md },
  forgotText:  { color: Colors.primaryLight, fontSize: Fonts.sizes.sm, fontWeight: '600' },
  loginBtn:    { borderRadius: BorderRadius.md, overflow: 'hidden', marginBottom: Spacing.md },
  loginGrad:   { paddingVertical: 16, alignItems: 'center' },
  loginBtnText:{ color: Colors.white, fontSize: Fonts.sizes.md, fontWeight: '700', letterSpacing: 0.5 },
  divider:     { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.md },
  line:        { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { marginHorizontal: Spacing.sm, color: Colors.textMuted, fontSize: Fonts.sizes.sm },
  registerBtn: { alignItems: 'center' },
  registerText:{ fontSize: Fonts.sizes.sm, color: Colors.textLight },
  registerLink:{ color: Colors.primary, fontWeight: '700' },
});
