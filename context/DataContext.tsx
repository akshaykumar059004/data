import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DataContext = createContext({
  list: [],
  setList: () => {},
});

export function DataProvider({ children }) {
  const [list, setList] = useState([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true); 

  
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("savedList");
        if (storedData) {
          setList(JSON.parse(storedData)); 
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsFirstLoad(false);  
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isFirstLoad) {
      const saveData = async () => {
        try {
          await AsyncStorage.setItem("savedList", JSON.stringify(list));
        } catch (error) {
          console.error("Failed to save data:", error);
        }
      };
      saveData();
    }
  }, [list, isFirstLoad]);

  return (
    <DataContext.Provider value={{ list, setList }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
