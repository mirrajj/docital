import React, { useEffect, useState } from "react";
import { FiFilter } from "react-icons/fi"; // Importing a funnel icon from react-icons
import useFetchData from "../hooks/useFetchData";


// Custom Select Component
const CustomSelect = ({ options, value, onChange,onChangeCategory, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (option,optionID,optionType) => {
        if (onChange) {
            onChange(option);
        }
        if (onChangeCategory) {
            onChangeCategory(option,optionID,optionType);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative w-40">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
                <span className="text-xs">{value || placeholder}</span>
                <svg
                    className={`w-4 h-4 ml-2 text-gray-500 transition-transform ${isOpen ? "transform rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg text-gray-500">
                    {options.map((option, index) => {
                        const categoryName = option.name ? option.name : option;
                        const categoryID = option.id ? option.id : null;
                        const categoryType = option.taskType ? option.taskType : null;
                        return (<div
                            key={index}
                            onClick={() => handleSelect(categoryName,categoryID,categoryType)}
                            className="p-2 text-xs cursor-pointer hover:bg-primaryFaint"
                        >
                            {option.name ? option.name : option}
                        </div>)
                    })}
                </div>
            )}
        </div>
    );
};

const RecordsHeader = ({ onCategoryChange, onDateFilter }) => {

    const { departments, tasks, loading, error } = useFetchData();
    // console.log(departments);
    // console.log(tasks);

    // State for the selected categorization type (Department or Task)
    const [categorizeBy, setCategorizeBy] = useState("");

    // State for the selected category (e.g., specific department or task)
    const [selectedCategory, setSelectedCategory] = useState("");

    // State for the date range filter visibility
    const [showDateFilter, setShowDateFilter] = useState(false);

    // State for the date range filter
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");


    // Handle categorization type change
    const handleCategorizeByChange = (value) => {
        setCategorizeBy(value);
        setSelectedCategory(""); // Reset selected category when categorization type changes
    };


    // Handle category selection
    const handleCategoryChange = (value,fieldValue,taskType) => {
        setSelectedCategory(value);
        console.log(selectedCategory);
        let filterField = null;
        let filterValue = null;
        let tableName;
        (taskType === "data-collection" &&  categorizeBy === "Task") ? tableName = value : tableName = "task_completion";
        if (!(taskType === "data-collection")) {
            filterField = categorizeBy === "Task" ? "task_id" : "department_id";
            filterValue = fieldValue;
        }

        onCategoryChange(tableName,filterField,fieldValue); // Notify parent component of the selected category
    };

    // Handle date filter submission
    const handleDateFilterSubmit = (e) => {
        e.preventDefault();
        onDateFilter({ startDate, endDate }); // Notify parent component of the date range
        setShowDateFilter(false); // Hide the date filter dropdown after submission
    };

    return (
        <div className="bg-transparent text-xs gap-3 flex items-center border-b border-gray-300 p-2">
            {/* Categorize by dropdown */}
            <div className="">
                <label htmlFor="categorize-by" className="block text-xs font-semibold text-gray-500">
                    Categorize By:
                </label>
                <CustomSelect
                    options={["Department", "Task"]}
                    value={categorizeBy}
                    onChange={handleCategorizeByChange}
                    placeholder="Select an option"
                />
            </div>

            {/* Category dropdown (dynamic based on categorization type) */}
            {categorizeBy && (
                <div className="border-l border-gray-300 pl-2">
                    <label htmlFor="category" className="block text-xs font-semibold text-gray-500">
                        Select {categorizeBy}:
                    </label>
                    <CustomSelect
                        options={categorizeBy === "Department" ? departments.map((d) => ({name : d.name,id : d.department_id})) : tasks.map((t) => ({name : t.task_name, id : t.task_id, taskType : t.task_type}))}
                        value={selectedCategory}
                    
                        onChangeCategory={handleCategoryChange}
                        placeholder={`Select a ${categorizeBy}`}
                    />
                </div>
            )}

            {/* Date filter icon and dropdown */}
            <div className="self-end relative border-l border-gray-300">
                {/* Funnel icon to toggle date filter dropdown */}
                <button
                    onClick={() => setShowDateFilter(!showDateFilter)}
                    className="p-2 text-gray-600 hover:text-green-500 focus:outline-none"
                >
                    <FiFilter className="w-5 h-5" />
                </button>

                {/* Date filter dropdown */}
                {showDateFilter && (
                    <div className="absolute -left-4 mt-2 flex flex-wrap bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-40">
                        <form onSubmit={handleDateFilterSubmit} className="items-start gap-2 flex">
                            <div className="">
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

                            <div className="">
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

                            <button
                                type="submit"
                                className="w-full px-4 self-end py-2 bg-gray-500 text-white rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                Apply
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecordsHeader;