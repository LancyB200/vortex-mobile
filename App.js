import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api, getToken, clearToken } from './src/api';
import { colors } from './src/theme';
import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ServersScreen from './src/screens/ServersScreen';
import AccountScreen from './src/screens/AccountScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const TABS = [
  { id: 'dashboard', label: 'Home', icon: 'shield-checkmark' },
  { id: 'servers', label: 'Servers', icon: 'globe' },
  { id: 'account', label: 'Account', icon: 'person' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api('/auth/me');
        setUser(data.user);
      } catch {
        await clearToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refreshUser = async () => {
    const data = await api('/auth/me');
    setUser(data.user);
  };

  const logout = async () => {
    await clearToken();
    setUser(null);
    setTab('dashboard');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <AuthScreen onLoggedIn={setUser} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.topbar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.topTitle}>
              {{ dashboard: 'VPN Dashboard', servers: 'Servers', account: 'Account', settings: 'Settings' }[tab]}
            </Text>
            <Text style={styles.topSub}>Secure your internet connection.</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </View>

        <View style={styles.flex}>
          {tab === 'dashboard' ? <DashboardScreen /> : null}
          {tab === 'servers' ? <ServersScreen /> : null}
          {tab === 'account' ? <AccountScreen user={user} refreshUser={refreshUser} /> : null}
          {tab === 'settings' ? (
            <SettingsScreen onLoggedOut={logout} refreshUser={refreshUser} />
          ) : null}
        </View>

        <View style={styles.tabBar}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={styles.tabItem}
                onPress={() => setTab(t.id)}
              >
                <Ionicons
                  name={active ? t.icon : `${t.icon}-outline`}
                  size={22}
                  color={active ? colors.primary : colors.muted}
                />
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  topTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  topSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.text, fontWeight: '800', fontSize: 15 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? 18 : 10,
    paddingTop: 10,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 3 },
  tabLabel: { color: colors.muted, fontSize: 10, fontWeight: '600' },
  tabLabelActive: { color: colors.primary },
});