import { useState, useEffect } from 'react';
import supabase from '../../../config/supabaseClient';

const useFetchTaskCompletions = () => {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTaskCompletions = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: pendingTasks, error:pendingError } = await supabase
        .from('tasks')
          .select(`
          task_name,
          task_type,
          department :department_id (name)
        `)
        .eq('status', 'pending')
        .eq('active', true);
        

      if (pendingError) throw pendingError;

      setPendingTasks(pendingTasks);

      // Step 1: Fetch all task completions
      const { data: taskCompletions, error: completionError } = await supabase
        .from('tasks')
        .select(`*,
          department: department_id (name)`)
        .eq('verification_status',"not_verified")
        .eq('active', true)
        .eq('status', 'completed');

      if (completionError) throw completionError;

      // Step 2: Fetch associated task and subtask data for each completion
      // const enrichedCompletions = await Promise.all(
      //   taskCompletions.map(async (completion) => {
      //     // Fetch the associated task and department name
      //     const { data: task, error: taskError } = await supabase
      //       .from('task')
      //         .select(`
      //         task_name,
      //         task_type,
      //         department:department_id (name)
      //       `)
      //       .eq('task_id', completion.task_id)
      //       .single();

      //     if (taskError) throw taskError;

      //     // Fetch subtasks if the task is of type 'checklist'
      //     let subtasks = [];
      //     if (task.task_type === 'checklist') {

      //       const { data: subtaskData, error: subtaskError } = await supabase
      //         .from('subtask')
      //         .select('subtask_name')
      //         .eq('task_id', completion.task_id);

      //       if (subtaskError) throw subtaskError;
      //       subtasks = subtaskData;
      //     }

      //     return {
      //       ...completion,
      //       task_type : task.task_type,
      //       task_name: task.task_name,
      //       department : task.department.name,
      //       subtasks: subtasks.map((subtask) => subtask.subtask_name),
      //     };
      //   })
      // );

      setCompletions(taskCompletions);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching task completions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskCompletions();
  }, []);

  return { pendingTasks,completions, loading, error, refetch: fetchTaskCompletions };
};


export default useFetchTaskCompletions;