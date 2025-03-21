import { useState, useEffect } from 'react';
import supabase from '@/config/supabaseClient';

const useTaskStatusData = () => {
  const [chartData, setChartData] = useState([]); // For the first use case (task cards)
  const [taskData, setTaskData] = useState({ // For the second use case (task status overview)
    pending: { count: 0 },
    completed: { count: 0 },
    overdue: { count: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        // Fetch all active, non-deleted tasks with needed fields for status calculation
        const { data, error } = await supabase
          .from('tasks')
          .select('status, completion_window, active_at')
          .eq('active', true)
          .is('deleted_at', null);

        if (error) {
          throw error;
        }
        
        // Initialize counters for the second use case
        const statusCounts = {
          pending: { count: 0 },
          completed: { count: 0 },
          overdue: { count: 0 },
        };

        // Initialize counters for the first use case
        const chartCounts = {
          pending: 0,
          completed: 0,
          overdue: 0,
        };

        // Get current time
        const currentTime = new Date();

        // Process each task
        data.forEach(task => {
          // Directly use 'pending' and 'completed' statuses from the database
          if (task.status === 'pending') {
            statusCounts.pending.count += 1;
            chartCounts.pending += 1;
          } else if (task.status === 'completed' || task.status === 'skipped') {
            statusCounts.completed.count += 1;
            chartCounts.completed += 1;
          } else {
            // For other statuses, determine if the task is overdue
            // by checking if current time exceeds active_at + completion_window
            if (task.active_at && task.completion_window) {
              const activeAtDate = new Date(task.active_at);
              const completionWindowHours = parseInt(task.completion_window, 10);
              
              if (!isNaN(completionWindowHours)) {
                // Calculate deadline by adding completion_window hours to active_at
                const deadlineTime = new Date(activeAtDate);
                deadlineTime.setHours(deadlineTime.getHours() + completionWindowHours);
                
                // Task is overdue if current time is past the deadline
                if (currentTime > deadlineTime) {
                  statusCounts.overdue.count += 1;
                  chartCounts.overdue += 1;
                } else {
                  // If not overdue and not completed, count as pending
                  statusCounts.pending.count += 1;
                  chartCounts.pending += 1;
                }
              } else {
                // If completion_window can't be parsed, treat as pending
                statusCounts.pending.count += 1;
                chartCounts.pending += 1;
              }
            } else {
              // If missing active_at or completion_window, treat as pending
              statusCounts.pending.count += 1;
              chartCounts.pending += 1;
            }
          }
        });

        // Format data for the first use case (chart)
        const formattedChartData = Object.keys(chartCounts).map((status, index) => ({
          status: status,
          tasks: chartCounts[status],
          fill: `hsl(var(--chart-${index + 1}))`,
        }));

        // Update states
        setChartData(formattedChartData);
        setTaskData(statusCounts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskData();
  }, []);

  return { chartData, taskData, loading, error };
};

export default useTaskStatusData;