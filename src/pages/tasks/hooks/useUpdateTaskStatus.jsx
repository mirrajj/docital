import { useState } from 'react';
import supabase from '../../../config/supabaseClient';

const useUpdateTaskStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateTaskStatus = async (taskId, checked,setShowSuccess,setShowError) => {
    setLoading(true);
    setError(null);
    console.log('Task ID:', taskId);
    console.log('Checked:', checked);

    try {
      // Update the task's active status in the database
      const { error: updateError } = await supabase
        .from('task')
        .update({ active: checked })
        .eq('task_id', taskId);

      if (updateError) {
        throw updateError;
      }

      console.log('Task status updated successfully!');
      setShowSuccess({state : true, message : "Task status updated successfully!"})
    } catch (err) {
      setError(err.message);
      console.error('Error updating task status:', err);
      setShowError({state : true, message : `${err}`})
    } finally {
      setLoading(false);
    }
  };

  return { updateTaskStatus, loading, error };
};

export default useUpdateTaskStatus;