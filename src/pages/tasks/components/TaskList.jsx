import React, { useState, useContext, useEffect } from 'react';
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
import TableLoadingSkeleton from '../../components/TableLoadingSkeleton';
import useUpdateTaskStatus from '../hooks/useUpdateTaskStatus';
import useDeleteTask from '../hooks/useDeleteTask';




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

    const data = {
        nodes: nodes.filter((item) =>
            item.task_name.toLowerCase().includes(search.toLowerCase())
        ),
    };

    const handleExpand = (item) => {
        if (taskName.includes(item.task_name)) {
            setTaskName(taskName.filter((t) => t !== item.task_name));
        } else {
            setTaskName([...taskName, item.task_name]);
        }
    };

    const handleRetry = () => {
        if (retryCount < maxRetries) {
            setRetryCount(retryCount + 1);
        }
    };

    const handleEditButtonClicked = async (elementID, taskID) => {
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
    }
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

                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h3 className="text-xl font-bold mb-4 text-gray-500">Confirm Task Delete</h3>
                        <p className="font-bold text-orange-400">Are you sure you want to delete this task?</p>
                        <div className="mt-4 flex justify-center gap-4">
                            <button className="btn-primary" onClick={() => handleTaskDelete(currentID)}>{deleteLoading ? <LoadingSpinner size={20} /> : "Yes, Delete"}</button>
                            <button className="border-red-400 bg-transparent text-red-400 border px-3 rounded-lg" onClick={() => { setShowConfirmModal(false) }}>Cancel</button>
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
                                <HeaderCell>Edit</HeaderCell>
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
                                        <Cell>
                                            <div onClick={() => setCurrentTaskID(item.task_id)}>
                                                {
                                                    updateLoading && currentID === item.task_id ? (<LoadingSpinner size={20} />) : (<TaskSwitch setShowError={setShowError} setShowSucess={setShowSuccess} itemID={item.task_id} checked={item.active} updateTaskStatus={updateTaskStatus} />)
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
