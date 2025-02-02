import { useState } from 'react';
import supabase from '../../../config/supabaseClient';

const useEditTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEditTask = async (taskId, setTaskDetails, setSubtasks) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch the task and its subtasks 
      const { data: task, error: fetchError } = await supabase
        .from('task')
        .select(`
          *,
        subtask(*) 
        `)
        .eq('task_id', taskId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Update the state with the fetched task details and subtasks
      setTaskDetails({
        title: task.task_name,
        department: task.department_id,
        completedBy: task.completed_by || '',
        instructionFile : task.instruction || '',
      });
     

      setSubtasks(task.subtask || []); 

    } catch (err) {
      setError(err.message);
      console.error('Error fetching task:', err);
    } finally {
      setLoading(false);
    }
  };

  return { handleEditTask, loading, error };
};

export default useEditTask;