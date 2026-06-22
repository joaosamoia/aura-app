import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Aura from '../../components/Aura';
import { useApp } from '../../lib/AppContext';
import { Affirmation } from '../../lib/affirmations';
import { useHaptics } from '../../lib/haptics';
import { getTheme } from '../../lib/themes';

function FavoriteCard({
  item,
  onRemove,
}: {
  item: Affirmation;
  onRemove: (a: Affirmation) => void;
}) {
  return (
    <Animated.View entering={FadeIn.duration(700)} layout={LinearTransition.springify()} style={styles.card}>
      <Aura theme={getTheme(item.theme)} mini />
      <View style={styles.cardScrim} />
      <View style={styles.cardContent}>
        <View style={{ flex: 1 }}>
          {item.lines.map((line, i) => (
            <Text key={i} style={styles.cardLine} numberOfLines={1}>
              {line}
            </Text>
          ))}
        </View>
        <Pressable
          onPress={() => onRemove(item)}
          hitSlop={12}
          style={({ pressed }) => [styles.heart, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="heart" size={22} color="#FFFFFF" />
        </Pressable>
      </View>
    </Animated.View>
  );
}

export default function Favorites() {
  const { favorites, theme, toggleFavorite } = useApp();
  const haptics = useHaptics();
  const insets = useSafeAreaInsets();

  const remove = (a: Affirmation) => {
    haptics.light();
    toggleFavorite(a);
  };

  return (
    <View style={styles.root}>
      <Aura theme={theme} />

      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>The words you keep close.</Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={40} color="rgba(255,255,255,0.7)" />
          <Text style={styles.emptyText}>
            Tap the heart on an affirmation{'\n'}to save it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(a) => a.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: insets.bottom + 110,
          }}
          renderItem={({ item }) => <FavoriteCard item={item} onRemove={remove} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#3E356E' },
  header: { paddingHorizontal: 28, paddingBottom: 16 },
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyText: {
    fontFamily: 'Quicksand_400Regular',
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  card: {
    height: 150,
    borderRadius: 26,
    overflow: 'hidden',
    marginBottom: 16,
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
  },
  cardScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.18)' },
  cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 22 },
  cardLine: {
    fontFamily: 'Quicksand_500Medium',
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 24,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  heart: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
