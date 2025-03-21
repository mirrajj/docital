import supabase from "@/config/supabaseClient";
import { useState,useEffect} from 'react';

const useFetchAudits = (pageSize = 10, filters = {}) => {
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
  
    const fetchAudits = async (pageIndex) => {
      setLoading(true);
      try {
        // Start building the query
        let query = supabase
          .from('audit')
          .select('*, department:department_id(name)')
          .is('deleted_at',null);
        
        // Apply filters
        
        // if (filters.status) {
        //   query = query.eq('status', filters.status);
        // }
        
        if (filters.department) {
            // First, we need to join with the department table
            query = supabase
                .from('audit')
                .select('*, department:department_id(name)')
                .eq('department.name', filters.department);
                
        }
        
        if (filters.dateFrom) {
          query = query.gte('created_at', filters.dateFrom);
        }
        
        if (filters.dateTo) {
          query = query.lte('created_at', filters.dateTo);
        }
        
        // Get count first
         const { count, error: countError } = await supabase
        .from('audit')
        .select('*', { count: 'exact', head: true });
        // .is('deleted_at',null);
        setTotalCount(count);
        
        // Then get paginated data
        const from = pageIndex * pageSize;
        const to = from + pageSize - 1;
        
        const { data, error } = await query
          .order('created_at', { ascending: false })
          .range(from, to);
        
        if (error) throw error;
        setAudits(data);
        setPage(pageIndex);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching audits:', err);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchAudits(page);
    }, [page, pageSize, filters]); // Add filters to dependency array
  
    return { 
      audits, 
      loading, 
      error, 
      page, 
      setPage, 
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      pageSize 
    };
  };
  export default useFetchAudits;