import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface DataContextType {
  list: { id: string; values: string[] }[];
  setList: React.Dispatch<React.SetStateAction<{ id: string; values: string[] }[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<{ id: string; values: string[] }[]>([]);
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
  }, [list]);

  return <DataContext.Provider value={{ list, setList }}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}