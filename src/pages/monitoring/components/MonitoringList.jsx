import React, { useEffect, useState, useCallback } from 'react';
import { useTheme } from '@table-library/react-table-library/theme';
import VerifyButton from './VerifyButton';
import useFetchTaskCompletions from '../hooks/useFetchTaskCompletions';
import { MdArrowRight, MdArrowDropDown } from 'react-icons/md';
import MonitoringDetailsModal from './MonitoringDetailsModal';
import { format } from 'date-fns';

import {
    Table,
    Header,
    HeaderRow,
    Body,
    Row,
    HeaderCell,
    Cell,
} from "@table-library/react-table-library/table";
import {
    useSort,
    HeaderCellSort,
    SortIconPositions,
    SortToggleType,
} from "@table-library/react-table-library/sort";
import useVerifyTask from '../hooks/useVerifyTask';


const MonitoringList = ({ setShowError, setShowSuccess }) => {
    const [nodes, setNodes] = useState([]);
    const [pendingNodes, setPendingNodes] = useState([]);
    const [taskName, setTaskName] = useState([]);
    const [pendingTaskName, setPendingTaskName] = useState([]);
    const [currentTaskID, setCurrentTaskID] = useState(null);
    const [userID, setUserID] = useState(null); //for capturing the id of the user who verified the task

    // Destructure both completions and pendingTasks from the hook
    const { completions, pendingTasks, loading, error, refetch } = useFetchTaskCompletions();
    const { verifyTaskCompletion, loading: verifyLoading, error: verifyError } = useVerifyTask();

    useEffect(() => {
        console.log("inside useEffect for completions");
        setNodes(completions);
    }, [completions]);

    useEffect(() => {
        console.log("inside useEffect for pending tasks");
        setPendingNodes(pendingTasks);
    }, [pendingTasks]);

    // console.log(nodes);
    // console.log(pendingNodes);

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
          color : #9ca3af;
          font-weight: 500;
  
          @media (min-width : 1024px) {
           &:nth-of-type(odd) {
            background-color: ;
          }
  
          &:nth-of-type(even) {
            background-color: ;
          }
            }
        `,
        HeaderRow: `
                 font-weight: 300;
               /  font-weight: 200;
          font-size : 13px;
          color : #16a34a;
          background: #e5e7eb;
          border-radius : 15px;
          border-bottom: 1px solid black;
               `,
        BaseCell: `
          padding : 12px 5px;
          border-bottom: 2px solid  #f5f5f5 ;
        `
    };

    const theme = useTheme([tableTheme]);

    const data = { nodes };
    const pendingData = { nodes: pendingNodes };

    const sort = useSort(
        data,
        {
            onChange: onSortChange,
        },
        {
            sortToggleType: SortToggleType.AlternateWithReset,
            sortFns: {
                DATE: (array) => array.sort((a, b) => a.completed_at.localeCompare(b.completed_at)),
                NAME: (array) => array.sort((a, b) => a.task_name.localeCompare(b.task_name)),
                DEPARTMENT: (array) => array.sort((a, b) => a.department.localeCompare(b.department)),
                RISK_LEVEL: (array) => array.sort((a, b) => a.risk_level - b.risk_level),
                COMPLETED: (array) => array.sort((a, b) => a.completed - b.completed),
            },
        }
    );

    const handleExpand = (item) => {
        if (taskName.includes(item.task_name)) {
            setTaskName(taskName.filter((t) => t !== item.task_name));
        } else {
            setTaskName([...taskName, item.task_name]);
        }
    };

    // Function to handle expanding pending tasks
    const handleExpandPending = (item) => {
        if (pendingTaskName.includes(item.task_name)) {
            setPendingTaskName(pendingTaskName.filter((t) => t !== item.task_name));
        } else {
            setPendingTaskName([...pendingTaskName, item.task_name]);
        }
    };

    // Function to format date strings
    const formatValue = (value) => {
        return format(new Date(value), "yyyy-MM-dd HH:mm"); // Extract only the date
    };

    const handleVerifyTask = async (taskID) => {
        const response = await verifyTaskCompletion(taskID, userID, setShowSuccess, setShowError);
        return response;
    };

    function onSortChange(action, state) {
        console.log(action, state);
    }

    // Loading skeleton for tables
    const TableSkeleton = () => (
        <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
            </div>
        </div>
    );

    // Empty state component
    const EmptyState = ({ message }) => (
        <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-500 mb-1">No Data Available</h3>
            <p className="text-sm text-gray-400">{message}</p>
        </div>
    );

    return (
        <div className='container mx-auto p-2 bg-transparent rounded-lg my-8 border border-x-0'>
            <div className="flex-1 mb-6">
                <h2 className="text-xl font-semibold text-gray-500 flex items-center gap-2 "><span className={`ml-2 inline-block size-5 bg-green-500 rounded-full animate-pulse`}></span>Ongoing Tasks</h2>
                <p className="text-xs tracking-wider text-gray-500 mt-1">Track tasks awaiting verification</p>
            </div>

            {loading ? (
                <TableSkeleton />
            ) : error ? (
                <div className="bg-red-50 p-4 rounded text-red-500 mb-4">
                    <p>Error loading ongoing tasks. Please try again.</p>
                </div>
            ) : nodes && nodes.length > 0 ? (
                <Table data={data} sort={sort} theme={theme}>
                    {(tableList) => (
                        <>
                            <Header>
                                <HeaderRow>
                                    <HeaderCellSort sortKey="DATE">Date</HeaderCellSort>
                                    <HeaderCellSort sortKey="NAME">Name</HeaderCellSort>
                                    <HeaderCellSort sortKey="DEPARTMENT">Department</HeaderCellSort>
                                    <HeaderCell sortkey="VERIFY">Verify</HeaderCell>
                                </HeaderRow>
                            </Header>

                            <Body>
                                {tableList.map((item, index) => (
                                    <React.Fragment key={index}>
                                        <Row>
                                            <Cell>{formatValue(item.active_at)}</Cell>
                                            <Cell>
                                                {item.task_name}
                                            </Cell>
                                            <Cell>{item.department.name}</Cell>
                                            <Cell>
                                                <div className='cursor-pointer border rounded-3xl w-fit py-1 px-1 flex items-center gap-2'>
                                                    <span>
                                                        <VerifyButton
                                                            handleVerifyTask={handleVerifyTask}
                                                            id={item.id}
                                                            checked={item.verified ? item.verified : false}
                                                            isDisabled={item.verification_status === "verified" ? true : false}
                                                        />
                                                    </span>
                                                    <span onClick={() => handleExpand(item)} className="cursor-pointer">
                                                        {taskName.includes(item.task_name) ? (
                                                            <MdArrowDropDown size="20" className='hover:opacity-50' title='see less' />
                                                        ) : (
                                                            <MdArrowRight size="20" className='hover:opacity-50' title='see more' />
                                                        )}
                                                    </span>
                                                </div>
                                            </Cell>
                                        </Row>
                                        {taskName.includes(item.task_name) && <MonitoringDetailsModal item={item} />}
                                    </React.Fragment>
                                ))}
                            </Body>
                        </>
                    )}
                </Table>
            ) : (
                <EmptyState message="No ongoing tasks found at the moment. Tasks will appear here once they are completed and ready for verification." />
            )}

            {/* Pending Tasks Table */}
            <div className="flex-1 mt-10 mb-6">
                <h2 className="text-xl font-semibold text-gray-500 flex items-center gap-2"><span className={`ml-2 inline-block size-5 bg-yellow-500 rounded-full animate-pulse`}></span> Pending Tasks</h2>
                <p className="text-xs tracking-wider text-gray-500 mt-1">View all pending tasks awaiting action</p>
            </div>

            {loading ? (
                <TableSkeleton />
            ) : error ? (
                <div className="bg-red-50 p-4 rounded text-red-500 mb-4">
                    <p>Error loading pending tasks. Please try again.</p>
                </div>
            ) : pendingNodes && pendingNodes.length > 0 ? (
                <Table data={pendingData} theme={theme}>
                    {(tableList) => (
                        <>
                            <Header>
                                <HeaderRow>
                                    <HeaderCell>Date</HeaderCell>
                                    <HeaderCell>Name</HeaderCell>
                                    <HeaderCell>Task Type</HeaderCell>
                                    <HeaderCell>Department</HeaderCell>
                                    <HeaderCell>Details</HeaderCell>
                                </HeaderRow>
                            </Header>

                            <Body>
                                {tableList.map((item, index) => (
                                    <React.Fragment key={index}>
                                        <Row>
                                            <Cell>{format(new Date(), "yyyy-MM-dd HH:mm")}</Cell>
                                            <Cell>{item.task_name}</Cell>
                                            <Cell>{item.task_type}</Cell>
                                            <Cell>{item.department.name}</Cell>
                                            <Cell>
                                                <div className='cursor-pointer border rounded-3xl w-fit py-1 px-1 flex items-center gap-2'>
                                                    <span onClick={() => handleExpandPending(item)} className="cursor-pointer">
                                                        {pendingTaskName.includes(item.task_name) ? (
                                                            <MdArrowDropDown size="20" className='hover:opacity-50' title='see less' />
                                                        ) : (
                                                            <MdArrowRight size="20" className='hover:opacity-50' title='see more' />
                                                        )}
                                                    </span>
                                                </div>
                                            </Cell>
                                        </Row>
                                        {pendingTaskName.includes(item.task_name) && <MonitoringDetailsModal item={item} />}
                                    </React.Fragment>
                                ))}
                            </Body>
                        </>
                    )}
                </Table>
            ) : (
                <EmptyState message="No pending tasks found at the moment. New tasks will appear here when they are assigned." />
            )}

            {/* Refresh button for both tables */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={() => refetch()}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-green-500 text-green-500 rounded-md hover:bg-green-50 transition-colors"
                    disabled={loading}
                >
                    <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Refresh
                </button>
            </div>
        </div>
    );
};

export default MonitoringList;
