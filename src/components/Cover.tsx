import React from "react";
import { View, Image, StyleSheet } from "react-native";
import Svg, { RadialGradient, LinearGradient, Rect, Circle, Stop, Defs } from "react-native-svg";
import { resolveMediaUrl } from "../lib/api";

export interface CoverArt {
  palette: [string, string];
  seed: number;
  imageUrl?: string;
}

export function Cover({
  cover,
  size = 56,
  rounded = 10,
}: {
  cover: CoverArt;
  size?: number;
  rounded?: number;
}) {
  const { palette, seed, imageUrl } = cover;
  const [a, b] = palette;
  const variant = seed % 5;
  const angle = seed % 360;

  if (imageUrl) {
    return (
      <Image
        source={{ uri: resolveMediaUrl(imageUrl) }}
        style={{ width: size, height: size, borderRadius: rounded }}
      />
    );
  }

  return (
    <View style={{ width: size, height: size, borderRadius: rounded, overflow: "hidden" }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform={`rotate(${angle} 0.5 0.5)`}>
            <Stop offset="0" stopColor={a} />
            <Stop offset="1" stopColor={b} />
          </LinearGradient>
          <RadialGradient id="rg" cx="35%" cy="30%" r="60%">
            <Stop offset="0" stopColor="#fff" stopOpacity={0.35} />
            <Stop offset="1" stopColor="#fff" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={size} height={size} fill="url(#cg)" />
        {variant === 0 && <Rect width={size} height={size} fill="url(#rg)" />}
        {variant === 1 && (
          <Circle cx={size / 2} cy={size / 2} r={size * 0.3} fill="#fff" opacity={0.22} />
        )}
        {variant === 4 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.35}
            stroke="#fff"
            strokeOpacity={0.3}
            strokeWidth={Math.max(1, size * 0.04)}
            fill="none"
          />
        )}
      </Svg>
    </View>
  );
}
