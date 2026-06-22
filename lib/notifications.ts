import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export type RitualKind = 'morning' | 'night';

function copyFor(kind: RitualKind, desire: string): { title: string; body: string } {
  if (kind === 'morning') {
    return {
      title: 'Set your intention',
      body: `You are attracting ${desire}. Begin today as the you who already has it.`,
    };
  }
  return {
    title: 'Program your mind before sleep',
    body: `You are attracting ${desire}. Let it settle into you as you rest.`,
  };
}

export async function ensurePermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    // Notifications only deliver on physical devices, but allow scheduling in dev.
  }
  const settings = await Notifications.getPermissionsAsync();
  let granted = settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (!granted) {
    const req = await Notifications.requestPermissionsAsync();
    granted = req.granted || req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('rituals', {
      name: 'Daily Rituals',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: undefined,
    });
  }

  return granted;
}

export async function scheduleRitual(
  kind: RitualKind,
  hour: number,
  minute: number,
  desire: string
): Promise<string> {
  const { title, body } = copyFor(kind, desire);
  const id = await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: false },
    trigger: {
      hour,
      minute,
      repeats: true,
      channelId: Platform.OS === 'android' ? 'rituals' : undefined,
    },
  });
  return id;
}

export async function cancelRitual(id?: string | null): Promise<void> {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // already gone
  }
}
