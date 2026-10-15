import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatSalary } from "./EmployeeItem";

export default function ClusterSummary({ clusters }) {
  if (!clusters) return null;
  if (clusters.length === 0) {
    return <Text style={styles.empty}>No employees yet, so there is nothing to analyze.</Text>;
  }
  return (
    <View>
      {clusters.map((c) => (
        <View key={c.group} style={styles.card}>
          <Text style={styles.tier}>{c.group}</Text>
          <Text>Employees: {c.count}</Text>
          <Text>Average base salary: ฿ {formatSalary(c.centroid)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#eef2ff", borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#c7d2fe" },
  tier: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  empty: { color: "#555", fontStyle: "italic", marginVertical: 8 },
});
