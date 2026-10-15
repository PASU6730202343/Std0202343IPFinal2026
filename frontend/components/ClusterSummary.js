import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatSalary } from "./EmployeeItem";
import { colors, block } from "../theme";

const tierStyle = [
  { bg: "#C8F0C8", icon: "🟢" },
  { bg: "#FFF3B0", icon: "🟡" },
  { bg: "#FFC9C7", icon: "🔴" },
];

export default function ClusterSummary({ clusters }) {
  if (!clusters) return null;
  if (clusters.length === 0) {
    return <Text style={styles.empty}>No employees yet, so there is nothing to analyze. 🍄</Text>;
  }
  return (
    <View>
      {clusters.map((c, i) => {
        const t = tierStyle[i % tierStyle.length];
        return (
          <View key={c.group} style={[styles.card, { backgroundColor: t.bg }]}>
            <Text style={styles.tier}>{t.icon} {c.group}</Text>
            <Text style={styles.line}>👥 Employees: <Text style={styles.bold}>{c.count}</Text></Text>
            <Text style={styles.line}>🪙 Average base salary: <Text style={styles.bold}>{formatSalary(c.centroid)}</Text></Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { ...block, padding: 14, marginBottom: 10 },
  tier: { fontSize: 18, fontWeight: "900", marginBottom: 4, color: colors.ink },
  line: { color: colors.ink, marginTop: 2 },
  bold: { fontWeight: "900" },
  empty: { color: colors.white, fontWeight: "700", marginVertical: 10, textAlign: "center" },
});
