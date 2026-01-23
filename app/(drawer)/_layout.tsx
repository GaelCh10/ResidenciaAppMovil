import customDrawer from "@/components/shared/customDrawer";
import { Ionicons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import React from "react";

const DrawerLayout = () => {
  return (
    <Drawer
      drawerContent={customDrawer}
      screenOptions={{
        headerShown: false, // Ocultamos el header del drawer para usar los internos si queremos
        overlayColor: "rgba(0,0,0,0.4)",
        drawerActiveTintColor: "blue",
        sceneStyle: { backgroundColor: "white" },
      }}
    >
      {/* 1. INICIO (Lleva a los Tabs que configuramos arriba) */}
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: "Bienvenido",
          title: "LSM",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 2. AVANCE (Ahora es independiente de los tabs) */}
      <Drawer.Screen
        name="avance/index"
        options={{
          drawerLabel: "Avance",
          title: "Tus avances",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="trending-up-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 3. DICCIONARIO */}
      <Drawer.Screen
        name="diccionario"
        options={{
          drawerLabel: "Diccionario",
          title: "Diccionario",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="glasses-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 4. TRADUCTOR */}
      <Drawer.Screen
        name="traductor"
        options={{
          drawerLabel: "Traductor",
          title: "Traductor",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="language-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="admin"
        options={{
          drawerLabel: "Administrador",
          title: "Gestión",
          drawerItemStyle: { display: "flex" }, // Podrías ocultarlo visualmente si prefieres
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="shield-checkmark-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Opcional: Si quieres link directo al Foro o Juegos en el drawer aunque estén en tabs, puedes dejarlos ocultos o referenciarlos con deep link, pero por ahora déjalo limpio así */}
    </Drawer>
  );
};

export default DrawerLayout;
