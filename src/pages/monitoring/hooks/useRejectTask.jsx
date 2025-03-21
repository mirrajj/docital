import { useState } from 'react';
import supabase from '@/config/supabaseClient';

const useRejectTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const rejectTaskCompletion = async (taskID, setShowSuccess, setShowError) => {
    setLoading(true);
    setError(null);
    
    try {
      // Update the task status to 'pending'
      const { data, error: updateError } = await supabase
        .from('tasks')
        .update({ 
          verification_status: 'pending',
        //   verified: false,
        //   rejected_at: new Date().toISOString(),
        //   rejected_by: userId
        })
        .eq('id', taskID);
      
      if (updateError) {
        throw updateError;
      }
      
      
      setShowSuccess('Task has been rejected and returned to pending status.');
      
      return {
        success: true,
        message: 'Task successfully rejected and returned to pending status.'
      };
    } catch (err) {
      console.error('Error rejecting task:', err);
      setError(err.message);
      setShowError('Failed to reject task. Please try again.');
      
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    rejectTaskCompletion,
    loading,
    error
  };
};

export default useRejectTask;