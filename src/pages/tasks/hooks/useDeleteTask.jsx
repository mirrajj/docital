import { useState } from 'react';
import supabase from '../../../config/supabaseClient';

const useDeleteTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteTask = async (taskId,setShowError,setShowSuccess,setShowConfirmModal) => {
    setLoading(true);
    setError(null);

    try {
      // Update the task's `deleted_at` column to the current timestamp
      const { error: updateError } = await supabase
        .from('task')
        .update({ deleted_at: new Date().toISOString() })
        .eq('task_id', taskId);

      if (updateError) {
        throw updateError;
      }

      console.log('Task deleted successfully!');
      setShowConfirmModal(false);
      setShowSuccess({state : true, message : "Task deleted successfully!"})
    } catch (err) {
      setError(err.message);
      console.error('Error deleting task:', err);
      setShowConfirmModal(false);
      setShowError({state : true, message : `${err}`})
    } finally {
      setLoading(false);
    }
  };

  return { deleteTask, loading, error };
};

export default useDeleteTask;