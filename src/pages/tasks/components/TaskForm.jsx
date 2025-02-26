import TaskButton from "./TaskButton";
import React, { useState, useEffect } from "react";
import { MdClose, MdDeleteOutline } from "react-icons/md";
import useInsertTask from "../hooks/useInsertTasks";
import useSubmitEditTask from "../hooks/useSubmitEditTask";
import { data } from "react-router-dom";
import ConfirmModal from "./ConfirmModal";
import LoadingSpinner from "../../../common/LoadingSpinner";
import supabase from "../../../config/supabaseClient";






const TaskForm2 = ({ btnType,
    step,
    setStep,
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

    const [taskType, setTaskType] = useState("");
    // const [dataFields, setDataFields] = useState([]);
    const [originalSubtasks, setOriginalSubtasks] = useState([]);
    const [showGuide, setShowGuide] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [modalType, setModalType] = useState("submit");
    const [tables, setTables] = useState([]); // State to store fetched tables
    const [columns, setColumns] = useState({}); 

    const { submitEditTask, loading: editLoading, error: editError } = useSubmitEditTask();

    useEffect(() => {
        setOriginalSubtasks(subtasks);
    }, []);

    useEffect(() => {
        const fetchTables = async () => {
            const { data, error } = await supabase
                .from('tables_metadata')
                .select('table_name');

            if (error) {
                console.error('Error fetching tables:', error);
            } else {
                setTables(data);
            }
        };

        if (step === 2 && taskType === "data-collection") {
            fetchTables();
        }
    }, [step, taskType]);

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

    // const handleAddDataField = () => {
    //     setDataFields([...dataFields, { name: "", type: "text" }]);
    // };
    const fetchColumns = async (tableName) => {
        // Step 1: Fetch the table_id based on the table_name
        const { data: tableData, error: tableError } = await supabase
            .from('tables_metadata')
            .select('table_id')
            .eq('table_name', tableName)
            .single(); // Use .single() if you expect only one result
    
        if (tableError) {
            console.error('Error fetching table ID:', tableError);
            return; // Exit if there's an error
        }
    
        // Step 2: Fetch columns using the retrieved table_id
        const { data, error } = await supabase
            .from('columns_metadata')
            .select('column_name') //filter out those that are referencing other columns
            .eq('table_id', tableData.table_id); // Use the retrieved table_id
    
        if (error) {
            console.error('Error fetching columns:', error);
        } else {
            //remove column with ids in name
            setColumns((prev) => ({
                ...prev,
                [tableName]: data,
            }));
        }
    };

    const handleAddDataField = () => {
        setDataFields([
            ...dataFields,
            { 
                name: "", 
                type: "text", 
                referenceTable: null, 
                referenceColumn: null,
                showReference: false, // Initially hide reference fields
            }
        ]);
    };

    const handleDataFieldChange = (index, field, value) => {
        
        const updatedFields = [...dataFields];
        updatedFields[index][field] = value;
        setDataFields(updatedFields);

        if (field === 'referenceTable' && value) {
            fetchColumns(value);
        }
    };

    const handleToggleReference = (index) => {
        const updatedFields = [...dataFields];
        updatedFields[index].showReference = !updatedFields[index].showReference;
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
                  
                    <div className="mb-6 flex items-start">
                        <div className="mr-4 mt-1 bg-gray-100 p-3 rounded-lg shadow-sm transform transition-all duration-300 hover:scale-110 hover:shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>

                        <div className="border-l-3 border-gray-500 pl-4">
                            <h3 className="font-semibold text-2xl text-gray-500 flex items-center">
                                Create New Task
                            
                            </h3>
                            <p className="text-gray-500 mt-1 text-sm">Fill in the details below to set up your task</p>
                            
                        </div>
                    </div>
                    <hr className="bg-gray-400 mb-4" />
                    {/* ****************************************************************************************** */}
                    {showGuide && (
                        <div className="bg-gradient-to-r from-blue-50 to-gray-50 rounded-xl mb-6 p-6 relative border border-blue-100 shadow-sm">
                            <button
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                                onClick={() => setShowGuide(false)}
                                aria-label="Close guide"
                            >
                                <MdClose className="text-xl" />
                            </button>

                            <div className="flex items-center mb-4">
                                <div className="bg-blue-100 p-2 rounded-full mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-medium text-gray-700">Getting Started Guide</h4>
                            </div>

                            <p className="text-gray-600 mb-5">Complete these three simple steps to create your first task:</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    {
                                        icon: (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        ),
                                        title: "Enter Task Details",
                                        description: "Provide a title, department, and other basic information about your task.",
                                        color: "blue"
                                    },
                                    {
                                        icon: (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                            </svg>
                                        ),
                                        title: "Select Task Type",
                                        description: "Choose between Checklist or Data Collection depending on your needs.",
                                        color: "blue"
                                    },
                                    {
                                        icon: (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                            </svg>
                                        ),
                                        title: "Review & Submit",
                                        description: "Verify all information is correct and submit your new task.",
                                        color: "blue"
                                    }
                                ].map((step, index) => (
                                    <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100">
                                        <div className={`bg-${step.color}-50 p-3 flex items-center justify-between border-b border-${step.color}-100`}>
                                            <div className={`flex items-center`}>
                                                <div className={`bg-${step.color}-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-${step.color}-600 font-bold`}>
                                                    {index + 1}
                                                </div>
                                                <h5 className={`font-medium text-${step.color}-500`}>{step.title}</h5>
                                            </div>
                                            <div className={`text-${step.color}-500`}>
                                                {step.icon}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <p className="text-gray-500 text-sm">{step.description}</p>
                                        </div>
                                        <div className={`p-3 border-t border-gray-100 bg-gray-50 text-xs text-${step.color}-500 flex items-center`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                            </svg>
                                            <span>Step {index + 1} of 3</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 flex justify-end">
                                <button
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                    onClick={() => setShowGuide(false)}
                                >
                                    Got it, don't show again
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                    {/* ****************************************************************************************** */}

                    <div className="flex gap-4">
                        <div className="grow-1/2 w-2/3 border-r border-gray">

                            {step === 1 && (
                                <form className="px-10">
                                    <h5 className="text-green-500 font-semibold text-2xl mb-6 p-4 border-b">Task Details</h5>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        {/* Left column */}
                                        <div>
                                            <div className="mb-4 bg-gray-50 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md">
                                                <label className="block mb-1 text-gray-500 font-medium text-sm">Task Name <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter task title"
                                                    value={taskDetails.name}
                                                    onChange={(e) => handleTaskDetailsChange("name", e.target.value)}
                                                    className="border w-full px-3 py-2 rounded-lg outline-none text-sm focus:ring-2 focus:ring-green-300 transition-all"
                                                    required
                                                />
                                            </div>

                                            <div className="mb-4 bg-gray-50 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md">
                                                <label className="block mb-1 text-gray-500 font-medium text-sm">Department <span className="text-red-500">*</span></label>
                                                <select
                                                    value={taskDetails.department}
                                                    onChange={(e) => handleTaskDetailsChange("department", e.target.value)}
                                                    className="border w-full px-3 py-2 rounded-lg outline-none text-sm bg-white focus:ring-2 focus:ring-green-300 transition-all"
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

                                            <div className="mb-4 bg-gray-50 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md">
                                                <label className="block mb-1 text-gray-500 font-medium text-sm">Active Status</label>
                                                <div className="flex items-center space-x-4 mt-2">
                                                    <label className="inline-flex items-center">
                                                        <input
                                                            type="radio"
                                                            className="form-radio h-4 w-4 text-green-500"
                                                            name="active"
                                                            value="true"
                                                            checked={taskDetails.active === "true"}
                                                            onChange={(e) => handleTaskDetailsChange("active", e.target.value)}
                                                        />
                                                        <span className="ml-2 text-sm">Active</span>
                                                    </label>
                                                    <label className="inline-flex items-center">
                                                        <input
                                                            type="radio"
                                                            className="form-radio h-4 w-4 text-red-500"
                                                            name="active"
                                                            value="false"
                                                            checked={taskDetails.active === "false"}
                                                            onChange={(e) => handleTaskDetailsChange("active", e.target.value)}
                                                        />
                                                        <span className="ml-2 text-sm">Inactive</span>
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">Defaults to active if not specified</p>
                                            </div>
                                        </div>

                                        {/* Right column */}
                                        <div>
                                            <div className="mb-4 bg-gray-50 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md">
                                                <label className="block mb-1 text-gray-500 font-medium text-sm">Frequency <span className="text-red-500">*</span></label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        placeholder="e.g., 3"
                                                        value={taskDetails.frequency_value || ""}
                                                        onChange={(e) => handleTaskDetailsChange("frequency_value", e.target.value)}
                                                        className="border w-1/2 px-3 py-2 outline-none rounded-lg text-sm focus:ring-2 focus:ring-green-300 transition-all"
                                                        min="1"
                                                    />
                                                    <select
                                                        value={taskDetails.frequency_unit || "hours"}
                                                        onChange={(e) => handleTaskDetailsChange("frequency_unit", e.target.value)}
                                                        className="border w-1/2 px-3 py-2 outline-none rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-300 transition-all"
                                                    >
                                                        <option value="hours">Hours</option>
                                                        <option value="days">Days</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="mb-4 bg-gray-50 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md">
                                                <label className="block mb-1 text-gray-500 font-medium text-sm">Completion Window</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        placeholder="e.g., 3"
                                                        value={taskDetails.completion_window_value || ""}
                                                        onChange={(e) => handleTaskDetailsChange("completion_window_value", e.target.value)}
                                                        className="border w-1/2 px-3 py-2 outline-none rounded-lg text-sm focus:ring-2 focus:ring-green-300 transition-all"
                                                        min="1"
                                                    />
                                                    <select
                                                        value={taskDetails.completion_window_unit || "minutes"}
                                                        onChange={(e) => handleTaskDetailsChange("completion_window_unit", e.target.value)}
                                                        className="border w-1/2 px-3 py-2 outline-none rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-300 transition-all"
                                                    >
                                                        <option value="minutes">Minutes</option>
                                                        <option value="hours">Hours</option>
                                                        <option value="days">Days</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="mb-4 bg-gray-50 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md">
                                                <label className="flex justify-between mb-1">
                                                    <span className="text-gray-500 font-medium text-sm">Add Instruction File</span>
                                                    <span className="text-xs text-gray-400">Optional</span>
                                                </label>
                                                <label className="flex items-center text-white justify-center cursor-pointer w-full px-3 py-2 bg-green-500 border rounded-lg hover:bg-white hover:border-green-500 hover:text-green-500 transition-all duration-200">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                    <span>Upload File</span>
                                                    <input
                                                        type="file"
                                                        onChange={handleFileUpload}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <p className="text-xs text-gray-400 mt-2">Max size: 10MB for images, 1.5GB for videos (3 min max)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6 bg-gray-50 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md">
                                        <label className="block mb-1 text-gray-500 font-medium text-sm">Description</label>
                                        <textarea
                                            placeholder="What this task is about..."
                                            value={taskDetails.description}
                                            onChange={(e) => handleTaskDetailsChange("description", e.target.value)}
                                            className="border w-full px-3 py-2 outline-none rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-300 transition-all"
                                            rows={4}
                                        />
                                    </div>

                                    <div className="relative py-5">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-300"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="bg-white px-4 text-sm text-blue-500 font-medium">Task Configuration</span>
                                        </div>
                                    </div>

                                    <h5 className="text-green-500 font-semibold text-xl mb-4">Select Task Type</h5>
                                    <div>
                                        {taskType ? (
                                            <div className="bg-blue-50 p-5 border rounded-xl shadow-sm">
                                                <div className="flex items-center">
                                                    <div className="mr-4 rounded-full bg-blue-100 p-2">
                                                        {taskType === "checklist" ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h6 className="font-semibold text-gray-800">
                                                            {taskType === "checklist" ? "Checklist Task" : "Data Collection Task"}
                                                        </h6>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {taskType === "checklist"
                                                                ? "A series of subtasks that can be marked as skippable or required"
                                                                : "Custom fields for gathering necessary information"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    className="mt-4 text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center"
                                                    onClick={() => { handleTaskTypeChange(""); setStep(1); setSubtasks([]); setDataFields([]) }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                                                    </svg>
                                                    Change Task Type
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div
                                                    className="bg-white p-5 border rounded-xl shadow-sm hover:shadow-md cursor-pointer hover:border-blue-300 transition-all duration-200"
                                                    onClick={() => handleTaskTypeChange("checklist")}
                                                >
                                                    <div className="flex items-center mb-3">
                                                        <div className="rounded-full bg-green-100 p-2 mr-3">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                            </svg>
                                                        </div>
                                                        <h6 className="font-semibold text-green-600">Checklist Task</h6>
                                                    </div>
                                                    <p className="text-xs text-gray-500 ml-10">
                                                        Create a series of subtasks that can be marked as skippable or required
                                                    </p>
                                                </div>
                                                <div
                                                    className="bg-white p-5 border rounded-xl shadow-sm hover:shadow-md cursor-pointer hover:border-blue-300 transition-all duration-200"
                                                    onClick={() => handleTaskTypeChange("data-collection")}
                                                >
                                                    <div className="flex items-center mb-3">
                                                        <div className="rounded-full bg-green-100 p-2 mr-3">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <h6 className="font-semibold text-green-600">Data Collection Task</h6>
                                                    </div>
                                                    <p className="text-xs text-gray-500 ml-10">
                                                        Specify custom fields for gathering necessary information
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            )}

                            {step === 2 && taskType === "checklist" && (
                                <div className="px-10">
                                    <div className="flex items-center mb-6">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <h5 className="text-blue-600 font-semibold text-xl">Checklist Subtasks</h5>
                                    </div>

                                    {subtasks.length === 0 && (
                                        <div className="text-center py-8 bg-gray-50 rounded-xl mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            <p className="text-gray-500">No subtasks yet. Add your first subtask below.</p>
                                        </div>
                                    )}

                                    <ul className="space-y-3 mb-6">
                                        {subtasks.map((subtask, index) => (
                                            <li key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border hover:shadow-md transition-all duration-200">
                                                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">
                                                    {index + 1}
                                                </span>
                                                <input
                                                    type="text"
                                                    placeholder="Subtask Name"
                                                    value={subtask.subtask_name}
                                                    onChange={(e) => handleSubtaskChange(index, "subtask_name", e.target.value)}
                                                    className="flex-grow border px-3 py-2 rounded-md outline-none text-sm focus:ring-2 focus:ring-blue-300 transition-all"
                                                />
                                                <label className="flex items-center text-gray-700 whitespace-nowrap">
                                                    <input
                                                        className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 mr-2 transition-all duration-200"
                                                        type="checkbox"
                                                        checked={subtask.subtask_skippable}
                                                        onChange={(e) => handleSubtaskChange(index, "subtask_skippable", e.target.checked)}
                                                    />
                                                    Skippable
                                                </label>
                                                <button
                                                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                                                    onClick={() => {
                                                        const newSubtasks = [...subtasks];
                                                        newSubtasks.splice(index, l);
                                                        setSubtasks(newSubtasks);
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        className="flex items-center bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition-colors duration-200"
                                        onClick={handleAddSubtask}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Subtask
                                    </button>
                                </div>
                            )}

                            {step === 2 && taskType === "data-collection" && (
                                <div className="px-10">
                                    <div className="flex items-center mb-6">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h5 className="text-blue-600 font-semibold text-xl">Data Collection Fields</h5>
                                    </div>

                                    {dataFields.length === 0 && (
                                        <div className="text-center py-8 bg-gray-50 rounded-xl mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-gray-500">No data fields yet. Add your first field below.</p>
                                        </div>
                                    )}

                                    <ul className="space-y-4 mb-6">
                                        {dataFields.map((field, index) => (
                                            <li key={index} className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-all duration-200">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">
                                                        {index + 1}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        placeholder="Field Name"
                                                        value={field.name}
                                                        onChange={(e) => handleDataFieldChange(index, "name", e.target.value)}
                                                        className="flex-grow border px-3 py-2 rounded-md outline-none text-sm focus:ring-2 focus:ring-blue-300 transition-all"
                                                    />
                                                    <select
                                                        value={field.type}
                                                        onChange={(e) => handleDataFieldChange(index, "type", e.target.value)}
                                                        className="border px-3 py-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-300 transition-all"
                                                    >
                                                        <option value="text">Text</option>
                                                        <option value="float4">Decimal Number</option>
                                                        <option value="int">Whole Number</option>
                                                        <option value="bool">True/False</option>
                                                        <option value="timestamp">Date and Time</option>
                                                    </select>
                                                    <button
                                                        onClick={() => handleToggleReference(index)}
                                                        className="p-2 text-gray-500 hover:text-blue-500 transition-colors rounded-md hover:bg-blue-50"
                                                        title="Toggle reference fields"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                                                        onClick={() => {
                                                            const newFields = [...dataFields];
                                                            newFields.splice(index, 1);
                                                            setDataFields(newFields);
                                                        }}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                {field.showReference && (
                                                    <div className="ml-9 mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100 animate-fadeIn">
                                                        <p className="text-xs text-blue-600 mb-2 font-medium">Reference Configuration</p>
                                                        <div className="flex flex-wrap gap-3">
                                                            <select
                                                                value={field.referenceTable || ''}
                                                                onChange={(e) => handleDataFieldChange(index, "referenceTable", e.target.value)}
                                                                className="flex-grow border px-3 py-2 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-300 transition-all"
                                                            >
                                                                <option value="">Select Reference Table</option>
                                                                {tables.map((table) => (
                                                                    <option key={table.table_name} value={table.table_name}>
                                                                        {table.table_name}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            {field.referenceTable && (
                                                                <select
                                                                    value={field.referenceColumn || ''}
                                                                    onChange={(e) => handleDataFieldChange(index, "referenceColumn", e.target.value)}
                                                                    className="flex-grow border px-3 py-2 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-300 transition-all"
                                                                >
                                                                    <option value="">Select Reference Column</option>
                                                                    {columns[field.referenceTable]?.map((column) => (
                                                                        <option key={column.column_name} value={column.column_name}>
                                                                            {column.column_name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        className="flex items-center bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition-colors duration-200"
                                        onClick={handleAddDataField}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Field
                                    </button>
                                </div>
                            )}
                             
                       
                        </div>
                        {/* Review Panel */}
                        <div className="grow-1/2 w-1/3 p-4  ml-4 self-start">
                            <h2 className="text-xl font-semibold mb-4 text-green-500 border-b pb-2">Task Review</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-white-50 shadow-md border-l-3  border-green-300 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-400 mb-1">Title</h3>
                                    <p className="text-base font-light text-gray-500 tracking-widest ">{taskDetails.name || "N/A"}</p>
                                </div>

                                <div className="bg-white-50 shadow-md border border-gray-200 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-400 mb-1">Department</h3>
                                    <p className="text-base font-light text-gray-500 tracking-widest">{taskDetails.department || "N/A"}</p>
                                </div>

                                <div className="col-span-1 md:col-span-2 bg-white-50 shadow-md border-l-3 border-green-300 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-400 mb-1">Description</h3>
                                    <p className="text-base font-light text-gray-500 tracking-widest">{taskDetails.description || "N/A"}</p>
                                </div>

                                <div className="bg-white-50 shadow-md border-l-3 border-green-300 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-400 mb-1">Frequency</h3>
                                    <p className="text-base font-light text-gray-500 tracking-widest">{taskDetails.frequency || "N/A"}</p>
                                </div>

                                <div className="bg-white-50 shadow-md border border-gray-200 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-400 mb-1">Completion Window</h3>
                                    <p className="text-base font-light text-gray-500 tracking-widest">{taskDetails.completion_window || "N/A"}</p>
                                </div>

                                <div className="bg-white-50 shadow-md  border-l-3 border-green-300 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-400 mb-1">Task Type</h3>
                                    <p className="text-base font-light text-gray-500 tracking-widest">{taskType || "N/A"}</p>
                                </div>
                            </div>

                            {subtasks.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-lg font-medium mb-2 text-gray-700">Subtasks</h3>
                                    <ul className="bg-gray-50 rounded p-4 divide-y divide-gray-200">
                                        {subtasks.map((subtask, index) => (
                                            <li key={index} className="py-2 flex items-start">
                                                <span className="inline-flex items-center">
                                                    <span className="mr-2 flex-shrink-0 text-blue-500">•</span>
                                                    <span className="font-medium">{subtask.subtask_name}</span>
                                                    {subtask.subtask_skippable && (
                                                        <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                                            Skippable
                                                        </span>
                                                    )}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {dataFields.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-medium mb-2 text-gray-700">Data Fields</h3>
                                    <div className="bg-gray-50 rounded overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field Name</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {dataFields.map((field, index) => (
                                                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{field.name}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-500">{field.type}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                       
                    </div>

                    <div className="flex gap-2 justify-end my-4 relative">
                        {taskType !== "" && <div className="flex text-blue-500 font-semibold tracking-wider text-sm py-3 px-5 left-5 transform transition-all duration-300 items-center border-2 hover:scale-105 border-blue-400 hover:shadow-md cursor-pointer rounded-lg absolute"><button className="self-center" onClick={(e) => e.target.innerText === "Next" ? setStep(2) : setStep(1)}>{step === 1 ? "Next" : "Prev"} </button> </div>}
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