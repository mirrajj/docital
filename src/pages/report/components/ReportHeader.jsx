import React, { useState } from 'react';

const ReportHeader = ({ setFilters }) => {
    const [dateRange, setDateRange] = useState('last7days');
    const [department, setDepartment] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        
        if (name === 'department') {
            setDepartment(value);
        }
        
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const getDateRangeText = () => {
        switch(dateRange) {
            case 'today': return 'Today';
            case 'yesterday': return 'Yesterday';
            case 'last7days': return 'Last 7 Days';
            case 'last30days': return 'Last 30 Days';
            case 'thisMonth': return 'This Month';
            case 'lastMonth': return 'Last Month';
            case 'custom': return startDate && endDate ? `${startDate} to ${endDate}` : 'Custom Range';
            default: return 'Last 7 Days';
        }
    };
    
    const getDepartmentText = () => {
        switch(department) {
            case 'all': return 'All Departments';
            case 'engineering': return 'Engineering Department';
            case 'marketing': return 'Marketing Department';
            case 'operations': return 'Operations Department';
            case 'finance': return 'Finance Department';
            default: return 'All Departments';
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-3 md:mb-0">Report Dashboard</h2>
                
                <div className="flex flex-wrap gap-2">
                    <select 
                        name="dateRange" 
                        value={dateRange}
                        onChange={(e) => {
                            setDateRange(e.target.value);
                            handleFilterChange(e);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="last7days">Last 7 Days</option>
                        <option value="last30days">Last 30 Days</option>
                        <option value="thisMonth">This Month</option>
                        <option value="lastMonth">Last Month</option>
                        <option value="custom">Custom Range</option>
                    </select>
                    
                    <select 
                        name="department" 
                        value={department}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Departments</option>
                        <option value="engineering">Engineering</option>
                        <option value="marketing">Marketing</option>
                        <option value="operations">Operations</option>
                        <option value="finance">Finance</option>
                    </select>
                    
                    {/* Added date filter */}
                    {dateRange === 'custom' && (
                        <div className="flex gap-2">
                            <input
                                type="date"
                                name="startDate"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    handleFilterChange(e);
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="self-center text-gray-500">to</span>
                            <input
                                type="date"
                                name="endDate"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    handleFilterChange(e);
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}
                </div>
            </div>
            
            <div className="border-b border-gray-200 py-3">
                {/* Added the selected department and date range */}
                <div className="flex flex-wrap items-center text-sm text-gray-600">
                    <div className="mr-6 flex items-center">
                        <span className="font-medium mr-2">Department:</span> 
                        <span>{getDepartmentText()}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="font-medium mr-2">Period:</span> 
                        <span>{getDateRangeText()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportHeader;