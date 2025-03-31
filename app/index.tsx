import { Text, View, Button, TextInput, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useData } from "../context/DataContext"; 
import axios from "axios";
//import Constants from "expo-constants";

//const API_URL = Constants.extra.API_URL; 


export default function Index() {
  const router = useRouter();
  const { list, setList } = useData();
  const [inputs, setInputs] = useState(["", "", "", ""]);

  const handleSubmit = async () => {
    const payload = {
      name: inputs[0],  // Extract values properly
      age: parseInt(inputs[1], 10) || 0,  // Ensure it's a number
      income: parseFloat(inputs[2]) || 0,
      address: inputs[3],
    };
    //console.log("Converted Age:", parseInt("10", 10));
   // console.log(payload);
    try {
      //console.log(inputs);
      await axios.post(``, payload,{
        headers: { "Content-Type": "application/json" }
      });
      //console.log(inputs);
      alert("User added!");
    } catch (error) {
      console.log("Error adding user:", error);
    }
  };

  function handleInputChange(text: string, index: number) {
    const updatedInputs = [...inputs];
    updatedInputs[index] = text;
    setInputs(updatedInputs);
  }

  // function addGoalHandler() {
  //   if (inputs.some((text) => text.trim() !== "")) {
  //     setList((currentList) => [
  //       ...currentList,
  //       { id: Date.now().toString(), values: [...inputs] },
  //     ]);
  //     setInputs(["", "", "", ""]);
  //   }
  // }

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
          keyboardType={index === 1 || index === 2 ? "numeric" : "default"} 
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
        <Button onPress={handleSubmit} title="Add List" />
        <View style={{ marginVertical: 10 }} />
        <Button onPress={() => router.push("/details")} title="View Data" color="blue" />
      </View>
    </View>
  );
}
