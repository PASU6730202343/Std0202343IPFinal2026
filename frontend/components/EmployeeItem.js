import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MarioButton from "./MarioButton";
import { colors, block } from "../theme";

export const formatSalary = (n) => Number(n).toLocaleString("en-US");

export default function EmployeeItem({ employee, onToggle, onDelete }) {
  const active = employee.status === "Active";
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.name}>🍄 {employee.name}</Text>
        <View style={[styles.badge, active ? styles.active : styles.leave]}>
          <Text style={styles.badgeText}>{active ? "⭐ Active" : "💤 On Leave"}</Text>
        </View>
      </View>
      <Text style={styles.position}>{employee.position}</Text>
      <Text style={styles.salary}>🪙 {formatSalary(employee.salary)}</Text>
      <View style={styles.actions}>
        <MarioButton title="Toggle Status" color="blue" small onPress={() => onToggle(employee.id)} style={styles.action} />
        <MarioButton title="Delete" color="red" small onPress={() => onDelete(employee)} style={styles.action} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { ...block, backgroundColor: colors.white, padding: 14, marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" },
  name: { fontSize: 17, fontWeight: "800", color: colors.ink, flexShrink: 1, marginRight: 8 },
  position: { color: "#555", marginTop: 2, fontWeight: "600" },
  salary: { marginTop: 6, fontWeight: "900", fontSize: 16, color: colors.darkYellow },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, borderWidth: 2, borderColor: colors.ink },
  active: { backgroundColor: colors.green },
  leave: { backgroundColor: colors.orange },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: "800" },
  actions: { flexDirection: "row", marginTop: 12 },
  action: { marginRight: 10 },
});
