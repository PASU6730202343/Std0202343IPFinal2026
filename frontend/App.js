import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import DashboardScreen from "./screens/DashboardScreen";
import { colors } from "./theme";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: colors.red },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: "900" },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: "🍄 HR Login" }} />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: "⭐ Employees", headerBackVisible: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
