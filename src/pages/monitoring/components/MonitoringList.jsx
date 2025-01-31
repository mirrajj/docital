import { useEffect, useState, useCallback } from 'react';
import { useMonitoringData } from '../hooks/useMonitoringData';
import { useTheme } from '@table-library/react-table-library/theme';
import VerifyButton from './VerifyButton';

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


const MonitoringList = () => {
    const [nodes, setNodes] = useState([]);
    const { monitoringData, updateVerificationStatus } = useMonitoringData();

    const fetchData = useCallback(async () => {
        const { monitoringData } = useMonitoringData();
        console.log(monitoringData);
        setNodes(monitoringData);
    }, []);

    useEffect(() => {
        // fetchData();
        setNodes(monitoringData);
    }, [updateVerificationStatus])
    const tableTheme = {
        Table: `
            // background : white;
        `,
        Row: `
          background : transparent;
          font-size : 14px;
          color : #34a853;
          font-weight : 300;
  
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
          font-size : ;
          font-weight : 300;
          color : #17612b;
          background: transparent;
          
        `,
        BaseCell: `
          padding : 15px 5px;
          @media (min-width : 1024px) {
            border-bottom: 1px dotted #34a853;
            padding : 8px 5px;
            }
        `
    }
    const theme = useTheme([tableTheme]);

    const data = { nodes };
    console.log(data);


    const sort = useSort(
        data,
        {
            onChange: onSortChange,
        },
        {
            sortToggleType: SortToggleType.AlternateWithReset,
            sortFns: {
                DATE: (array) => array.sort((a, b) => a.name.localeCompare(b.name)),
                NAME: (array) => array.sort((a, b) => a.name - b.name),
                DEPARTMENT: (array) => array.sort((a, b) => a.department.localeCompare(b.department)),
                RISK_LEVEL: (array) => array.sort((a, b) => a.risk_level - b.risk_level),
                COMPLETED: (array) => array.sort((a, b) => a.completed - b.completed),
                // VERIFY: (array) => array.sort((a, b) => a.isComplete - b.isComplete),
                // TASKS: (array) =>
                //   array.sort((a, b) => (a.nodes || []).length - (b.nodes || []).length),
            },
        }
    );
    function onSortChange(action, state) {
        console.log(action, state);
    }
    return (
        <div className='container mx-auto p-2 pt-8 bg-white rounded-lg my-8 border border-x-0 border-t-4'>
            <Table data={data} sort={sort} theme={theme}>
                {(tableList) => (
                    <>
                        <Header>
                            <HeaderRow>
                                <HeaderCellSort sortKey="DATE">Date</HeaderCellSort>
                                <HeaderCellSort sortKey="NAME">Name</HeaderCellSort>
                                <HeaderCellSort sortKey="DEPARTMENT">Department</HeaderCellSort>
                                <HeaderCellSort sortKey="RISK_LEVEL">Risk_Level</HeaderCellSort>
                                <HeaderCell sortKey="COMPLETED">Tasks</HeaderCell>
                                <HeaderCell sortKey="VERIFY">Verify</HeaderCell>
                            </HeaderRow>
                        </Header>

                        <Body>
                            {tableList.map((item) => (
                                <Row item={item} key={item.id}>
                                    <Cell>{item.date}</Cell>
                                    <Cell>
                                        {item.name}
                                    </Cell>
                                    <Cell>{item.department}</Cell>
                                    <Cell className={`${item.riskLevel === "High" ? "text-red-400" : "text-primary"}`}>{item.riskLevel}</Cell>
                                    <Cell>{item.completed.toString()}</Cell>
                                    <Cell><VerifyButton handleVerificationStatus={updateVerificationStatus} id={item.id} checked = {item.verified} /></Cell>
                                </Row>
                            ))}
                        </Body>
                    </>
                )}
            </Table>
        </div>
    );

}

export default MonitoringList;
