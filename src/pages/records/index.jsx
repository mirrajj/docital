import React, { useState, useRef } from "react";
import { useTaskHistory } from "./hooks/useTaskHistory";
import RecordsHeader from "./components/RecordsHeader";
import AppAlert from "@/common/AppAlert";
import { jsPDF } from "jspdf";
import { CSVLink } from "react-csv";
import RecordList from "./components/RecordList";
import autoTable from "jspdf-autotable";
import { FiChevronLeft, FiChevronRight, FiClipboard } from 'react-icons/fi';
import { format } from 'date-fns';

const Records = () => {
    const [skeletonColumns, setSkeletonColumns] = useState([1, 2, 3, 4, 5]);
    const [columns, setColumns] = useState([]);
    // State for task selection and filtering
    const [selectedTask, setSelectedTask] = useState({
        tableName: null,
        task_type: null,
        task_id: null,
    });

    // State for date range filtering
    const [dateRange, setDateRange] = useState({
        startDate: null,
        endDate: null,
    });

    // State for pagination
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
    });

    // State for error alerts
    const [alert, setAlert] = useState({
        show: false,
        type: "info",
        message: "",
    });

    // Reference for CSV download link
    const csvLinkRef = useRef(null);

    // Fetch task history data using our custom hook
    const {
        loading,
        error,
        historyData,
        pagination: { totalPages, totalCount }
    } = useTaskHistory({
        selectedTask,
        taskId: selectedTask.task_id,
        taskType: selectedTask.task_type,
        startDate: dateRange.startDate ? new Date(dateRange.startDate) : null,
        endDate: dateRange.endDate ? new Date(dateRange.endDate) : null,
        page: pagination.page,
        pageSize: pagination.pageSize
    });

    // Handle task selection from header
    const handleTaskSelect = (tableName, taskType, taskId, startDate, endDate) => {

        setSelectedTask({
            tableName: tableName,
            taskType: taskType,
            taskId: taskId,
        });

        // Reset pagination when changing task
        setPagination({
            ...pagination,
            page: 1,
        });

        // Handle date filtering if provided
        if (startDate || endDate) {
            setDateRange({
                startDate,
                endDate,
            });
        }
    };
    // console.log(selectedTask);

    // Handle date filter
    const handleDateFilter = ({ startDate, endDate }) => {
        setDateRange({
            startDate,
            endDate,
        });

        // Reset pagination when applying filters
        setPagination({
            ...pagination,
            page: 1,
        });
    };

    // Handle pagination change
    const handlePageChange = (newPage) => {
        setPagination({
            ...pagination,
            page: newPage,
        });
    };

    // Format data for CSV export
    const formatDataForExport = () => {
        if (!historyData || historyData.length === 0) {
            return [];
        }

        // Standard columns for all tasks
        const baseColumns = [
            { label: "Date", key: "date" },
            { label: "Completed By", key: "completedBy" },
            { label: "Completed At", key: "completedAt" },
            { label: "Verified By", key: "verifiedBy" },
            { label: "Verified At", key: "verifiedAt" },
            { label: "Status", key: "verificationStatus" },
        ];

        // For data collection tasks, add dynamic fields
        let dataFields = [];
        if (selectedTask.task_type !== "data_collection" && historyData[0]?.data) {
            // Extract all unique field names from response data
            historyData.forEach(item => {
                if (item.data) {
                    Object.keys(item.data).forEach(key => {
                        if (!dataFields.some(field => field.key === `data.${key}`)) {
                            dataFields.push({
                                label: key,
                                key: `data.${key}`
                            });
                        }
                    });
                }
            });
        }

        // Combine standard columns with data fields
        const allColumns = [...baseColumns, ...dataFields];

        // Format data rows
        const rows = historyData.map(item => {
            const baseRow = {
                date: format(new Date(item.date), 'yyyy-MM-dd'),
                completedBy: item.completedBy,
                completedAt: format(new Date(item.completedAt), 'yyyy-MM-dd HH:MM'),
                verifiedBy: item.verifiedBy,
                verifiedAt: format(new Date(item.verifiedAt), 'yyyy-MM-dd HH:MM'),
                verificationStatus: item.verificationStatus,
            };

            // Add dynamic data fields if they exist
            if (item.data) {
                Object.keys(item.data).forEach(key => {
                    baseRow[`data.${key}`] = item.data[key];
                });
            }

            return baseRow;
        });

        return {
            data: rows,
            headers: allColumns
        };
    };

    // Generate PDF for download
    const handleDownloadPdf = () => {
        if (!historyData || historyData.length === 0) {
            setAlert({
                show: true,
                type: "warning",
                message: "No data available to download",
            });
            return;
        }

        try {
            const doc = new jsPDF();

            // Add title
            doc.setFontSize(16);
            doc.text(`Task History: ${selectedTask.tableName}`, 14, 20);

            // Add date range if applicable
            if (dateRange.startDate || dateRange.endDate) {
                doc.setFontSize(12);
                doc.text(
                    `Period: ${dateRange.startDate || 'All'} to ${dateRange.endDate || 'Present'}`,
                    14, 30
                );
            }

            // Format data collection fields for better PDF display
            const formatCollectedData = (data) => {
                if (!data || !data.responseField || data.responseField.length === 0) {
                    return "No data";
                }

                // Format as "field name: value" on separate lines
                return data.responseField.map(field =>
                    `${field.name}: ${field.response}`
                ).join('\n');
            };

            // Create table data
            const tableData = historyData.map(item => {
                const row = [
                    item.date,
                    item.completedBy,
                    format(new Date(item.completedAt), 'yyyy-MM-dd HH:MM'),
                    item.verifiedBy
                ];

                // Add data fields for data collection tasks
                if (item.data) {
                    row.push(formatCollectedData(item.data));
                }

                return row;
            });

            // Define table headers
            const headers = ['Date', 'Completed By', 'Completed At', 'Verified By'];
            if (selectedTask.task_type === "data_collection") {
                headers.push('Collected Data');
            }

            // Add table
            autoTable(doc, {
                head: [headers],
                body: tableData,
                startY: 40,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [76, 175, 80] },
                // Enable cell wrapping for data collection column
                columnStyles: {
                    4: { cellWidth: 'auto', cellPadding: 2 } // 5th column (index 4) is the data collection column
                }
            });

            // Save the PDF
            doc.save(`task-history-${selectedTask.tableName}.pdf`);

        } catch (err) {
            console.error("Error generating PDF:", err);
            setAlert({
                show: true,
                type: "error",
                message: "Error generating PDF. Please try again.",
            });
        }
    };

    // Handle CSV download
    const handleDownloadCsv = () => {
        if (!historyData || historyData.length === 0) {
            setAlert({
                show: true,
                type: "warning",
                message: "No data available to download",
            });
            return;
        }

        // Trigger the CSV download
        csvLinkRef.current?.link.click();
    };

    // Format data for CSV export
    const csvData = formatDataForExport();

    return (
        <div>
            {/* Alert component for displaying messages */}
            {alert.show && (
                <AppAlert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert({ ...alert, show: false })}
                />
            )}

            {/* Error state */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                    <p className="text-red-700">Error loading data: {error}</p>
                </div>
            )}

            {/* Header with filters */}
            <div className="mb-6">
                <RecordsHeader
                    onTaskSelect={handleTaskSelect}
                    onDateFilter={handleDateFilter}
                    handleDownloadPdf={handleDownloadPdf}
                    handleDownloadCsv={handleDownloadCsv}
                />
            </div>

            {/* Main content area - will contain RecordList component in the future */}
            <div className="p-4">
                {/* Loading state */}
                {loading ? (
                    <div className='w-full border rounded-lg overflow-hidden'>
                        <table className='w-full'>
                            <thead>
                                <tr className='bg-gray-50 border-b'>
                                    {skeletonColumns.map((column, index) => (
                                        <th key={index} className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            {column.label || column.key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(5)].map((_, index) => (
                                    <tr key={index}>
                                        {skeletonColumns.map((column, colIndex) => (
                                            <td key={colIndex} className='px-6 py-4 whitespace-nowrap'>
                                                <div className='h-4 bg-gray-200 rounded animate-pulse'></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <>
                        {/* Task selection prompt */}
                        {!selectedTask.tableName && (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                <div className="mb-4 text-green-400 animate-pulse">
                                    <FiClipboard size={50} />
                                </div>
                                <h3 className="text-lg font-medium mb-2">No Records Selected</h3>
                                <p className="text-sm max-w-md text-center">
                                    Please select a department and task from the dropdown menu above to view historical records
                                </p>
                                <div className="mt-6 flex space-x-2">
                                    <div className="h-2 w-2 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <div className="h-2 w-2 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    <div className="h-2 w-2 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: "600ms" }} />
                                </div>
                            </div>
                        )}

                        {/* No data state */}
                        {selectedTask.tableName && historyData?.length === 0 && (
                            <div className='w-full border rounded-lg overflow-hidden'>
                                <table className='w-full'>
                                    <thead>
                                        <tr className='bg-gray-50 border-b'>
                                            {columns.map((column, index) => (
                                                <th key={index} className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                    {column.label || column.key}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colSpan={columns.length} className='px-6 py-12 text-center text-gray-500 border-b'>
                                                <div className='flex flex-col items-center justify-center'>
                                                    <svg className='w-12 h-12 text-gray-300 mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                                                    </svg>
                                                    <p className='text-sm font-medium'>No data available</p>
                                                    <p className='text-xs text-gray-400 mt-1'>There are currently no records to display</p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* RecordList component will be placed here */}
                        {selectedTask.tableName && historyData?.length > 0 && (
                            <div>
                                {/* Placeholder for RecordList component */}
                                <div className="border border-dashed border-gray-300 rounded-md p-4 text-center text-gray-500">
                                    <RecordList historyData={historyData} />
                                    <p className="text-sm mt-2">Displaying {historyData.length} of {totalCount} records</p>
                                </div>

                                {/* Pagination controls */}
                                {totalPages && (
                                    <div className="flex items-center justify-center gap-4 py-4">
                                        <button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            aria-label="Previous page"
                                            className={`p-2 rounded-md border text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${pagination.page === 1
                                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-indigo-600'
                                                }`}
                                        >
                                            <FiChevronLeft size={18} />
                                        </button>

                                        <span className="text-sm font-medium text-gray-700">
                                            Page {pagination.page} of {totalPages || 1}
                                        </span>

                                        <button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page === totalPages}
                                            aria-label="Next page"
                                            className={`p-2 rounded-md border text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${pagination.page === totalPages
                                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-indigo-600'
                                                }`}
                                        >
                                            <FiChevronRight size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Hidden CSV download link */}
            {csvData.data && (
                <CSVLink
                    data={csvData.data}
                    headers={csvData.headers}
                    filename={`task-history-${selectedTask.tableName}.csv`}
                    className="hidden"
                    ref={csvLinkRef}
                />
            )}
        </div>
    );
};

export default Records;