import { useState } from 'react';
import supabase from '../../../config/supabaseClient';

const useInsertTask = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const insertTask = async (taskSubmission) => {
        const { taskDetails, taskType, subtasks, dataFields, setDataFields, setShowForm, setTaskDetails, setSubtasks, setShowSuccess, setShowError, setShowConfirmModal, hideModal } = taskSubmission;

        setLoading(true);
        setError(null);

        // Track changes for rollback
        let insertedTaskId = null; // Track the inserted task ID
        let insertedSubtasks = []; // Track inserted subtasks
        let insertedInstructionId = null; // Track inserted instruction ID
        let createdTableName = null; // Track the dynamically created table name
        let tableId = null; // Track the inserted table ID

        try {
            // Step 0: Check if the table already exists (for data-collection tasks)
            if (taskType === "data-collection") {
                const { data, error } = await supabase
                    .rpc('check_table_exists', { table_name: taskDetails.name });
                if (error) throw error;
                if (data.length > 0) throw new Error("Table Name already exists!");
            }

            // Step 1: Fetch the department ID based on the department name
            const { data: department, error: departmentError } = await supabase
                .from('department')
                .select('department_id')
                .eq('name', taskDetails.department) // Match the department name
                .single();

            if (!department) throw new Error('Department not found');
            // if (departmentError) throw departmentError;

            const departmentId = department.department_id;

            // Step 2: Insert the task into the `task` table with the fetched department ID
            const { data: task, error: taskError } = await supabase
                .from('task')
                .insert([
                    {
                        task_name: taskDetails.name,
                        task_type: taskType || 'general', // Default task type
                        description: taskDetails.description.trim() === '' ? null : taskDetails.description,
                        department_id: departmentId, // Use the fetched department ID
                        active: taskDetails.active || true, // Default value
                        completion_window: taskDetails.completion_window_value && taskDetails.completion_window_unit
                            ? `${taskDetails.completion_window_value} ${taskDetails.completion_window_unit}`
                            : null,
                        frequency: taskDetails.frequency_value && taskDetails.frequency_unit
                            ? `${taskDetails.frequency_value} ${taskDetails.frequency_unit}`
                            : null,
                    },
                ])
                .select('task_id') // Return the inserted task ID
                .single();

            if (taskError) throw taskError;

            insertedTaskId = task.task_id; // Track the inserted task ID

            // Step 3: Insert subtasks (if any)
            if (subtasks.length > 0) {
                const subtaskInsertions = subtasks.map((subtask) => ({
                    task_id: insertedTaskId,
                    subtask_name: subtask.subtask_name,
                    subtask_skippable: subtask.subtask_skippable || false, // Default value
                }));

                const { data: insertedSubtaskData, error: subtaskError } = await supabase
                    .from('subtask')
                    .insert(subtaskInsertions)
                    .select(); // Return inserted subtasks

                if (subtaskError) throw subtaskError;

                insertedSubtasks = insertedSubtaskData; // Track inserted subtasks
            }

            // Step 4: Insert instructions (if any)
            if (taskDetails.instructionFile) {
                const { data: instructionData, error: instructionError } = await supabase
                    .from('instructions')
                    .insert([
                        {
                            task_id: insertedTaskId,
                            description: taskDetails.instructionFile, // Assuming this is a text description
                        },
                    ])
                    .select('instruction_id') // Return the inserted instruction ID
                    .single();

                if (instructionError) throw instructionError;

                insertedInstructionId = instructionData.instruction_id; // Track inserted instruction ID
            }

            // Step 5: Handle dataFields (if any)
            if (dataFields.length > 0) {
                const tableName = taskDetails.name; // Unique table name for the task

                // Step 5.1: Insert the table name into `tables_metadata`
                const { data: tableMetadata, error: tableMetadataError } = await supabase
                    .from('tables_metadata')
                    .insert([
                        {
                            table_name: tableName,
                            created_by: null, // Assuming the current user is creating the table
                        },
                    ])
                    .select('table_id') // Return the inserted table ID
                    .single();

                // if (tableMetadataError) throw tableMetadataError;
                if (tableMetadataError) throw new Error("table meta data error")

                tableId = tableMetadata.table_id; // Track the inserted table ID

                // Step 5.2: Insert column definitions into `columns_metadata`
                const columnMetadataInsertions = dataFields.map((field) => ({
                    table_id: tableId,
                    column_name: field.name,
                    data_type: field.type, // e.g., 'text', 'number', 'date'
                    reference_table: field.referenceTable || null, // Optional: Reference table for foreign keys
                    reference_column: field.referenceColumn || null, // Optional: Reference column for foreign keys
                    soft_reference : true
                }));

                const { error: columnMetadataError } = await supabase
                    .from('columns_metadata')
                    .insert(columnMetadataInsertions);

                if (columnMetadataError) throw columnMetadataError;
                if (columnMetadataError) throw new Error("columns meta data error");

                // Step 5.3: Create the table dynamically using the RPC function
                const { error: tableError } = await supabase.rpc('create_dynamic_table', {
                    table_name: tableName, // Only the table name is needed
                });

                if (tableError) throw tableError;
                // if (tableError) throw new Error("table creating error");

                createdTableName = tableName; // Track the created table name
            }

            console.log('Task inserted successfully!');
            setShowForm(false);

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
            setDataFields([]);
            hideModal();
            setShowConfirmModal(false);

            // Show success popup
            setShowSuccess({ state: true, message: "Task inserted successfully!" });

        } catch (err) {
            // Rollback changes if any step fails
            console.error('Error inserting task:', err);
            console.log(err);


            // Rollback Step 5: Drop the dynamically created table and delete metadata (if any)
            if (createdTableName) {
                // Drop the table
                await supabase.rpc('drop_table', { table_name: createdTableName });

                // Delete metadata entries
                if (tableId) {
                    await supabase
                        .from('columns_metadata')
                        .delete()
                        .eq('table_id', tableId);

                    await supabase
                        .from('tables_metadata')
                        .delete()
                        .eq('table_id', tableId);
                }
            }

            // Rollback Step 4: Delete the inserted instruction (if any)
            if (insertedInstructionId) {
                await supabase
                    .from('instructions')
                    .delete()
                    .eq('instruction_id', insertedInstructionId);
            }

            // Rollback Step 3: Delete inserted subtasks (if any)
            if (insertedSubtasks.length > 0) {
                await supabase
                    .from('subtask')
                    .delete()
                    .in('subtask_id', insertedSubtasks.map((subtask) => subtask.subtask_id));
            }

            // Rollback Step 2: Delete the inserted task (if any)
            if (insertedTaskId) {
                await supabase
                    .from('task')
                    .delete()
                    .eq('task_id', insertedTaskId);
            }

            // Show error message
            setError(err.message);
            hideModal();
            setShowConfirmModal(false);
            setShowError({ state: true, message: `Error inserting task:', ${err}` });
        } finally {
            setLoading(false);
        }
    };

    return { insertTask, loading, error };
};

export default useInsertTask;