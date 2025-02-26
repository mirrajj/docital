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
    const { hideModal,showModal } = useContext(DataContext);
    const [subtasks, setSubtasks] = useState([]);
    const [currentTaskID, setCurrentTaskID] = useState(null);
    const [showSuccess, setShowSuccess] = useState({state: false, message : ""});
    const [showError, setShowError] = useState({state: false, message : ""});
    const [ dataFields,setDataFields ] = useState([]);
    const [step, setStep] = useState(1);
    const [taskDetails, setTaskDetails] = useState({
        name: "",
        department: "",
        description : "",
        active : "",
        completion_window_value : null,
        completion_window_unit : "",
        completion_window : "",
        frequency : "",
        frequency_value : null,
        frequency_unit : "",
        instructionFile: null,
    });

    const onClick = (id_name) => {
        setBtnType(id_name);
        setShowForm(true);
        setStep(1);
    }

    // console.log(subtasks);
    // console.log(taskDetails);
    // console.log(currentTaskID);

    //function to remove form modal after it is cancelled
    // const handleCancel = () => {
    //     setTaskDetails({
    //         name: "",
    //         department: "",
    //         description: "",
    //         active: "",
    //         completion_window_value: null,
    //         completion_window_unit: "",
    //         completion_window: "",
    //         frequency: "",
    //         frequency_value: null,
    //         frequency_unit: "",
    //         instructionFile: null,
    //     });
    //     setSubtasks([]);
    //     setShowForm(false);
    //     hideModal();
    // }


    return (
        <>
            {/* <DashboardHeader title="Task" /> */}
            {showError.state && (
                <AppAlert
                    type="error"
                    message={showError.message}
                    onClose={() => setShowError(false)}
                />
            )}

            {showSuccess.state && (
                <AppAlert
                    type="success"
                    message={showSuccess.message}
                    onClose={() => setShowSuccess(false)}
                />
            )}
            <div className="flex justify-end mb-2 border-b4">
                <TaskButton onClick={onClick} name="Create New" />
            </div>

            {showForm && <TaskForm2
                hideModal={hideModal}
                showModal={showModal}
                setShowSuccess={setShowSuccess}
                setShowError={setShowError}
                setShowForm={setShowForm}
                btnType={btnType}
                step = {step}
                setStep={setStep}
                setSubtasks={setSubtasks}
                setTaskDetails={setTaskDetails}
                dataFields = {dataFields}
                setDataFields = {setDataFields}
                subtasks={subtasks}
                taskDetails={taskDetails}
                currentTaskID={currentTaskID} />}

            <TaskList2
                onClick={onClick}
                setShowError={setShowError}
                setShowSuccess={setShowSuccess}
                step = {step}
                setStep={setStep}
                setSubtasks={setSubtasks}
                dataFields = {dataFields}
                setDataFields = {setDataFields}
                setTaskDetails={setTaskDetails}
                setCurrentTaskID={setCurrentTaskID}
                setShowForm = {setShowForm}
                currentID={currentTaskID} />
        </>
    );
};
export default Task;