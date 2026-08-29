import React from "react";
import { View } from "react-native";
import Svg, { Rect, Polygon, Defs, LinearGradient, Stop } from "react-native-svg";

export function VideoClipCover({
  paletteA = "#FA243C",
  paletteB = "#FFE66D",
  seed = 0,
  width = 170,
}: {
  paletteA?: string;
  paletteB?: string;
  seed?: number;
  width?: number;
}) {
  const height = Math.round((width * 9) / 16);
  const angle = seed % 360;
  const iconSize = width * 0.18;
  const gradId = `clip-${seed}-${paletteA.replace("#", "")}`;

  return (
    <View style={{ width, height, borderRadius: 8, overflow: "hidden" }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform={`rotate(${angle} 0.5 0.5)`}>
            <Stop offset="0" stopColor={paletteA} />
            <Stop offset="1" stopColor={paletteB} />
          </LinearGradient>
        </Defs>
        <Rect width={width} height={height} fill={`url(#${gradId})`} />
        <Polygon
          points={`${width / 2 - iconSize / 2},${height / 2 - iconSize / 2} ${width / 2 + iconSize / 2},${height / 2} ${width / 2 - iconSize / 2},${height / 2 + iconSize / 2}`}
          fill="rgba(255,255,255,0.6)"
        />
      </Svg>
    </View>
  );
}
