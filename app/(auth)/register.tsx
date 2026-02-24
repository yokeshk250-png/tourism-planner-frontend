import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors, Fonts, Spacing, BorderRadius } from '../../constants/colors';
import Toast from 'react-native-toast-message';

export default function RegisterScreen() {
  const router    = useRouter();
  const register  = useAuthStore(s => s.register);
  const loading   = useAuthStore(s => s.loading);

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agreed,   setAgreed]   = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirm) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' }); return;
    }
    if (password !== confirm) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' }); return;
    }
    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' }); return;
    }
    if (!agreed) {
      Toast.show({ type: 'error', text1: 'Please accept the terms' }); return;
    }
    try {
      await register(email.trim(), password, name.trim());
      Toast.show({ type: 'success', text1: 'Account created!', text2: 'Welcome aboard 🌍' });
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Registration failed', text2: e.message });
    }
  };

  const fields = [
    { label: 'Full Name',        icon: 'person-outline',      value: name,     set: setName,     type: 'default',       secure: false },
    { label: 'Email',            icon: 'mail-outline',        value: email,    set: setEmail,    type: 'email-address', secure: false },
    { label: 'Password',         icon: 'lock-closed-outline', value: password, set: setPassword, type: 'default',       secure: true  },
    { label: 'Confirm Password', icon: 'lock-closed-outline', value: confirm,  set: setConfirm,  type: 'default',       secure: true  },
  ];

  return (
    <LinearGradient colors={Colors.gradients.hero as any} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: Spacing.lg }} keyboardShouldPersistTaps="handled">

          <View style={{ alignItems: 'center', marginBottom: Spacing.xl }}>
            <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md }}>
              <Ionicons name="person-add" size={32} color={Colors.white} />
            </View>
            <Text style={{ fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.white }}>Create Account</Text>
            <Text style={{ fontSize: Fonts.sizes.base, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>Start your adventure today</Text>
          </View>

          <View style={{ backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg }}>

            {fields.map((f, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.greyLight, borderRadius: BorderRadius.md, marginBottom: Spacing.md, paddingHorizontal: Spacing.md, borderWidth: 1, borderColor: Colors.border }}>
                <Ionicons name={f.icon as any} size={20} color={Colors.grey} style={{ marginRight: Spacing.sm }} />
                <TextInput
                  style={{ flex: 1, height: 52, fontSize: Fonts.sizes.md, color: Colors.text }}
                  placeholder={f.label}
                  placeholderTextColor={Colors.textMuted}
                  keyboardType={f.type as any}
                  autoCapitalize={f.type === 'email-address' ? 'none' : 'words'}
                  secureTextEntry={f.secure && !showPass}
                  value={f.value}
                  onChangeText={f.set}
                />
                {f.secure && (
                  <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                    <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.grey} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg }}
              onPress={() => setAgreed(!agreed)}
            >
              <Ionicons
                name={agreed ? 'checkbox' : 'square-outline'}
                size={22} color={agreed ? Colors.primary : Colors.grey}
                style={{ marginRight: 8 }}
              />
              <Text style={{ fontSize: Fonts.sizes.sm, color: Colors.textLight }}>
                I agree to the <Text style={{ color: Colors.primary, fontWeight: '700' }}>Terms & Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRegister} disabled={loading} style={{ borderRadius: BorderRadius.md, overflow: 'hidden', marginBottom: Spacing.md }}>
              <LinearGradient colors={Colors.gradients.primary as any} style={{ paddingVertical: 16, alignItems: 'center' }}>
                <Text style={{ color: Colors.white, fontSize: Fonts.sizes.md, fontWeight: '700' }}>
                  {loading ? 'Creating account...' : 'Create Account →'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => router.back()}>
              <Text style={{ fontSize: Fonts.sizes.sm, color: Colors.textLight }}>
                Already have an account? <Text style={{ color: Colors.primary, fontWeight: '700' }}>Sign In</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
