import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { GlassPanel } from '../src/components/ui/GlassPanel';
import { PrimaryButton } from '../src/components/ui/PrimaryButton';
import { colors, fontFamilies, fontSizes, spacing, radii } from '../src/design/tokens';

type AuthMode = 'password' | 'magic';
type PasswordStep = 'signin' | 'signup';
type MagicStep = 'email' | 'otp';

export default function Auth() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('password');
  const [passwordStep, setPasswordStep] = useState<PasswordStep>('signin');
  const [magicStep, setMagicStep] = useState<MagicStep>('email');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const clear = () => { setError(null); setInfo(null); };

  const handlePasswordAuth = async () => {
    clear();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      if (passwordStep === 'signup') {
        const { error: e } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: displayName } },
        });
        if (e) throw e;
        setInfo('Check your email to confirm your account.');
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
        router.replace('/casting');
      }
    } catch (e: any) {
      setError(e.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMagicLink = async () => {
    clear();
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true);
    try {
      const { error: e } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (e) throw e;
      setMagicStep('otp');
      setInfo('Enter the 6-digit code from your email.');
    } catch (e: any) {
      setError(e.message || 'Could not send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    clear();
    if (!otp) { setError('Enter the code from your email'); return; }
    setLoading(true);
    try {
      const { error: e } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (e) throw e;
      router.replace('/casting');
    } catch (e: any) {
      setError(e.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#00001A', '#000033', '#13294B']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.logo}>ORBCAST</Text>
              <Text style={styles.title}>Sign In</Text>
              <Text style={styles.subtitle}>Sync your speakers and settings across devices.</Text>
            </View>

            {/* Mode tabs */}
            <View style={styles.tabs}>
              {(['password', 'magic'] as AuthMode[]).map((m) => (
                <TouchableOpacity
                  testID={`auth-tab-${m}`}
                  key={m}
                  onPress={() => { setMode(m); clear(); }}
                  style={[styles.tab, mode === m && styles.tabActive]}
                >
                  <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                    {m === 'password' ? 'Password' : 'Magic Link'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <GlassPanel style={styles.card}>
              {/* Error / Info */}
              {error && <Text testID="auth-error" style={styles.error}>{error}</Text>}
              {info && <Text testID="auth-info" style={styles.infoText}>{info}</Text>}

              {/* Password Mode */}
              {mode === 'password' && (
                <View>
                  {passwordStep === 'signup' && (
                    <TextInput
                      testID="auth-display-name"
                      style={styles.input}
                      placeholder="Display name"
                      placeholderTextColor={colors.text.tertiary}
                      value={displayName}
                      onChangeText={setDisplayName}
                      autoCapitalize="words"
                    />
                  )}
                  <TextInput
                    testID="auth-email"
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={colors.text.tertiary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TextInput
                    testID="auth-password"
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={colors.text.tertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                  <PrimaryButton
                    testID="auth-submit"
                    title={passwordStep === 'signin' ? 'Sign In' : 'Create Account'}
                    onPress={handlePasswordAuth}
                    loading={loading}
                    style={styles.submitBtn}
                  />
                  <TouchableOpacity
                    testID="auth-toggle-step"
                    onPress={() => { setPasswordStep(passwordStep === 'signin' ? 'signup' : 'signin'); clear(); }}
                    style={styles.toggleRow}
                  >
                    <Text style={styles.toggleText}>
                      {passwordStep === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Magic Link Mode */}
              {mode === 'magic' && (
                <View>
                  {magicStep === 'email' ? (
                    <>
                      <TextInput
                        testID="auth-magic-email"
                        style={styles.input}
                        placeholder="Email address"
                        placeholderTextColor={colors.text.tertiary}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                      <PrimaryButton
                        testID="auth-magic-send"
                        title="Send Code"
                        onPress={handleSendMagicLink}
                        loading={loading}
                        style={styles.submitBtn}
                      />
                    </>
                  ) : (
                    <>
                      <TextInput
                        testID="auth-otp"
                        style={[styles.input, styles.otpInput]}
                        placeholder="000000"
                        placeholderTextColor={colors.text.tertiary}
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                      <PrimaryButton
                        testID="auth-otp-verify"
                        title="Verify Code"
                        onPress={handleVerifyOTP}
                        loading={loading}
                        style={styles.submitBtn}
                      />
                      <TouchableOpacity
                        testID="auth-magic-back"
                        onPress={() => { setMagicStep('email'); clear(); }}
                        style={styles.toggleRow}
                      >
                        <Text style={styles.toggleText}>Use different email</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            </GlassPanel>

            {/* Skip */}
            <TouchableOpacity
              testID="auth-skip"
              onPress={() => router.replace('/casting')}
              style={styles.skipBtn}
            >
              <Text style={styles.skipText}>Continue without signing in</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  kav: { flex: 1 },
  scroll: { padding: spacing.screenPadding, paddingTop: 60 },
  header: { marginBottom: spacing.xl },
  logo: { color: colors.brand.primary, fontSize: fontSizes.small, fontFamily: fontFamilies.heading, letterSpacing: 6, marginBottom: 16 },
  title: { color: colors.text.primary, fontSize: fontSizes.h2, fontFamily: fontFamilies.headingXB, marginBottom: 8 },
  subtitle: { color: colors.text.secondary, fontSize: fontSizes.body, fontFamily: fontFamilies.body },
  tabs: { flexDirection: 'row', marginBottom: spacing.md, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radii.pill, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radii.pill },
  tabActive: { backgroundColor: colors.brand.primary },
  tabText: { color: colors.text.tertiary, fontSize: fontSizes.caption, fontFamily: fontFamilies.bodyMed },
  tabTextActive: { color: '#fff' },
  card: { marginBottom: spacing.lg },
  input: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    color: colors.text.primary,
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.body,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: spacing.md,
  },
  otpInput: { textAlign: 'center', fontSize: 24, letterSpacing: 8, fontFamily: fontFamilies.mono },
  submitBtn: { marginTop: 4 },
  toggleRow: { paddingVertical: 16, alignItems: 'center' },
  toggleText: { color: colors.text.secondary, fontSize: fontSizes.caption, fontFamily: fontFamilies.body },
  error: { color: colors.status.error, fontSize: fontSizes.caption, fontFamily: fontFamilies.body, marginBottom: spacing.md, textAlign: 'center' },
  infoText: { color: colors.status.online, fontSize: fontSizes.caption, fontFamily: fontFamilies.body, marginBottom: spacing.md, textAlign: 'center' },
  skipBtn: { alignItems: 'center', paddingVertical: 16 },
  skipText: { color: colors.text.tertiary, fontSize: fontSizes.caption, fontFamily: fontFamilies.body },
});
