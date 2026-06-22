import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Aura from '../../components/Aura';
import { useApp } from '../../lib/AppContext';
import { useHaptics } from '../../lib/haptics';
import {
  cancelRitual,
  ensurePermissions,
  RitualKind,
  scheduleRitual,
} from '../../lib/notifications';
import {
  DEFAULT_RITUALS,
  loadRituals,
  RitualsState,
  RitualTime,
  saveRituals,
} from '../../lib/storage';

function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const m = minute.toString().padStart(2, '0');
  return `${h12}:${m} ${period}`;
}

interface RowProps {
  kind: RitualKind;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  caption: string;
  value: RitualTime;
  onChange: (next: RitualTime) => void;
}

function RitualRow({ kind, icon, title, caption, value, onChange }: RowProps) {
  const haptics = useHaptics();
  const [showPicker, setShowPicker] = useState(false);

  const pickerDate = new Date();
  pickerDate.setHours(value.hour, value.minute, 0, 0);

  const onTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (event.type === 'dismissed' || !date) return;
    onChange({ ...value, hour: date.getHours(), minute: date.getMinutes() });
  };

  return (
    <Animated.View entering={FadeIn.duration(700)} style={styles.card}>
      <View style={styles.rowTop}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={22} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardCaption}>{caption}</Text>
        </View>
        <Switch
          value={value.enabled}
          onValueChange={(v) => {
            haptics.selection();
            onChange({ ...value, enabled: v });
          }}
          trackColor={{ false: 'rgba(255,255,255,0.2)', true: 'rgba(255,255,255,0.55)' }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="rgba(255,255,255,0.2)"
        />
      </View>

      {value.enabled && (
        <Pressable
          style={styles.timeRow}
          onPress={() => {
            haptics.light();
            setShowPicker(true);
          }}
        >
          <Text style={styles.timeLabel}>Reminder time</Text>
          <Text style={styles.timeValue}>{formatTime(value.hour, value.minute)}</Text>
        </Pressable>
      )}

      {showPicker && (
        <View style={Platform.OS === 'ios' ? styles.iosPicker : undefined}>
          <DateTimePicker
            mode="time"
            value={pickerDate}
            onChange={onTimeChange}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            themeVariant="dark"
          />
          {Platform.OS === 'ios' && (
            <Pressable style={styles.doneBtn} onPress={() => setShowPicker(false)}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          )}
        </View>
      )}
    </Animated.View>
  );
}

export default function Rituals() {
  const { theme } = useApp();
  const insets = useSafeAreaInsets();

  const [rituals, setRituals] = useState<RitualsState>(DEFAULT_RITUALS);
  const desireRef = useRef(theme.desire);

  useEffect(() => {
    loadRituals().then(setRituals);
  }, []);

  // If the desire changes while rituals are on, refresh their wording.
  useEffect(() => {
    if (desireRef.current === theme.desire) return;
    desireRef.current = theme.desire;
    (async () => {
      const current = await loadRituals();
      const next: RitualsState = { ...current };
      for (const kind of ['morning', 'night'] as RitualKind[]) {
        const r = current[kind];
        if (r.enabled) {
          await cancelRitual(r.notificationId);
          const id = await scheduleRitual(kind, r.hour, r.minute, theme.desire);
          next[kind] = { ...r, notificationId: id };
        }
      }
      setRituals(next);
      saveRituals(next);
    })();
  }, [theme.desire]);

  const applyRitual = async (kind: RitualKind, next: RitualTime) => {
    await cancelRitual(rituals[kind].notificationId);
    let notificationId: string | null = null;
    let enabled = next.enabled;

    if (enabled) {
      const ok = await ensurePermissions();
      if (!ok) {
        enabled = false;
      } else {
        notificationId = await scheduleRitual(kind, next.hour, next.minute, theme.desire);
      }
    }

    const updated: RitualsState = {
      ...rituals,
      [kind]: { ...next, enabled, notificationId },
    };
    setRituals(updated);
    saveRituals(updated);
  };

  return (
    <View style={styles.root}>
      <Aura theme={theme} />

      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.title}>Rituals</Text>
        <Text style={styles.subtitle}>
          Gentle reminders to return to your intention.
        </Text>
      </View>

      <View style={styles.list}>
        <RitualRow
          kind="morning"
          icon="sunny-outline"
          title="Morning"
          caption="Set your intention"
          value={rituals.morning}
          onChange={(next) => applyRitual('morning', next)}
        />
        <RitualRow
          kind="night"
          icon="moon-outline"
          title="Night"
          caption="Program your mind before sleep"
          value={rituals.night}
          onChange={(next) => applyRitual('night', next)}
        />

        <Text style={styles.note}>
          You'll be reminded that you are attracting {theme.desire}.
        </Text>
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
    lineHeight: 22,
  },
  list: { paddingHorizontal: 20, gap: 16 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  cardTitle: { fontFamily: 'Quicksand_600SemiBold', color: '#FFFFFF', fontSize: 18 },
  cardCaption: {
    fontFamily: 'Quicksand_400Regular',
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 16,
    borderTopColor: 'rgba(255,255,255,0.15)',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  timeLabel: { fontFamily: 'Quicksand_400Regular', color: 'rgba(255,255,255,0.8)', fontSize: 15 },
  timeValue: { fontFamily: 'Quicksand_600SemiBold', color: '#FFFFFF', fontSize: 17 },
  iosPicker: { marginTop: 8, alignItems: 'center' },
  doneBtn: {
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  doneText: { fontFamily: 'Quicksand_500Medium', color: '#FFFFFF', fontSize: 15 },
  note: {
    fontFamily: 'Quicksand_400Regular',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
