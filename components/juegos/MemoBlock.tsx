import { TouchableOpacity, View, Text, Image } from "react-native";

export const MemoBlock = ({ memoBlock, handleMemoClick }: any) => {
  return (
    <TouchableOpacity
      className="w-16 h-16 m-1 rounded-lg bg-primary/40 justify-center items-center"
      onPress={() => handleMemoClick(memoBlock)}
      disabled={memoBlock.flipped || memoBlock.matched}
    >
      {memoBlock.flipped || memoBlock.matched ? (
        <View className={`w-full h-full justify-center items-center rounded-lg ${memoBlock.matched ? "bg-green-300" : "bg-white"}`}>
          {memoBlock.tipo === "texto" ? (
            <Text className="text-xl font-work-black text-primary">{memoBlock.texto}</Text>
          ) : (
            <Image source={{ uri: memoBlock.img }} className="w-10 h-10" />
          )}
        </View>
      ) : (
        <View className="w-full h-full bg-primary rounded-lg" />
      )}
    </TouchableOpacity>
  );
};
