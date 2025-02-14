import React, { useEffect, useState, useCallback } from 'react';
import { useTheme } from '@table-library/react-table-library/theme';
import VerifyButton from './VerifyButton';
import useFetchTaskCompletions from '../hooks/useFetchTaskCompletions';
import { MdArrowRight, MdArrowDropDown } from 'react-icons/md';
import MonitoringDetailsModal from './MonitoringDetailsModal';

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
    const [taskName, setTaskName] = useState([]);
    const [currentTaskID, setCurrentTaskID] = useState(null);
    const [userID,setUserID] = useState(null);
    const { completions, loading, error, refetch } = useFetchTaskCompletions();
    const { verifyTaskCompletion, loading: verifyLoading, error: verifyError } = useVerifyTask()

    useEffect(() => {
        console.log("inside useEffect")
        setNodes(completions);
    }, [completions])

    console.log(nodes);

    const tableTheme = {
        Table: `
            // background : white;
        `,
        Row: `
          background : ;
          font-size : 14px;
          color : #9ca3af;
          font-weight : 500;
  
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
               //   color : #34a553;
                 color: #9ca3af;
                 background: transparent;
                 border-bottom: 1px solid black;
               `,
        BaseCell: `
          padding : 12px 5px;
          border-bottom: 2px solid  #f5f5f5 ;
        `
    }
    const theme = useTheme([tableTheme]);

    const data = { nodes };


    const sort = useSort(
        data,
        {
            onChange: onSortChange,
        },
        {
            sortToggleType: SortToggleType.AlternateWithReset,
            sortFns: {
                DATE: (array) => array.sort((a, b) => a.completion_time.localeCompare(b.completion_time)),
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

    const handleVerifyTask = async (taskID) => {
        const response = await verifyTaskCompletion(taskID,userID,setShowSuccess,setShowError);
        return response;
    }

    function onSortChange(action, state) {
        console.log(action, state);
    }
    return (
        <div className='container mx-auto p-2 pt-8 bg-white rounded-lg my-8 border border-x-0'>
            <Table data={data} sort={sort} theme={theme}>
                {(tableList) => (
                    <>
                        <Header>
                            <HeaderRow>
                                <HeaderCellSort sortKey="DATE">Date</HeaderCellSort>
                                <HeaderCellSort sortKey="NAME">Name</HeaderCellSort>
                                <HeaderCellSort sortKey="DEPARTMENT">Department</HeaderCellSort>
                                {/* <HeaderCellSort sortKey="RISK_LEVEL">Risk_Level</HeaderCellSort>
                                <HeaderCell sortKey="COMPLETED">Tasks</HeaderCell> */}
                                <HeaderCell sortkey="VERIFY">Verify</HeaderCell>
                            </HeaderRow>
                        </Header>

                        <Body>
                            {tableList.map((item, index) => (
                                <React.Fragment key={index}>
                                    <Row>
                                        <Cell>{item.completion_time}</Cell>
                                        <Cell>
                                            {item.task_name}
                                        </Cell>
                                        <Cell>{item.department}</Cell>
                                        {/* <Cell className={`${item.riskLevel === "High" ? "text-red-400" : "text-primary"}`}>{item.riskLevel}</Cell> */}
                                        {/* <Cell>{item.completed.toString()}</Cell> */}
                                        <Cell>
                                            <div className='cursor-pointer border rounded-3xl w-fit py-1 px-1 flex items-center gap-2'>
                                                <span>
                                                    <VerifyButton handleVerifyTask={handleVerifyTask}
                                                     id={item.completion_id} checked={item.verified ? item.verified : false} 
                                                     isDisabled={item.verified ? true : false}
                                                     
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
        </div>
    );

}

export default MonitoringList;
