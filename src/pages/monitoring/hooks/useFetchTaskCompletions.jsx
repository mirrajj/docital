import { useState, useEffect } from 'react';
import supabase from '../../../config/supabaseClient';

const useFetchTaskCompletions = () => {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTaskCompletions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch pending tasks
      const { data: pendingTasks, error: pendingError } = await supabase
        .from('tasks')
        .select(`
          id,
          task_name,
          task_type,
          department: department_id (name)
        `)
        .eq('status', 'pending')
        .eq('active', true);

      if (pendingError) throw pendingError;
      setPendingTasks(pendingTasks);

      // Fetch task completions awaiting verification
      const { data: taskCompletions, error: completionError } = await supabase
        .from('tasks')
        .select(`*,
          department: department_id (name)`)
        .eq('verification_status', 'not_verified')
        .eq('active', true)
        .eq('status', 'completed');

      if (completionError) throw completionError;
      setCompletions(taskCompletions);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching task completions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchTaskCompletions();

    // Set up real-time subscriptions
    const tasksSubscription = supabase
      .channel('tasks-changes')
      .on('postgres_changes', 
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'tasks'
        }, 
        (payload) => {
          console.log('Change received!', payload);
          
          // Handle the change based on the event type
          if (payload.eventType === 'INSERT') {
            // For new tasks, refetch to ensure we have all related data
            fetchTaskCompletions();
          } 
          else if (payload.eventType === 'UPDATE') {
            console.log("updated event")
            const updatedTask = payload.new;
            
            // Handle task status changes
            if (updatedTask.status === 'pending') {
              // If task was moved to pending (e.g., rejected)
              fetchTaskCompletions(); // Refetch to update both lists
            } 
            else if (updatedTask.status === 'completed') {
              if (updatedTask.verification_status === 'not_verified') {
                // New task ready for verification
                fetchTaskCompletions();
              } 
              else if (updatedTask.verification_status === 'verified') {
                // Task was verified, remove from completions list
                setCompletions(prev => prev.filter(task => task.id !== updatedTask.id));
              }
            }
          } 
          else if (payload.eventType === 'DELETE') {
            // Handle deletions
            const deletedTaskId = payload.old.id;
            setPendingTasks(prev => prev.filter(task => task.id !== deletedTaskId));
            setCompletions(prev => prev.filter(task => task.id !== deletedTaskId));
          }
        })
      .subscribe();

    // Clean up subscription when component unmounts
    return () => {
      supabase.removeChannel(tasksSubscription);
    };
  }, []);

  return { pendingTasks, completions, loading, error, refetch: fetchTaskCompletions };
};

export default useFetchTaskCompletions;