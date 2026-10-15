import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";

export default function AddEmployeeForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [salary, setSalary] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const n = name.trim();
    const p = position.trim();
    const s = Number(salary.trim());
    if (!n || !p || !salary.trim()) return Alert.alert("Invalid input", "All fields are required.");
    if (!Number.isFinite(s) || s <= 0) return Alert.alert("Invalid input", "Salary must be a number greater than 0.");
    setError("");
    setSaving(true);
    try {
      await onSubmit({ name: n, position: p, salary: s });
      setName("");
      setPosition("");
      setSalary("");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.title}>Add Employee</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Position" value={position} onChangeText={setPosition} />
      <TextInput style={styles.input} placeholder="Salary" keyboardType="numeric" value={salary} onChangeText={setSalary} />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={[styles.button, saving && { opacity: 0.6 }]} onPress={submit} disabled={saving}>
        <Text style={styles.buttonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { backgroundColor: "#fff", borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#e5e7eb" },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#d0d5dd", borderRadius: 8, padding: 10, marginBottom: 8 },
  error: { color: "#dc2626", marginBottom: 8 },
  button: { backgroundColor: "#16a34a", padding: 12, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
});
