import TaskButton from "./TaskButton";
import React, { useState, useEffect } from "react";
import { MdInfo, MdTaskAlt, MdList, MdCheck } from "react-icons/md";
import useInsertTask from "../hooks/useInsertTasks";


const TaskForm2 = ({ btnType, handleCancel, taskData }) => {
    const {insertTask,loading,error} = useInsertTask();

    const [step, setStep] = useState(1); 
    const [taskType, setTaskType] = useState(""); 
    const [subtasks, setSubtasks] = useState([]); 
    const [dataFields, setDataFields] = useState([]); 
    const [taskDetails, setTaskDetails] = useState({
        title: "",
        department: "",
        completedBy: "",
        instructionFile: null,
    });  


    const steps = [
        { label: "Task Details and Choose Type", icon: <MdTaskAlt /> },
        // { label: "Choose Type", icon: "📋" },
        { label: "Add Subtasks", icon: <MdList /> },
        { label: "Review & Submit", icon: <MdCheck /> }
    ];

    useEffect(() => {
        if (btnType === "edit" && taskData) {
            setTaskDetails({
                title: taskData.title || "",
                department: taskData.department || "",
                completedBy: taskData.completedBy || "",
                instructionFile: taskData.instructionFile || null,
            });
            setSubtasks(taskData.subtasks || []);
        }
    }, [btnType, taskData]);

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
        setSubtasks([...subtasks, { name: "", skippable: false }]);
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
        };
        await insertTask(taskSubmission);
        console.log("Task Submitted:", taskSubmission);

    };

    return (
        <>
            {btnType === "Create New" ?
                <div className="container mx-auto  px-4 py-10 bg-white rounded-lg">
                    <div className="text-primaryDark mb-6">
                        <h3 className="font-bold">Create New Tasks</h3>
                        <h4 className="tracking-wider">All Inputs Marked * Are Required</h4>
                    </div>
                    <hr className="bg-gray-400 mb-4" />
                    <div className="flex justify-end mb-4">
                        <TaskButton handleCancel={handleCancel} name={"Cancel"} />
                    </div>
                    {/* Step Indicators */}
                    <div className="flex justify-around items-center mb-6 py-4 bg-primaryFaint rounded-md">
                        {steps.map((stepItem, index) => (
                            <div className="flex flex-col self-start" key={index}>
                                <p className={`${index + 1 === step ? "text-primaryDark text-4xl font-bold mb-3" : "opacity-30"}`}>{index + 1}.</p>
                                <div
                                    // key={index}
                                    className={`flex flex-col items-center ${index + 1 === step ? "text-primaryDark bg-white font-bold border-4 rounded-full px-10 py-10 shadow-light size-40 text-center  border-primary" : "text-gray-400 border-4 size-40 rounded-full p-10"
                                        }`}
                                >
                                    <span className="text-red-400 text-xl ">{stepItem.icon}</span>
                                    <span className="text-xs">{stepItem.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>

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
                                    <span className="mr-2 text-gray-400 text-xs">📁 Upload File</span>
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <div className=" flex mt-4 items-center gap-4 justify-between">
                                <TaskButton onClick={handleSubmit} name="Finish" loading = {loading} />
                                <h5 className="text-red-400 text-xs font-bold my-4 bg-gray-300 text-center py-4 rounded-lg grow">for tasks that require input data or subtasks continue below</h5>
                            </div>

                            <h5 className="text-gray-400 text-3xl mb-4">Select Task Type:</h5>
                            <div className="flex gap-4">
                                <div
                                    className="p-4 border rounded shadow-md cursor-pointer hover:bg-primaryFaint"
                                    onClick={() => handleTaskTypeChange("checklist")}
                                >
                                    <h6 className="font-bold text-primaryDark">Checklist Task</h6>
                                    <p className="text-sm text-gray-600">
                                        A checklist task allows you to create a series of subtasks that can be marked as skippable or not.
                                    </p>
                                </div>
                                <div
                                    className="p-4 border rounded shadow-md cursor-pointer hover:bg-primaryFaint"
                                    onClick={() => handleTaskTypeChange("data-collection")}
                                >
                                    <h6 className="font-bold text-primaryDark">Data Collection Task</h6>
                                    <p className="text-sm text-gray-600">
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
                                            value={subtask.name}
                                            onChange={(e) =>
                                                handleSubtaskChange(index, "name", e.target.value)
                                            }
                                            className="border px-2 py-1 rounded-md"
                                        />
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={subtask.skippable}
                                                onChange={(e) =>
                                                    handleSubtaskChange(
                                                        index,
                                                        "skippable",
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
                                Add Subtask
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

                    {step === 3 && (
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
                    )}
        
                {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
                
                :
                <div className="container lg:max-w-3xl lg:w-8/12  absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-10 bg-white rounded-2xl shadow-darker   z-20 bg-gradient-to-b from-primaryFaint from-5% via-white">

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
                                        value={subtask.name}
                                        onChange={(e) => handleSubtaskChange(index, "name", e.target.value)}
                                        className="border px-2 py-1"
                                    />
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={subtask.skippable}
                                            onChange={(e) => handleSubtaskChange(index, "skippable", e.target.checked)}
                                        />
                                        Skippable
                                    </label>
                                    <button className="btn-danger" onClick={() => handleDeleteSubtask(index)}>
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
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