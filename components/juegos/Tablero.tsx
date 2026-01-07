import { View } from "react-native";
import { MemoBlock } from "./MemoBlock";

export const Tablero = ({ memoBlocks, handleMemoClick }: any) => (
  <View className="flex-row flex-wrap justify-center w-80 h-80 bg-primary/20 rounded-2xl p-2">
    {memoBlocks.map((b: any) => (
      <MemoBlock key={b.index} memoBlock={b} handleMemoClick={handleMemoClick} />
    ))}
  </View>
);
