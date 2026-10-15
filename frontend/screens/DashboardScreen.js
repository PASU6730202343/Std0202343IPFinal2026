import React, { useCallback, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert, Platform, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import EmployeeItem from "../components/EmployeeItem";
import AddEmployeeForm from "../components/AddEmployeeForm";
import ClusterSummary from "../components/ClusterSummary";
import MarioButton from "../components/MarioButton";
import { colors } from "../theme";
import { getEmployees, addEmployee, toggleStatus, deleteEmployee, getSalaryClusters } from "../api";

export default function DashboardScreen() {
  const [employees, setEmployees] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [clusters, setClusters] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const load = useCallback(async () => {
    try {
      setEmployees(await getEmployees());
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onAdd = async (data) => {
    await addEmployee(data); // errors surface inside the form
    setClusters(null);
    await load();
  };

  const onToggle = async (id) => {
    try {
      const updated = await toggleStatus(id);
      setEmployees((list) => list.map((e) => (e.id === updated.id ? updated : e)));
    } catch (e) {
      Alert.alert("Error", e.message);
      load();
    }
  };

  const doDelete = async (id) => {
    try {
      await deleteEmployee(id);
      setEmployees((list) => list.filter((e) => e.id !== id));
      setClusters(null);
    } catch (e) {
      Alert.alert("Error", e.message);
      load();
    }
  };

  const onDelete = (employee) => {
    const message = `Delete ${employee.name}?`;
    if (Platform.OS === "web") {
      if (window.confirm(`Are you sure? ${message}`)) doDelete(employee.id);
      return;
    }
    Alert.alert("Are you sure?", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => doDelete(employee.id) },
    ]);
  };

  const onAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await getSalaryClusters();
      setClusters(res.clusters || []);
    } catch (e) {
      Alert.alert("Analysis failed", e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const header = (
    <View>
      <AddEmployeeForm onSubmit={onAdd} />
      <MarioButton title="📊 Analyze Salary Structure" color="blue" onPress={onAnalyze} disabled={analyzing} style={{ marginBottom: 12 }} />
      {analyzing && <ActivityIndicator size="large" color={colors.yellow} style={{ marginVertical: 12 }} />}
      {!analyzing && <ClusterSummary clusters={clusters} />}
      <Text style={styles.section}>🏰 Employees ({employees.length})</Text>
    </View>
  );

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={{ padding: 12 }}
      data={employees}
      keyExtractor={(e) => e.id}
      renderItem={({ item }) => <EmployeeItem employee={item} onToggle={onToggle} onDelete={onDelete} />}
      ListHeaderComponent={header}
      ListEmptyComponent={<Text style={styles.empty}>No employees found.</Text>}
      refreshing={refreshing}
      onRefresh={onRefresh}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.sky },
  section: { fontSize: 20, fontWeight: "900", marginVertical: 8, color: colors.white, textShadowColor: colors.ink, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 },
  empty: { textAlign: "center", color: colors.white, fontWeight: "700", marginTop: 12 },
});
