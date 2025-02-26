const DynamicTable = ({ data, columns, tableRef }) => {
    // Calculate the number of columns to determine sizing strategy
    const columnCount = columns.length;
    
    // Define responsive classes based on column count
    const getColumnWidthClass = () => {
      if (columnCount <= 3) return ""; // Natural sizing for few columns
      if (columnCount <= 5) return "text-sm"; // Slightly smaller text
      if (columnCount <= 8) return "text-xs"; // Extra small text
      return "text-xs"; // Extra small text for many columns
    };
  
    return (
      <div className="w-full border border-gray my-5 rounded-lg" ref={tableRef}>
        <table className="w-full table-fixed bg-white rounded-lg">
          {/* Table Header */}
          
          <thead className="bg-gray-300">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className={`px-2 py-2 text-left font-medium text-green-600 border-b border-gray-200 ${getColumnWidthClass()}`}
                  style={{ width: `${100 / columnCount}%` }} // Equal width distribution
                >
                  <div className="truncate" title={column}>
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
                {columns.map((column) => (
                  <td
                    key={column}
                    className={`px-2 py-2 text-gray-500 border-b border-gray-200 ${getColumnWidthClass()}`}
                    style={{ verticalAlign: 'top' }}
                  >
                    <div className="break-words">
                      {row[column]}
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