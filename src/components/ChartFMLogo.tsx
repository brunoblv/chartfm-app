import React from "react";
import Svg, { Rect, Defs, LinearGradient, Stop } from "react-native-svg";

export function ChartFMLogo({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 88 88" fill="none">
      <Rect width="88" height="88" rx="20" fill="url(#chartfm-logo-grad)" />
      <Rect x="22" y="50" width="10" height="20" rx="3" fill="white" opacity={0.85} />
      <Rect x="39" y="36" width="10" height="34" rx="3" fill="white" opacity={0.92} />
      <Rect x="56" y="20" width="10" height="50" rx="3" fill="white" />
      <Defs>
        <LinearGradient id="chartfm-logo-grad" x1="0" y1="0" x2="88" y2="88">
          <Stop stopColor="#FA243C" />
          <Stop offset={1} stopColor="#FF5858" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}
