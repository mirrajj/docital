import { useState, useEffect } from 'react';
import supabase from '@/config/supabaseClient';

const useDailyTaskData = () => {
    const [hourlyData, setHourlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHourlyTaskCompletionData = async () => {
            try {
                // Fetch data from task_completion, joined with task and department
                const { data, error } = await supabase
                    .from('task_completion')
                    .select(`
                        task_id,
                        completed_at,
                        task:task_id (
                            department_id,
                            department:department_id (
                                name
                            )
                        )
                     `)
                    .gte('completed_at', new Date().toISOString().split('T')[0]) // Today's data only
                    .order('completed_at', { ascending: true });

                if (error) {
                    throw error;
                }

                // Initialize hourly data structure
                const hours = [
                    '< 8 AM',
                    '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
                    '13 PM', '14 PM', '15 PM', '16 PM', '17 PM',
                    '> 17 PM',
                ];
                const departments = [
                    'cleaning', 'processing', 'drying',
                    'finishedProduct', 'rawMaterial', 'generalOffice'
                ];

                // Initialize an object to store counts for each hour and department
                const hourlyCounts = {};
                hours.forEach(hour => {
                    hourlyCounts[hour] = {
                        hour: hour,
                        cleaning: 0,
                        processing: 0,
                        drying: 0,
                        finished: 0,
                        raw: 0,
                        general: 0,
                    };
                });
                console.log(data);
                // Process each task completion
                data.forEach(taskCompletion => {
                    let hourLabel;
                    const completedAt = new Date(taskCompletion.completed_at);
                    const hour = completedAt.getHours();
                    
                    if (hour < 8) {
                        hourLabel = hours[0];
                    }else if (hour > 17) {
                        hourLabel = hours[11]
                    }else{
                        hourLabel = hours[(hour - 8) + 1]; // Map hour (8-17) to '8 AM' - '5 PM'
                    }
                    console.log(hourLabel);
                    const department = taskCompletion.task.department.name.toLowerCase().split(' ')[0];
                   

                    // Increment the count for the corresponding hour and department
                    if (hourlyCounts[hourLabel] && hourlyCounts[hourLabel][department] !== undefined) {
                        hourlyCounts[hourLabel][department] += 1;
                    }
                    
                });

                console.log(hourlyCounts);
                // Convert the hourlyCounts object to an array
                const formattedData = hours.map(hour => hourlyCounts[hour]);

                setHourlyData(formattedData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHourlyTaskCompletionData();
    }, []);

    return { hourlyData, loading, error };
};

export default useDailyTaskData;