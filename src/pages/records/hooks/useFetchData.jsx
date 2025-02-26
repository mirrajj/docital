import { useState, useEffect } from "react";
import supabase from "../../../config/supabaseClient";


const useFetchData = (setShowError,retryCount) => {
  const [departments, setDepartments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
       console.log("fetching") 
      try {
        // Fetch departments
        const { data: departmentsData, error: departmentsError } = await supabase
          .from("department") // Replace with your departments table name
          .select("*");

        if (departmentsError) throw departmentsError;

        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from("task") // Replace with your tasks table name
          .select("*");

        if (tasksError) throw tasksError;

        // Set state
        setDepartments(departmentsData);
        setTasks(tasksData);
        setError(null);
      } catch (error) {
        setError(error.message);
        setShowError({state : true, message : `${error.message}`})
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [retryCount]);

  return { departments, tasks, loading, error };
};

export default useFetchData;