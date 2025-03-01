import { useState, useEffect } from 'react';
import supabase from '@/config/supabaseClient';

const useUncomplianceData = () => {
  const [uncomplianceData, setUncomplianceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUncomplianceData = async () => {
      try {
        // Fetch data from the uncompliance table, joined with the department table
        const { data, error } = await supabase
          .from('uncompliance')
          .select(`
            uncompliance_id,
            created_at,
            uncompliance:task_id (
                department:department_id (
                    name
                )
            )
          `)
          .order('created_at', { ascending: true });

        if (error) {
          throw error;
        }

        // Initialize an object to store counts for each date and department
        const dateCounts = {};
        // console.log(data);
        // Process each uncompliance record
        data.forEach(record => {
          const date = new Date(record.created_at).toISOString().split('T')[0]; // Format as YYYY-MM-DD
          const departmentName = record.uncompliance.department.name.toLowerCase().replace(/\s+/g, ''); // Normalize department name

          // Initialize the date entry if it doesn't exist
          if (!dateCounts[date]) {
            dateCounts[date] = { date };
          }

          // Initialize the department count if it doesn't exist
          if (!dateCounts[date][departmentName]) {
            dateCounts[date][departmentName] = 0;
          }

          // Increment the count for the corresponding date and department
          dateCounts[date][departmentName] += 1;
        });

        // Convert the dateCounts object to an array
        const formattedData = Object.values(dateCounts);

        setUncomplianceData(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUncomplianceData();
  }, []);

  return { uncomplianceData, loading, error };
};

export default useUncomplianceData;
