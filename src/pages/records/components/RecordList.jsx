import React, { useState, useCallback, useEffect } from 'react';
import { useTheme } from '@table-library/react-table-library/theme';
import { usePagination } from "@table-library/react-table-library/pagination";
// import useFetchData from '../../tasks/hooks/useFetchTasks';

import {
    Table,
    Header,
    HeaderRow,
    Body,
    Row,
    Cell,
} from "@table-library/react-table-library/table";

import {
    useSort,
    HeaderCellSort,
    SortIconPositions,
    SortToggleType,
} from "@table-library/react-table-library/sort";



const RecordList = ({ recordType }) => {

    const tableTheme = {
        Table: `
            color : #17612B;
            font-family : sans-serif;
            background-color : transparent;
        `,
        Row: `
          background : ;
          font-size : 14px;
          color : gray;
          font-weight : 400;
  
          @media (min-width : 1024px) {
           &:nth-of-type(odd) {
            background-color: transparent;
          }
          &:nth-of-type(even) {
            background-color: transparent;
        }
         }
        `,
        HeaderRow: `
          font-size : 1.3rem;
          font-weight  : 300;
          color : gray;
          background: transparent;
          border-bottom : 1px solid #34a853;
          
        `,
        BaseCell: `
          padding : 15px 5px;
          border-bottom: 1px solid #34a853;
            
        `
    }
    const theme = useTheme(tableTheme);
    const [data, setData] = useState({ nodes: [] });
    const LIMIT = 2;

    const fetchData = useCallback(async (params) => {
        const result = await useFetchData(params);
        console.log(result);
        setData(result);
    }, []);

    function onPaginationChange(action, state) {
        fetchData({
            offset: state.page * LIMIT,
            limit: LIMIT,
        });
    }

    useEffect(() => {
        fetchData({
            offset: 0,
            limit: LIMIT
        });
    }, [fetchData]);

    const pagination = usePagination(
        data,
        {
            state: {
                page: 0,
                size: LIMIT,
            },
            onChange: onPaginationChange,
        },
        {
            isServer: true,
        }
    );

    function onSortChange(action, state) {
        console.log(action, state);
    }
    const sort = useSort(
        data,
        {
            onChange: onSortChange,
        },
        {
            sortToggleType: SortToggleType.AlternateWithReset,
            sortFns: {
                TITLE: (array) => array.sort((a, b) => a.title > (b.title) ? 1 : -1),
                DATE: (array) => array.sort((a, b) => a.date - b.date),
                DETAILS: (array) => array.sort((a, b) => a.details.localeCompare(b.details)),
                // COMPLETE: (array) => array.sort((a, b) => a.isComplete - b.isComplete),
                // TASKS: (array) =>
                //   array.sort((a, b) => (a.nodes || []).length - (b.nodes || []).length),
            },
        }
    );


    return (
        <>
            <Table data={data} sort={sort} pagination={pagination} className="" theme={theme}>
                {(tableList) => (
                    <>
                        <Header>
                            <HeaderRow>
                                <HeaderCellSort sortKey="TITLE">Title</HeaderCellSort>
                                <HeaderCellSort sortKey="DATE">Date</HeaderCellSort>
                                <HeaderCellSort sortKey="DETAILS">Details</HeaderCellSort>
                            </HeaderRow>
                        </Header>

                        <Body>
                            {tableList.map((item) => (

                                <Row item={item} key={item.id}>
                                    <Cell>{item.title}</Cell>
                                    <Cell>
                                        {item.date}
                                    </Cell>
                                    <Cell>{item.details}</Cell>
                                </Row>

                            ))}
                        </Body>
                    </>
                )}
            </Table>
            {data.pageInfo && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        paddingTop: '1em'
                    }}
                >
                    <span className='text-gray-500 font-light'>Total Pages: {data.pageInfo.totalPages}</span>

                    <span className='text-gray-500'>
                        Page:{" "}
                        {Array(data.pageInfo.totalPages)
                            .fill()
                            .map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    style={{
                                        color: '#17612b',
                                        background:
                                            pagination.state.page === index ? "#6b7280" : "",
                                        marginLeft: '2px',
                                        padding: '0px 6px',
                                        border: '2px solid #34a853',
                                        borderRadius: '2px',
                                        fontWeight:
                                            pagination.state.page === index ? "bold" : "300",
                                    }}
                                    onClick={() => pagination.fns.onSetPage(index)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                    </span>
                </div>
            )}
        </>
    );
}

export default RecordList;
