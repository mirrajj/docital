import { useState, useEffect } from "react";

// Dummy data
const dummyMonitoringData = [
    {
      id: 1,
      date: "2025-01-29",
      name: "Task A",
      riskLevel: "High",
      department: "Finance",
      verified: false,
      completed: false,
    },
    {
      id: 2,
      date: "2025-01-28",
      name: "Task B",
      riskLevel: "Medium",
      department: "HR",
      verified: false,
      completed: true,
    },
    {
      id: 3,
      date: "2025-01-27",
      name: "Task C",
      riskLevel: "Low",
      department: "IT",
      verified: true,
      completed: true,
    },
  ];

// Custom hook for fetching and managing monitoring data
export const useMonitoringData = () => {
  const [monitoringData, setMonitoringData] = useState(dummyMonitoringData);

  // Simulate data fetching
  console.log("out useEffect")
  useEffect(() => {
    const fetchData = async () => {
        console.log("inside fetchData");
      // Simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setMonitoringData(dummyMonitoringData);
    };
    
    fetchData();
}, []);



  // Function to update the verification status
  const updateVerificationStatus = (id) => {
    console.log(monitoringData);
      setMonitoringData((prevData) =>
        prevData.map((task) =>
            task.id === id ? { ...task, verified: !task.verified } : task
    )
);
    console.log(monitoringData);
  };

//   console.log(monitoringData);

  return { monitoringData, updateVerificationStatus };
};
