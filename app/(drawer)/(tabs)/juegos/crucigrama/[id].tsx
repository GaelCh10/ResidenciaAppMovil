import { CrucigramaGrid } from "@/components/juegos/CrucigramaGrid";
import { useLocalSearchParams } from "expo-router";
import { animales } from "./data/animales";

export default function CrucigramaJuego() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const crucigramas: any = {
    animales,

  };

  const data = crucigramas[id ?? "animales"];
  return <CrucigramaGrid {...data} />;
}
