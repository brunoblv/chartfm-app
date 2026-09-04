import React from "react";
import { View, Pressable, ViewStyle, StyleProp } from "react-native";

/**
 * Folha de baixo com fundo escuro. O fundo é `absoluteFill` e o pai é
 * `box-none`: no Android o clique do mouse (celular espelhado) caía no
 * Pressable de `flex: 1` que cobria os botões da própria folha.
 */
export function SheetScaffold({
  children,
  onClose,
  sheetStyle,
}: {
  children: React.ReactNode;
  onClose: () => void;
  sheetStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={{ flex: 1, justifyContent: "flex-end" }} pointerEvents="box-none" collapsable={false}>
      <Pressable
        accessibilityRole="button"
        onPress={onClose}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.45)" }}
      />
      <View pointerEvents="auto" collapsable={false} style={sheetStyle}>
        {children}
      </View>
    </View>
  );
}
