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
import { MdEdit,MdSearch,MdDeleteOutline,MdArrowDropDown,MdArrowRight } from 'react-icons/md';
import { useTheme } from '@table-library/react-table-library/theme';
import { DataContext } from '../../../utils/DataContext';
import TaskDetailsModal from './TaskDetailsModal';
import LoadingSpinner from '../../../common/LoadingSpinner';
import useEditTask from '../hooks/useEditTask';



const TaskList2 = ({ onClick, setTaskDetails, setSubtasks,setCurrentTaskID,currentID }) => {
    const { handleEditTask, loading: editLoading, error: editError } = useEditTask();
    const {showModal} = useContext(DataContext);
    const [retryCount, setRetryCount] = useState(0);
    const [search, setSearch] = useState("");
    const [taskName, setTaskName] = useState([]);
    const [nodes, setNodes] = useState([]);
    const maxRetries = 3;
    const { tasks, loading, error } = useFetchTasks(retryCount);

    useEffect(() => {
        setNodes(tasks);
        console.log("inside useEffect");
    }, [tasks]);

    const tableTheme = {
        Table: ``,
        Row: `
          background: transparent;
          font-size: 14px;
        //   color: #34a853;
          color : #9ca3af;
          font-weight: 500;
        `,
        HeaderRow: `
          font-weight: 300;
          color: #9ca3af;
          background: transparent;
        `,
        BaseCell: `
          padding: 15px 5px;
          border-bottom: 1px solid #f5f5f5;
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
    const handleEditButtonClicked = async (elementID,taskID) => {

        setCurrentTaskID(taskID);
        await handleEditTask(taskID,setTaskDetails, setSubtasks);
        if (!editLoading && !editError) {
            onClick(elementID);
            showModal();
        }
    }

    if (loading) {
        return <LoadingSpinner size={50} />;
    }

    if (error) {
        return (
            <div className="text-red-500 text-center">
                Error: {error}
                {retryCount < maxRetries && (
                    <button className="ml-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={handleRetry}>
                        Retry ({retryCount + 1}/{maxRetries})
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className='container mx-auto p-2 pt-8 bg-white rounded-lg my-8 border-2'>
            <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    id="search"
                    type="text"
                    value={search}
                    onChange={handleSearch}
                    placeholder="Search by Task"
                    className="pl-10 border-3 border-gray-300 rounded-lg outline-none text-gray-400 text-sm py-2"
                />
            </div>
            <br />

            <Table data={data} theme={theme}>
                {(tableList) => (
                    <>
                        <Header>
                            <HeaderRow>
                                <HeaderCell>Created At</HeaderCell>
                                <HeaderCell>Name</HeaderCell>
                                <HeaderCell>Type</HeaderCell>
                                <HeaderCell>Department</HeaderCell>
                                <HeaderCell>Status</HeaderCell>
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
                                        <Cell className={`${item.status === "paused" ? "text-yellow-500" : "text-primary"}`}>{item.status}</Cell>
                                        <Cell>
                                            <div className="cursor-pointer  w-fit py-1 flex items-center gap-2">
                                                {editLoading && currentID === item.task_id ? (
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
                                                                onClick={() => console.log("task deleted!")}
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

                                                {editError && (
                                                    setTimeout(() => {
                                                        (
                                                            <div className="fixed top-4 right-4 bg-red-500 text-white text-xs p-2 rounded shadow">
                                                                {editError}
                                                            </div>
                                                        );
                                                    }, 3000)
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
