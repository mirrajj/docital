import { useState } from 'react';
import supabase from '../../../config/supabaseClient';

const useInsertTask = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const insertTask = async (taskSubmission) => {
        const { taskDetails, taskType, subtasks, dataFields } = taskSubmission;

        setLoading(true);
        setError(null);

        try {
            // Step 1: Fetch the department ID based on the department name
            const { data: department, error: departmentError } = await supabase
                .from('department')
                .select('department_id')
                .eq('name', taskDetails.department) // Match the department name
                .single();

            if (departmentError) {
                throw departmentError;
                
            }

            if (!department) {
                throw new Error('Department not found');
            }

            const departmentId = department.department_id;

            // Step 2: Insert the task into the `task` table with the fetched department ID
            const { data: task, error: taskError } = await supabase
                .from('task')
                .insert([
                    {
                        task_name: taskDetails.title,
                        task_type: taskType || 'general', // Default task type
                        department_id: departmentId, // Use the fetched department ID
                        status: 'active', // Default status
                    },
                ])
                .select('task_id') // Return the inserted task ID
                .single();

            if (taskError) {
                throw taskError;
            }


            const taskId = task.task_id;

            // Step 2: Insert subtasks (if any)
            if (subtasks.length > 0) {
                const subtaskInsertions = subtasks.map((subtask) => ({
                    task_id: taskId,
                    subtask_name: subtask.name,
                    subtask_skippable: subtask.skippable || false, // Default value
                }));

                const { error: subtaskError } = await supabase
                    .from('subtask')
                    .insert(subtaskInsertions);

                if (subtaskError) {
                    throw subtaskError;
                }
            }

            // Step 3: Insert instructions (if any)
            if (taskDetails.instructionFile) {
                const { error: instructionError } = await supabase
                    .from('instructions')
                    .insert([
                        {
                            task_id: taskId,
                            description: taskDetails.instructionFile, // Assuming this is a text description
                        },
                    ]);

                if (instructionError) {
                    throw instructionError;
                }
            }

            // Step 4: Handle dataFields (if any)
            if (dataFields.length > 0) {
                // Create a new table for the task's data fields
                const tableName = taskDetails.title; // Unique table name for the task
                const columns = dataFields.map((field) => ({
                    name: field.name,
                    type: field.type, // e.g., 'text', 'number', 'date'
                }));

                // Create the table dynamically
                const { error: tableError } = await supabase.rpc('create_table', {
                    table_name: tableName,
                    columns: columns,
                });

                if (tableError) {
                    throw tableError;
                }
            }

            console.log('Task inserted successfully!');
        } catch (err) {
            setError(err.message);
            console.error('Error inserting task:', err);
        } finally {
            setLoading(false);
        }
    };

    return { insertTask, loading, error };
};

export default useInsertTask;