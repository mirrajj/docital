import React from "react";
import { format } from "date-fns";

const RecordList = ({ historyData }) => {
  // Format date strings for display
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  // Format data fields as a structured list
  const formatDataFields = (data) => {
    if (!data || !data.responseField || data.responseField.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-col divide-y divide-gray-200 w-full">
        {data.responseField.map((field, index) => (
          <div key={index} className="py-1.5 flex justify-between text-xs">
            <span className="text-gray-600">{field.name}</span>
            <span className="text-gray-900 font-medium">{field.response}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        
          <div className="mr-4 w-12 h-12">
            {/* Logo placeholder - replace with your actual logo */}
            <div className="w-full h-full rounded flex items-center justify-center text-gray-500 text-xs">
              <img src="/images/groital-company-limited-logo.png" />
            </div>
          </div>
          <div className="flex-grow">
            <h2 className="text-lg font-bold text-gray-500 tracking-wider">Record History</h2>
            <p className="text-sm text-gray-500">Detailed view of all task records and collected data</p>
          </div>
  
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300 border-collapse border border-gray-300 rounded-lg text-xs">
          <thead className="bg-gray-200">
            <tr>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-300">
                Date
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-300">
                Completed By
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-300">
                Completed At
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-300">
                Verified By
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-300">
                Verified At
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-300">
                Status
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-300">
                Data Collection Details
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-300">
            {historyData.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-2 text-center text-xs text-gray-500 border border-gray-300">
                  No records found
                </td>
              </tr>
            ) : (
              historyData.map((record, index) => (
                <tr key={record.id || index} className="bg-white">
                  <td className="px-3 py-2 align-top text-xs text-gray-900 border border-gray-300">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-3 py-2 align-top text-xs text-gray-500 border border-gray-300">
                    {record.completedBy}
                  </td>
                  <td className="px-3 py-2 align-top text-xs text-gray-500 border border-gray-300">
                    {formatDate(record.completedAt)}
                  </td>
                  <td className="px-3 py-2 align-top text-xs text-gray-500 border border-gray-300">
                    {record.verifiedBy}
                  </td>
                  <td className="px-3 py-2 align-top text-xs text-gray-500 border border-gray-300">
                    {formatDate(record.verifiedAt)}
                  </td>
                  <td className="px-3 py-2 align-top text-xs border border-gray-300">
                    <span className={`px-1.5 py-0.5 inline-flex text-xs leading-4 font-medium rounded-full 
                      ${record.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                        record.verificationStatus === 'not_verified' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'}`}>
                      {record.verificationStatus || "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top text-xs border border-gray-300">
                    <div className="bg-white w-full">
                      {record.data ?
                        formatDataFields(record.data) :
                        <span className="text-gray-500">No data available</span>
                      }
                      {record.notes && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className="text-gray-600 font-medium text-xs">Notes:</span>
                          <div className="mt-1 text-xs text-gray-900">{record.notes}</div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
    
  );
};

export default RecordList;