import { useState, useEffect } from 'react';
import supabase from '@/config/supabaseClient';

const useGetTemplateFields = (templateId) => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!templateId) {
      setFields([]);
      return;
    }

    const fetchTemplateFields = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch the template from the task_template table
        const { data, error: supabaseError } = await supabase
          .from('task_templates')
          .select('fields')
          .eq('id', templateId)
          .single(); // Use single() since we expect only one row

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        // Set the fields from the JSONB column
        setFields(data?.fields || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching template fields:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplateFields();
  }, [templateId]);

  return { fields, loading, error };
};

export default useGetTemplateFields;