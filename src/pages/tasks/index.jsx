import TaskForm2 from "./components/TaskForm";
import TaskList2 from "./components/TaskList";
import TaskButton from "./components/TaskButton";
import { useState } from "react";
import { useContext } from "react";
import { DataContext } from "../../utils/DataContext";
import AppAlert from "../../common/AppAlert";


const Task = () => {
    const [showForm, setShowForm] = useState(false);
    const [btnType, setBtnType] = useState("");
    const { hideModal } = useContext(DataContext);
    const [subtasks, setSubtasks] = useState([]);
    const [currentTaskID, setCurrentTaskID] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
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
        setTaskDetails({
            title: '',
            department: '',
            completedBy: '',
            instructionFile: null,
        });
        setSubtasks([]);
        setShowForm(false);
        hideModal();
    }


    return (
        <>
            {showError && (
                <AppAlert
                    type="error"
                    message="Failed. Please try again."
                    onClose={() => setShowError(false)}
                />
            )}

            {showSuccess && (
                <AppAlert
                    type="success"
                    message="Task successfully!"
                    onClose={() => setShowSuccess(false)}
                />
            )}

            <TaskButton onClick={onClick} name="Create New" />

            {showForm && <TaskForm2
                hideModal={hideModal}
                setShowSuccess={setShowSuccess}
                setShowError={setShowError}
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
                setShowError={setShowError}
                setShowSuccess={setShowSuccess}
                setSubtasks={setSubtasks}
                setTaskDetails={setTaskDetails}
                setCurrentTaskID={setCurrentTaskID}
                currentID={currentTaskID} />
        </>
    );
};
export default Task;