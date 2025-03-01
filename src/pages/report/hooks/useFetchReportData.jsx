import { useState, useEffect } from 'react';
import supabase from "../../../config/supabaseClient";

const useFetchReportData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (category, filters) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from(category).select('*');

      // Apply date range filter if provided
      if (filters.dateRange) {
        const { startDate, endDate } = filters.dateRange;
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      }

      // Apply department filter if provided
      if (filters.department) {
        query = query.eq('department_id', filters.department);
      }

      // Handle specific cases for tasks (completed vs overdue)
      if (category === 'task_completion') {
        const { data: taskData, error: taskError } = await query;

        if (taskError) throw taskError;

        // Separate completed and overdue tasks
        const completedTasks = taskData.filter((task) => task.status === 'completed');
        const overdueTasks = taskData.filter((task) => task.status === 'incomplete');

        setData({ completedTasks, overdueTasks });
        return;
      }

      // Fetch data for other categories
      const { data: fetchedData, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setData(fetchedData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
};

export default useFetchReportData;