import React, { useState, useContext, useEffect,useMemo,useCallback } from 'react';
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
import useFetchTasks from '../hooks/useFetchTasks';
import { MdEdit, MdSearch, MdDeleteOutline, MdArrowDropDown, MdArrowRight } from 'react-icons/md';
import { useTheme } from '@table-library/react-table-library/theme';
import { DataContext } from '../../../utils/DataContext';
import TaskDetailsModal from './TaskDetailsModal';
import LoadingSpinner from '../../../common/LoadingSpinner';
import TaskSwitch from './TaskSwitch';
import useEditTask from '../hooks/useEditTask';
import TableLoadingSkeleton from '../../generalComponents/TableLoadingSkeleton';
import useUpdateTaskStatus from '../hooks/useUpdateTaskStatus';
import useDeleteTask from '../hooks/useDeleteTask';
import supabase from '@/config/supabaseClient';




const TaskList2 = ({ onClick,
    step,
    setStep, 
    setTaskDetails, 
    setSubtasks, 
    setCurrentTaskID, 
    setShowError, 
    setShowSuccess, 
    currentID, 
    setShowForm, 
    setDataFields }) => {


    const { handleEditTask, loading: editLoading, error: editError } = useEditTask();
    const { updateTaskStatus, loading: updateLoading, error: updateError } = useUpdateTaskStatus();
    const { deleteTask, loading: deleteLoading, error: deleteError } = useDeleteTask();
    const { showModal } = useContext(DataContext);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [search, setSearch] = useState("");
    const [taskName, setTaskName] = useState([]);
    const [nodes, setNodes] = useState([]);
    const maxRetries = 3;
    const { tasks, loading, error } = useFetchTasks(retryCount, setShowError);

    useEffect(() => {
        setNodes(tasks);
        console.log("inside useEffect");
    }, [tasks, retryCount]);

    //subcribing to real time changes 
    useEffect(() => {
        const channel = supabase
        .channel("task-update-channel")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "task" },
          (payload) => {
            // Use functional update to prevent stale state issues
            setNodes(prevNodes => 
                prevNodes.map(task => 
                    task.task_id === payload.new.task_id ? {...task, active: payload.new.active} : task
                )
            );
        }
        )
        .subscribe();
  
      return () => {
        supabase.removeChannel(channel); // Cleanup subscription
      };
    },[])

    // console.log(nodes);


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
    
    const theme = useTheme([tableTheme]);

    const handleSearch = (event) => {
        setSearch(event.target.value);
    };

    const data = useMemo(() => {
       return {
            nodes: nodes.filter((item) =>
                item.task_name.toLowerCase().includes(search.toLowerCase())
            ),
        }
    },[nodes]) 

    console.log(data);

    const handleExpand = useCallback((item) => {
        setTaskName(prev => {
            if (prev.includes(item.task_name)) {
                return prev.filter((t) => t !== item.task_name);
            } else {
                return [...prev, item.task_name];
            }
        });
    }, []);

    const handleRetry = useCallback(() => {
        if (retryCount < maxRetries) {
            setRetryCount(prev => prev + 1);
        }
    }, [retryCount, maxRetries]);

    const handleEditButtonClicked = useCallback(async (elementID, taskID) => {
        setCurrentTaskID(taskID);
        setStep(1);
        const response = await handleEditTask(taskID, setTaskDetails, setSubtasks, setShowError, setShowSuccess);
        if (response === "success") {
            onClick(elementID);
            showModal();
        } else {
            setCurrentTaskID(null);
            // Reset states in case of prompt edit button clicking from the creating of tasks
            setTaskDetails({
                name: "",
                department: "",
                description: "",
                active: "",
                completion_window_value: null,
                completion_window_unit: "",
                completion_window: "",
                frequency: "",
                frequency_value: null,
                frequency_unit: "",
                instructionFile: null,
            });
            setSubtasks([]);
            setDataFields([]);
            setShowForm(false);
        }
    }, [handleEditTask, setCurrentTaskID, setStep, setTaskDetails, setSubtasks, setShowError, setShowSuccess, onClick, showModal, setShowForm, setDataFields]);

    const handleTaskDelete = async (taskID) => {
        // setCurrentTaskID(taskID);
        await deleteTask(taskID, setShowError, setShowSuccess, setShowConfirmModal);
    }

    const handleDeleteButtonClicked = (taskID) => {
        setCurrentTaskID(taskID);
        setShowConfirmModal(true);
    }

    if (loading || error) {

        return (<TableLoadingSkeleton
            error = {error}
            retryCount = {retryCount}
            maxRetries = {maxRetries}
            handleRetry = {handleRetry}
            isLoading = {loading}
        />);
    }

    return (
        <div className='container mx-auto p-2 pt-3 bg-transparent my-8 border-y border-gray'>

            {showConfirmModal && (
                <div className="fixed inset-0 flex items-center justify-center z-40">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
                    <div className="bg-white dark:bg-slate-900 rounded-lg z-50 shadow-lg max-w-md w-full mx-4 overflow-hidden">
                        <div className="p-6">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-red-500"
                                    >
                                        <path d="M10.24 3.957l-8.422 14.06A1.989 1.989 0 0 0 3.518 21h16.845a1.989 1.989 0 0 0 1.7-2.983l-8.423-14.06a1.989 1.989 0 0 0-3.4 0z"></path>
                                        <path d="M12 9v4"></path>
                                        <path d="M12 17h.01"></path>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Delete Task</h3>
                                <p className="text-gray-500 dark:text-gray-400">Are you sure you want to delete this task? This action cannot be undone.</p>
                            </div>
                        </div>
                        <div className="flex items-center p-6 space-x-2 border-t border-gray-200 dark:border-gray-800">
                            <button
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-500 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-900 transition-colors"
                                onClick={() => setShowConfirmModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-900 transition-colors"
                                onClick={() => handleTaskDelete(currentID)}
                            >
                                {deleteLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Deleting...</span>
                                    </div>
                                ) : (
                                    "Delete Task"
                                )}
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
                    <div className="relative">
                        <input
                            id="search"
                            type="text"
                            value={search}
                            onChange={handleSearch}
                            placeholder="Search by task name..."
                            className="w-64 py-2 px-4 pl-10 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500 transition-all duration-200 outline-none"
                        />
                        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />

                        {search && (
                            <button
                                onClick={() => {
                                    document.getElementById('search').value = '';
                                    handleSearch({ target: { value: '' } });
                                }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label="Clear search"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
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
                            {tableList.map((item, index) => (
                                <React.Fragment key={index}>
                                    <Row>
                                        <Cell>{new Date(item.created_at).toLocaleString()}</Cell>
                                        <Cell>{item.task_name}</Cell>
                                        <Cell>{item.task_type}</Cell>
                                        <Cell>{item.department.name}</Cell>
                                        <Cell  onClick={() => setCurrentTaskID(item.task_id)}>
                                            <div>
                                                {
                                                    updateLoading && currentID === item.task_id ? (<LoadingSpinner size={20} />) : (<TaskSwitch setShowError={setShowError} setShowSucess={setShowSuccess} itemID={item.task_id} item={item} updateTaskStatus={updateTaskStatus} />)
                                                }
                                            </div>
                                        </Cell>
                                        <Cell>
                                            <div className="cursor-pointer border rounded-2xl w-fit py-1 px-1 flex items-center gap-2">
                                                {(editLoading && currentID === item.task_id) ? (
                                                    <LoadingSpinner size={20} /> // Show loading spinner
                                                ) : (
                                                    <>
                                                        <span>
                                                            <MdEdit
                                                                size="20"
                                                                id="edit"
                                                                color='#34a853'
                                                                className='hover:opacity-50'
                                                                onClick={(e) => handleEditButtonClicked(e.currentTarget.id, item.task_id)}
                                                            />
                                                        </span>
                                                        <span>
                                                            <MdDeleteOutline
                                                                size="20"
                                                                id="delete"
                                                                color='crimson'
                                                                className='hover:opacity-50'
                                                                onClick={() => handleDeleteButtonClicked(item.task_id)}
                                                            />
                                                        </span>
                                                        <span onClick={() => handleExpand(item)} className="cursor-pointer">
                                                            {taskName.includes(item.task_name) ? (
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
                                    {taskName.includes(item.task_name) && <TaskDetailsModal item={item} />}
                                </React.Fragment>
                            ))}
                        </Body>
                    </>
                )}
            </Table>
        </div>
    );
};


export default TaskList2;
