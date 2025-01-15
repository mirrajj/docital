// useFetchData.js
import { useState, useEffect, useCallback } from 'react';

// Simulated getData function with dummy data
const useFetchData = async (params) => {
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return dummy data
  return {
   nodes : [
    { id: 1, title: "Drying 1", date: "02/01/2024", details: "pending", category: "drying" },
    { id: 2, title: "Drying 2", date: "02/03/2024", details: "pending", category: "drying" },
    { id: 3, title: "Drying 3", date: "02/04/2024", details: "pending", category: "drying" },
    { id: 4, title: "Drying 4", date: "03/05/2024", details: "completed", category: "drying" },
    { id: 5, title: "Cleaning1", date: "02/01/2024", details: "pending", category: "cleaning" },
    { id: 6, title: "Cleaning2", date: "03/01/2024", details: "completed", category: "cleaning" },
    { id: 7, title: "Raw Material 1", date: "02/01/2024", details: "pending", category: "rawMaterials" },
    { id: 8, title: "Raw Material 2", date: "01/01/2024", details: "completed", category: "rawMaterials" }
  ].slice(params.offset,params.limit + params.offset),
    pageInfo : { totalPages: 5}, // Total number of pages },
  };
};

// Custom hook to fetch data
// const useFetchData = (params) => {
//   const [data, setData] = useState({ nodes: [] });

//   const fetchData = useCallback(async () => {
//     const result = await getData(params);
//     setData(result);
//   }, [params]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   return data;
// };

export default useFetchData;
