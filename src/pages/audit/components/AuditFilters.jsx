import { useState } from 'react';
import { Calendar } from 'lucide-react';

const AuditFilters = ({ onApplyFilters, onNewAudit }) => {
  const [filters, setFilters] = useState({
    department: '',
    dateFrom: '',
    dateTo: '',
  });
  const [showDateFilters, setShowDateFilters] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (e) => {
    const { value } = e.target;
    setFilters((prev) => ({ ...prev, status: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      department: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const applyFilters = () => {
    onApplyFilters(filters); // Pass the filters to the parent for API call
  };

  const toggleDateFilters = () => {
    setShowDateFilters(!showDateFilters);
  };

  return (
    <div className="border-t border-b border-gray-300 p-2">
      <div className="flex items-center justify-between mb-2 flex-wrap">
        {/* Status Filter */}
        {/* <div className="flex items-center space-x-2">
          <label htmlFor="status" className="text-xs text-gray-700">
            Status:
          </label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleStatusChange}
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pass">Passed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div> */}

        {/* Department Filter */}
        <div className="flex items-center space-x-2">
          <label htmlFor="department" className="text-xs text-gray-700">
            Department:
          </label>
          <select
            id="department"
            name="department"
            value={filters.department}
            onChange={handleInputChange}
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            <option value="Processing Department">Processing</option>
            <option value="Drying Department">Drying</option>
            <option value="Finished Product Department">Finished Product</option>
            <option value="Raw Material Department">Raw Materials</option>
            <option value="General Office Space">General Office</option>
          </select>
        </div>

        {/* Date Filter Toggle Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleDateFilters}
            className="flex items-center space-x-1 text-xs text-gray-700 border border-gray-300 rounded px-2 py-1 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <Calendar size={14} />
            <span>Date Range</span>
          </button>
        </div>

        {/* Search Button */}
        <button 
          onClick={applyFilters}
          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          Search
        </button>

        {/* Create Button */}
        <button 
          onClick={onNewAudit}
          className="ml-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          + New Audit
        </button>
      </div>

      {/* Date Range Filter - Collapsible */}
      {showDateFilters && (
        <div className="mt-2 p-2 border border-gray-200 rounded bg-gray-50">
          <div className="flex items-center space-x-2">
            <label htmlFor="dateFrom" className="text-xs text-gray-700">
              From:
            </label>
            <input
              type="date"
              id="dateFrom"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <label htmlFor="dateTo" className="text-xs text-gray-700">
              To:
            </label>
            <input
              type="date"
              id="dateTo"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={toggleDateFilters}
              className="ml-2 text-xs text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Clear Filters */}
      <div className="mt-2 flex justify-end">
        <button
          onClick={handleClearFilters}
          className="text-xs text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default AuditFilters;