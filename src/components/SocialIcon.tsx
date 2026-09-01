import React from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export type SocialIconName = "google" | "instagram" | "lastfm" | "x-twitter" | "spotify";

const BRAND_COLORS: Record<SocialIconName, string> = {
  google: "#4285F4",
  instagram: "#E4405F",
  lastfm: "#D51007",
  "x-twitter": "#000000",
  spotify: "#1ED760",
};

export function SocialIcon({
  name,
  size = 16,
  color,
}: {
  name: SocialIconName;
  size?: number;
  color?: string;
}) {
  return <FontAwesome6 name={name} iconStyle="brand" size={size} color={color ?? BRAND_COLORS[name]} />;
}
