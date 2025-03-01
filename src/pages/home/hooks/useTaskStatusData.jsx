import { useState, useEffect } from 'react';
import supabase from '@/config/supabaseClient';

const useTaskStatusData = () => {
  const [chartData, setChartData] = useState([]); // For the first use case (chart)
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
        // Fetch all tasks from the 'task' table
        const { data, error } = await supabase
          .from('task')
          .select('*');

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

        // Process each task
        data.forEach(task => {
          if (task.status === 'pending') {
            statusCounts.pending.count += 1;
            chartCounts.pending += 1;
          } else if (task.status === 'completed') {
            statusCounts.completed.count += 1;
            chartCounts.completed += 1;
          } else if (task.status === 'overdue') {
            statusCounts.overdue.count += 1;
            chartCounts.overdue += 1;
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