import { Button, Text, View } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "600" }}>MicroVita</Text>
      <Button
        title="Open Chatbot"
        onPress={() => navigation.navigate("Chat")}
      />
    </View>
  );
}
