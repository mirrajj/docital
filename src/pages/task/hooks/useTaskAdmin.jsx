import { useState, useCallback, useEffect } from 'react';
import supabase from '@/config/supabaseClient';

export const useTaskAdmin = () => {
    const [tasks, setTasks] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [currentID, setCurrentID] = useState(null);

    // Fetch tasks
    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select(`
                    *,
                    department:department_id (name)
                `)
                .is('deleted_at',null)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTasks(data || []);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch templates
    const fetchTemplates = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('task_templates')
                .select('*')
                .eq('is_latest',true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTemplates(data || []);
        } catch (err) {
            console.error('Error fetching templates:', err);
        }
    }, []);

    // Create task
    const createTask = useCallback(async (taskData) => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .insert([{ 
                    ...taskData,
                    // created_at: new Date().toISOString(),
                    active_at: taskData.active ? new Date().toISOString() : null
                }])
                .select();

            if (error) throw error;
            // await fetchTasks(); // Refresh tasks
            return data[0];
        } catch (err) {
            console.error('Error creating task:', err);
            throw err;
        }
    }, [fetchTasks]);

    // Update task
    const updateTask = useCallback(async (taskId, taskData) => {
        setUpdateLoading(true);
        setCurrentID(taskId);
        try {
            const { data, error } = await supabase
                .from('tasks')
                .update({ 
                    ...taskData,
                    updated_at: new Date().toISOString(),
                    active_at: taskData.active && !tasks.find(t => t.id === taskId)?.active 
                        ? new Date().toISOString() 
                        : tasks.find(t => t.id === taskId)?.active_at
                })
                .eq('id', taskId)
                .select();

            if (error) throw error;
            await fetchTasks(); // Refresh tasks
            return data[0];
        } catch (err) {
            console.error('Error updating task:', err);
            throw err;
        } finally {
            setUpdateLoading(false);
            setCurrentID(null);
        }
    }, [fetchTasks, tasks]);

    // Delete task
    const deleteTask = useCallback(async (taskId) => {
        setDeleteLoading(true);
        setCurrentID(taskId);
        try {
            const { error } = await supabase
                .from('tasks')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', taskId);

            if (error) throw error;
            await fetchTasks(); // Refresh tasks
        } catch (err) {
            console.error('Error deleting task:', err);
            throw err;
        } finally {
            setDeleteLoading(false);
            setCurrentID(null);
        }
    }, [fetchTasks]);

    // Update task status
    const updateTaskStatus = useCallback(async (taskId, { active }) => {
        setUpdateLoading(true);
        setCurrentID(taskId);
        try {
            const { data, error } = await supabase
                .from('tasks')
                .update({ 
                    active,
                    updated_at: new Date().toISOString(),
                    active_at: active ? new Date().toISOString() : null
                })
                .eq('id', taskId)
                .select();

            if (error) throw error;
            await fetchTasks(); // Refresh tasks
            return data[0];
        } catch (err) {
            console.error('Error updating task status:', err);
            throw err;
        } finally {
            setUpdateLoading(false);
            setCurrentID(null);
        }
    }, [fetchTasks]);

    // Fetch task fields
    const fetchTaskFields = useCallback(async (templateId) => {
        try {
            const { data, error } = await supabase
                .from('task_fields')
                .select('*')
                .eq('template_id', templateId)
                .order('order', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('Error fetching task fields:', err);
            throw err;
        }
    }, []);

    // Subscribe to real-time updates
    useEffect(() => {
        const channel = supabase
            .channel("task-update-channel")
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "tasks" },
                (payload) => {
                    // Update tasks when changes occur
                    setTasks(prevTasks => 
                        prevTasks.map(task => 
                            task.id === payload.new.id ? { ...task, ...payload.new } : task
                        )
                    );
                }
            )
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "tasks" },
                (payload) => {
                    // Add new tasks when inserted
                    fetchTasks();
                }
            )
            .on(
                "postgres_changes",
                { event: "DELETE", schema: "public", table: "tasks" },
                (payload) => {
                    // Remove deleted tasks
                    setTasks(prevTasks => 
                        prevTasks.filter(task => task.id !== payload.old.id)
                    );
                }
            )
            .subscribe();

        // Clean up on component unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchTasks]);

    // Initial data load
    useEffect(() => {
        fetchTasks();
        fetchTemplates();
    }, [fetchTasks, fetchTemplates]);

    return {
        tasks,
        templates,
        loading,
        error,
        updateLoading,
        deleteLoading,
        currentID,
        fetchTasks,
        fetchTemplates,
        fetchTaskFields,
        createTask,
        updateTask,
        deleteTask,
        updateTaskStatus
    };
};

export default useTaskAdmin;