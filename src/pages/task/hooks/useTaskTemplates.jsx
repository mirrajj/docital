import { useState, useCallback } from 'react';
import supabase from '@/config/supabaseClient';

export const useTaskTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all templates
    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('task_templates')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setTemplates(data || []);
        } catch (err) {
            console.error('Error fetching templates:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create a new template
    const createTemplate = useCallback(async (templateData) => {
        try {
            const dataToInsert = {
                ...templateData,
                fields: templateData.fields || [],
                created_at: new Date().toISOString(),
            };
    
            const { data, error } = await supabase
                .from('task_templates')
                .insert([dataToInsert])
                .select();
    
            if (error) throw error;
            await fetchTemplates(); // Refresh templates
            return data[0];
        } catch (err) {
            console.error('Error creating template:', err);
            throw err;
        }
    }, [fetchTemplates]);

    // Update an existing template
    const updateTemplate = useCallback(async (templateId, templateData) => {
        try {
            const { data, error } = await supabase
                .from('task_templates')
                .update({
                    ...templateData,
                    // updated_at: new Date().toISOString()
                })
                .eq('id', templateId)
                .select();
                
            if (error) throw error;
            await fetchTemplates(); // Refresh templates
            return data[0];
        } catch (err) {
            console.error('Error updating template:', err);
            throw err;
        }
    }, [fetchTemplates]);

    // Delete a template
    const deleteTemplate = useCallback(async (templateId) => {
        try {
            const { error } = await supabase
                .from('task_templates')
                .delete()
                .eq('id', templateId);
                
            if (error) throw error;
            
            await fetchTemplates(); // Refresh templates
            return true;
        } catch (err) {
            console.error('Error deleting template:', err);
            throw err;
        }
    }, [fetchTemplates]);

    // Add a field to a template
    const addTemplateField = useCallback(async (templateId, newField) => {
        try {
            // First get the current template
            const { data: template, error: fetchError } = await supabase
                .from('task_templates')
                .select('fields')
                .eq('id', templateId)
                .single();
                
            if (fetchError) throw fetchError;
            
            // Add the new field to the fields array
            const updatedFields = [...(template.fields || []), newField];
            
            // Update the template with the new fields array
            const { data, error } = await supabase
                .from('task_templates')
                .update({
                    fields: updatedFields,
                    // updated_at: new Date().toISOString()
                })
                .eq('id', templateId)
                .select();
                
            if (error) throw error;
            
            // Refresh templates
            await fetchTemplates();
            return data[0];
        } catch (err) {
            console.error('Error adding template field:', err);
            throw err;
        }
    }, [fetchTemplates]);

    // Update a field in a template
    const updateTemplateField = useCallback(async (templateId, fieldIndex, updatedField) => {
        try {
            // First get the current template
            const { data: template, error: fetchError } = await supabase
                .from('task_templates')
                .select('fields')
                .eq('id', templateId)
                .single();
                
            if (fetchError) throw fetchError;
            
            // Create a new fields array with the updated field
            const updatedFields = [...(template.fields || [])];
            updatedFields[fieldIndex] = updatedField;
            
            // Update the template with the modified fields array
            const { data, error } = await supabase
                .from('task_templates')
                .update({
                    fields: updatedFields,
                    updated_at: new Date().toISOString()
                })
                .eq('id', templateId)
                .select();
                
            if (error) throw error;
            
            // Refresh templates
            await fetchTemplates();
            return data[0];
        } catch (err) {
            console.error('Error updating template field:', err);
            throw err;
        }
    }, [fetchTemplates]);

    // Delete a field from a template
    const deleteTemplateField = useCallback(async (templateId, fieldIndex) => {
        try {
            // First get the current template
            const { data: template, error: fetchError } = await supabase
                .from('task_templates')
                .select('fields')
                .eq('id', templateId)
                .single();
                
            if (fetchError) throw fetchError;
            
            // Remove the field at the specified index
            const updatedFields = [...(template.fields || [])];
            updatedFields.splice(fieldIndex, 1);
            
            // Update the template with the modified fields array
            const { data, error } = await supabase
                .from('task_templates')
                .update({
                    fields: updatedFields,
                    updated_at: new Date().toISOString()
                })
                .eq('id', templateId)
                .select();
                
            if (error) throw error;
            
            // Refresh templates
            await fetchTemplates();
            return data[0];
        } catch (err) {
            console.error('Error deleting template field:', err);
            throw err;
        }
    }, [fetchTemplates]);

    // Get a specific template by ID
    const getTemplateById = useCallback(async (templateId) => {
        try {
            const { data, error } = await supabase
                .from('task_templates')
                .select('*')
                .eq('id', templateId)
                .single();
                
            if (error) throw error;
            return data;
        } catch (err) {
            console.error('Error fetching template by ID:', err);
            throw err;
        }
    }, []);

    return {
        templates,
        loading,
        error,
        fetchTemplates,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        addTemplateField,
        updateTemplateField,
        deleteTemplateField,
        getTemplateById
    };
};

export default useTaskTemplates;