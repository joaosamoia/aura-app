import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Aura from '../../components/Aura';
import { useApp } from '../../lib/AppContext';
import { useHaptics } from '../../lib/haptics';
import { getTheme, THEME_ORDER, ThemeKey } from '../../lib/themes';

export default function Settings() {
  const { theme, themeKey, setTheme, hapticsEnabled, setHapticsEnabled } = useApp();
  const haptics = useHaptics();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const onPickTheme = (key: ThemeKey) => {
    if (key === themeKey) return;
    haptics.success();
    setTheme(key);
  };

  return (
    <View style={styles.root}>
      <Aura theme={theme} />

      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Shape your aura.</Text>
      </View>

      <View style={styles.list}>
        <Text style={styles.sectionLabel}>What you're attracting</Text>
        <View style={styles.themeGrid}>
          {THEME_ORDER.map((key) => {
            const t = getTheme(key);
            const active = key === themeKey;
            return (
              <Pressable
                key={key}
                onPress={() => onPickTheme(key)}
                style={({ pressed }) => [
                  styles.themeChip,
                  active && styles.themeChipActive,
                  pressed && { transform: [{ scale: 0.97 }] },
                ]}
              >
                <View style={[styles.swatch, { backgroundColor: t.blobs[0] }]} />
                <Text style={styles.themeChipText}>{t.label}</Text>
                {active && (
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                )}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Experience</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingTitle}>Haptics</Text>
              <Text style={styles.settingCaption}>Soft vibrations on touch</Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={(v) => {
                if (v) haptics.selection();
                setHapticsEnabled(v);
              }}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: 'rgba(255,255,255,0.55)' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="rgba(255,255,255,0.2)"
            />
          </View>

          <View style={styles.divider} />

          <Pressable
            style={styles.settingRow}
            onPress={() => {
              haptics.light();
              router.push('/rituals');
            }}
          >
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingTitle}>Ritual reminders</Text>
              <Text style={styles.settingCaption}>Manage your morning & night times</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </View>

        <Text style={styles.footer}>Aura · made to be felt</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#3E356E' },
  header: { paddingHorizontal: 28, paddingBottom: 18 },
  title: {
    fontFamily: 'Quicksand_600SemiBold',
    color: '#FFFFFF',
    fontSize: 30,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontFamily: 'Quicksand_400Regular',
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    marginTop: 6,
  },
  list: { paddingHorizontal: 20 },
  sectionLabel: {
    fontFamily: 'Quicksand_500Medium',
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 18,
    marginBottom: 12,
    marginLeft: 6,
  },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  themeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '47%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
  },
  themeChipActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderColor: 'rgba(255,255,255,0.4)',
  },
  swatch: { width: 18, height: 18, borderRadius: 9 },
  themeChipText: {
    flex: 1,
    fontFamily: 'Quicksand_500Medium',
    color: '#FFFFFF',
    fontSize: 16,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  settingTextWrap: { flex: 1, paddingRight: 12 },
  settingTitle: { fontFamily: 'Quicksand_600SemiBold', color: '#FFFFFF', fontSize: 17 },
  settingCaption: {
    fontFamily: 'Quicksand_400Regular',
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  footer: {
    fontFamily: 'Quicksand_400Regular',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 36,
    letterSpacing: 0.5,
  },
});
