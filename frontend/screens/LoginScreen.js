import React, { useState } from "react";
import { View, Text, TextInput, Alert, StyleSheet, ScrollView } from "react-native";
import { login } from "../api";
import MarioButton from "../components/MarioButton";
import { colors, block } from "../theme";

const DEMO_USER = "admin";
const DEMO_PASS = "password123";

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
      const msg =
        e.message === "Network request failed" || e.message === "Failed to fetch"
          ? "Cannot reach the server. Check your connection."
          : e.message;
      Alert.alert("Login failed", msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setUsername(DEMO_USER);
    setPassword(DEMO_PASS);
  };

  return (
    <ScrollView style={styles.bg} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.stars}>☁️   ⭐   ☁️</Text>
      <Text style={styles.title}>SUPER HR WORLD</Text>
      <Text style={styles.subtitle}>🍄 Employee Manager 🍄</Text>

      <View style={styles.card}>
        <View style={styles.hint}>
          <Text style={styles.hintTitle}>❓ Demo account (for examiners)</Text>
          <Text style={styles.hintText}>Username: <Text style={styles.bold}>{DEMO_USER}</Text></Text>
          <Text style={styles.hintText}>Password: <Text style={styles.bold}>{DEMO_PASS}</Text></Text>
          <MarioButton title="Fill it for me" color="yellow" small onPress={fillDemo} style={{ marginTop: 8 }} />
        </View>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <MarioButton title="▶ START" color="red" onPress={onLogin} loading={loading} />
        <MarioButton
          title="📝 New player? Register"
          color="green"
          small
          onPress={() => navigation.navigate("Register")}
          style={{ marginTop: 10 }}
        />
      </View>

      <View style={styles.ground}>
        <Text style={styles.groundText}>🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.sky },
  container: { padding: 20, alignItems: "center", justifyContent: "center", flexGrow: 1 },
  stars: { fontSize: 28, marginBottom: 4 },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.yellow,
    textShadowColor: colors.red,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    letterSpacing: 1,
    textAlign: "center",
  },
  subtitle: { color: colors.white, fontWeight: "700", marginBottom: 16, fontSize: 16 },
  card: { ...block, backgroundColor: colors.white, padding: 16, width: "100%", maxWidth: 420 },
  hint: {
    backgroundColor: "#FFF3B0",
    borderWidth: 2,
    borderColor: colors.darkYellow,
    borderStyle: "dashed",
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  hintTitle: { fontWeight: "800", marginBottom: 4, color: colors.ink },
  hintText: { color: colors.ink },
  bold: { fontWeight: "900" },
  label: { fontWeight: "700", marginBottom: 4, color: colors.ink },
  input: {
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: colors.cloud,
  },
  ground: { marginTop: 20 },
  groundText: { fontSize: 18 },
});
