import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api';
import { colors } from '../theme';

export default function ServersScreen() {
  const [servers, setServers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('vortex_server_id').then(setSelected);
    api('/vpn/servers')
      .then(({ servers }) => setServers(servers))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const choose = (id) => {
    AsyncStorage.setItem('vortex_server_id', id);
    setSelected(id);
  };

  return (
    <View style={styles.flex}>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <FlatList
        data={servers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.muted}>
            {loading ? 'Loading servers...' : 'No servers available.'}
          </Text>
        }
        renderItem={({ item }) => {
          const isSelected = selected === item.id;
          const loadClass =
            item.load < 40 ? styles.loadLow : item.load < 70 ? styles.loadMid : styles.loadHigh;
          return (
            <TouchableOpacity
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => choose(item.id)}
            >
              <View style={styles.flagBox}>
                <Text style={styles.flag}>{item.flag}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.country}>{item.country}</Text>
                <Text style={styles.city}>
                  {item.city} · {item.name}
                </Text>
              </View>
              <View>
                <Text style={[styles.load, loadClass]}>{item.load}% load</Text>
                {isSelected ? <Text style={styles.selected}>SELECTED</Text> : null}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 16, paddingBottom: 40 },
  muted: { color: colors.muted, textAlign: 'center', marginTop: 30 },
  errorBox: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
    borderRadius: 10,
    padding: 12,
  },
  errorText: { color: '#fca5a5', fontSize: 13 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  cardSelected: {
    borderColor: colors.primary,
  },
  flagBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: { fontSize: 26 },
  info: { flex: 1 },
  country: { color: colors.text, fontSize: 15, fontWeight: '700' },
  city: { color: colors.muted, fontSize: 12, marginTop: 3 },
  load: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  loadLow: { color: colors.green, backgroundColor: 'rgba(16,185,129,0.12)' },
  loadMid: { color: colors.amber, backgroundColor: 'rgba(245,158,11,0.12)' },
  loadHigh: { color: colors.red, backgroundColor: 'rgba(239,68,68,0.12)' },
  selected: {
    color: '#93c5fd',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 6,
  },
});