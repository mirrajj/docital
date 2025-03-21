import { useState,useEffect } from 'react';
import supabase from '@/config/supabaseClient';

export const useTaskHistory = ({
  selectedTask,
  taskId,
  taskType,
  startDate = null,
  endDate = null,
  page = 1,
  pageSize = 10
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchTaskHistory = async () => {
      if (selectedTask.taskId === undefined) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        // First, count total rows for pagination
        let countQuery = supabase
          .from('tasks_history')
          .select('id', { count: 'exact' })
          .eq('task_id', selectedTask.taskId);
        
        // Apply date filters if provided
        if (startDate) {
          countQuery = countQuery.gte('record_date', startDate.toISOString().split('T')[0]);
        }
        if (endDate) {
          countQuery = countQuery.lte('record_date', endDate.toISOString().split('T')[0]);
        }
        
        const { count, error: countError } = await countQuery;
        
        if (countError) {
          console.log("count error");
        } 
        
        // Calculate pagination values
        const total = count || 0;
        setTotalCount(total);
        setTotalPages(Math.ceil(total / pageSize));
        
        // Query task history with pagination
        let historyQuery = supabase
          .from('tasks_history')
          .select('id, created_at, task_id, changes, record_date')
          .eq('task_id', selectedTask.taskId)
          .order('record_date', { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);
        
        // Apply date filters if provided
        if (startDate) {
          historyQuery = historyQuery.gte('record_date', startDate.toISOString().split('T')[0]);
        }
        if (endDate) {
          historyQuery = historyQuery.lte('record_date', endDate.toISOString().split('T')[0]);
        }
        
        const { data: historyResults, error: historyError } = await historyQuery;
        
        if (historyError) {
          throw historyError;
        } 
        
        // For data collection tasks, also fetch the responses
        let responseResults = [];
        if (selectedTask.taskType === 'data_collection') {
          // Get task_responses for the same task and within the same date range
          let responseQuery = supabase
            .from('task_responses')
            .select('id, created_at, task_id, response_value, response_notes')
            .eq('task_id', selectedTask.taskId);
          
          // We need to match responses to history items later,
          // so we'll get all responses and filter client-side
          const { data: responses, error: responseError } = await responseQuery;
          
          if (responseError) {
            throw new Error("data collection error");
          }
          responseResults = responses || [];
        }
        
        // Transform the data to combine history and responses
        // Now using the async version that fetches user names
        const transformedData = await transformTaskHistoryData(historyResults, responseResults);
        setHistoryData(transformedData);
      } catch (err) {
        console.error('Error fetching task history:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTaskHistory();
  }, [selectedTask, taskId, taskType, startDate, endDate, page, pageSize]);
  
  // Include the fetchUserNames function here
  
  /**
   * Function to fetch user information for user IDs in batch
   * @param {Array} userIds - Array of user IDs to fetch information for
   * @returns {Object} - Map of user IDs to user names
   */
  const fetchUserNames = async (userIds) => {
    // Remove null/undefined values and deduplicate IDs
    const validUserIds = [...new Set(userIds.filter(id => id))];
    
    // If no valid IDs, return empty map
    if (validUserIds.length === 0) {
      return {};
    }
    
    try {
      // Query the employees table for all needed user IDs at once
      const { data, error } = await supabase
        .from('employee')
        .select('id, name') // Adjust field names based on your schema
        .in('id', validUserIds);
      
      if (error) {
        console.error('Error fetching user names:', error);
        return {};
      }
      
      // Convert array to map for easier lookup
      const userMap = {};
      data.forEach(user => {
        userMap[user.id] = user.name;
      });
      
      return userMap;
    } catch (err) {
      console.error('Error in fetchUserNames:', err);
      return {};
    }
  };
  
  /**
   * Transform raw database results into a structured format with user names
   * @param {Array} historyItems - Task history items from database
   * @param {Array} responseItems - Task response items from database
   * @returns {Array} - Transformed data
   */
  const transformTaskHistoryData = async (historyItems, responseItems) => {
    // Extract all user IDs that need to be looked up
    const userIdsToFetch = [];
    
    historyItems.forEach(item => {
      const changes = item.changes || {};
      
      // Collect all user IDs that need to be fetched
      if (changes.completed_by?.value) userIdsToFetch.push(changes.completed_by.value);
      if (changes.verified_by?.value) userIdsToFetch.push(changes.verified_by.value);
    });
    
    // Fetch all user names in a single batch query
    const userNameMap = await fetchUserNames(userIdsToFetch);
    
    return historyItems.map(historyItem => {
      // Extract values from the changes JSONB field
      const changes = historyItem.changes || {};
      
      // Get user IDs from the history item
      const completedById = changes.completed_by?.value || null;
      const verifiedById = changes.verified_by?.value || null;
      
      // Look up the corresponding user names using the map
      const completedByName = completedById ? (userNameMap[completedById] || `Unknown (ID: ${completedById})`) : null;
      const verifiedByName = verifiedById ? (userNameMap[verifiedById] || `Unknown (ID: ${verifiedById})`) : null;
      
      // Find matching response by looking for closest created_at timestamp
      const matchingResponse = responseItems.length > 0
        ? responseItems.find(response => {
            const historyDate = new Date(historyItem.created_at).toDateString();
            const responseDate = new Date(response.created_at).toDateString();
            return historyDate === responseDate;
          })
        : null;
      
      // Build standard columns from history data
      return {
        id: historyItem.id,
        date: historyItem.record_date,
        createdAt: historyItem.created_at,
        // Extract actual values from nested JSON structure
        completedAt: changes.completed_at?.value || null,
        // completedBy: completedById, // Keep the ID for reference
        completedBy: completedByName, // Add the user name
        verifiedAt: changes.verified_at?.value || null,
        // verifiedBy: verifiedById, // Keep the ID for reference
        verifiedBy: verifiedByName, // Add the user name
        verificationStatus: changes.verification_status?.value || null,
        // Include response data only for data collection tasks
        data: matchingResponse ? matchingResponse.response_value : null,
        notes: matchingResponse ? matchingResponse.response_notes : null
      };
    });
  };
  
  return {
    loading,
    error,
    historyData,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      pageSize
    }
  };
};