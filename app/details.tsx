import React from "react";
import { View, Text, StyleSheet, FlatList, Button, Alert } from "react-native";
import XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useData } from "../context/DataContext"; // Import context

export default function Details() {
  const { list } = useData(); // Get global state

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

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>Name</Text>
        <Text style={styles.headerText}>Age</Text>
        <Text style={styles.headerText}>Income</Text>
        <Text style={styles.headerText}>Address</Text>
      </View>

      {/* Data Rows */}
      {list.length === 0 ? (
        <Text style={styles.noDataText}>No data available</Text>
      ) : (
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
            </View>
          )}
        />
      )}

      {/* Download Button at the Bottom */}
      <View style={styles.buttonContainer}>
        <Button onPress={downloadExcel} title="Download as Excel" color="green" />
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
  buttonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
});
