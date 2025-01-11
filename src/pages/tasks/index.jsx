import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import TaskButton from "./components/TaskButton";
import { useState } from "react";
import { useContext } from "react";
import  {DataContext}  from "../../utils/DataContext";


const Task = () => {
    const [showForm,setShowForm] = useState(false);
    const [btnType,setBtnType] = useState("");
    const {hideModal} = useContext(DataContext);

    const onClick = (e) => {
        // console.log("Hello world");
        setBtnType(e.currentTarget.id);
        setShowForm(true);
    }
    //function to remove form modal after it is cancelled
    const handleCancel = () => {
        setShowForm(false);
        hideModal();
    }
    

 return(
    <>
        <TaskButton onClick={onClick} name = "Create New"  />
        {/* handleCancel passed to forms so buttons in the forms modal can hide form modal  */}
        {showForm && btnType === 'Create New' && <TaskForm btnType={btnType} handleCancel={handleCancel} /> }
        {showForm && btnType === 'edit' && <TaskForm btnType ={btnType} handleCancel = {handleCancel} />}
        <TaskList onClick={onClick} />
    </>
 );
};
export default Task;