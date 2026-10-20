import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import PasswordInput from '../components/PasswordInput';
import { api, setToken } from '../api';
import { colors } from '../theme';

export default function AuthScreen({ onLoggedIn }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/register';
      const body =
        mode === 'login'
          ? { email, password }
          : { name, email, password };
      const data = await api(path, { method: 'POST', body: JSON.stringify(body) });
      await setToken(data.token);
      onLoggedIn(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.center}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.logo}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoV}>V</Text>
            </View>
            <Text style={styles.logoText}>VORTEX</Text>
          </View>

          <Text style={styles.title}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </Text>
          <Text style={styles.sub}>
            {mode === 'login'
              ? 'Sign in to secure your internet connection.'
              : 'Join Vortex VPN and protect your traffic.'}
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {mode === 'register' ? (
            <>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={colors.muted}
                value={name}
                onChangeText={setName}
              />
            </>
          ) : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <PasswordInput
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.button, busy && styles.buttonDisabled]}
            onPress={submit}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={switchMode}>
            <Text style={styles.link}>
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  center: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 28,
  },
  logo: {
    alignItems: 'center',
    marginBottom: 22,
  },
  logoIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoV: { color: '#fff', fontSize: 22, fontWeight: '800' },
  logoText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
  },
  title: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  sub: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#fca5a5', fontSize: 13 },
  label: {
    color: colors.mutedLight,
    fontSize: 13,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 22,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 1,
    fontSize: 13,
  },
  link: {
    color: colors.primary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 18,
  },
});