import { useState, useEffect } from 'react';
import supabase from '../../../config/supabaseClient';

const useFetchTasks = (retryCount) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Fetching tasks...');
    const fetchTasks = async () => {
      try {
        // Fetch tasks with related department data
        let { data: tasks, error } = await supabase
          .from('task')
          .select(`
            task_name,
            task_type,
            status,
            created_at,
            department (
              name
            )
          `);


        if (error) {
          throw error;
        }

        // Update state with fetched tasks
        setError(null);
        setTasks(tasks);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [retryCount]);
  

  return { tasks, loading, error };
};

export default useFetchTasks;