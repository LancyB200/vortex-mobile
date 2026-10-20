import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { api } from '../api';
import { colors } from '../theme';

const PLANS = [
  { id: 'free', name: 'Free', price: '$0', per: 'forever', perks: ['3 server locations', 'Standard speed', '1 device'] },
  { id: 'pro', name: 'Pro', price: '$9.99', per: '/ month', perks: ['All server locations', 'High speed', '5 devices', 'No logs'] },
  { id: 'premium', name: 'Premium', price: '$29.99', per: '/ year', perks: ['Everything in Pro', 'Unlimited devices', 'Priority support', 'Dedicated IP'] },
];

export default function AccountScreen({ user, refreshUser }) {
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/vpn/history')
      .then(({ connections }) => setHistory(connections))
      .catch((err) => setError(err.message));
  }, []);

  const subscribe = async (plan) => {
    setBusy(true);
    setMessage('');
    setError('');
    try {
      await api('/vpn/subscribe', { method: 'POST', body: JSON.stringify({ plan }) });
      await refreshUser();
      setMessage(`You are now on the ${plan} plan.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.planBadge}>{user?.plan} plan</Text>
        </View>
      </View>

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

      {PLANS.map((plan) => {
        const current = user?.plan === plan.id;
        return (
          <View key={plan.id} style={[styles.planCard, current && styles.planCurrent]}>
            <View style={styles.planHead}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>
                {plan.price}
                <Text style={styles.planPer}> {plan.per}</Text>
              </Text>
            </View>
            {plan.perks.map((perk) => (
              <Text key={perk} style={styles.perk}>✓ {perk}</Text>
            ))}
            <TouchableOpacity
              style={[styles.planBtn, current && styles.planBtnCurrent]}
              disabled={current || busy}
              onPress={() => subscribe(plan.id)}
            >
              <Text style={styles.planBtnText}>
                {current ? 'CURRENT PLAN' : `UPGRADE TO ${plan.name.toUpperCase()}`}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <Text style={styles.sectionTitle}>Connection History</Text>
      {history.length === 0 ? (
        <Text style={styles.muted}>No connections yet. Connect from the dashboard.</Text>
      ) : (
        history.map((conn) => (
          <View key={conn.id} style={styles.historyCard}>
            <Text style={styles.historyServer}>
              {conn.flag} {conn.server_name}
            </Text>
            <Text style={styles.historyIp}>{conn.vpn_ip}</Text>
            <Text style={styles.historyTime}>
              {new Date(conn.connected_at + 'Z').toLocaleString()}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.text, fontSize: 22, fontWeight: '800' },
  name: { color: colors.text, fontSize: 17, fontWeight: '700' },
  email: { color: colors.muted, fontSize: 13, marginTop: 2 },
  planBadge: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 8,
    backgroundColor: 'rgba(37,99,235,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
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
  planCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  planCurrent: { borderColor: colors.primary },
  planHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  planName: { color: colors.text, fontSize: 16, fontWeight: '700' },
  planPrice: { color: colors.text, fontSize: 24, fontWeight: '800' },
  planPer: { color: colors.muted, fontSize: 12, fontWeight: '400' },
  perk: { color: colors.mutedLight, fontSize: 12, marginBottom: 4 },
  planBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  planBtnCurrent: { backgroundColor: colors.cardAlt },
  planBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 22,
    marginBottom: 12,
  },
  muted: { color: colors.muted, fontSize: 13 },
  historyCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  historyServer: { color: colors.textSoft, fontSize: 14, fontWeight: '600' },
  historyIp: { color: colors.mutedLight, fontSize: 12, marginTop: 4 },
  historyTime: { color: colors.muted, fontSize: 11, marginTop: 2 },
});