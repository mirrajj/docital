import React,{useState,useContext,useEffect} from 'react';
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
  import { MdInfo,MdEdit } from 'react-icons/md';
  import { useTheme } from '@table-library/react-table-library/theme';
  import { DataContext } from '../../../utils/DataContext';
  import TaskDetailsModal from './TaskDetailsModal';
  import LoadingSpinner from '../../../common/LoadingSpinner';



  const TaskList2 = ({ onClick }) => {
    const [retryCount, setRetryCount] = useState(0);
    const { tasks, loading, error } = useFetchTasks(retryCount);
    
    const [search, setSearch] = useState("");
    const { showModal } = useContext(DataContext);
    const [taskName, setTaskName] = useState([]);
    const [nodes, setNodes] = useState([]);
    const maxRetries = 3;

    useEffect(() => {
        setNodes(tasks);
        console.log("inside useEffect");
    }, [tasks]);

    const tableTheme = {
        Table: ``,
        Row: `
          background: transparent;
          font-size: 14px;
          color: #34a853;
          font-weight: 300;
        `,
        HeaderRow: `
          font-weight: 300;
          color: #17612b;
          background: transparent;
        `,
        BaseCell: `
          padding: 15px 5px;
          border-bottom: 1px dotted #34a853;
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

    if (loading) {
        return <LoadingSpinner />;
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
        <div className='container mx-auto p-2 pt-8 bg-white rounded-lg my-8 border border-x-0 border-y-4'>
            <label htmlFor="search">
                Search by Task:&nbsp;
                <input id="search" type="text" value={search} onChange={handleSearch} />
            </label>
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
                                        <Cell className={`${item.status === "paused" ? "text-yellow-500" : ""}`}>{item.status}</Cell>
                                        <Cell>
                                            <div className="cursor-pointer hover:opacity-50 w-fit">
                                                <MdEdit size="20" id="edit" onClick={(e) => { onClick(e); showModal(); }} />
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
