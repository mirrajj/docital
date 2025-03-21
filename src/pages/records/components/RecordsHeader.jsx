import React, { useState } from "react";
import { FiFilter, FiDownload } from "react-icons/fi";
import { MdRefresh } from "react-icons/md";
import { BsChevronDown, BsFilePdf, BsFiletypeCsv } from "react-icons/bs";
import useFetchData from "../hooks/useFetchData";
import AppAlert from "../../../common/AppAlert";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const RecordsHeader = ({ onTaskSelect, onDateFilter, handleDownloadPdf, handleDownloadCsv }) => {
  const [showError, setShowError] = useState({ state: false, message: "" });
  const [retryCount, setRetryCount] = useState(0);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  const { departments, tasks, loading, error } = useFetchData(setShowError, retryCount);
  
  // State for department and task selection
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedTask, setSelectedTask] = useState("");

  // State for the date range filter
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // State for task metadata
  const [taskType, setTaskType] = useState("");
  const [taskId, setTaskId] = useState("");

  const handleRetry = () => {
    setRetryCount(retryCount + 1);
  };

  // Handle department selection
  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value);
    setSelectedTask(""); // Reset selected task when department changes
    setTaskType("");
    setTaskId("");
  };

  // Handle task selection
  const handleTaskChange = (value, taskId, taskType) => {
    
    setSelectedTask(value);
    setTaskId(taskId);
    setTaskType(taskType);

    // Determine table name based on task type
    const tableName = value;
    
    // Notify parent component
    onTaskSelect(tableName, taskType, taskId);
  };

  // Handle date filter submission
  const handleDateFilterSubmit = (e) => {
    e.preventDefault();
    
    if (selectedTask === "") {
      alert("Please select a task first");
      return;
    }
    
    // Apply filters with date range
    onTaskSelect(selectedTask, taskType, taskId, startDate, endDate);

    // Reset date inputs and hide filter
    setStartDate("");
    setEndDate("");
    setShowDateFilter(false);
  };

  // Handle download options
  const handleDownload = (type) => {
    if (type === 'pdf') {
      handleDownloadPdf();
    } else if (type === 'csv') {
      handleDownloadCsv();
    }
    setShowDownloadOptions(false);
  };

  // Find task details by name
  const getTaskDetails = (taskName) => {
    const task = tasks.find(t => t.task_name === taskName);
    return task ? [task.id, task.task_type] : [null, null];
  };

  return (
    <div className="flex w-full border-b border-gray-300">
      {showError.state && (
        <AppAlert
          type="error"
          message={showError.message}
          onClose={() => setShowError({ state: false, message: "" })}
        />
      )}

      {/* Loading State with Skeleton */}
      {loading && (
        <div className="w-full animate-pulse">
          <div className="flex items-center gap-3 border-b border-gray-300 py-2">
            <div className="h-10 w-32 rounded-md bg-gray-200"></div>
            <div className="h-10 w-32 rounded-md bg-gray-200"></div>
            <div className="ml-auto h-9 w-9 rounded-md bg-gray-200"></div>
            <div className="h-9 w-9 rounded-md bg-gray-200"></div>
          </div>
        </div>
      )}

      {/* Content State */}
      {!loading && error === null && (
        <div className="bg-transparent text-xs gap-3 flex items-center w-full py-2 transition-opacity duration-300 ease-in-out">
          {/* Department dropdown */}
          <div className="w-32">
            <Label htmlFor="department" className="text-xs font-semibold text-gray-500">
              Select Department:
            </Label>
            <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
              <SelectTrigger className="h-8 text-xs" aria-label="Department selection">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem >Select a department</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.department_id} value={dept.department_id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Task dropdown (shown when a department is selected) */}
          {selectedDepartment && (
            <div className="border-l border-gray-300 pl-2 transition-all duration-300 ease-in-out w-32">
              <Label htmlFor="task" className="text-xs font-semibold text-gray-500">
                Select Task:
              </Label>
              <Select 
                value={selectedTask} 
                onValueChange={(value) => {
                  const filteredTasks = tasks.filter((task) => task.department_id === selectedDepartment);
                  const selectedTaskObj = filteredTasks.find(task => task.task_name === value);
                  if (selectedTaskObj) {
                    handleTaskChange(value, selectedTaskObj.id, selectedTaskObj.task_type);
                  }
                }}
              >
                <SelectTrigger className="h-8 text-xs" aria-label="Task selection">
                  <SelectValue placeholder="Select task" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem >Select a task</SelectItem>
                  {tasks
                    .filter((task) => task.department_id === selectedDepartment)
                    .map((task) => (
                      <SelectItem key={task.id} value={task.task_name}>
                        {task.task_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date filter icon and dropdown */}
          <div className="self-end relative border-gray-300 ml-auto">
            <Button
              onClick={() => setShowDateFilter(!showDateFilter)}
              variant="outline"
              size="icon"
              className="h-9 w-9 p-0"
              aria-label="Filter by date"
              title="Filter by date"
            >
              <FiFilter className="w-5 h-5" />
            </Button>

            {showDateFilter && (
              <div className="absolute right-0 mt-2 flex flex-wrap bg-white border border-gray-200 rounded-lg shadow-md p-4 z-40 min-w-64 transition-all duration-200 ease-in-out">
                <form onSubmit={handleDateFilterSubmit} className="items-start gap-3 flex flex-col w-full">
                  <div className="w-full">
                    <Label htmlFor="start-date" className="text-xs font-medium text-gray-700">
                      Start Date:
                    </Label>
                    <Input
                      type="date"
                      id="start-date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="w-full">
                    <Label htmlFor="end-date" className="text-xs font-medium text-gray-700">
                      End Date:
                    </Label>
                    <Input
                      type="date"
                      id="end-date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="flex gap-2 w-full">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowDateFilter(false)}
                      className="flex-1 h-8 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700"
                    >
                      Apply
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Download dropdown menu */}
          <div className="self-end relative">
            <Button
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
              variant="outline"
              className="h-9 p-2 flex items-center gap-1"
              aria-label="Download options"
              title="Download options"
            >
              <FiDownload className="w-5 h-5" />
              <BsChevronDown className="w-3 h-3" />
            </Button>

            {showDownloadOptions && (
              <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-md z-40 min-w-32 transition-all duration-200 ease-in-out">
                <button
                  onClick={() => handleDownload('pdf')}
                  className="w-full text-left flex items-center gap-1 px-4 py-1 text-xs text-gray-700 hover:bg-red-300 transition-colors duration-200 rounded-t-lg"
                >
                  <BsFilePdf size={30} />Download as PDF
                </button>
                <button
                  onClick={() => handleDownload('csv')}
                  className="flex items-center gap-2 w-full text-left px-4 py-1 text-xs text-gray-700 hover:bg-green-300 transition-colors duration-200 rounded-b-lg"
                >
                  <BsFiletypeCsv size={30} />Download as CSV
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Refresh button */}
      <Button
        variant="outline"
        // size="icon"
        className="flex self-center h-9 w-8 p-0 mt-2"
        onClick={handleRetry}
        aria-label="Refresh data"
        title="Refresh department data"
      >
        <MdRefresh size={32} />
      </Button>
    </div>
  );
};

export default RecordsHeader;