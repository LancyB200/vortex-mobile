import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import PasswordInput from '../components/PasswordInput';
import { api } from '../api';
import { colors } from '../theme';

export default function SettingsScreen({ onLoggedOut, refreshUser }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const save = async () => {
    setMessage('');
    setError('');

    const body = {};
    if (name.trim()) body.name = name.trim();
    if (password) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirm) {
        setError('Passwords do not match');
        return;
      }
      body.password = password;
    }
    if (!Object.keys(body).length) {
      setError('Nothing to update');
      return;
    }

    try {
      await api('/auth/me', { method: 'PATCH', body: JSON.stringify(body) });
      await refreshUser();
      setName('');
      setPassword('');
      setConfirm('');
      setMessage('Settings saved.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      {message ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{message}</Text>
        </View>
      ) : null}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Text style={styles.label}>Display Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Your name"
        placeholderTextColor={colors.muted}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>New Password</Text>
      <PasswordInput
        placeholder="Leave blank to keep current"
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>Confirm New Password</Text>
      <PasswordInput
        placeholder="Repeat new password"
        value={confirm}
        onChangeText={setConfirm}
      />

      <TouchableOpacity style={styles.button} onPress={save}>
        <Text style={styles.buttonText}>SAVE CHANGES</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={onLoggedOut}>
        <Text style={styles.logoutText}>LOG OUT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  successBox: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.35)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  successText: { color: '#6ee7b7', fontSize: 13 },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  errorText: { color: '#fca5a5', fontSize: 13 },
  label: { color: colors.mutedLight, fontSize: 13, marginBottom: 6, marginTop: 12 },
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
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { color: '#fff', fontWeight: '800', letterSpacing: 1, fontSize: 13 },
  logoutBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 28,
  },
  logoutText: { color: '#f87171', fontWeight: '800', letterSpacing: 1, fontSize: 13 },
});