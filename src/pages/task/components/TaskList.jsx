import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    Table,
    Header,
    HeaderRow,
    Body,
    Row,
    HeaderCell,
    Cell,
    useCustom,
} from "@table-library/react-table-library/table";
import { useTheme } from "@table-library/react-table-library/theme";
import { MdEdit, MdDeleteOutline, MdArrowDropDown, MdArrowRight } from "react-icons/md";
import { Edit,Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { format } from 'date-fns';
import TaskDetailsModal from './TaskDetails';
import TaskSwitch from './TaskSwitch';
import LoadingSpinner from './LoadingSpinner';

const TaskList = ({ 
    tasks, 
    loading, 
    error, 
    onEdit, 
    onDelete, 
    onUpdateStatus, 
    onSearch,
    searchQuery,
    filterOptions,
    onFilterChange,
    setShowError,
    setShowSuccess
}) => {
    const [search, setSearch] = useState(searchQuery || '');
    const [expandedTasks, setExpandedTasks] = useState([]);
    const [currentID, setCurrentID] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    // Update search when prop changes
    useEffect(() => {
        setSearch(searchQuery || '');
    }, [searchQuery]);

    // Table theme
    const tableTheme = {
        Table: `
                color : #17612B;
               font-family : sans-serif;
               background-color : white;
               border : 1px solid #e5e7eb;
               border-radius : 10px;
               margin-top : 10px;
           `,
        Row: `
             background: ;
             font-size: 12px;
           //   color: #34a853;
             color : #9ca3af;
             font-weight: 500;
           `,
        HeaderRow: `
             font-weight: 200;
             font-size : 13px;
             color : #16a34a;
             background: #e5e7eb;
             border-radius : 15px;
             border-bottom: 1px solid black;
           `,
        BaseCell: `
             padding: 15px 5px;
           //   border-bottom: 1px solid  #3b82f6 ;
             border-bottom: 1px solid  #f5f5f5 ;
           `,
    };
    
    const theme = useTheme(tableTheme);

    // Handle search input
    const handleSearch = (event) => {
        const value = event.target.value;
        setSearch(value);
        onSearch(value);
    };

    // Filter data based on search and other filters
    const data = useMemo(() => {
        if (!tasks) return { nodes: [] };
        
        return {
            nodes: tasks.filter((item) => {
                // Search filter
                const matchesSearch = 
                    item.task_name?.toLowerCase().includes(search.toLowerCase()) ||
                    item.description?.toLowerCase().includes(search.toLowerCase()) ||
                    item.document_code?.toLowerCase().includes(search.toLowerCase());
                
                // Department filter
                const matchesDepartment = !filterOptions.department || 
                    item.department_id === filterOptions.department;
                
                // Task type filter
                const matchesTaskType = !filterOptions.taskType || 
                    item.task_type === filterOptions.taskType;
                
                // Status filter
                const matchesStatus = !filterOptions.status || 
                    item.status === filterOptions.status;
                
                // Priority filter
                const matchesPriority = !filterOptions.priority || 
                    item.priority === filterOptions.priority;
                
                return matchesSearch && matchesDepartment && matchesTaskType && 
                       matchesStatus && matchesPriority;
            }),
        };
    }, [tasks, search, filterOptions]);

    // Handle expanding/collapsing task details
    const handleExpand = useCallback((item) => {
        setExpandedTasks(prev => {
            if (prev.includes(item.id)) {
                return prev.filter((id) => id !== item.id);
            } else {
                return [...prev, item.id];
            }
        });
    }, []);

    // Handle edit button click
    const handleEditButtonClicked = useCallback((action, taskId) => {
        setEditLoading(true);
        setCurrentID(taskId);
        
        // Simulate a small delay for better UX
        setTimeout(() => {
            setEditLoading(false);
            setCurrentID(null);
            onEdit(taskId);
        }, 300);
    }, [onEdit]);

    // Handle delete button click
    const handleDeleteButtonClicked = useCallback((taskId) => {
        setTaskToDelete(taskId);
        setShowConfirmModal(true);
    }, []);

    // Confirm delete action
    const confirmDelete = useCallback(async () => {
        if (!taskToDelete) return;
        
        try {
            await onDelete(taskToDelete);
            setShowConfirmModal(false);
            setTaskToDelete(null);
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
    }, [taskToDelete, onDelete, setShowSuccess, setShowError]);

    // Cancel delete action
    const cancelDelete = useCallback(() => {
        setShowConfirmModal(false);
        setTaskToDelete(null);
    }, []);

    // Update task status
    const updateTaskStatus = useCallback(async (taskId, newStatus) => {
        setUpdateLoading(true);
        setCurrentID(taskId);
        
        try {
            await onUpdateStatus(taskId, newStatus);
        } catch (error) {
            setShowError({
                state: true,
                message: `Failed to update task status: ${error.message}`
            });
        } finally {
            setUpdateLoading(false);
            setCurrentID(null);
        }
    }, [onUpdateStatus, setShowError]);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    };

    // Show loading indicator or error message
    if (loading) {
        return (
            <div className="container mx-auto p-2 pt-3 bg-transparent my-8 border-y border-gray">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size={40} />
                    <p className="ml-4 text-lg text-gray-600">Loading tasks...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-2 pt-3 bg-transparent my-8 border-y border-gray">
                <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
                    <h3 className="font-semibold mb-2">Error loading tasks</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className='container mx-auto p-2 pt-3 bg-transparent my-8 border-y border-gray'>
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                        <p className="mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button 
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                onClick={cancelDelete}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-500">Tasks Overview</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage and track your ongoing tasks</p>
                </div>

                <div className="flex items-center gap-3">
                    <Input
                        placeholder="Search tasks..."
                        value={search}
                        onChange={handleSearch}
                        className="max-w-xs"
                    />
                    
                    <Select 
                        value={filterOptions.department}
                        onValueChange={(value) => onFilterChange('department', value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {/* This would come from your departments data */}
                            <SelectItem value="dep1">Department 1</SelectItem>
                            <SelectItem value="dep2">Department 2</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    <Select 
                        value={filterOptions.taskType}
                        onValueChange={(value) => onFilterChange('taskType', value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="internal">Internal</SelectItem>
                            <SelectItem value="external">External</SelectItem>
                            <SelectItem value="compliance">Compliance</SelectItem>
                            <SelectItem value="operational">Operational</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <hr />

            <Table data={data} theme={theme}>
                {(tableList) => (
                    <>
                        <Header>
                            <HeaderRow>
                                <HeaderCell>Created At</HeaderCell>
                                <HeaderCell>Name</HeaderCell>
                                <HeaderCell>Type</HeaderCell>
                                <HeaderCell>Department</HeaderCell>
                                <HeaderCell>Active</HeaderCell>
                                <HeaderCell>Actions</HeaderCell>
                            </HeaderRow>
                        </Header>

                        <Body>
                            {tableList.map((item) => (
                                <React.Fragment key={item.id}>
                                    <Row>
                                        <Cell>{formatDate(item.created_at)}</Cell>
                                        <Cell>{item.task_name}</Cell>
                                        <Cell>{item.task_type}</Cell>
                                        <Cell>{item.department?.name || 'Unknown'}</Cell>
                                        <Cell onClick={() => setCurrentID(item.id)}>
                                            <div>
                                                {updateLoading && currentID === item.id ? (
                                                    <LoadingSpinner size={20} />
                                                ) : (
                                                    <TaskSwitch
                                                        setShowError={setShowError}
                                                        setShowSuccess={setShowSuccess}
                                                        itemID={item.id}
                                                        item={item}
                                                        updateTaskStatus={updateTaskStatus}
                                                    />
                                                )}
                                            </div>
                                        </Cell>
                                        <Cell>
                                            <div className="cursor-pointer border rounded-2xl w-fit py-1 px-1 flex items-center gap-2">
                                                {(editLoading && currentID === item.id) ? (
                                                    <LoadingSpinner size={20} />
                                                ) : (
                                                    <>
                                                        <span>
                                                            <Edit
                                                                size="16"
                                                                id="edit"
                                                                color='#34a853'
                                                                className='hover:opacity-50'
                                                                onClick={(e) => handleEditButtonClicked(e.currentTarget.id, item.id)}
                                                            />
                                                        </span>
                                                        <span>
                                                            <Trash2
                                                                size="16"
                                                                id="delete"
                                                                color='crimson'
                                                                className='hover:opacity-50'
                                                                onClick={() => handleDeleteButtonClicked(item.id)}
                                                            />
                                                        </span>
                                                        <span onClick={() => handleExpand(item)} className="cursor-pointer">
                                                            {expandedTasks.includes(item.id) ? (
                                                                <MdArrowDropDown size="20" className='hover:opacity-50' />
                                                            ) : (
                                                                <MdArrowRight size="20" className='hover:opacity-50' />
                                                            )}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </Cell>
                                    </Row>
                                    {expandedTasks.includes(item.id) && <TaskDetailsModal item={item} />}
                                </React.Fragment>
                            ))}

                            {tableList.length === 0 && (
                                <Row>
                                    <Cell colSpan={6}>
                                        <div className="flex justify-center items-center py-8 text-gray-500">
                                            {search || Object.values(filterOptions).some(val => val !== '') ? 
                                                'No tasks match the current filters' : 
                                                'No tasks found. Create a new task to get started.'}
                                        </div>
                                    </Cell>
                                </Row>
                            )}
                        </Body>
                    </>
                )}
            </Table>
        </div>
    );
};

export default TaskList;