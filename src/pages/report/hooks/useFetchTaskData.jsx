import { useState } from "react";
import supabase from "../../../config/supabaseClient";

const useFetchTaskData = () => {
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState(null);


    const fetchTaskData = async () => {
        setLoading(true);
        try {
          // Fetch uncompliance data with department names
            const { data: uncomplianceData, error: uncomplianceError } = await supabase
                .from('uncompliance')
                .select(`
        *,
        task:task_id (
            department:department_id (
                name
            )
        )
    `);
      
          if (uncomplianceError) throw uncomplianceError;
      
          // Fetch task completion data with department names
          const { data: completionData, error: completionError } = await supabase
            .from('task_completion')
            .select(`
              *,
              task:task_id (
                department:department_id (
                name
                )
              )
            `);
      
          if (completionError) throw completionError;
      
      
          // Combine the data for the grouped bar chart
          const combinedData = {uncomplianceData,completionData}
      
          return combinedData;
        } catch (err) {
            setError(err);
          console.error('Error fetching data:', err.message);
          return [];
        }finally{
            setLoading(false);
        }
      };

      return {fetchTaskData,loading,error};

}
export default useFetchTaskData;

