import React, { useCallback, useState } from "react";
import { View, Text, TextInput, FlatList, ActivityIndicator, Alert, Platform, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import EmployeeItem from "../components/EmployeeItem";
import AddEmployeeForm from "../components/AddEmployeeForm";
import ClusterSummary from "../components/ClusterSummary";
import MarioButton from "../components/MarioButton";
import { colors } from "../theme";
import { getEmployees, addEmployee, updateEmployee, toggleStatus, deleteEmployee, getSalaryClusters } from "../api";

export default function DashboardScreen() {
  const [employees, setEmployees] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [clusters, setClusters] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);

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

  const onSave = async (data) => {
    await updateEmployee(editing.id, data); // errors surface inside the form
    setEditing(null);
    setClusters(null);
    await load();
  };

  const onEdit = (employee) => setEditing(employee);

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
      setEditing((cur) => (cur && cur.id === id ? null : cur));
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

  const q = search.trim().toLowerCase();
  const visible = q
    ? employees.filter((e) => e.name.toLowerCase().includes(q) || e.position.toLowerCase().includes(q))
    : employees;

  const header = (
    <View>
      {editing ? (
        <AddEmployeeForm key={editing.id} editing={editing} onSubmit={onSave} onCancel={() => setEditing(null)} />
      ) : (
        <AddEmployeeForm onSubmit={onAdd} />
      )}
      <MarioButton title="📊 Analyze Salary Structure" color="blue" onPress={onAnalyze} disabled={analyzing} style={{ marginBottom: 12 }} />
      {analyzing && <ActivityIndicator size="large" color={colors.yellow} style={{ marginVertical: 12 }} />}
      {!analyzing && <ClusterSummary clusters={clusters} />}
      <Text style={styles.section}>🏰 Employees ({q ? `${visible.length} of ${employees.length}` : employees.length})</Text>
      <TextInput
        style={styles.search}
        placeholder="🔍 Search by name or position"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />
    </View>
  );

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={visible}
      keyExtractor={(e) => e.id}
      renderItem={({ item }) => <EmployeeItem employee={item} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />}
      ListHeaderComponent={header}
      ListEmptyComponent={<Text style={styles.empty}>{q ? "No employees match your search." : "No employees found."}</Text>}
      refreshing={refreshing}
      onRefresh={onRefresh}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.sky },
  content: { padding: 12, paddingBottom: 32, width: "100%", maxWidth: 480, alignSelf: "center" },
  section: { fontSize: 20, fontWeight: "900", marginVertical: 8, color: colors.white, textShadowColor: colors.ink, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 },
  search: { borderWidth: 3, borderColor: colors.ink, borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: colors.white, fontWeight: "600" },
  empty: { textAlign: "center", color: colors.white, fontWeight: "700", marginTop: 12 },
});
