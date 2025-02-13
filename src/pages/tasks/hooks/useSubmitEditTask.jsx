import { useState } from 'react';
import supabase from '../../../config/supabaseClient';

const useSubmitEditTask = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const submitEditTask = async (editSubmission) => {
        const {
            currentTaskID,
            taskDetails,
            subtasks,
            originalSubtasks,
            setTaskDetails,
            setSubtasks,
            setShowForm,
            setShowSuccess,
            setShowError,
            setShowConfirmModal,
            hideModal,
        } = editSubmission;
    
        setLoading(true);
        setError(null);
        console.log(currentTaskID);
    
        // Track changes for rollback
        let insertedSubtasks = []; // Track newly inserted subtasks
        let updatedSubtasks = []; // Track updated subtasks
        let deletedSubtasks = []; // Track deleted subtasks
    
        try {
            // Step 1: Update the task in the `task` table
            const { error: taskError } = await supabase
                .from('task')
                .update({
                    task_name: taskDetails.name,
                    description: taskDetails.description.trim() === '' ? null : taskDetails.description,
                    completion_window: taskDetails.completion_window_value && taskDetails.completion_window_unit
                        ? `${taskDetails.completion_window_value} ${taskDetails.completion_window_unit}`
                        : null,
                    frequency: taskDetails.frequency_value && taskDetails.frequency_unit
                        ? `${taskDetails.frequency_value} ${taskDetails.frequency_unit}`
                        : null,
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
                const { data: insertedData, error: insertError } = await supabase
                    .from('subtask')
                    .insert(
                        newSubtasks.map((subtask) => ({
                            ...subtask,
                            task_id: currentTaskID, // Link to the parent task
                        }))
                    )
                    .select(); // Return inserted rows
    
                if (insertError) throw insertError;
    
                // Track inserted subtasks for rollback
                insertedSubtasks = insertedData;
            }
    
            // Step 4: Upsert existing subtasks
            if (existingSubtasks.length > 0) {
                const { data: updatedData, error: upsertError } = await supabase
                    .from('subtask')
                    .upsert(
                        existingSubtasks.map((subtask) => ({
                            ...subtask,
                            task_id: currentTaskID, // Ensure the subtask is linked to the task
                        }))
                    )
                    .select(); // Return updated rows
    
                if (upsertError) throw upsertError;
    
                // Track updated subtasks for rollback
                updatedSubtasks = updatedData;
            }
    
            // Step 5: Delete any subtasks that were removed
            const subtasksToDelete = originalSubtasks.filter(
                (original) => !subtasks.some((subtask) => subtask.subtask_id === original.subtask_id)
            );
    
            if (subtasksToDelete.length > 0) {
                const { error: deleteError } = await supabase
                    .from('subtask')
                    .delete()
                    .in('subtask_id', subtasksToDelete.map((subtask) => subtask.subtask_id));
    
                if (deleteError) throw deleteError;
    
                // Track deleted subtasks for rollback
                deletedSubtasks = subtasksToDelete;
            }
    
            console.log('Task and subtasks updated successfully!');
    
            // Hide the form
            setShowForm(false);
            hideModal();
    
            // Reset states
            setTaskDetails({
                name: "",
                department: "",
                description: "",
                active: "",
                completion_window_value: null,
                completion_window_unit: "",
                completion_window: "",
                frequency: "",
                frequency_value: null,
                frequency_unit: "",
                instructionFile: null,
            });
            setSubtasks([]);
            setShowConfirmModal(false);
            // Show success popup
            setShowSuccess({state : true, message : "Task updated successfully!"})
    
        } catch (err) {
            // Rollback changes if any step fails
            console.error('Error updating task:', err);
    
            // Rollback Step 5: Restore deleted subtasks
            if (deletedSubtasks.length > 0) {
                await supabase
                    .from('subtask')
                    .insert(deletedSubtasks);
            }
    
            // Rollback Step 4: Revert updated subtasks to their original state
            if (updatedSubtasks.length > 0) {
                await supabase
                    .from('subtask')
                    .upsert(originalSubtasks.filter((subtask) => updatedSubtasks.some((updated) => updated.subtask_id === subtask.subtask_id)));
            }
    
            // Rollback Step 3: Delete newly inserted subtasks
            if (insertedSubtasks.length > 0) {
                await supabase
                    .from('subtask')
                    .delete()
                    .in('subtask_id', insertedSubtasks.map((subtask) => subtask.subtask_id));
            }
    
            // Rollback Step 1: Revert task update (if possible)
            // Note: You may need to store the original task details for this step.
    
            // Show error message
            setError(err.message);
            setShowConfirmModal(false);
            setShowError({state : true, message : `${err}`})
        } finally {
            setLoading(false);
        }
    };

    return { submitEditTask, loading, error };
};

export default useSubmitEditTask;