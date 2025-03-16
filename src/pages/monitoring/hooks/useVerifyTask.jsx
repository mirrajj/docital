import { useState } from 'react';
import supabase from '@/config/supabaseClient';

const useVerifyTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const verifyTaskCompletion = async (completionId, userId,setShowSuccess,setShowError) => {
    setLoading(true);
    setError(null);
console.log(completionId);

    try {
      // Update the `verified` and `verified_by` columns in the `task_completion` table
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          verification_status: "verified", // Mark the task as verified
          verified_by: userId ? userId : null, // Set the user ID of the verifier
          verified_at: new Date().toISOString(), // Optionally, add a timestamp for verification
        })
        .eq('id', completionId); // Update the specific task completion

      if (updateError) {
        throw updateError;
      }

      // console.log('Task completion verified successfully!');
      setShowSuccess({state : true, message : 'Task completion verified successfully!'})
      return "success";
    } catch (err) {
      setError(err.message);
      setShowError({state : true, message : `Error verifying task completion`});
      // console.error('Error verifying task completion:', err);
      return "failed";
    } finally {
      setLoading(false);
    }
  };

  return { verifyTaskCompletion, loading, error };
};

export default useVerifyTask;