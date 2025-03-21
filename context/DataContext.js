import React, { createContext, useContext, useState } from "react";

// ✅ Provide a default value to prevent `undefined` errors
const DataContext = createContext({
  list: [],
  setList: () => {},
});

export function DataProvider({ children }) {
  const [list, setList] = useState([]);

  return (
    <DataContext.Provider value={{ list, setList }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);

  // ✅ Add a safeguard in case `useData()` is used outside `DataProvider`
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }

  return context;
}
