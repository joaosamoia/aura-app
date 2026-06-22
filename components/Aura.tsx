import {
  Blur,
  Canvas,
  Circle,
  Fill,
  Group,
  Paint,
  RadialGradient,
  vec,
} from '@shopify/react-native-skia';
import React, { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native';
import {
  interpolateColor,
  SharedValue,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AuraTheme } from '../lib/themes';

/**
 * The living aura: several pastel radial-gradient "blobs" that drift, breathe,
 * and glow over a deep base color. The whole thing is heavily blurred so it
 * reads as soft, organic light rather than distinct shapes. Theme changes
 * cross-fade every color smoothly — never a hard cut.
 */

interface BlobConfig {
  x: number; // base position (fraction of width)
  y: number; // base position (fraction of height)
  radius: number; // fraction of max(w,h)
  driftX: number;
  driftY: number;
  sx: number; // horizontal speed
  sy: number; // vertical speed
  br: number; // breathing speed
  phase: number;
}

// Five blobs, each with its own slow rhythm. Speeds are tiny so the motion
// feels hypnotic (full cycles take ~8–30s).
const BLOBS: BlobConfig[] = [
  { x: 0.28, y: 0.3, radius: 0.62, driftX: 0.1, driftY: 0.08, sx: 0.18, sy: 0.13, br: 0.22, phase: 0.0 },
  { x: 0.72, y: 0.26, radius: 0.55, driftX: 0.09, driftY: 0.1, sx: 0.15, sy: 0.17, br: 0.18, phase: 1.7 },
  { x: 0.35, y: 0.72, radius: 0.6, driftX: 0.12, driftY: 0.09, sx: 0.12, sy: 0.2, br: 0.25, phase: 3.1 },
  { x: 0.74, y: 0.74, radius: 0.5, driftX: 0.1, driftY: 0.11, sx: 0.2, sy: 0.11, br: 0.2, phase: 4.6 },
  { x: 0.5, y: 0.5, radius: 0.7, driftX: 0.08, driftY: 0.08, sx: 0.1, sy: 0.14, br: 0.15, phase: 2.3 },
];

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type SV<T> = SharedValue<T>;

interface BlobProps {
  i: number;
  cfg: BlobConfig;
  clock: SV<number>;
  progress: SV<number>;
  solidFrom: SV<string[]>;
  solidTo: SV<string[]>;
  fadeFrom: SV<string[]>;
  fadeTo: SV<string[]>;
  w: number;
  h: number;
}

function Blob({ i, cfg, clock, progress, solidFrom, solidTo, fadeFrom, fadeTo, w, h }: BlobProps) {
  const maxDim = Math.max(w, h);

  const center = useDerivedValue(() => {
    const t = clock.value / 1000;
    const x = w * cfg.x + Math.sin(t * cfg.sx + cfg.phase) * w * cfg.driftX;
    const y = h * cfg.y + Math.cos(t * cfg.sy + cfg.phase) * h * cfg.driftY;
    return vec(x, y);
  });

  const radius = useDerivedValue(() => {
    const t = clock.value / 1000;
    const breathe = 1 + Math.sin(t * cfg.br + cfg.phase) * 0.18;
    return maxDim * cfg.radius * breathe;
  });

  const colors = useDerivedValue(() => {
    const solid = interpolateColor(
      progress.value,
      [0, 1],
      [solidFrom.value[i], solidTo.value[i]]
    );
    const fade = interpolateColor(
      progress.value,
      [0, 1],
      [fadeFrom.value[i], fadeTo.value[i]]
    );
    return [solid, fade];
  });

  return (
    <Circle c={center} r={radius}>
      <RadialGradient c={center} r={radius} colors={colors} />
    </Circle>
  );
}

export interface AuraProps {
  theme: AuraTheme;
  /** Lighter version for small surfaces (e.g. favorite cards). */
  mini?: boolean;
  style?: ViewStyle;
}

export default function Aura({ theme, mini = false, style }: AuraProps) {
  const [size, setSize] = useState({ w: 0, h: 0 });

  const clock = useSharedValue(0);
  const progress = useSharedValue(1);

  const solidFrom = useSharedValue(theme.blobs);
  const solidTo = useSharedValue(theme.blobs);
  const fadeFrom = useSharedValue(theme.blobs.map((c) => hexToRgba(c, 0)));
  const fadeTo = useSharedValue(theme.blobs.map((c) => hexToRgba(c, 0)));

  const baseFrom = useSharedValue(theme.base);
  const baseTo = useSharedValue(theme.base);

  // Drive a global clock on the UI thread.
  useFrameCallback((info) => {
    clock.value = info.timeSinceFirstFrame;
  });

  // Smoothly cross-fade every color when the theme changes.
  useEffect(() => {
    solidFrom.value = solidTo.value;
    fadeFrom.value = fadeTo.value;
    baseFrom.value = baseTo.value;

    solidTo.value = theme.blobs;
    fadeTo.value = theme.blobs.map((c) => hexToRgba(c, 0));
    baseTo.value = theme.base;

    progress.value = 0;
    progress.value = withTiming(1, { duration: mini ? 1200 : 1800 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme.key]);

  const baseColor = useDerivedValue(() =>
    interpolateColor(progress.value, [0, 1], [baseFrom.value, baseTo.value])
  );

  // Gentle whole-aura breathing in opacity.
  const groupOpacity = useDerivedValue(() => {
    const t = clock.value / 1000;
    return 0.92 + Math.sin(t * 0.16) * 0.08;
  });

  const blurAmount = mini ? 28 : 70;
  const blurLayer = useMemo(
    () => (
      <Paint>
        <Blur blur={blurAmount} />
      </Paint>
    ),
    [blurAmount]
  );

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };

  const { w, h } = size;
  const scrimRadius = Math.max(w, h) * 0.75;

  return (
    <View style={[StyleSheet.absoluteFill, style]} onLayout={onLayout} pointerEvents="none">
      {w > 0 && h > 0 && (
        <Canvas style={{ flex: 1 }}>
          <Fill color={baseColor} />
          <Group layer={blurLayer} opacity={groupOpacity}>
            {BLOBS.map((cfg, i) => (
              <Blob
                key={i}
                i={i}
                cfg={cfg}
                clock={clock}
                progress={progress}
                solidFrom={solidFrom}
                solidTo={solidTo}
                fadeFrom={fadeFrom}
                fadeTo={fadeTo}
                w={w}
                h={h}
              />
            ))}
          </Group>

          {/* Soft center scrim keeps white text legible over bright pastels. */}
          {!mini && (
            <Circle c={vec(w / 2, h / 2)} r={scrimRadius}>
              <RadialGradient
                c={vec(w / 2, h / 2)}
                r={scrimRadius}
                colors={['rgba(0,0,0,0.22)', 'rgba(0,0,0,0.0)']}
              />
            </Circle>
          )}
        </Canvas>
      )}
    </View>
  );
}
