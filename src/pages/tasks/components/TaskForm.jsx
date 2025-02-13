import TaskButton from "./TaskButton";
import React, { useState, useEffect } from "react";
import { MdInfo, MdClose, MdDeleteOutline,MdArrowRightAlt } from "react-icons/md";
import useInsertTask from "../hooks/useInsertTasks";
import useSubmitEditTask from "../hooks/useSubmitEditTask";
import { data } from "react-router-dom";
import ConfirmModal from "./ConfirmModal";
import LoadingSpinner from "../../../common/LoadingSpinner";






const TaskForm2 = ({ btnType,
    // handleCancel,
    setTaskDetails,
    setSubtasks,
    taskDetails,
    subtasks,
    dataFields,
    setDataFields,
    currentTaskID,
    setShowForm,
    setShowSuccess,
    setShowError,
    showModal,
    hideModal }) => {


    const { insertTask, loading, error } = useInsertTask();

    const [step, setStep] = useState(1);
    const [taskType, setTaskType] = useState("");
    // const [dataFields, setDataFields] = useState([]);
    const [originalSubtasks, setOriginalSubtasks] = useState([]);
    const [showGuide, setShowGuide] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [modalType, setModalType] = useState("submit");

    const { submitEditTask, loading: editLoading, error: editError } = useSubmitEditTask();

    useEffect(() => {
        setOriginalSubtasks(subtasks);
    }, []);

    console.log("subtasks", subtasks);
    console.log("originalSubtasks", originalSubtasks);


    // Handlers
    const handleCancel = () => {
       
        setTaskDetails({
            name: "",
            department: "",
            description: "",
            active: "",
            completion_window_value: null,
            completion_window_unit: "",
            completion_window: "",
            frequency: "",
            frequency_value: null,
            frequency_unit: "",
            instructionFile: null,
        });
        setSubtasks([]);
        setDataFields([]);
        setShowForm(false);
        hideModal();
    }
    const confirmCancel = () => {
        setModalType("cancel");
        setShowConfirmModal(true);
        console.log(modalType);
    }

    const handleTaskTypeChange = (type) => {
        if (taskDetails.name.trim() === "" || taskDetails.department.trim() === "") {
            alert("Please fill out the title and department fields before proceeding.");
            return;
        }
        setTaskType(type);
        // setStep(2);
    };

    const handleTaskDetailsChange = (field, value) => { //goes into task table
     
        setTaskDetails({ ...taskDetails, [field]: value });
    };

    const handleFileUpload = (e) => {
        setTaskDetails({ ...taskDetails, instructionFile: e.target.files[0] });
    };

    const handleAddSubtask = () => {
        setSubtasks([...subtasks, { subtask_name: "", subtask_skippable: false }]);
    };

    const handleSubtaskChange = (index, field, value) => {
        
        const updatedSubtasks = [...subtasks];
        updatedSubtasks[index][field] = value;
        setSubtasks(updatedSubtasks);
    };

    const handleDeleteSubtask = (index) => { // for edit task
        const updatedSubtasks = subtasks.filter((_, i) => i !== index);
        setSubtasks(updatedSubtasks);
    };

    const handleAddDataField = () => {
        setDataFields([...dataFields, { name: "", type: "text" }]);
    };

    const handleDataFieldChange = (index, field, value) => {
        
        const updatedFields = [...dataFields];
        updatedFields[index][field] = value;
        setDataFields(updatedFields);
    };

    function validateTableName(tableName) {
        // Check length
        if (tableName.length > 63) {
            alert("Table name must be 63 characters or fewer.");
            return false;
        }

        // Check for invalid characters (allow letters, digits, underscores, and dollar signs)
        const validNamePattern = /^[a-zA-Z_][a-zA-Z0-9_$]*$/;
        if (!validNamePattern.test(tableName)) {
            alert("Table name can only contain letters, digits, underscores, and dollar signs, and must start with a letter or underscore.");
            return false;
        }

        // Check for spaces
        if (tableName.includes(" ")) {
            alert("Table name cannot contain spaces.");
            return false;
        }

        // Check for reserved keywords (basic example, can be expanded)
        const reservedKeywords = [
            "SELECT", "INSERT", "UPDATE", "DELETE", "FROM", "WHERE", "JOIN", "CREATE", "DROP", "TABLE", "ALTER", "INDEX", "VIEW", "FUNCTION", "TRIGGER", "PROCEDURE"
        ];
        if (reservedKeywords.includes(tableName.toUpperCase())) {
            alert("Table name cannot be a reserved keyword.");
            return false;
        }

        // Return validation result
        return true;
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (btnType === "Create New") {

            const taskSubmission = {
                taskDetails,
                taskType,
                subtasks,
                dataFields,
                setDataFields,
                setShowForm,
                setTaskDetails,
                setSubtasks,
                setShowSuccess,
                setShowError,
                setShowConfirmModal,
                hideModal
            };
            await insertTask(taskSubmission);
            console.log("Task Submitted:", taskSubmission);
        } else {
            const editSubmission = {
                taskDetails,
                subtasks,
                originalSubtasks,
                currentTaskID,
                setTaskDetails,
                setSubtasks,
                setShowForm,
                setShowSuccess,
                setShowError,
                setShowConfirmModal,
                hideModal
            };
            await submitEditTask(editSubmission);
            console.log("Task Updated");
        }
    };

    const confirmSubmission = (e) => {
        // setShowConfirmModal(false);
        handleSubmit(e);
        // hideModal();
    };

    const handleInitialSubmit = () => {
        if (btnType === "Create New") {

            if (taskDetails.name.trim() === "" || taskDetails.department.trim() === "" || taskDetails.frequency === null) {
                alert("Please ensure all required fields (title, department, and completed by) are filled out before submitting.");
                return;
            }

            if ((taskType === "data-collection" && dataFields.some((field) => field.name.trim() === "") || (taskType === "data-collection" && dataFields.length === 0))) {
                alert("Ensure there are fields and all data fields must be filled out before submitting.");
                return;
            }

            if ((taskType === "checklist"  && subtasks.some((subtask) => subtask.subtask_name.trim() === "") || (taskType === "checklist" && subtasks.length === 0))) {
                alert("No subtasks and all data fields must be filled out before submitting.");
                return;
            }

            if (taskType === "data-collection" && dataFields.length) {
                const isValid = validateTableName(taskDetails.name);
                const isFieldNameValid = dataFields.find((obj) => false === validateTableName(obj.name));
                
                if (isFieldNameValid || !isValid) {
                    return;
                }
                
            }

        } else {
            if (taskDetails.name.trim() === "" || taskDetails.frequency === null) {
                alert("Please ensure all required fields (title, department, and completed by) are filled out before submitting.");
                return;
            }
            if ((step > 1 && subtasks.some((subtask) => subtask.subtask_name.trim() === ""))) {
                alert("No subtasks and all data fields must be filled out before submitting.");
                return;
            }
        }
        setModalType("submit");
        setShowConfirmModal(true);
        showModal();
    };

    return (
        <>
          
            {btnType === "Create New" ?
                <div className="container mx-auto px-4 py-10 bg-white rounded-lg border-dashed border-2">
                   
                    <ConfirmModal loading = {loading} isOpen={showConfirmModal} onClose={() => {setShowConfirmModal(false);hideModal()}} title = { modalType === "submit" ? "Confirm task submission": "Discard task creation"} message = {modalType === "submit" ? "Are you sure you want to submit task?" : "Are you sure you want to discard"} confirmText = {modalType === "submit" ? "Yes submit" : "Discard"} cancelText = {modalType === "submit" ? "no" : "continue creating task"} cancelColor = "" confirmColor="" onConfirm={modalType === "submit" ? confirmSubmission : handleCancel}/>
                  
                    <div className="text-primary mb-6">
                        <h3 className="font-bold tracking-widest text-2xl text-green-500">Create New Tasks</h3>
                        {/* <h4 className="tracking-wider">All Inputs Marked * Are Required</h4> */}
                    </div>
                    <hr className="bg-gray-400 mb-4" />
                    {showGuide && (
                        <div className="p-4 bg-gray-100 rounded-lg mb-4 py-5 relative">
                            <button className="absolute top-2 right-4 text-gray-400 text-4xl hover:bg-slate-200 rounded-lg" onClick={() => setShowGuide(false)}><MdClose /></button>
                            <h4 className="text-gray-400 tracking-wider my-5">Get started with creating tasks by completing three easy steps</h4>
                            <ul className="list-none flex gap-2">
                                <li className="mb-2 flex flex-col bg-white p-2 rounded-lg shadow-md py-10 items-center w-1/3">
                                    📌 <span className="ml-2 text-center text-gray-500">Step 1: <p className="text-xs text-blue-500 text-center tracking-wider">Enter task details such as title and department.</p></span>
                                </li>
                                <li className="mb-2 flex flex-col bg-white p-2 rounded-lg shadow-md py-10 items-center w-1/3">
                                    ✅ <span className="ml-2 text-center text-gray-500">Step 2: <p className="text-xs text-blue-500 text-center tracking-wider">Choose task type (Checklist or Data Collection).</p></span>
                                </li>
                                <li className="mb-2 flex flex-col bg-white p-2 rounded-lg shadow-md items-center py-10 w-1/3">
                                    🚀 <span className="ml-2 text-center text-gray-500">Step 3: <p className="text-xs text-blue-500 text-center tracking-wider">Review and submit your task.</p></span>
                                </li>
                            </ul>
                        </div>
                    )}
           

                    <div className="flex gap-4">
                        <div className="grow-1/2 w-2/3 border-r border-gray">

                            {step === 1 && (
                                <form className="px-10">
                                    <h5 className="text-green-500 font-semibold text-3xl mb-4 p-4">Task Details:</h5>

                                    <div className="mb-4 bg-gray-100 rounded-xl p-4">
                                        <label className="block mb-1 text-gray-400 font-normal">Task Name *</label>
                                        <input
                                            type="text"
                                            placeholder="Enter task title"
                                            value={taskDetails.name}
                                            onChange={(e) => handleTaskDetailsChange("name", e.target.value)}
                                            className="border w-full px-2 py-2 rounded-lg outline-none text-xs"
                                            required
                                        />
                                    </div>

                                    <div className="mb-4 bg-gray-100 rounded-xl p-4 ">
                                        <label className="block mb-1 text-gray-400 font-normal">Department *</label>
                                        <select
                                            value={taskDetails.department}
                                            onChange={(e) => handleTaskDetailsChange("department", e.target.value)}
                                            className="border w-full px-2 py-2 rounded-lg outline-none text-xs bg-white"
                                            required
                                        >
                                            <option value="">Select a department</option>
                                            <option value="Processing Department">Processing Department</option>
                                            <option value="Drying Department">Drying Department</option>
                                            <option value="Finished Products Department">Finished Products Department</option>
                                            <option value="Raw Material Department">Raw Material Department</option>
                                            <option value="General Office Space">General Office Space</option>
                                            <option value="Cleaners Department">Cleaners Department</option>
                                        </select>
                                    </div>

                                    <div className="mb-4 bg-gray-100 rounded-xl p-4">
                                        <label className="block mb-1 text-gray-400 font-normal">Description <span className="text-xs">(Optional)</span></label>
                                        <textarea
                                            placeholder="eg. what the task is about.."
                                            value={taskDetails.description}
                                            onChange={(e) => handleTaskDetailsChange("description", e.target.value)}
                                            className="border w-full px-2 py-2 outline-none rounded-lg text-xs resize-none"
                                            rows={4}
                                        />
                                    </div>

                                    <div className="mb-4 bg-gray-100 rounded-xl p-4">
                                        <label className="block mb-1 text-gray-400 font-normal">Active <span className="text-xs">(Optional)</span></label>
                                        <select
                                            value={taskDetails.active}
                                            onChange={(e) => handleTaskDetailsChange("active", e.target.value)}
                                            className="border w-full px-2 py-2 outline-none rounded-lg text-xs bg-white"
                                        >
                                            <option value="">Select an option</option>
                                            <option value="true">True</option>
                                            <option value="false">False</option>
                                        </select>
                                        <p className="text-xs text-gray-400 mt-1">If left empty, this will default to true.</p>
                                    </div>

                                    <div className="mb-4 bg-gray-100 rounded-xl p-4">
                                        <label className="block mb-1 text-gray-400 font-normal">Completion Window <span className="text-xs">(Optional)</span></label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder="eg. 3"
                                                value={taskDetails.completion_window_value || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    // const unit = taskDetails.completion_window_unit || "minutes"; // Default to "minutes" if unit is not set
                                                    handleTaskDetailsChange("completion_window_value", `${value}`);
                                                }}
                                                className="border w-1/2 px-2 py-2 outline-none rounded-lg text-xs"
                                                min="1" // Ensure the number is at least 1
                                            />
                                            <select
                                                value={taskDetails.completion_window_unit || "minutes"} // Default to "minutes"
                                                onChange={(e) => {
                                                    const unit = e.target.value;
                                                    // const value = taskDetails.completion_window_value || ""; // Use the current value
                                                    handleTaskDetailsChange("completion_window_unit", `${unit}`);
                                                }}
                                                className="border w-1/2 px-2 py-2 outline-none rounded-lg text-xs bg-white"
                                            >
                                                <option value="minutes">Minutes</option>
                                                <option value="hours">Hours</option>
                                                <option value="days">Days</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-4 bg-gray-100 rounded-xl p-4">
                                        <label className="block mb-1 text-gray-400 font-normal">Frequency *</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder="eg. 3"
                                                value={taskDetails.frequency_value || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    handleTaskDetailsChange("frequency_value", `${value}`);
                                                }}
                                                className="border w-1/2 px-2 py-2 outline-none rounded-lg text-xs"
                                                min="1" // Ensure the number is at least 1
                                            />
                                            <select
                                                value={taskDetails.frequency_unit || "minutes"} // Default to "minutes"
                                                onChange={(e) => {
                                                    const unit = e.target.value;
                                                    handleTaskDetailsChange("frequency_unit", `${unit}`);
                                                }}
                                                className="border w-1/2 px-2 py-2 outline-none rounded-lg text-xs bg-white"
                                            >
                                                {/* <option value="minutes">Minutes</option> */}
                                                <option value="hours">Hours</option>
                                                <option value="days">Days</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-4 bg-gray-100 rounded-xl p-4">
                                        <label className="block mb-1 text-gray-400 font-normal">Add Instruction File</label>
                                        <label className="flex items-center text-white justify-center cursor-pointer w-full px-3 py-2 bg-green-500 border rounded-lg hover:bg-white hover:border-green-500 hover:border-2 hover:text-green-500">
                                            <span>Upload File</span>
                                            <input
                                                type="file" 
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                        </label>
                                        <p className="text-xs text-gray-400 mt-4">You can only add media files, with a maximum size of 1.5GB and a duration of 3 minutes for videos. The maximum image size for images is 10MB.</p>
                                    </div>
                                    <div className=" flex mt-4 mb-4 items-center gap-4 justify-between">

                                        <h5 className="text-blue-500 text-xs font-bold my-4 bg-gray-300 text-center py-4 rounded-lg grow">for tasks that require input data or subtasks continue below</h5>
                                    </div>
                                    <hr className="my-4 h-2" />

                                    <h5 className="text-green-500 font-semibold text-3xl mb-4 p-4">Select Task Type:</h5>
                                    <div>
                                        {taskType ? (
                                            // Show the selected task type
                                            <div className="bg-gray-100 p-4 border rounded-3xl shadow-md">
                                                <h6 className="font-bold text-primary">
                                                    {taskType === "checklist" ? "Checklist Task" : "Data Collection Task"}
                                                </h6>
                                                <p className="text-xs text-gray-400">
                                                    {taskType === "checklist"
                                                        ? "A checklist task allows you to create a series of subtasks that can be marked as skippable or not."
                                                        : "A data collection task lets you specify custom fields for gathering necessary information."}
                                                </p>
                                                <button
                                                    className="mt-2 text-sm text-green-500 hover:underline"
                                                    onClick={() => {handleTaskTypeChange(""); setStep(1); setSubtasks([]); setDataFields([])}} // Reset selection
                                                >
                                                    Change Task Type
                                                </button>
                                            </div>
                                        ) : (
                                            // Show the task type options
                                            <div className="flex gap-4">
                                                <div
                                                    className="bg-gray-100 p-4 border rounded-3xl shadow-md cursor-pointer hover:bg-blue-100"
                                                    onClick={() => handleTaskTypeChange("checklist")}
                                                >
                                                    <h6 className="font-bold text-green-500">Checklist Task</h6>
                                                    <MdInfo color="green" />
                                                    <p className="text-xs text-gray-400">
                                                        A checklist task allows you to create a series of subtasks that can be marked as skippable or not.
                                                    </p>
                                                </div>
                                                <div
                                                    className="bg-gray-100 p-4 border rounded-3xl shadow-md cursor-pointer hover:bg-blue-100"
                                                    onClick={() => handleTaskTypeChange("data-collection")}
                                                >
                                                    <h6 className="font-bold text-green-500">Data Collection Task</h6>
                                                    <MdInfo color="green" />
                                                    <p className="text-xs text-gray-400">
                                                        A data collection task lets you specify custom fields for gathering necessary information.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            )}
                           

                            {step === 2 && taskType === "checklist" && (
                                <div className="px-10">
                                    <h5 className="text-blue-500 font-semibold text-3xl mb-4 bg-gray-100 rounded-xl p-4">Checklist Task:</h5>

                                    <ul className="">
                                        {subtasks.map((subtask, index) => (
                                            <li key={index} className="flex gap-2 my-2">
                                                <input
                                                    type="text"
                                                    placeholder="Subtask Name"
                                                    value={subtask.subtask_name}
                                                    onChange={(e) =>
                                                        handleSubtaskChange(index, "subtask_name", e.target.value)
                                                    }
                                                    className="border px-2 py-4 rounded-md outline-primary text-xs"
                                                />
                                                <label className="text-sm self-center items-center text-primaryDark">
                                                    <input
                                                        className="size-4 text-primary"
                                                        type="checkbox"
                                                        checked={subtask.subtask_skippable}
                                                        onChange={(e) =>
                                                            handleSubtaskChange(
                                                                index,
                                                                "subtask_skippable",
                                                                e.target.checked
                                                            )
                                                        }
                                                    />
                                                    Skippable
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                    <button className="btn-primary" onClick={handleAddSubtask}>
                                        Add Subtask
                                    </button>
                                    <p></p>
                                </div>
                            )}
                    

                            {step === 2 && taskType === "data-collection" && (
                                <div className="px-10">
                                    <h5 className="text-blue-500 font-semibold text-3xl mb-4 bg-gray-100 rounded-xl p-4">Data Collection Task:</h5>

                                    <ul>
                                        {dataFields.map((field, index) => (
                                            <li key={index} className="my-2 text-sm">
                                                <input
                                                    type="text"
                                                    placeholder="Field Name"
                                                    value={field.name}
                                                    onChange={(e) =>
                                                        handleDataFieldChange(index, "name", e.target.value)
                                                    }
                                                    className="border px-2 py-3 rounded-lg outline-primary"
                                                />
                                                <select
                                                    value={field.type}
                                                    onChange={(e) =>
                                                        handleDataFieldChange(index, "type", e.target.value)
                                                    }
                                                    className="border px-2 py-1 ml-2 rounded-lg text-primaryDark"
                                                >
                                                    <option value="text">Text (e.g., names, descriptions)</option>
                                                    <option value="float4">Decimal Number (e.g., 3.14, -10.5)</option>
                                                    <option value="int">Whole Number (e.g., 1, 42, -7)</option>
                                                    <option value="bool">True/False (Boolean)</option>
                                                    <option value="timestamp">Date and Time (e.g., 2023-10-15 14:30:00)</option>
                                                </select>
                                            </li>
                                        ))}
                                    </ul>
                                    <button className="btn-primary" onClick={handleAddDataField}>
                                        Add Field
                                    </button>
                                    <p></p>
                                </div>
                            )} 
                             
                       
                        </div>
                        {/* Review Panel */}
                        <div className="grow-1/2 w-1/3 p-4  ml-4 self-start">
                            <h3 className=" mb-4 text-3xl text-blue-500 font-semibold">Review</h3>
                            <div>
                                <p className="bg-white p-4 rounded-lg shadow-md text-sm mb-3 text-gray-400 font-serif font-bold"><strong className="tracking-widest font-semibold text-blue-500"> Title:</strong> {taskDetails.name || "N/A"}</p>
                                <p className="bg-white p-4 rounded-lg shadow-md text-sm mb-3 text-gray-400 font-serif font-bold"><strong className="tracking-widest font-semibold text-blue-500">Department:</strong> {taskDetails.department || "N/A"}</p>
                                <p className="bg-white p-4 rounded-lg shadow-md text-sm mb-3 text-gray-400 font-serif font-bold"><strong className="tracking-widest font-semibold text-blue-500">Description:</strong> {taskDetails.description || "N/A"}</p>
                                <p className="bg-white p-4 rounded-lg shadow-md text-sm mb-3 text-gray-400 font-serif font-bold"><strong className="tracking-widest font-semibold text-blue-500">Frequency:</strong> {taskDetails.frequency || "N/A"}</p>
                                <p className="bg-white p-4 rounded-lg shadow-md text-sm mb-3 text-gray-400 font-serif font-bold"><strong className="tracking-widest font-semibold text-blue-500">Completed window:</strong> {taskDetails.completion_window || "N/A"}</p>
                                <p className="bg-white p-4 rounded-lg shadow-md text-sm mb-3 text-gray-400 font-serif font-bold"><strong className="tracking-widest font-semibold text-blue-500">Task Type:</strong> {taskType || "N/A"}</p>
                                {subtasks.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg shadow-md text-sm text-primaryLighter">
                                        <h4 className="font-bold mt-4">Subtasks:</h4>
                                        <ul>
                                            {subtasks.map((subtask, index) => (
                                                <li key={index} className="border-b py-1">
                                                    {subtask.subtask_name} {subtask.subtask_skippable ? "(Skippable)" : ""}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {dataFields.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg shadow-md text-sm text-primaryLighter">
                                        <h4 className="font-bold mt-4">Data Fields:</h4>
                                        <ul>
                                            {dataFields.map((field, index) => (
                                                <li key={index} className="border-b py-1">
                                                    {field.name} ({field.type})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                       
                    </div>

                    <div className="flex gap-2 justify-end my-4 relative">
                        {taskType !== "" && <div className="flex text-blue-500 font-semibold tracking-wider text-xl py-3 px-5 left-5 absolute"><button className="self-center" onClick={(e) => e.target.innerText === "Next" ? setStep(2) : setStep(1)}>{step === 1 ? "Next" : "Prev"} </button> <MdArrowRightAlt /> </div>}
                        <TaskButton handleCancel={confirmCancel} name={"Cancel"} />
                        <TaskButton handleSubmit={handleInitialSubmit} name="Finish" />
                    </div>
                </div>
                
                :
                <div className="container text-xs lg:max-w-2xl lg:w-8/12 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-10 bg-white rounded-2xl shadow-darker h-screen  z-50 bg-gradient-to-b from-primaryFaint from-5% via-white">
                    {showConfirmModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                                <h3 className="text-xl font-bold mb-4 text-gray-500">Confirm Task Submission</h3>
                                <p className="font-bold text-orange-400">Are you sure you want to submit this task?</p>
                                <div className="mt-4 flex justify-center gap-4">
                                    <button className="btn-primary" onClick={confirmSubmission}>{editLoading ? <LoadingSpinner size={20} /> : "Yes, Submit"}</button>
                                    <button className="border-red-400 bg-transparent text-red-400 border px-3 rounded-lg" onClick={() => { setShowConfirmModal(false) }}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}
                    {step === 1 && <div>
                        <div className="text-primaryDark mb-4">
                            <h3 className="font-bold">Edit Task</h3>
                            <h4 className="tracking-wider">Modify the task details and subtasks as needed</h4>
                        </div>
                        <hr className="bg-primaryDark mb-4" />


                        <h5 className="text-primary mb-4 text-lg">Task Details:</h5>
                        <div className="mb-4 text-gray-400">
                            <label className="block mb-1 text-xs text-primary font-semibold">Name *</label>
                            <input
                                type="text"
                                placeholder="Enter task title"
                                value={taskDetails.name}
                                onChange={(e) => handleTaskDetailsChange("name", e.target.value)}
                                className="border w-full px-2 py-1 text-xs rounded-lg"
                            />
                        </div>

                        <div className="mb-4 text-gray-400">
                            <label className="block mb-1 text-xs text-primary font-semibold">Department *</label>
                            <input
                                type="text"
                                placeholder="Enter department"
                                value={taskDetails.department}
                                disabled
                                className="border w-full px-2 py-1 text-xs rounded-lg"
                            />
                        </div>

                        <div className="mb-4 bg-gray-100 rounded-xl p-4">
                            <label className="block mb-1 text-primary font-semibold">Description <span className="text-xs">(Optional)</span></label>
                            <textarea
                                placeholder="eg. what the task is about.."
                                value={taskDetails.description}
                                onChange={(e) => handleTaskDetailsChange("description", e.target.value)}
                                className="border w-full px-2 py-2 outline-none rounded-lg text-xs resize-none"
                                rows={4}
                            />
                        </div>


                        <div className="mb-4 bg-gray-100 rounded-xl p-4">
                            <label className="block mb-1 text-primary  font-semibold">Completion Window <span className="text-xs">(Optional)</span></label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="eg. 3"
                                    value={taskDetails.completion_window_value || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // const unit = taskDetails.completion_window_unit || "minutes"; // Default to "minutes" if unit is not set
                                        handleTaskDetailsChange("completion_window_value", `${value}`);
                                    }}
                                    className="border w-1/2 px-2 py-2 outline-none rounded-lg text-xs"
                                    min="1" // Ensure the number is at least 1
                                />
                                <select
                                    value={taskDetails.completion_window_unit || "minutes"} // Default to "minutes"
                                    onChange={(e) => {
                                        const unit = e.target.value;
                                        // const value = taskDetails.completion_window_value || ""; // Use the current value
                                        handleTaskDetailsChange("completion_window_unit", `${unit}`);
                                    }}
                                    className="border w-1/2 px-2 py-2 outline-none rounded-lg text-xs bg-white"
                                >
                                    <option value="minutes">Minutes</option>
                                    <option value="hours">Hours</option>
                                    <option value="days">Days</option>
                                </select>
                            </div>
                        </div>

                    </div>}
                    {step === 2 && (
                        <>
                            <div className="mb-4 bg-gray-100 rounded-xl p-4">
                                <label className="block mb-1 text-primary font-semibold">Frequency *</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="eg. 3"
                                        value={taskDetails.frequency_value || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            handleTaskDetailsChange("frequency_value", `${value}`);
                                        }}
                                        className="border w-1/2 px-2 py-2 outline-none rounded-lg text-xs"
                                        min="1" // Ensure the number is at least 1
                                    />
                                    <select
                                        value={taskDetails.frequency_unit || "minutes"} // Default to "minutes"
                                        onChange={(e) => {
                                            const unit = e.target.value;
                                            handleTaskDetailsChange("frequency_unit", `${unit}`);
                                        }}
                                        className="border w-1/2 px-2 py-2 outline-none rounded-lg text-xs bg-white"
                                    >
                                        {/* <option value="minutes">Minutes</option> */}
                                        <option value="hours">Hours</option>
                                        <option value="days">Days</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-4 bg-gray-100 rounded-xl p-4">
                                <label className="block mb-1 text-primary font-semibold">Add Instruction File</label>
                                <label className="flex items-center justify-center cursor-pointer w-full px-3 py-2 bg-primaryLighter border rounded-lg text-white hover:bg-white hover:border-primary hover:border-2 hover:text-primary">
                                    <span>Upload File</span>
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-xs text-gray-400 mt-4">You can only add media files, with a maximum size of 1.5GB and a duration of 3 minutes for videos. The maximum image size for images is 10MB.</p>
                            </div>
                            <h5 className="text-primary text-center text-lg">Subtasks:</h5>
                            <ul className="overflow-y-scroll overflow-hidden h-52 border-y  ">
                                {subtasks.map((subtask, index) => (
                                    <li key={index} className="flex gap-2 my-2 justify-center items-center">
                                        <input
                                            type="text"
                                            placeholder="Subtask Name"
                                            value={subtask.subtask_name}
                                            onChange={(e) => handleSubtaskChange(index, "subtask_name", e.target.value)}
                                            className="border px-2 py-1 rounded-lg"
                                        />
                                        <label className="font-semibold">
                                            <input
                                                type="checkbox"
                                                checked={subtask.subtask_skippable}
                                                onChange={(e) => handleSubtaskChange(index, "subtask_skippable", e.target.checked)}
                                            />
                                            Skippable
                                        </label>
                                        <button className="text-base text-red-500" onClick={() => handleDeleteSubtask(index)}>
                                            <MdDeleteOutline />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <button className="btn-primary" onClick={handleAddSubtask}>
                                Add Subtask
                            </button>
                        </>
                    )}
                    

                    <div className="flex  fixed bottom-2 gap-4 mt-4 justify-end">
                        <button className="btn-primary" onClick={(e) => e.target.innerText === "Next" ? setStep(2) : setStep(1)}>{step ===1 ? "Next" : "Prev"}</button>
                        <button className="btn-primary" onClick={handleInitialSubmit}>Submit Changes</button>
                        <button className="btn-primary" onClick={handleCancel}>Cancel</button>
                    </div>
                </div>

            }
        </>

    );
};
export default TaskForm2;