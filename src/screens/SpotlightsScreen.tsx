import React from "react";
import { View, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../theme/ThemeProvider";
import { BackHeader } from "../components/BackHeader";
import { SpotlightPickerRow } from "../components/SpotlightPickerRow";
import { SpotlightKind } from "../components/ChartSpotlightCard";
import { useAppState, SpotlightCategory } from "../state/AppState";

const ORDER: SpotlightKind[] = ["flashback", "destaque", "nacional", "push", "radar"];

export function SpotlightsScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation();
  const { spotlights, setSpotlight } = useAppState();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title="Destaques" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4 }}>
        {ORDER.map((kind) => (
          <SpotlightPickerRow
            key={kind}
            kind={kind}
            value={spotlights[kind as SpotlightCategory]}
            onChange={(song) => setSpotlight(kind as SpotlightCategory, song)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
