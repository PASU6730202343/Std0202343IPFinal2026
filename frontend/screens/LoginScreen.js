import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { login } from "../api";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setLoading(true);
    try {
      await login(username, password); // token only needs to live in memory
      navigation.replace("Dashboard");
    } catch (e) {
      const msg = e.message === "Network request failed" || e.message === "Failed to fetch"
        ? "Cannot reach the server. Check your connection."
        : e.message;
      Alert.alert("Login failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HR System</Text>
      <TextInput style={styles.input} placeholder="Username" autoCapitalize="none"
        value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry
        value={password} onChangeText={setPassword} />
      <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={onLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f4f6fa" },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 24 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#d0d5dd", borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: "#2563eb", padding: 14, borderRadius: 8, alignItems: "center" },
  disabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
