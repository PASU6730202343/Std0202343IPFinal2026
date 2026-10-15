import React, { useState } from "react";
import { View, Text, TextInput, Alert, StyleSheet } from "react-native";
import MarioButton from "./MarioButton";
import { colors, block } from "../theme";

// Used for both adding (no `editing`) and editing an existing employee.
export default function AddEmployeeForm({ onSubmit, editing, onCancel }) {
  const [name, setName] = useState(editing ? editing.name : "");
  const [position, setPosition] = useState(editing ? editing.position : "");
  const [salary, setSalary] = useState(editing ? String(editing.salary) : "");
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
      if (!editing) {
        setName("");
        setPosition("");
        setSalary("");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.form, editing && styles.editing]}>
      <Text style={styles.title}>
        {editing ? `✏️ Edit Employee #${editing.id}` : "➕ New Player (Add Employee)"}
      </Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Position" value={position} onChangeText={setPosition} />
      <TextInput
        style={styles.input}
        placeholder="Salary"
        keyboardType="numeric"
        value={salary}
        onChangeText={setSalary}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <MarioButton
        title={editing ? "💾 Save Changes" : "Add Employee"}
        color="green"
        onPress={submit}
        loading={saving}
      />
      {editing && <MarioButton title="Cancel" color="red" small onPress={onCancel} style={{ marginTop: 10 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { ...block, backgroundColor: colors.white, padding: 14, marginBottom: 14 },
  editing: { backgroundColor: "#FFF3B0" },
  title: { fontSize: 17, fontWeight: "900", marginBottom: 10, color: colors.ink },
  input: {
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: colors.cloud,
  },
  error: { color: colors.red, fontWeight: "700", marginBottom: 8 },
});
