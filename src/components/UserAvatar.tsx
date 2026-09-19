import React, { useEffect, useRef, useState } from "react";
import { View, Text, Image, Animated } from "react-native";
import { useAppTheme } from "../theme/ThemeProvider";
import { resolveMediaUrl } from "../lib/api";
import { useTr } from "../i18n/useTr";

interface UserAvatarProps {
  name: string;
  color: string;
  imageUrl?: string | null;
  /** Avatar de moderador. Quando existe, alterna com o pessoal a cada segundo. */
  staffImageUrl?: string | null;
  size: number;
}

/** Avatar pessoal; para moderadores com avatar próprio, alterna os dois a cada segundo. */
export function UserAvatar({ name, color, imageUrl, staffImageUrl, size }: UserAvatarProps) {
  const radius = size / 2;
  const alternates = Boolean(staffImageUrl);
  const [showStaff, setShowStaff] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!alternates) return;
    const id = setInterval(() => setShowStaff((v) => !v), 1000);
    return () => clearInterval(id);
  }, [alternates]);

  useEffect(() => {
    Animated.timing(fade, { toValue: showStaff ? 1 : 0, duration: 350, useNativeDriver: true }).start();
  }, [showStaff, fade]);

  const personal = imageUrl ? (
    <Image source={{ uri: resolveMediaUrl(imageUrl) }} style={{ width: size, height: size, borderRadius: radius }} />
  ) : (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: size * 0.39 }}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );

  if (!staffImageUrl) return personal;

  return (
    <View style={{ width: size, height: size }}>
      {personal}
      <Animated.Image
        source={{ uri: resolveMediaUrl(staffImageUrl) }}
        style={{ position: "absolute", width: size, height: size, borderRadius: radius, opacity: fade }}
      />
    </View>
  );
}

export function StaffBadge() {
  const tr = useTr();
  const { colors } = useAppTheme();
  return (
    <View style={{ backgroundColor: colors.accent, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, marginLeft: 6 }}>
      <Text style={{ color: "#fff", fontSize: 9.5, fontWeight: "800", letterSpacing: 0.4 }}>{tr("Staff")}</Text>
    </View>
  );
}
