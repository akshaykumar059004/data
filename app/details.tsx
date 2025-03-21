import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, Alert } from "react-native";
import { useData } from "../context/DataContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export default function Details() {
  const { list, setList } = useData();

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
          <Text style={styles.headerText}>Remove</Text>
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

            <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noDataText}>No data available</Text>}
      />

      <View style={styles.bottomButtons}>
        <Button title="Clear All Data" color="grey" onPress={clearAllData} />
        <View style={{ marginVertical: 10 }} />
        <Button title="Download as Excel" color="green" onPress={downloadExcel} />
      </View>
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
  noDataText: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 20,
    color: "gray",
  },
  deleteButton: {
    flex: 0.8,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    backgroundColor: "#FF5B61",
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  bottomButtons: {
    marginTop: "auto", 
    paddingBottom: 20,
  },
});

export default Details;
