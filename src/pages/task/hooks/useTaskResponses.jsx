import { useState, useCallback } from 'react';
import supabase from '@/config/supabaseClient';

export const useTaskResponses = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch responses for a specific task
    const getTaskResponses = useCallback(async (taskId) => {
        setLoading(true);
        setError(null);
        try {
            // This query would join the task_responses table with task_fields
            // to get the field labels and other information
            const { data, error } = await supabase
                .from('task_responses')
                .select(`
                    *,
                    field:field_id (id, field_label, field_type)
                `)
                .eq('task_id', taskId);

            if (error) throw error;
            
            // Process the data to make it more usable
            const processedData = data.map(response => ({
                id: response.id,
                field_id: response.field_id,
                field_label: response.field?.field_label || 'Unknown Field',
                field_type: response.field?.field_type || 'text',
                response_value: response.response_value,
                response_notes: response.response_notes,
                file_urls: response.file_urls,
                created_at: response.created_at,
                created_by: response.created_by
            }));
            
            return processedData;
        } catch (err) {
            console.error('Error fetching task responses:', err);
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        getTaskResponses,
        loading,
        error
    };
};