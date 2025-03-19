import { Text, View, Button, TextInput, Alert, Platform } from "react-native";
import { useState } from "react";
import XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing"; // Make sure it's imported!

export default function Index() {
  const [inputs, setInputs] = useState(["", "", "", ""]); // Array for 4 inputs
  const [list, setList] = useState([]); // Stores list of added items

  function handleInputChange(text, index) {
    const updatedInputs = [...inputs];
    updatedInputs[index] = text;
    setInputs(updatedInputs);
  }

  function addGoalHandler() {
    const nonEmptyInputs = inputs.filter((text) => text.trim() !== "");
    if (nonEmptyInputs.length > 0) {
      setList((currentList) => [...currentList, { id: Date.now().toString(), values: [...inputs] }]);
      setInputs(["", "", "", ""]);
    }
  }

  async function downloadExcel() {
    if (list.length === 0) {
      Alert.alert("No Data", "There is no data to export.");
      return;
    }

    const dataForExcel = list.map((item) => ({
      Name: item.values[0] || "" ,
      Age : item.values[1] || "",
      Income: item.values[2] || "",
      Adress: item.values[3] || "",
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const excelFile = XLSX.write(wb, { type: "base64" });

    // Use documentDirectory instead of cacheDirectory
    const fileUri = FileSystem.documentDirectory + "data.xlsx";

    try {
      await FileSystem.writeAsStringAsync(fileUri, excelFile, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Error", "Sharing is not available on this device.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save file: " + error.message);
    }
  }
  const placeholders = ["Enter Name", "Enter Age", "Enter income", "Enter Address"];
  return (
    <View style={{ alignItems: "center", backgroundColor: "skyblue", height: 900 }}>
      <View style={{ flexDirection: "column", justifyContent: "space-between" }}>
      
{inputs.map((text, index) => (
  <TextInput
    key={index}
    onChangeText={(value) => handleInputChange(value, index)}
    value={text}
    placeholder={placeholders[index]} // Dynamically set placeholder text
    style={{ borderWidth: 2, margin: 10, width: 250, padding: 5 }}
  />
))}
        <Text style={{ margin: 5 }}></Text>
        <Button onPress={addGoalHandler} title="Add list" />
        <Text style={{ margin: 5 }}></Text>
        <Button onPress={downloadExcel} title="Download as Excel" color="green" />
      </View>

      {list.map((item) => (
        <View key={item.id} style={{ marginTop: 10, alignItems: "center" }}>
          {item.values.map((value, idx) => (
            <Text key={idx}>{value}</Text>
          ))}
        </View>
      ))}
    </View>
  );
}
