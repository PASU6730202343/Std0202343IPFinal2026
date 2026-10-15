import React, { useState } from "react";
import { View, Text, TextInput, Alert, Platform, StyleSheet, ScrollView } from "react-native";
import { register } from "../api";
import MarioButton from "../components/MarioButton";
import { colors, block } from "../theme";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const notify = (title, message) => {
    if (Platform.OS === "web") window.alert(`${title}\n${message}`);
    else Alert.alert(title, message);
  };

  const onRegister = async () => {
    const name = username.trim();
    if (!/^[A-Za-z0-9_]{3,30}$/.test(name)) {
      return Alert.alert("Invalid input", "Username must be 3-30 characters (letters, numbers, underscore).");
    }
    if (password.length < 6) return Alert.alert("Invalid input", "Password must be at least 6 characters.");
    if (password !== confirm) return Alert.alert("Invalid input", "Passwords do not match.");

    setLoading(true);
    try {
      await register(name, password);
      notify("Registered!", "Your account is ready. Please log in.");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Registration failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.bg} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>NEW PLAYER</Text>
      <Text style={styles.subtitle}>⭐ Create your account ⭐</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} placeholder="Username" autoCapitalize="none" value={username} onChangeText={setUsername} />
        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} placeholder="At least 6 characters" secureTextEntry value={password} onChangeText={setPassword} />
        <Text style={styles.label}>Confirm password</Text>
        <TextInput style={styles.input} placeholder="Repeat password" secureTextEntry value={confirm} onChangeText={setConfirm} />
        <MarioButton title="✔ Register" color="green" onPress={onRegister} loading={loading} />
        <MarioButton title="Back to login" color="blue" small onPress={() => navigation.goBack()} style={{ marginTop: 10 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.sky },
  container: { padding: 20, alignItems: "center", justifyContent: "center", flexGrow: 1 },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.yellow,
    textShadowColor: colors.red,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  subtitle: { color: colors.white, fontWeight: "700", marginBottom: 16, fontSize: 16 },
  card: { ...block, backgroundColor: colors.white, padding: 16, width: "100%", maxWidth: 420 },
  label: { fontWeight: "700", marginBottom: 4, color: colors.ink },
  input: { borderWidth: 2, borderColor: colors.ink, borderRadius: 10, padding: 12, marginBottom: 12, backgroundColor: colors.cloud },
});
