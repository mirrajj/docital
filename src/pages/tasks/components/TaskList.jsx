import { useState,useContext } from 'react'
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import {tasks as nodes} from '../data/tasks';
import TaskSwitch from './TaskSwitch';
import { MdInfo,MdEdit } from 'react-icons/md';
import TaskDetailsModal from './TaskDetailsModal';
import  {DataContext}  from '../../../utils/DataContext';


const TaskList = ({onClick}) => {
  const [search, setSearch] = useState("");
  const [ids, setIds] = useState([]);
  const {showModal} = useContext(DataContext);

  let data = {nodes}

    const tableTheme = {
      Row: `
        background : transparent;
        font-size : 14  px;
        color : #34a853;
        font-weight : 400;

        @media (min-width : 1024px) {
         &:nth-of-type(odd) {
          background-color: #34a85321;
        }

        &:nth-of-type(even) {
          background-color: ;
    }
          }
      `,
      HeaderRow : `
        font-size : 14px;
        color : #17612b;
        background:;
        
      `,
      BaseCell  : `
        padding : 5px;
        @media (min-width : 1024px) {
          border-bottom: 1px solid #f5f5f5;
          padding : 2px;
          }
      `
    }
  const theme = useTheme([tableTheme]);


  //function to set checked value of the switch, yet to add functionality to the switch
  const onChange = (e) => {
    console.log(e.target.checked);
  }

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };


    // function to handle row click by first iterating through the ids array to check if the id of the clicked row is already in the array,
    //  then add or remove the id from the array
  const handleExpand = (item) => {
    if (ids.includes(item.id)) {
      setIds(ids.filter((id) => id !== item.id));
    } else {
      setIds([...ids, item.id]);
    }
  };

  const row_props = {
    onClick: handleExpand,
  }
  const row_options = {
    renderAfterRow: (item) => {
      if (ids.includes(item.id)) {
        return <TaskDetailsModal item={item} />
      }
    }
  }
//filtering the data based on the search input, runs on every change in the search input
  data = {
    nodes: data.nodes.filter((task) => {
      return task.title.toLowerCase().includes(search.toLowerCase());
    }),
  }
    // console.log(data);

  const columns = [
    { label: "Title", renderCell: (item) => item.title },
    { label: "Active", renderCell: () => <TaskSwitch onChange={onChange} /> },
    { label: "Details", renderCell: () => <MdInfo size="20" /> },
    { label: "Edit", renderCell: () => <div className='cursor-pointer hover:opacity-50 w-fit'><MdEdit size="20" id='edit' onClick={(e) => { onClick(e); showModal() }} /></div> },
  ];


  return (
    <div className='container mx-auto rounded-md shadow-light p-2 pt-8 bg-white'>

      <label htmlFor="search" className="text-base text-primaryDark ">
        Search Task:&nbsp;
        <input id="search" type="text" value={search} onChange={handleSearch} className='rounded-md border' />
        <p className='text-xs font-normal mt-2 tracking-wider'>*Click on row to see details of task</p>
      </label>

      <p></p>
      <br />

      <CompactTable
        data={data}
        columns={columns}
        theme={theme}
        rowProps={row_props}
        rowOptions={row_options}
      />

    </div>
  );
}
export default TaskList;