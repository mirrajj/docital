import { useState } from 'react';
import supabase from '../../../config/supabaseClient';

const useSubmitEditTask = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const submitEditTask = async (editSubmission) => {
        const {currentTaskID, taskDetails, subtasks, originalSubtasks,setTaskDetails,setSubtasks,setShowForm,setShowSuccess,hideModal} = editSubmission;
        setLoading(true);
        setError(null);
        console.log(currentTaskID);

        try {
            // Step 1: Update the task in the `task` table
            const { error: taskError } = await supabase
                .from('task')
                .update({
                    task_name: taskDetails.title,
                    //fetch task instructions from the database
                })
                .eq('task_id', currentTaskID);

            if (taskError) {
                throw taskError;
            }

            // Step 2: Separate new subtasks from existing subtasks
            const newSubtasks = subtasks.filter((subtask) => !subtask.subtask_id);
            const existingSubtasks = subtasks.filter((subtask) => subtask.subtask_id);

            // Step 3: Insert new subtasks
            if (newSubtasks.length > 0) {
                const { error: insertError } = await supabase
                    .from('subtask')
                    .insert(newSubtasks.map((subtask) => ({
                        ...subtask,
                        task_id: currentTaskID, // Link to the parent task
                    })));

                if (insertError) throw insertError;
            }

            // Step 4: Upsert existing subtasks
            if (existingSubtasks.length > 0) {
                const { error: upsertError } = await supabase
                    .from('subtask')
                    .upsert(existingSubtasks.map((subtask) => ({
                        ...subtask,
                        task_id: currentTaskID, // Ensure the subtask is linked to the task
                    })));

                if (upsertError) throw upsertError;
            }
            // Step 3: Delete any subtasks that were removed
            const deletedSubtasks = originalSubtasks.filter(
                (original) => !subtasks.some((subtask) => subtask.subtask_id === original.subtask_id)
            );

            if (deletedSubtasks.length > 0) {
                const { error: deleteError } = await supabase
                    .from('subtask')
                    .delete()
                    .in('subtask_id', deletedSubtasks.map((subtask) => subtask.subtask_id));

                if (deleteError) throw deleteError;
            }

            console.log('Task and subtasks updated successfully!');
            // Hide the form
            setShowForm(false);
            hideModal();

            // Reset states
            setTaskDetails({
                title: '',
                department: '',
                completedBy: '',
                instructionFile: null,
            });
            setSubtasks([]);

            // Show success popup
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000); // Hide after 2 seconds

        } catch (err) {
            setError(err.message);
            console.error('Error updating task:', err);
        } finally {
            setLoading(false);
        }
    };

    return { submitEditTask, loading, error };
};

export default useSubmitEditTask;