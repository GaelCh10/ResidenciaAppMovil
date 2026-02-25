import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, 
        tabBarActiveTintColor: "white",
        tabBarShowLabel: false,
        tabBarStyle: { backgroundColor: "#0b1973" },
      }}
    >
      <Tabs.Screen
        name="(stack)"
        options={{
          title: "Cursos",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="footsteps-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="juegos"
        options={{
          title: "Juegos",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="game-controller-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="foro"
        options={{
          title: "Foro",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="chatbox-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="user/index"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="person-circle-outline" color={color} />
          ),
        }}
      />
    </Tabs>
  );
};
export default TabsLayout;
