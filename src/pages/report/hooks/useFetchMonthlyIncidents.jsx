import { useState, useEffect } from 'react';
import supabase from '@/config/supabaseClient';

const useFetchMonthlyIncidents = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncidentsByMonth = async () => {
      try {
        // Fetch data from incidents, joined with department
        const { data, error } = await supabase
          .from('incidents')
          .select(`
            incident_id,
            created_at,
            department_id,
            department:department_id (name)
          `)
          .order('created_at', { ascending: true });

        if (error) {
          throw error;
        }

        // Initialize monthly data structure
        const months = [
          'January', 'February', 'March', 'April', 
          'May', 'June', 'July', 'August', 
          'September', 'October', 'November', 'December'
        ];

        // Initialize an object to store counts for each month and department
        const monthlyCounts = {};
        months.forEach(month => {
          monthlyCounts[month] = {
            month: month,
            cleaning: 0,
            processing: 0,
            drying: 0,
            finished: 0,
            raw: 0,
            general: 0,
          };
        });

        // Process each incident
        data.forEach(incident => {
          const createdAt = new Date(incident.created_at);
          const month = months[createdAt.getMonth()]; // Get the month name
          const departmentName = incident.department.name.toLowerCase().split(' ')[0];

          // Increment the count for the corresponding month and department
          if (monthlyCounts[month] && monthlyCounts[month][departmentName] !== undefined) {
            monthlyCounts[month][departmentName] += 1;
          }
        });
        console.log(monthlyCounts);

        // Convert the monthlyCounts object to an array
        const formattedData = months.map(month => monthlyCounts[month]);

        setChartData(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidentsByMonth();
  }, []);

  return { chartData, loading, error };
};

export default useFetchMonthlyIncidents;