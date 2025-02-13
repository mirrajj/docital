import { useState } from 'react';
import supabase from '../../../config/supabaseClient';

const useEditTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEditTask = async (taskId, setTaskDetails, setSubtasks,setShowError,setShowSuccess) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch the task and its subtasks 
      const { data: task, error: fetchError } = await supabase
      .from('task')
      .select(`
          *,
          subtask(*),
          department:department_id (name)
      `)
      .eq('task_id', taskId)
      .single();

      if (fetchError) {
        throw fetchError;
      }
      
      let completionValue = "";
      let completionUnit = "minutes";
      let frequencyValue = "";
      let frequencyUnit = "hours";

      if (task.completion_window && typeof task.completion_window === "string") {
        [completionValue, completionUnit] = task.completion_window.split(' ');
      }
      if (task.frequency && typeof task.frequency === "string") {
        [frequencyValue, frequencyUnit] = task.frequency.split(' ');
      }

      // Update the state with the fetched task details and subtasks
      setTaskDetails({
        name: task.task_name,
        description : task.description || '',
        department: task.department.name,
        completion_window : task.completion_window || '',
        completion_window_value : completionValue,
        completion_window_unit : completionUnit,
        frequency : task.frequency || '',
        frequency_value : frequencyValue,
        frequency_unit : frequencyUnit,
      });
     

      setSubtasks(task.subtask || []); 
      setShowSuccess({state : true, message : "Task edited successfully!"})
      return "success";

    } catch (err) {
      setError(err.message);
      setShowError({state : true, message : `${err.message}`})
      console.error('Error fetching task:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { handleEditTask, loading, error };
};

export default useEditTask;