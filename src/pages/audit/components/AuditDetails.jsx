// src/pages/audit/components/AuditDetails.jsx
import React, { useState, useEffect } from 'react';
import { FaChevronUp, FaChevronDown, FaFile, FaCheckCircle, FaAccessibleIcon } from 'react-icons/fa';

const AuditDetails = ({ audit, colSpan }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation timing - make visible after component mounts
    if (audit) {
      setTimeout(() => setIsVisible(true), 50);
    }
  }, [audit]);

  if (!audit) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <tr className="w-1/2 col-span-full">
      <td className="p-0 w-full">
        <div className="flex justify-center w-full">
          <div className={`relative max-w-full left-full transition-all duration-300 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'}`}>
            {/* Arrow indicator */}
            <div className="size-6 rotate-45 bg-white absolute -top-3 left-1/2 -translate-x-1/2 rounded-sm border-l border-t border-gray-200 z-10"></div>
            
            {/* Content container */}
            <div className="mt-4 p-4 border border-gray-200 w-full rounded-xl shadow-md bg-transparent">
              {/* <div className="flex justify-between mb-4">
                <h4 className="font-bold text-sm text-gray-700">Audit Details: {audit.title || audit.id}</h4>
                <span className={`inline-block h-3 w-3 ${audit.status === 'pass' ? "bg-green-500" : audit.status === 'failed' ? "bg-red-500" : "bg-yellow-400"} rounded-full animate-pulse`}></span>
              </div> */}
              
              {/* <hr className="mb-3" /> */}
              
              {/* Information rows */}
              <ul className="space-y-2 list-none">
                {/* Description */}
                <li className="bg-gray-50 w-full rounded-lg  p-3 border border-gray-200 transition-all hover:shadow-sm">
                  <div className="flex items-start">
                    <FaFile size={16} className="text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div className='flex gap-1'>
                      <span className="text-xs text-gray-600">Description:</span>
                      <p className="text-sm font-medium">{audit.description || 'No description provided'}</p>
                    </div>
                  </div>
                </li>
                
                {/* Notes (if available) */}
                {audit.notes && (
                  <li className="bg-gray-50 rounded-lg p-3 border border-gray-200 transition-all hover:shadow-sm">
                    <div className="flex items-start">
                      <FaFile size={16} className="text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-gray-600">Notes:</span>
                        <p className="text-sm font-medium">{audit.notes}</p>
                      </div>
                    </div>
                  </li>
                )}
                
                {/* Department */}
                <li className="bg-gray-50 rounded-lg p-3 border border-gray-200 transition-all hover:shadow-sm">
                  <span className="text-xs text-gray-600">Department:</span>
                  {/* <p className="text-sm font-medium">{audit.department || 'Not specified'}</p> */}
                </li>
                
                {/* Timeline */}
                <li className="bg-gray-50 rounded-lg p-3 border border-gray-200 transition-all hover:shadow-sm">
                  <span className="text-xs text-gray-600">Timeline:</span>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <p className="text-xs text-gray-500">Created:</p>
                      {/* <p className="text-sm">(audit.created_at)</p> */}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Updated:</p>
                      {/* <p className="text-sm">(audit.updatedAt)</p> */}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Scheduled:</p>
                      {/* <p className="text-sm">(audit.scheduled_date)</p> */}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Completed:</p>
                      {/* <p className="text-sm">(audit.completed_at)</p> */}
                    </div>
                  </div>
                </li>
                
                {/* Findings */}
                <li className="bg-gray-50 rounded-lg p-3 border border-gray-200 transition-all hover:shadow-sm">
                  <span className="text-xs text-gray-600 mb-2 block">Findings:</span>
                  {audit.findings && audit.findings.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      {audit.findings.map((finding, index) => (
                        <div key={index} className="bg-white p-2 rounded border border-gray-200 flex items-start">
                          {finding.severity === 'high' ? (
                            <FaAccessibleIcon size={16} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          ) : finding.severity === 'medium' ? (
                            <FaAccessibleIcon size={16} className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                          ) : (
                            <FaCheckCircle size={16} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{finding.title}</p>
                            <p className="text-xs text-gray-500">{finding.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">No findings recorded</p>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default AuditDetails;