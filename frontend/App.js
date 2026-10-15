import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import DashboardScreen from "./screens/DashboardScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: "HR Login" }} />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: "Employees", headerBackVisible: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
