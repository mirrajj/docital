import { useState } from 'react';
import { Calendar, Filter, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const AuditFilters = ({ showForm, onApplyFilters, onNewAudit }) => {
  const [filters, setFilters] = useState({
    department: '',
    dateFrom: '',
    dateTo: '',
  });

  const handleDepartmentChange = (value) => {
    setFilters((prev) => ({ ...prev, department: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      department: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const applyFilters = () => {
    onApplyFilters(filters);
  };

  return (
    <div className="border-t border-b border-gray-300 p-2">
      <div className="flex items-center justify-between mb-2">
        {/* Left side: Filter controls */}
        <div className={`${showForm ? "hidden" : ""} flex items-center gap-2`}>
          {/* Department Filter */}
          <div className="flex items-center space-x-2">
            <Select
              value={filters.department || ""}
              onValueChange={handleDepartmentChange}
            >
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem>All Departments</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Drying">Drying</SelectItem>
                <SelectItem value="Finished Product">Finished Product</SelectItem>
                <SelectItem value="Raw Material">Raw Materials</SelectItem>
                <SelectItem value="Quality Assurance Quality Control">Quality Assurance Quality Control</SelectItem>
                <SelectItem value="Procurement">Procurement</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="General Office Space">General Office Space</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs flex items-center gap-1">
                <Calendar size={14} />
                <span>Date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <label htmlFor="dateFrom" className="text-xs text-gray-700 w-12">
                    From:
                  </label>
                  <Input
                    type="date"
                    id="dateFrom"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleInputChange}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="dateTo" className="text-xs text-gray-700 w-12">
                    To:
                  </label>
                  <Input
                    type="date"
                    id="dateTo"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleInputChange}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Search Button */}
          <Button 
            onClick={applyFilters}
            size="sm"
            className="h-8 text-xs bg-green-600 hover:bg-green-700"
          >
            Search
          </Button>

          {/* Clear Filters Button - Icon only */}
          <Button
            onClick={handleClearFilters}
            size="sm"
            variant="ghost"
            className="h-8 text-xs px-2"
            title="Clear Filters"
          >
            <X size={14} />
          </Button>
        </div>

        {/* Right side: New Audit button */}
        <div className="ml-auto">
          <Button 
            onClick={onNewAudit}
            size="sm"
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700"
          >
            + New Audit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuditFilters;