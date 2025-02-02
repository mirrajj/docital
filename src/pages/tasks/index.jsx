import TaskForm2 from "./components/TaskForm";
import TaskList2 from "./components/TaskList";
import TaskButton from "./components/TaskButton";
import { useState } from "react";
import { useContext } from "react";
import  {DataContext}  from "../../utils/DataContext";
import { MdCheck } from "react-icons/md";


const Task = () => {
    const [showForm,setShowForm] = useState(false);
    const [btnType,setBtnType] = useState("");
    const {hideModal} = useContext(DataContext);
    const [subtasks, setSubtasks] = useState([]); 
    const [currentTaskID, setCurrentTaskID] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [taskDetails, setTaskDetails] = useState({
            title: "",
            department: "",
            completedBy: "",
            instructionFile: null,
    });

    const onClick = (id) => {
        setBtnType(id);
        setShowForm(true);
    }

    // console.log(subtasks);
    // console.log(taskDetails);
    // console.log(currentTaskID);
   
    //function to remove form modal after it is cancelled
    const handleCancel = () => {
        setShowForm(false);
        hideModal();
    }
    

 return(
     <>
         {showSuccess && (
             <div className="fixed top-4 right-4 bg-green-500 text-white p-2 rounded shadow">
                 <span className="text-white text-sm"><MdCheck /></span>Task updated successfully!
             </div>
         )}

         <TaskButton onClick={onClick} name="Create New" />
     
         {showForm && <TaskForm2
             hideModal={hideModal}
             setShowSuccess={setShowSuccess}
             setShowForm={setShowForm}
             btnType={btnType}
             handleCancel={handleCancel}
             setSubtasks={setSubtasks}
             setTaskDetails={setTaskDetails}
             subtasks={subtasks}
             taskDetails={taskDetails}
             currentTaskID={currentTaskID} />}

         <TaskList2
             onClick={onClick}
             setSubtasks={setSubtasks}
             setTaskDetails={setTaskDetails}
             setCurrentTaskID={setCurrentTaskID}
             currentID={currentTaskID} />
     </>
 );
};
export default Task;