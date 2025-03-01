import { useState, useEffect } from 'react';
import supabase from '@/config/supabaseClient';

const useIncidentsData = () => {
  const [incidentsData, setIncidentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncidentsData = async () => {
      try {
           const now = new Date();
           const todayStart = new Date(now);
           todayStart.setUTCHours(0, 0, 0, 0); // Start of today in UTC
           const todayEnd = new Date(now);
           todayEnd.setUTCHours(23, 59, 59, 999); // End of today in UTC

          // Fetch incidents from the 'incidents' table for today only
          const { data, error } = await supabase
              .from('incidents')
              .select('*')
              .gte('created_at', todayStart.toISOString()) // Greater than or equal to start of today
              .lte('created_at', todayEnd.toISOString()); // Less than or equal to end of today
        
        if (error) {
          throw new Error("error fetching data");
        }
        console.log(data);
        // Format the data
        const formattedData = data.map(incident => ({
          title: incident.description,
          time: new Date(incident.created_at).toLocaleTimeString(), // Convert date to time
          severity: incident.severity,
          status: incident.is_resolved,
        }));

        setIncidentsData(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidentsData();
  }, []);

  return { incidentsData, loading, error };
};

export default useIncidentsData;