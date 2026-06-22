import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface Props {
  lines: string[];
  /** changing this re-triggers the sequential fade (used on swipe). */
  triggerKey: string | number;
}

/** Renders affirmation lines that fade in slowly, one after another. */
export default function AffirmationText({ lines, triggerKey }: Props) {
  return (
    <View style={styles.container}>
      {lines.map((line, i) => (
        <Animated.Text
          key={`${triggerKey}-${i}`}
          entering={FadeIn.delay(400 + i * 750).duration(1700)}
          style={styles.line}
        >
          {line}
        </Animated.Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  line: {
    fontFamily: 'Quicksand_400Regular',
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 38,
    textAlign: 'center',
    marginVertical: 8,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 12,
  },
});
