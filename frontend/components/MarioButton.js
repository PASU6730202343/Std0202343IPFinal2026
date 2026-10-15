import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors, block } from "../theme";

const palette = {
  red: [colors.red, colors.darkRed],
  green: [colors.green, colors.darkGreen],
  blue: [colors.blue, colors.darkBlue],
  yellow: [colors.yellow, colors.darkYellow],
};

export default function MarioButton({ title, onPress, color = "red", loading, disabled, small, style }) {
  const [bg, edge] = palette[color];
  const textColor = color === "yellow" ? colors.ink : colors.white;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        { backgroundColor: bg, borderBottomColor: edge },
        small && styles.small,
        (disabled || loading) && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }, small && { fontSize: 13 }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { ...block, paddingVertical: 12, paddingHorizontal: 16, alignItems: "center", justifyContent: "center" },
  small: { paddingVertical: 7, paddingHorizontal: 12, borderWidth: 2, borderBottomWidth: 4, borderRadius: 10 },
  text: { fontWeight: "800", fontSize: 16, letterSpacing: 0.5 },
});
