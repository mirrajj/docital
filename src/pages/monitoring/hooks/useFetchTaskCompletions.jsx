import { useState, useEffect } from 'react';
import supabase from '../../../config/supabaseClient';

const useFetchTaskCompletions = () => {
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTaskCompletions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Fetch all task completions
      const { data: taskCompletions, error: completionError } = await supabase
        .from('task_completion')
        .select('*');

      if (completionError) throw completionError;

      // Step 2: Fetch associated task and subtask data for each completion
      const enrichedCompletions = await Promise.all(
        taskCompletions.map(async (completion) => {
          // Fetch the associated task and department name
          const { data: task, error: taskError } = await supabase
            .from('task')
              .select(`
              task_name,
              task_type,
              department:department_id (name)
            `)
            .eq('task_id', completion.task_id)
            .single();

          if (taskError) throw taskError;

          // Fetch subtasks if the task is of type 'checklist'
          let subtasks = [];
          if (task.task_type === 'checklist') {

            const { data: subtaskData, error: subtaskError } = await supabase
              .from('subtask')
              .select('subtask_name')
              .eq('task_id', completion.task_id);

            if (subtaskError) throw subtaskError;
            subtasks = subtaskData;
          }

          return {
            ...completion,
            task_type : task.task_type,
            task_name: task.task_name,
            department : task.department.name,
            subtasks: subtasks.map((subtask) => subtask.subtask_name),
          };
        })
      );

      setCompletions(enrichedCompletions);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching task completions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("use effect running")
    fetchTaskCompletions();
  }, []);

  return { completions, loading, error, refetch: fetchTaskCompletions };
};

export default useFetchTaskCompletions;