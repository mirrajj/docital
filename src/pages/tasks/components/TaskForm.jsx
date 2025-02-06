import TaskButton from "./TaskButton";
import React, { useState, useEffect } from "react";
import { MdInfo } from "react-icons/md";
import useInsertTask from "../hooks/useInsertTasks";
import useSubmitEditTask from "../hooks/useSubmitEditTask";


const TaskForm2 = ({ btnType,
    handleCancel,
    setTaskDetails,
    setSubtasks,
    taskDetails,
    subtasks,
    currentTaskID,
    setShowForm,
    setShowSuccess,
    setShowError,
    hideModal }) => {


    const { insertTask, loading, error } = useInsertTask();

    const [step, setStep] = useState(1);
    const [taskType, setTaskType] = useState("");
    const [dataFields, setDataFields] = useState([]);
    const [originalSubtasks, setOriginalSubtasks] = useState([]);

    const { submitEditTask, loading: editLoading, error: editError } = useSubmitEditTask();

    useEffect(() => {
        setOriginalSubtasks(subtasks);
    }, []);

    console.log("subtasks", subtasks);
    console.log("originalSubtasks", originalSubtasks);


    // Handlers
    const handleTaskTypeChange = (type) => {
        if (taskDetails.title.trim() === "" || taskDetails.department.trim() === "") {
            alert("Please fill out the title and department fields before proceeding.");
            return;
        }
        setTaskType(type);
        setStep(2);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (btnType === "Create New") {
            if (taskDetails.title.trim() === "" || taskDetails.department.trim() === "" || taskDetails.completedBy.trim() === "") {
                alert("Please ensure all required fields (title, department, and completed by) are filled out before submitting.");
                return;
            }

            if (step > 1 && dataFields.some((field) => field.name.trim() === "")) {
                alert("All data fields must be filled out before submitting.");
                return;
            }
            const taskSubmission = {
                taskDetails,
                taskType,
                subtasks,
                dataFields,
                setShowForm,
                setTaskDetails,
                setSubtasks,
                setShowSuccess,
            };
            await insertTask(taskSubmission);
            console.log("Task Submitted:", taskSubmission);
        } else {
            if (taskDetails.title.trim() === "" || taskDetails.department.trim() === "" || taskDetails.completedBy.trim() === "") {
                alert("Please ensure all required fields (title, department, and completed by) are filled out before submitting.");
                return;
            }
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
                hideModal
            };
            await submitEditTask(editSubmission);
            console.log("Task Updated");
        }
    };

    return (
        <>
            {btnType === "Create New" ?
                <div className="container mx-auto  px-4 py-10 bg-white rounded-lg border-dashed border-2">
                    <div className="text-primary mb-6">
                        <h3 className="font-bold">Create New Tasks</h3>
                        <h4 className="tracking-wider">All Inputs Marked * Are Required</h4>
                    </div>
                    <hr className="bg-gray-400 mb-4" />
      

                    <div className="flex gap-4">
                        <div className="grow-1/2 w-2/3 border-r border-gray">

                            {step === 1 && (
                                <form className="px-10">
                                    <h5 className="text-gray-400 text-3xl mb-4">Task Details:</h5>

                                    <div className="mb-4">
                                        <label className="block mb-1 text-gray-400 font-bold">Task Title *</label>
                                        <input
                                            type="text"
                                            placeholder="Enter task title"
                                            value={taskDetails.title}
                                            onChange={(e) => handleTaskDetailsChange("title", e.target.value)}
                                            className="border-2 w-full px-2 py-2 rounded-lg outline-none text-xs"
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block mb-1 text-gray-400 font-bold">Department *</label>
                                        <input
                                            type="text"
                                            placeholder="Enter department"
                                            value={taskDetails.department}
                                            onChange={(e) => handleTaskDetailsChange("department", e.target.value)}
                                            className="border-2 w-full px-2 py-2 rounded-lg outline-none text-xs"
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block mb-1 text-gray-400 font-bold">Completed By</label>
                                        <input
                                            type="text"
                                            placeholder="eg. 3hrs..."
                                            value={taskDetails.completedBy}
                                            onChange={(e) => handleTaskDetailsChange("completedBy", e.target.value)}
                                            className="border-2 w-full px-2 py-2 outline-none rounded-lg text-xs"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block mb-1 text-gray-400 font-bold">Instruction File</label>
                                        <label
                                            className="flex items-center cursor-pointer w-fit px-3 py-2 hover:bg-gray-100"
                                        >
                                            <span className="mr-2 text-gray-400 text-xs"><span className="text-lg">📁</span> Upload File</span>
                                            <input
                                                type="file"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    <div className=" flex mt-4 mb-4 items-center gap-4 justify-between">
                                        
                                        <h5 className="text-orange-400 text-xs font-bold my-4 bg-gray-300 text-center py-4 rounded-lg grow">for tasks that require input data or subtasks continue below</h5>
                                    </div>
                                    <hr className="my-4 h-2" />

                                    <h5 className="text-gray-400 text-3xl mb-4">Select Task Type:</h5>
                                    <div className="flex gap-4">
                                        <div
                                            className=" bg-gray-100 p-4 border rounded-3xl shadow-md cursor-pointer hover:bg-primaryFaint"
                                            onClick={() => handleTaskTypeChange("checklist")}
                                        >
                                            <h6 className="font-bold text-primary">Checklist Task</h6>
                                            <MdInfo color="green" />
                                            <p className="text-xs text-gray-400">
                                                A checklist task allows you to create a series of subtasks that can be marked as skippable or not.
                                            </p>
                                        </div>
                                        <div
                                            className="bg-gray-100 p-4 border rounded-3xl shadow-md cursor-pointer hover:bg-primaryFaint"
                                            onClick={() => handleTaskTypeChange("data-collection")}
                                        >
                                            <h6 className="font-bold text-primary">Data Collection Task</h6>
                                            <MdInfo color="green" />
                                            <p className="text-xs text-gray-400">
                                                A data collection task lets you specify custom fields for gathering necessary information.
                                            </p>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {step === 2 && taskType === "checklist" && (
                                <div>
                                    <h5 className="text-gray-400 text-3xl mb-4">Checklist Task:</h5>

                                    <ul>
                                        {subtasks.map((subtask, index) => (
                                            <li key={index} className="flex gap-2 my-2">
                                                <input
                                                    type="text"
                                                    placeholder="Subtask Name"
                                                    value={subtask.subtask_name}
                                                    onChange={(e) =>
                                                        handleSubtaskChange(index, "subtask_name", e.target.value)
                                                    }
                                                    className="border px-2 py-1 rounded-md"
                                                />
                                                <label>
                                                    <input
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
                                    <button
                                        className="btn-primary mt-4"
                                        onClick={() => setStep(3)}
                                    >
                                        Finish Checklist
                                    </button>
                                </div>
                            )}

                            {step === 2 && taskType === "data-collection" && (
                                <div>
                                    <h5 className="text-gray-400 text-3xl mb-4">Data Collection Task:</h5>

                                    <ul>
                                        {dataFields.map((field, index) => (
                                            <li key={index} className="my-2">
                                                <input
                                                    type="text"
                                                    placeholder="Field Name"
                                                    value={field.name}
                                                    onChange={(e) =>
                                                        handleDataFieldChange(index, "name", e.target.value)
                                                    }
                                                    className="border px-2 py-1"
                                                />
                                                <select
                                                    value={field.type}
                                                    onChange={(e) =>
                                                        handleDataFieldChange(index, "type", e.target.value)
                                                    }
                                                    className="border px-2 py-1 ml-2"
                                                >
                                                    <option value="text">Text</option>
                                                    <option value="float4">Number</option>
                                                    <option value="bool">Boolean</option>
                                                    <option value="date">Date</option>
                                                </select>
                                            </li>
                                        ))}
                                    </ul>
                                    <button className="btn-primary" onClick={handleAddDataField}>
                                        Add Field
                                    </button>
                                    <p></p>
                                    <button
                                        className="btn-primary mt-4"
                                        onClick={() => setStep(3)}
                                    >
                                        Finish Data Collection
                                    </button>
                                </div>
                            )}

                            {/* {step === 3 && (
                                <div>
                                    <h5 className="text-gray-400 text-3xl mb-4">Review & Submit:</h5>
                                    <pre className="bg-gray-100 p-4 rounded">
                                        {JSON.stringify(
                                            { taskDetails, taskType, subtasks, dataFields },
                                            null,
                                            2
                                        )}
                                    </pre>
                                    <div className="flex gap-4 mt-4">
                                        <TaskButton name="Submit" onClick={handleSubmit} loading={loading} />
                                        <TaskButton name="Cancel" onClick={handleCancel} />
                                    </div>
                                </div>
                            )} */}
                        </div>
                        {/* Review Panel */}
                        <div className="grow-1/2 w-1/3 p-4 bg-gray-100 rounded-lg shadow-lg ml-4 self-start">
                            <h3 className=" mb-4 text-2xl text-gray-400">Review</h3>
                            <div>
                                <p className="bg-white p-4 rounded-lg shadow-md text-sm mb-3 text-primaryLighter"><strong> Title:</strong> {taskDetails.title || "N/A"}</p>
                                <p className="bg-white p-4 rounded-lg shadow-md text-sm mb-3 text-primaryLighter"><strong>Department:</strong> {taskDetails.department || "N/A"}</p>
                                <p className="bg-white p-4 rounded-lg shadow-md text-sm mb-3 text-primaryLighter"><strong>Completed By:</strong> {taskDetails.completedBy || "N/A"}</p>
                                <p className="bg-white p-4 rounded-lg shadow-md text-sm mb-3 text-primaryLighter"><strong>Task Type:</strong> {taskType || "N/A"}</p>
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
                            </div>
                        </div>
                    </div>

                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <div className="flex gap-2 justify-end mb-4">
                        <TaskButton handleCancel={handleCancel} name={"Cancel"} />
                        <TaskButton handleSubmit={handleSubmit} name="Finish" loading={loading} />
                    </div>
                </div>
                :
                <div className="container lg:max-w-3xl lg:w-8/12  absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-10 bg-white rounded-2xl shadow-darker  z-20 bg-gradient-to-b from-primaryFaint from-5% via-white">

                    <div className="text-primaryDark mb-6">
                        <h3 className="font-bold">Edit Task</h3>
                        <h4 className="tracking-wider">Modify the task details and subtasks as needed</h4>
                    </div>
                    <hr className="bg-primaryDark mb-4" />

                    <div>
                        <h5>Task Details:</h5>
                        <div className="mb-4">
                            <label className="block mb-1 text-sm">Task Title *</label>
                            <input
                                type="text"
                                placeholder="Enter task title"
                                value={taskDetails.title}
                                onChange={(e) => handleTaskDetailsChange("title", e.target.value)}
                                className="border w-full px-2 py-1 text-sm"
                            />
                        </div>
                        {taskDetails.department &&
                            <div className="mb-4">
                                <label className="block mb-1 text-sm">Department *</label>
                                <input
                                    type="text"
                                    placeholder="Enter department"
                                    value={taskDetails.department}
                                    onChange={(e) => handleTaskDetailsChange("department", e.target.value)}
                                    className="border w-full px-2 py-1 text-sm"
                                />
                            </div>
                        }

                        <div className="mb-4">
                            <label className="block mb-1 text-sm">Completed By *</label>
                            <input
                                type="text"
                                placeholder="Enter responsible person"
                                value={taskDetails.completedBy}
                                onChange={(e) => handleTaskDetailsChange("completedBy", e.target.value)}
                                className="border w-full px-2 py-1 text-sm"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1">Instruction File</label>
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                className="border w-full px-2 py-1"
                            />
                        </div>

                        <h5>Subtasks:</h5>
                        <ul>
                            {subtasks.map((subtask, index) => (
                                <li key={index} className="flex gap-2 my-2">
                                    <input
                                        type="text"
                                        placeholder="Subtask Name"
                                        value={subtask.subtask_name}
                                        onChange={(e) => handleSubtaskChange(index, "subtask_name", e.target.value)}
                                        className="border px-2 py-1"
                                    />
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={subtask.subtask_skippable}
                                            onChange={(e) => handleSubtaskChange(index, "subtask_skippable", e.target.checked)}
                                        />
                                        Skippable
                                    </label>
                                    <button className="btn-danger" onClick={() => handleDeleteSubtask(index)}>
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button className="btn-primary" onClick={handleAddSubtask}>
                            Add Subtask
                        </button>
                    </div>

                    <div className="flex gap-4 mt-4">
                        <button className="btn-primary" onClick={handleSubmit}>Submit Changes</button>
                        <button className="btn-primary" onClick={handleCancel}>Cancel</button>
                    </div>
                </div>

            }

        </>

    );
};
export default TaskForm2;