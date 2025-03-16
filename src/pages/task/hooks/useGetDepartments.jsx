import { useState, useEffect } from 'react';
import supabase from '@/config/supabaseClient';

const useGetDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        
        // Fetch departments from Supabase
        const { data, error } = await supabase
          .from('department')
          .select('department_id, name, created_at')
          .order('name', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        setDepartments(data || []);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
    
    // Optional: Set up a real-time subscription for departments
    const subscription = supabase
      .channel('departments-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'departments' 
        }, 
        (payload) => {
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            setDepartments(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setDepartments(prev => 
              prev.map(dept => dept.id === payload.new.id ? payload.new : dept)
            );
          } else if (payload.eventType === 'DELETE') {
            setDepartments(prev => 
              prev.filter(dept => dept.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Clean up subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { departments, loading, error };
};

export default useGetDepartments;