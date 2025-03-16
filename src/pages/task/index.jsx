import React, { useState, useEffect, useMemo } from 'react';
import useTaskAdmin from './hooks/useTaskAdmin';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TaskTemplateManager from './components/TaskTemplateManager';
import AppAlert from '@/common/AppAlert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom'; // Assuming you're using React Router

const Task = () => {
    // Parent component states
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [showError, setShowError] = useState({ state: false, message: '' });
    const [showSuccess, setShowSuccess] = useState({ state: false, message: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('tasks');
    const [filterOptions, setFilterOptions] = useState({
        department: '',
        taskType: '',
        status: '',
        priority: ''
    });

    const navigate = useNavigate();

    // Hook for handling API calls
    const {
        tasks,
        templates,
        loading,
        error,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        fetchTemplates
    } = useTaskAdmin();

    // Fetch tasks and templates on component mount
    useEffect(() => {
        fetchTasks();
        fetchTemplates();
    }, [fetchTasks, fetchTemplates]);

    // Check if templates exist
    const hasTemplates = useMemo(() => {
        return templates && templates.length > 0;
    }, [templates]);

    // Handlers and other functions
    const handleCreateNew = () => {
        if (!hasTemplates) {
            setShowError({
                state: true,
                message: 'You need to create a template first before creating a task.'
            });
            return;
        }
        
        setEditingTask(null);
        setShowForm(true);
    };

    const handleManageTemplates = () => {
        // Navigate to template management page
        // navigate('/templates');
        // Or you could set a state to show template management component
        setActiveTab('templates');
    };

    const handleEditTask = (taskId) => {
        const taskToEdit = tasks.find(task => task.id === taskId);
        setEditingTask(taskToEdit);
        setShowForm(true);
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTask(taskId);
            setShowSuccess({
                state: true,
                message: 'Task deleted successfully'
            });
        } catch (error) {
            setShowError({
                state: true,
                message: `Failed to delete task: ${error.message}`
            });
        }
    };

    const handleTaskSubmit = async (taskData) => {
        try {
            if (editingTask) {
                await updateTask(editingTask.id, taskData);
                setShowSuccess({
                    state: true,
                    message: 'Task updated successfully'
                });
            } else {
                await createTask(taskData);
                setShowSuccess({
                    state: true,
                    message: 'Task created successfully'
                });
            }
            setShowForm(false);
            setEditingTask(null);
        } catch (error) {
            setShowError({
                state: true,
                message: `Failed to ${editingTask ? 'update' : 'create'} task: ${error.message}`
            });
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingTask(null);
    };

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            await updateTaskStatus(taskId, { active: newStatus });
            setShowSuccess({
                state: true,
                message: `Task status updated to ${newStatus ? 'active' : 'inactive'}`
            });
        } catch (error) {
            setShowError({
                state: true,
                message: `Failed to update task status: ${error.message}`
            });
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleFilterChange = (filterName, value) => {
        setFilterOptions(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    return (
        <>
            {showError.state && (
                <AppAlert
                    type="error"
                    message={showError.message}
                    onClose={() => setShowError({ state: false, message: '' })}
                />
            )}

            {showSuccess.state && (
                <AppAlert
                    type="success"
                    message={showSuccess.message}
                    onClose={() => setShowSuccess({ state: false, message: '' })}
                />
            )}
            
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Task Administration</h1>
                <div className="flex space-x-2">
                    <Button 
                        onClick={handleManageTemplates} 
                        className="bg-gray-500 hover:bg-gray-600 text-white"
                    >
                        Manage Templates
                    </Button>
                    <Button 
                        onClick={handleCreateNew} 
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={!hasTemplates}
                    >
                        Create New Task
                    </Button>
                </div>
            </div>
            
            {/* Template Warning Message when no templates exist */}
            {!hasTemplates && !loading && (
                <div className="p-4 mb-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
                    <h3 className="font-bold">No Templates Available</h3>
                    <p>You need to create at least one task template before you can create tasks. Please use the "Manage Templates" button to create a template first.</p>
                </div>
            )}
            
            {showForm && 
                <TaskForm
                    onSubmit={handleTaskSubmit}
                    onCancel={handleCancelForm}
                    task={editingTask}
                    templates={templates}
                />
            }

            <TaskList
                tasks={tasks}
                loading={loading}
                error={error}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onUpdateStatus={handleUpdateStatus}
                onSearch={handleSearch}
                searchQuery={searchQuery}
                filterOptions={filterOptions}
                onFilterChange={handleFilterChange}
                setShowError={setShowError}
                setShowSuccess={setShowSuccess}
            />
                
                {/* Task Template Manager */}
             {activeTab === 'templates' && (

                <TaskTemplateManager
                    // templates={templates}
                    // fetchTemplates={fetchTemplates}
                    // setShowError={setShowError}
                    // setShowSuccess={setShowSuccess}
                />)}

        </>
    );
};

export default Task;