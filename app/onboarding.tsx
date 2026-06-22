import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Aura from '../components/Aura';
import { useApp } from '../lib/AppContext';
import { useHaptics } from '../lib/haptics';
import { getTheme, THEME_ORDER, ThemeKey } from '../lib/themes';

const WELCOME = [
  {
    title: 'Welcome to Aura',
    subtitle: 'A soft space to attract what you desire.',
  },
  {
    title: 'Breathe, and begin',
    subtitle: 'Speak it. Feel it. Let it find you.',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { completeOnboarding } = useApp();
  const haptics = useHaptics();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [step, setStep] = useState(0);
  const [preview, setPreview] = useState<ThemeKey>('peace');

  const next = () => {
    haptics.soft();
    setStep((s) => s + 1);
  };

  const choose = async (theme: ThemeKey) => {
    haptics.success();
    setPreview(theme);
    await completeOnboarding(theme);
    // small breath so the aura starts recoloring before the transition
    setTimeout(() => router.replace('/(tabs)'), 650);
  };

  const isQuestion = step >= WELCOME.length;

  return (
    <View style={styles.root}>
      <Aura theme={getTheme(preview)} />

      <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
        {!isQuestion ? (
          <Pressable style={styles.flexCenter} onPress={next}>
            <Animated.View key={`w-${step}`} entering={FadeIn.duration(1400)} exiting={FadeOut.duration(600)} style={styles.flexCenter}>
              <Text style={styles.title}>{WELCOME[step].title}</Text>
              <Text style={styles.subtitle}>{WELCOME[step].subtitle}</Text>
              <Text style={styles.tapHint}>tap to continue</Text>
            </Animated.View>
          </Pressable>
        ) : (
          <Animated.View key="q" entering={FadeIn.duration(1400)} style={styles.flexCenter}>
            <Text style={styles.title}>What do you want{'\n'}to attract?</Text>
            <View style={[styles.options, { width: Math.min(width - 56, 360) }]}>
              {THEME_ORDER.map((key) => (
                <Pressable
                  key={key}
                  style={({ pressed }) => [
                    styles.option,
                    pressed && styles.optionPressed,
                  ]}
                  onPress={() => choose(key)}
                >
                  <Text style={styles.optionText}>{getTheme(key).label}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#3E356E' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  flexCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
  title: {
    fontFamily: 'Quicksand_500Medium',
    color: '#FFFFFF',
    fontSize: 34,
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 14,
  },
  subtitle: {
    fontFamily: 'Quicksand_400Regular',
    color: 'rgba(255,255,255,0.85)',
    fontSize: 17,
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 26,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  tapHint: {
    fontFamily: 'Quicksand_400Regular',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    letterSpacing: 1.5,
    marginTop: 44,
    textTransform: 'uppercase',
  },
  options: { marginTop: 44, gap: 14 },
  option: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderRadius: 26,
    paddingVertical: 18,
    alignItems: 'center',
  },
  optionPressed: { backgroundColor: 'rgba(255,255,255,0.28)', transform: [{ scale: 0.98 }] },
  optionText: {
    fontFamily: 'Quicksand_500Medium',
    color: '#FFFFFF',
    fontSize: 19,
    letterSpacing: 0.5,
  },
});
