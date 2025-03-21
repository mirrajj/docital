import { format } from 'date-fns';

const DynamicTable = ({ data, columns, tableRef, title, companyName = "GROITAL" }) => {
  // Calculate the number of columns to determine sizing strategy
  const columnCount = columns.length;
  
  // Define responsive classes based on column count
  const getColumnWidthClass = () => {
    if (columnCount <= 3) return ""; // Natural sizing for few columns
    if (columnCount <= 5) return "text-sm"; // Slightly smaller text
    if (columnCount <= 8) return "text-xs"; // Extra small text
    return "text-xs"; // Extra small text for many columns
  };

  // Function to format date strings
  const formatValue = (value, column) => {
    if (typeof value === "string" && Date.parse(value) && column === "DATE") {
      return format(new Date(value), "yyyy-MM-dd"); // Extract only the date
    }
    if (typeof value === "string" && Date.parse(value)) {
      return format(new Date(value), "yyyy-MM-dd HH:mm"); // Extract only the date
    }
    return value; // Return original value if not a date
  };
  
  // Get current date for the document
  const currentDate = format(new Date(), "MMMM d, yyyy");
  
  return (
    <div className="w-full border border-gray my-5 rounded-lg" ref={tableRef}>
      {/* Document Header with Title and Logo */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center">
          {/* Company Logo Placeholder */}
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              <img src="/images/groital-company-limited-logo.png" alt="groital logo" className='w-full'/>
            </div>
            <div className="ml-3">
              <p className="font-semibold text-gray-800 tracking-wider">{companyName}</p>
              <p className="text-xs text-gray-500">{currentDate}</p>
            </div>
          </div>
          
          {/* Document Title */}
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-500 tracking-widest">{title.replace(/_/g,' ')} records</h1>
          </div>
        
          {/* Empty div for balance */}
          <div className="w-24"></div>
        </div>
      </div>
      
      <table className="w-full table-fixed bg-white rounded-lg">
        {/* Table Header */}
        <thead className="bg-gray-300">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className={`px-2 py-4 text-left font-medium text-blue-600 border-b border-r border-gray-200 ${getColumnWidthClass()}`}
                style={{ width: `${100 / columnCount}%`, verticalAlign : `top` }} // Equal width distribution
              >
                <div className="" title={column}> 
                  {/* removed trancate from the className */}
                  {column}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        
        {/* Table Body */}
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((column, colIndex) => (
                <td
                  key={column}
                  className={`px-2 py-2 text-gray-500 border-b ${colIndex < columnCount - 1 ? 'border-r' : ''} border-gray-200 ${getColumnWidthClass()}`}
                  style={{ verticalAlign: 'top' }}
                >
                  <div className="break-words">
                    {formatValue(row[column], column)}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicTable;