import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Image, Pressable, Linking, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { useAppTheme } from "../../theme/ThemeProvider";
import { useTr } from "../../i18n/useTr";
import { HomePlaylist } from "../../api/homeHub";
import { resolveMediaUrl } from "../../lib/api";

const AUTO_ADVANCE_MS = 6000;
/** Depois de um gesto manual, o avanço automático espera um pouco antes de voltar. */
const RESUME_AFTER_TOUCH_MS = 10000;

/** Espelha o card de playlists da Home do site: avança sozinho, mas o gesto manual tem prioridade. */
export function PlaylistsCarousel({ playlists }: { playlists: HomePlaylist[] }) {
  const { colors } = useAppTheme();
  const tr = useTr();
  const scrollRef = useRef<ScrollView>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const pausedUntil = useRef(0);
  const count = playlists.length;

  useEffect(() => {
    if (count <= 1 || width === 0) return;
    const timer = setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      setIndex((current) => {
        const next = (current + 1) % count;
        scrollRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [count, width]);

  if (count === 0) return null;

  function onScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    if (width === 0) return;
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  }

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.divider, backgroundColor: colors.surface, overflow: "hidden" }}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={count > 1}
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={() => {
          pausedUntil.current = Date.now() + RESUME_AFTER_TOUCH_MS;
        }}
        onMomentumScrollEnd={onScrollEnd}
      >
        {playlists.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => Linking.openURL(p.url)}
            accessibilityRole="link"
            accessibilityLabel={`${tr("Playlists do ChartFM")}: ${p.title}`}
            style={{ width: width || undefined, flexDirection: "row", gap: 12, padding: 12, alignItems: "center" }}
          >
            {p.coverUrl ? (
              <Image source={{ uri: resolveMediaUrl(p.coverUrl) }} style={{ width: 84, height: 84, borderRadius: 12 }} />
            ) : (
              <View style={{ width: 84, height: 84, borderRadius: 12, backgroundColor: colors.fillSubtle }} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: colors.accent, textTransform: "uppercase", letterSpacing: 0.4 }}>
                {tr("Playlists do ChartFM")}
              </Text>
              <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "700", color: colors.text, marginTop: 2 }}>
                {p.title}
              </Text>
              {!!p.description && (
                <Text numberOfLines={2} style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 2 }}>
                  {p.description}
                </Text>
              )}
              <Text style={{ fontSize: 12.5, fontWeight: "700", color: colors.accent, marginTop: 4 }}>{tr("Ouvir agora")} →</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      {count > 1 && (
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, paddingBottom: 10 }}>
          {playlists.map((p, i) => (
            <View
              key={p.id}
              style={{
                width: i === index ? 16 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === index ? colors.accent : colors.divider,
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
