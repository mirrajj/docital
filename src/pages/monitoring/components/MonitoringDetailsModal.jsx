import React, { useState } from 'react';

const MonitoringDetailsModal = ({ item }) => {
  const [expandedFields, setExpandedFields] = useState({
    verified_by: false,
    task_type: false,
    subtasks: false,
  });

  const toggleField = (field) => {
    setExpandedFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <tr className='border w-1/3 flex flex-col rounded-xl h-auto col-span-full relative left-1/3 p-2 my-2 bg-white shadow-md'>
        <td className="size-6 rotate-45 bg-white -mt-5 rounded-sm border-l border-t left-1/2 relative"></td>
      {/* Verified By Field */}
      <td className='text-green-500 font-semibold w-full text-sm py-2 h-fit cursor-pointer'>
        <div className = "flex justify-between" onClick={() => toggleField('verified_by')}>

          <span>Verified By: </span>
          <span>{expandedFields.verified_by ? '-' : '+'}</span>
        </div>
        {expandedFields.verified_by && <div className='text-gray-400 text-xs'>{item.verified_by}</div>}
      </td>

      {/* Task Type Field */}
      <td className='text-green-500 font-semibold w-full text-sm py-2 h-fit cursor-pointer'>
        <div className = "flex justify-between" onClick={() => toggleField('task_type')}>
          <span>Task Type: </span>
          <span>{expandedFields.task_type ? '-' : '+'}</span>
        </div>
        {expandedFields.task_type && <div className='text-gray-400 text-xs'>{item.task_type}</div>}
      </td>

      {/* Subtasks Field */}
      <td className='text-green-500 font-semibold w-full text-sm h-fit py-2 cursor-pointer'>
        <div className = "flex justify-between" onClick={() => toggleField('subtasks')}>
          <span>Subtasks: </span>
          <span>{expandedFields.subtasks ? '-' : '+'}</span>
        </div>
        {expandedFields.subtasks && (
          <ul>
            {item.subtasks && item.subtasks.map((subtask, index) => (
              <li key={index} className='text-gray-400 border-t-2 w-4/5 px-3 py-2 text-xs h-fit'>{subtask}</li>
            ))}
          </ul>
        )}
      </td>
    </tr>
  );
};

export default MonitoringDetailsModal;