import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api';
import { colors, formatTime } from '../theme';

export default function DashboardScreen() {
  const [status, setStatus] = useState('disconnected');
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');
  const timerRef = useRef(null);

  const loadStatus = useCallback(async () => {
    try {
      const data = await api('/vpn/status');
      setSession(data);
      setStatus(data.connected ? 'connected' : 'disconnected');
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    timerRef.current = setInterval(loadStatus, 2000);
    return () => clearInterval(timerRef.current);
  }, [loadStatus]);

  const connectVPN = async () => {
    setError('');
    if (status === 'connected') {
      try {
        await api('/vpn/disconnect', { method: 'POST' });
        setSession(null);
        setStatus('disconnected');
      } catch (err) {
        setError(err.message);
      }
      return;
    }

    setStatus('connecting');
    try {
      const selected = await AsyncStorage.getItem('vortex_server_id');
      if (!selected) {
        setError('Pick a server first on the Servers tab.');
        setStatus('disconnected');
        return;
      }
      await api('/vpn/connect', {
        method: 'POST',
        body: JSON.stringify({ serverId: selected }),
      });
      await loadStatus();
    } catch (err) {
      setError(err.message);
      setStatus('disconnected');
    }
  };

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const server = session?.server;

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View
        style={[
          styles.card,
          isConnected && styles.cardConnected,
          isConnecting && styles.cardConnecting,
        ]}
      >
        <View style={styles.statusRow}>
          <View
            style={[
              styles.dot,
              isConnected && styles.dotGreen,
              isConnecting && styles.dotAmber,
            ]}
          />
          <Text style={styles.statusText}>
            {isConnected ? 'CONNECTED' : isConnecting ? 'CONNECTING...' : 'DISCONNECTED'}
          </Text>
        </View>

        <View
          style={[
            styles.power,
            isConnected && styles.powerGreen,
            isConnecting && styles.powerAmber,
          ]}
        >
          <Ionicons
            name={isConnected ? 'lock-closed' : 'flash'}
            size={40}
            color={isConnected ? colors.green : colors.mutedLight}
          />
        </View>

        <Text style={styles.title}>
          {isConnected
            ? 'Your connection is secure'
            : isConnecting
            ? 'Connecting to Vortex...'
            : 'Your connection is not secure'}
        </Text>

        <Text style={styles.sub}>
          {isConnected
            ? `Protected through ${server?.flag} ${server?.country}.`
            : isConnecting
            ? 'Establishing a secure VPN connection...'
            : 'Select a server and connect to protect your traffic.'}
        </Text>

        <TouchableOpacity
          style={[styles.button, isConnecting && styles.buttonDisabled]}
          onPress={connectVPN}
          disabled={isConnecting}
        >
          <Text style={styles.buttonText}>
            {isConnected ? 'DISCONNECT' : isConnecting ? 'CONNECTING...' : 'CONNECT'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Current Location</Text>
          <Text style={styles.infoValue}>
            {isConnected ? `${server?.flag} ${server?.country}` : 'Not connected'}
          </Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>IP Address</Text>
          <Text style={styles.infoValue}>{isConnected ? session.ip : 'Not connected'}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Download</Text>
          <Text style={styles.infoValue}>
            {isConnected ? `${session.downloadMbps} Mbps` : '0 Mbps'}
          </Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Upload</Text>
          <Text style={styles.infoValue}>
            {isConnected ? `${session.uploadMbps} Mbps` : '0 Mbps'}
          </Text>
        </View>
      </View>

      {isConnected ? (
        <View style={styles.details}>
          <View style={styles.detailBox}>
            <Text style={styles.infoLabel}>Connection Time</Text>
            <Text style={styles.infoValue}>{formatTime(session.connectedSeconds)}</Text>
          </View>
          <View style={styles.detailBox}>
            <Text style={styles.infoLabel}>Protocol</Text>
            <Text style={styles.infoValue}>WireGuard</Text>
          </View>
          <View style={styles.detailBox}>
            <Text style={styles.infoLabel}>Encryption</Text>
            <Text style={styles.infoValue}>AES-256</Text>
          </View>
          <View style={styles.detailBox}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, styles.secure]}>● Secure</Text>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  errorText: { color: '#fca5a5', fontSize: 13 },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 30,
    alignItems: 'center',
  },
  cardConnected: { borderColor: colors.green },
  cardConnecting: { borderColor: colors.amber },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.muted,
    marginRight: 8,
  },
  dotGreen: { backgroundColor: colors.green },
  dotAmber: { backgroundColor: colors.amber },
  statusText: {
    color: colors.mutedLight,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  power: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 26,
  },
  powerGreen: { borderColor: colors.green },
  powerAmber: { borderColor: colors.amber },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  sub: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 42,
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '800', letterSpacing: 1, fontSize: 13 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    gap: 10,
  },
  infoCard: {
    flexGrow: 1,
    flexBasis: '46%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 6,
  },
  infoValue: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: '600',
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
    gap: 12,
  },
  detailBox: { flexGrow: 1, flexBasis: '40%' },
  secure: { color: colors.green },
});