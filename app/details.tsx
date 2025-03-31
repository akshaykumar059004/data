import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, Alert, TextInput, Modal } from "react-native";
import { useData } from "../context/DataContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import XLSX from "xlsx";
import axios from "axios";
//import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useFocusEffect } from "expo-router";

//const API_URL = Constants.extra.API_URL; 

export default function Details() {
  const { list, setList } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editedValues, setEditedValues] = useState([]);


  useFocusEffect(
    React.useCallback(() => {
      fetchUsers();
    }, [])
  );

  const fetchUsers = async () => {
    try {
      const response = await axios. get(`/api/data`);
      const formattedData = response.data.map((item) => ({
        id: item.id.toString(), // Ensure ID is a string
        values: [item.name, item.age, item.income, item.address], // Convert object to values array
      }));
      setList(formattedData);
      console.log(list);
    } catch (error) {
      console.log("Error fetching users:", error);
    }
  };

  const deleteItem = async (id) => {
    const updatedList = list.filter((item) => item.id !== id);
    setList(updatedList);
    try {
      await AsyncStorage.setItem("savedList", JSON.stringify(updatedList));
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const clearAllData = async () => {
    if (list.length === 0) {
      Alert.alert("No Data", "No data to clear!");
      return;
    }

    Alert.alert("Confirm", "Are you sure you want to clear all data?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          setList([]);
          try {
            await AsyncStorage.removeItem("savedList"); 
          } catch (error) {
            console.error("Failed to clear data:", error);
          }
        },
      },
    ]);
  };

  const editItem = (item) => {
    setSelectedItem(item);
    setEditedValues([...item.values]);
    setModalVisible(true);
  };

  const saveEdit = async () => {
    if (editedValues.some((text) => text.trim() === "")) {
      Alert.alert("Error", "Enter all the data.");
      return;
    }

    if (isNaN(editedValues[1]) || isNaN(editedValues[2])) {
      Alert.alert("Invalid Input", "Age and Income must be numbers.");
      return;
    }

    const updatedList = list.map((item) =>
      item.id === selectedItem.id ? { ...item, values: editedValues } : item
    );
    setList(updatedList);
    setModalVisible(false);
    try {
      await AsyncStorage.setItem("savedList", JSON.stringify(updatedList));
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  async function downloadExcel() {
    if (list.length === 0) {
      Alert.alert("No Data", "There is no data to export.");
      return;
    }

    const dataForExcel = list.map((item) => ({
      Name: item.values[0] || "",
      Age: item.values[1] || "",
      Income: item.values[2] || "",
      Address: item.values[3] || "",
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const excelFile = XLSX.write(wb, { type: "base64" });
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stored Data</Text>

      {list.length > 0 && (
        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>Name</Text>
          <Text style={styles.headerText}>Age</Text>
          <Text style={styles.headerText}>Income</Text>
          <Text style={styles.headerText}>Address</Text>
          <Text style={styles.headerText}>Actions</Text>
        </View>
      )}

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            {item.values.map((value, index) => (
              <Text key={index} style={styles.cell}>
                {value} 
              </Text>
            ))}
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={() => editItem(item)} style={styles.editButton}>
                <Text>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.deleteButton}>
                <Text>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>No data available</Text>}
      />

      <View style={styles.bottomButtons}>
        <Button title="Clear All Data" color="grey" onPress={clearAllData} />
        <View style={{ marginVertical: 10 }} />
        <Button title="Download as Excel" color="green" onPress={downloadExcel} />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Data</Text>
            {editedValues.map((value, index) => (
              <TextInput
                key={index}
                style={styles.input}
                value={editedValues[index]}
                onChangeText={(text) => {
                  const newValues = [...editedValues];
                  newValues[index] = text;
                  setEditedValues(newValues);
                }}
                keyboardType={index === 1 || index === 2 ? "numeric" : "default"}
              />
            ))}
            <Button title="Save" onPress={saveEdit} />
            <Text></Text>
            <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 5,
  },
  headerText: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: "center",
  },
  cell: {
    flex: 1,
    textAlign: "center",
  },
  editButton: {
    backgroundColor: "skyblue",
    padding: 5,
    borderRadius: 5,
    marginBottom: 5,
  },
  deleteButton: {
    backgroundColor: "#FF5B61",
    padding: 5,
    borderRadius: 5,
  },
  bottomButtons: {
    backgroundColor: "#FF5B61",
    padding: 5,
    borderRadius: 5,
  },
  actionButtons: {
    backgroundColor: "#FF5B61",
    padding: 5,
    borderRadius: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
});

