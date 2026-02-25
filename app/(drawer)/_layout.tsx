import customDrawer from "@/components/shared/customDrawer";
import { Ionicons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import React from "react";

const DrawerLayout = () => {
  return (
    <Drawer
      drawerContent={customDrawer}
      screenOptions={{
        headerShown: false,
        overlayColor: "rgba(11, 25, 115, 0.4)", 
        drawerStyle: {
          backgroundColor: "#ffffff",
          width: 280,
        },

        drawerActiveTintColor: "#ffffff", 
        drawerActiveBackgroundColor: "#0b1973", 
        drawerInactiveTintColor: "#64748b", 
        drawerInactiveBackgroundColor: "transparent",

        drawerItemStyle: {
          borderRadius: 16, 
          paddingHorizontal: 8,
          marginVertical: 4,
          marginHorizontal: 16, 
        },

        drawerLabelStyle: {
          fontFamily: "WorkSans-Bold",
          fontSize: 16,
          marginLeft: -10,
        },
        sceneStyle: { backgroundColor: "white" },
      }}
    >

      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: "Inicio",
          title: "LSM",
          drawerIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="avance/index"
        options={{
          drawerLabel: "Mi Avance",
          title: "Tus avances",
          drawerIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "trending-up" : "trending-up-outline"} size={22} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="diccionario"
        options={{
          drawerLabel: "Diccionario",
          title: "Diccionario",
          drawerIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "library" : "library-outline"} size={22} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="traductor"
        options={{
          drawerLabel: "Traductor",
          title: "Traductor",
          drawerIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "language" : "language-outline"} size={22} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="admin"
        options={{
          drawerLabel: "Panel de Gestión",
          title: "Gestión",
          drawerIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "shield-checkmark" : "shield-checkmark-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;