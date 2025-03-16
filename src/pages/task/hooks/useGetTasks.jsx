import supabase from '@/config/supabaseClient';
import { useState, useEffect } from 'react';

const useGetTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        // Replace with your actual API endpoint
        const {data, error} = await supabase
        .from('tasks')
        .select('*')
        
        if (error) {
          throw new Error('Failed to fetch tasks');
        }
        
        
        setTasks(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return { tasks, loading, error };
};

export default useGetTasks;