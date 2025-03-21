import { useState, useEffect } from 'react';
import supabase from '../../../config/supabaseClient';

const useFetchTasks = (retryCount,setShowError) => {
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
            task_id,
            task_name,
            task_type,
            status,
            created_at,
            active,
            frequency,
            completion_window,
            department (
              name
            )
          `)
          .is('deleted_at', null); // Exclude soft-deleted tasks;

          if (error) {
            throw error;}
          
      

        // Update state with fetched tasks
        setError(null);
        setTasks(tasks);
        // setShowSuccess({state : true, message : "Task status updated successfully!"})
      } catch (err) {

          setError(err.message);
        
        setShowError({state : true, message : `${err}`})
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();

  }, [retryCount]);
  

  return { tasks, loading, error };
};

export default useFetchTasks;