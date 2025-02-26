import React, { useState } from "react";
import { FiFilter,FiDownload } from "react-icons/fi"; // Importing a funnel icon from react-icons
import useFetchData from "../hooks/useFetchData"; // Custom hook for fetching data
import { MdRefresh } from "react-icons/md";
import AppAlert from "../../../common/AppAlert";

const RecordsHeader2 = ({ onCategoryChange, onDateFilter, handleDownloadPdf }) => {
  const [showError, setShowError] = useState({state: false, message : ""});
  const [retryCount, setRetryCount] = useState(0);

  const { departments, tasks, loading, error } = useFetchData(setShowError,retryCount);
  
  // State for the selected categorization type (Department or Others)
  const [categorizeBy, setCategorizeBy] = useState("");

  // State for the selected department
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // State for the selected task
  const [selectedTask, setSelectedTask] = useState("");

  // State for the selected special table (when categorizeBy is "Others")
  const [selectedTable, setSelectedTable] = useState("");

  // State for the date range filter visibility
  const [showDateFilter, setShowDateFilter] = useState(false);

  // State for the date range filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  //state for fieldValue and field
  const [task_type,setTask_type] = useState("");
  const [fieldVal,setFieldVal] = useState("");

  const handleRetry = () => {
    setRetryCount(retryCount + 1);
  }

  // Handle categorization type change
  const handleCategorizeByChange = (value) => {
    setCategorizeBy(value);
    setSelectedDepartment(""); // Reset selected department
    setSelectedTask(""); // Reset selected task
    setSelectedTable(""); // Reset selected table
  };

  // Handle department selection
  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value);
    setSelectedTask(""); // Reset selected task when department changes
  };

  // Handle task selection
  const handleTaskChange = (value,fieldValue,taskType) => {

    setSelectedTask(value);
    setFieldVal(fieldValue);
    setTask_type(taskType);

    let filterField = null;
    let filterValue = null;
    let tableName;
    (taskType === "data-collection") ? tableName = value : tableName = "task_completion";
    if (!(taskType === "data-collection")) {
        filterField = "task_id";
        filterValue = fieldValue;
    }
    onCategoryChange(tableName, filterField, filterValue); // Notify parent component
  };

  // Handle special table selection (when categorizeBy is "Others")
  const handleTableChange = (value) => {
    setSelectedTable(value);
    onCategoryChange(value, null, null); // Notify parent component
  };

  // Handle date filter submission
  const handleDateFilterSubmit = (e) => {
    e.preventDefault();
    console.log(selectedTable);
    console.log(selectedTask);
    if (selectedTask !== "") {

        let filterField = null;
        let filterValue = null;
        let tableName;

        (task_type === "data-collection") ? tableName = selectedTask : tableName = "task_completion";
        if (!(task_type === "data-collection")) {
            filterField = "task_id";
            filterValue = fieldVal;
        }
        onCategoryChange(tableName, filterField, filterValue, startDate, endDate); // Notify parent component

    } else if (selectedTable !== "") {
        console.log(selectedTable);
        // console.log();
        onCategoryChange(selectedTable, null, null, startDate, endDate); // Notify parent component
    }else{
        alert("no task or table selected!");
    }

    
    // onDateFilter({ startDate, endDate }); // Notify parent component of the date range
    setShowDateFilter(false); // Hide the date filter dropdown after submission
  };

  return (
      <div className="flex w-full flex-col">
          {showError.state && (
              <AppAlert
                  type="error"
                  message={showError.message}
                  onClose={() => setShowError(false)}
              />
          )}

          {/* Loading State with Skeleton */}
          {loading && (
              <div className="w-full animate-pulse">
                  <div className="flex items-center gap-3 border-b border-gray-300 py-2">
                      <div className="h-16 w-32 rounded-md bg-gray-200"></div>
                      <div className="h-16 w-32 rounded-md bg-gray-200"></div>
                      <div className="h-16 w-32 rounded-md bg-gray-200"></div>
                      <div className="ml-auto h-9 w-9 rounded-md bg-gray-200"></div>
                  </div>
              </div>
          )}

          {/* Content State with improved transitions */}
          {(!loading && error === null) && (
              <div className="bg-transparent text-xs gap-3 flex items-center border-b border-gray-300 w-full py-2 transition-opacity duration-300 ease-in-out">
                  {/* Categorize by dropdown */}
                  <div className="">
                      <label htmlFor="categorize-by" className="block text-xs font-semibold text-gray-500">
                          Categorize By:
                      </label>
                      <select
                          id="categorize-by"
                          value={categorizeBy}
                          onChange={(e) => handleCategorizeByChange(e.target.value)}
                          className="block w-full p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          aria-label="Categorize by options"
                      >
                          <option value="">Select an option</option>
                          <option value="Department">Department</option>
                          <option value="Others">Others</option>
                      </select>
                  </div>

                  {/* Department dropdown (shown when categorizeBy is "Department") */}
                  {categorizeBy === "Department" && (
                      <div className="border-l border-gray-300 pl-2 transition-all duration-300 ease-in-out">
                          <label htmlFor="department" className="block text-xs font-semibold text-gray-500">
                              Select Department:
                          </label>
                          <select
                              id="department"
                              value={selectedDepartment}
                              onChange={(e) => handleDepartmentChange(e.target.value)}
                              className="block w-full p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                              aria-label="Department selection"
                          >
                              <option value="">Select a department</option>
                              {departments.map((dept) => (
                                  <option key={dept.department_id} value={dept.department_id}>
                                      {dept.name}
                                  </option>
                              ))}
                          </select>
                      </div>
                  )}

                  {/* Task dropdown (shown when a department is selected) */}
                  {categorizeBy === "Department" && selectedDepartment && (
                      <div className="border-l border-gray-300 pl-2 transition-all duration-300 ease-in-out">
                          <label htmlFor="task" className="block text-xs font-semibold text-gray-500">
                              Select Task:
                          </label>
                          <select
                              id="task"
                              value={selectedTask}
                              onChange={(e) => {
                                  const selectedTaskName = e.target.value;
                                  const selectedTaskType = e.target.selectedOptions[0].getAttribute("data-task-type");
                                  const selectedTaskId = e.target.selectedOptions[0].getAttribute("data-task-id");
                                  handleTaskChange(selectedTaskName, selectedTaskId, selectedTaskType);
                              }}
                              className="block w-full p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                              aria-label="Task selection"
                          >
                              <option value="">Select a task</option>
                              {tasks
                                  .filter((task) => task.department_id === selectedDepartment)
                                  .map((task) => (
                                      <option
                                          key={task.task_id}
                                          value={task.task_name}
                                          data-task-type={task.task_type}
                                          data-task-id={task.task_id}
                                      >
                                          {task.task_name}
                                      </option>
                                  ))}
                          </select>
                      </div>
                  )}

                  {/* Special table dropdown (shown when categorizeBy is "Others") */}
                  {categorizeBy === "Others" && (
                      <div className="border-l border-gray-300 pl-2 transition-all duration-300 ease-in-out">
                          <label htmlFor="table" className="block text-xs font-semibold text-gray-500">
                              Select Table:
                          </label>
                          <select
                              id="table"
                              value={selectedTable}
                              onChange={(e) => handleTableChange(e.target.value)}
                              className="block w-full p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                              aria-label="Table selection"
                          >
                              <option className="text-gray-500 font-semibold" value="">Select a table</option>
                              <option className="text-gray-500 font-semibold" value="finished_product_inspection">Finished Product Inspection</option>
                              <option className="text-gray-500 font-semibold" value="raw_material">Raw Material</option>
                              <option className="text-gray-500 font-semibold" value="drying_records">Drying</option>
                              <option className="text-gray-500 font-semibold" value="incidents">Incidents</option>
                              <option className="text-gray-500 font-semibold" value="waste_material">Waste Material</option>
                          </select>
                      </div>
                  )}

                  {/* Date filter icon and dropdown */}
                  <div className="self-end relative border-gray-300 ml-auto">
                      {/* Funnel icon to toggle date filter dropdown */}
                      <button
                          onClick={() => setShowDateFilter(!showDateFilter)}
                          className="p-2 text-gray-600 hover:text-green-500 focus:outline-none border rounded-md focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                          aria-label="Filter by date"
                          title="Filter by date"
                      >
                          <FiFilter className="w-5 h-5" />
                      </button>

                      {/* Date filter dropdown with improved positioning and animation */}
                      {showDateFilter && (
                          <div className="absolute right-0 mt-2 flex flex-wrap bg-white border border-gray-200 rounded-lg shadow-md p-4 z-40 min-w-64 transition-all duration-200 ease-in-out">
                              <form onSubmit={handleDateFilterSubmit} className="items-start gap-3 flex flex-col w-full">
                                  <div className="w-full">
                                      <label htmlFor="start-date" className="block text-xs font-medium text-gray-700">
                                          Start Date:
                                      </label>
                                      <input
                                          type="date"
                                          id="start-date"
                                          value={startDate}
                                          onChange={(e) => setStartDate(e.target.value)}
                                          className="block w-full p-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                      />
                                  </div>

                                  <div className="w-full">
                                      <label htmlFor="end-date" className="block text-xs font-medium text-gray-700">
                                          End Date:
                                      </label>
                                      <input
                                          type="date"
                                          id="end-date"
                                          value={endDate}
                                          onChange={(e) => setEndDate(e.target.value)}
                                          className="block w-full p-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                      />
                                  </div>

                                  <div className="flex gap-2 w-full">
                                      <button
                                          type="button"
                                          onClick={() => setShowDateFilter(false)}
                                          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                                      >
                                          Cancel
                                      </button>
                                      <button
                                          type="submit"
                                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                                      >
                                          Apply
                                      </button>
                                  </div>
                              </form>
                          </div>
                      )}
                  </div>
                  <div
                      title="Download as PDF"
                      className="border rounded-md p-2 cursor-pointer text-gray-600 hover:text-green-500 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 self-end transition-colors duration-200"
                      onClick={handleDownloadPdf}
                      role="button"
                      aria-label="Download as PDF"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleDownloadPdf()}
                  >
                      <FiDownload size={20} />
                  </div>
              </div>
          )}

          {/* Refresh button with improved styling and accessibility */}
          <div
              className="flex self-center text-gray-600 cursor-pointer hover:bg-gray-300 p-2 rounded-full transition-colors duration-200 mt-2"
              onClick={handleRetry}
              role="button"
              aria-label="Refresh data"
              title="Refresh data"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleRetry()}
          >
              <MdRefresh size={20} />
          </div>
      </div>
  );
};

export default RecordsHeader2;