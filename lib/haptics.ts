import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { useApp } from './AppContext';

/**
 * Returns delicate haptic helpers that respect the user's preference.
 * Everything here is intentionally soft — no heavy/rigid feedback.
 */
export function useHaptics() {
  const { hapticsEnabled } = useApp();

  const soft = useCallback(() => {
    if (!hapticsEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
  }, [hapticsEnabled]);

  const light = useCallback(() => {
    if (!hapticsEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [hapticsEnabled]);

  const selection = useCallback(() => {
    if (!hapticsEnabled) return;
    Haptics.selectionAsync().catch(() => {});
  }, [hapticsEnabled]);

  const success = useCallback(() => {
    if (!hapticsEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {}
    );
  }, [hapticsEnabled]);

  return { soft, light, selection, success };
}
