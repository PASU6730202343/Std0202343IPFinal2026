import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export const formatSalary = (n) => Number(n).toLocaleString("en-US");

export default function EmployeeItem({ employee, onToggle, onDelete }) {
  const active = employee.status === "Active";
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.name}>{employee.name}</Text>
        <View style={[styles.badge, active ? styles.active : styles.leave]}>
          <Text style={styles.badgeText}>{employee.status}</Text>
        </View>
      </View>
      <Text style={styles.position}>{employee.position}</Text>
      <Text style={styles.salary}>฿ {formatSalary(employee.salary)}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.toggle]} onPress={() => onToggle(employee.id)}>
          <Text style={styles.btnText}>Toggle Status</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.delete]} onPress={() => onDelete(employee)}>
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#e5e7eb" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 16, fontWeight: "600", flexShrink: 1 },
  position: { color: "#555", marginTop: 2 },
  salary: { marginTop: 4, fontWeight: "600" },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  active: { backgroundColor: "#16a34a" },
  leave: { backgroundColor: "#f59e0b" },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  actions: { flexDirection: "row", marginTop: 10 },
  btn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginRight: 8 },
  toggle: { backgroundColor: "#2563eb" },
  delete: { backgroundColor: "#dc2626" },
  btnText: { color: "#fff", fontWeight: "600" },
});
