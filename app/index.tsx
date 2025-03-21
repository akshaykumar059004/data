import { Text, View, Button, TextInput } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useData } from "../context/DataContext"; // Import context

export default function Index() {
  const router = useRouter();
  const { list, setList } = useData(); // Use global state
  const [inputs, setInputs] = useState(["", "", "", ""]);

  function handleInputChange(text, index) {
    const updatedInputs = [...inputs];
    updatedInputs[index] = text;
    setInputs(updatedInputs);
  }

  function addGoalHandler() {
    if (inputs.some((text) => text.trim() !== "")) {
      setList((currentList) => [
        ...currentList,
        { id: Date.now().toString(), values: [...inputs] },
      ]);
      setInputs(["", "", "", ""]);
    }
  }

  return (
    <View style={{ alignItems: "center", height: "100%", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Data Entry
      </Text>
      {["Enter Name", "Enter Age", "Enter Income", "Enter Address"].map((placeholder, index) => (
        <TextInput
          key={index}
          onChangeText={(value) => handleInputChange(value, index)}
          value={inputs[index]}
          placeholder={placeholder}
          style={{
            borderWidth: 2,
            margin: 10,
            width: 250,
            padding: 8,
            borderRadius: 5,
          }}
        />
      ))}
      <View style={{ margin: 30, width: 200, height: 90 }}>
        <Button onPress={addGoalHandler} title="Add List" />
        <View style={{ marginVertical: 10 }} />
        <Button onPress={() => router.push("/details")} title="View Data" color="blue" />
      </View>
    </View>
  );
}
