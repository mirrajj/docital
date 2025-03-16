import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useTaskResponses } from '../hooks/useTaskResponses';

const TaskDetailsModal = ({ item }) => {
    const [responses, setResponses] = useState([]);
    const { getTaskResponses, loading } = useTaskResponses();

    useEffect(() => {
        const fetchResponses = async () => {
            if (item && item.task_id) {
                try {
                    const data = await getTaskResponses(item.task_id);
                    setResponses(data);
                } catch (error) {
                    console.error("Error fetching task responses:", error);
                }
            }
        };

        fetchResponses();
    }, [item, getTaskResponses]);

    // Helper function to format dates
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
        } catch (error) {
            return 'Invalid date';
        }
    };

    // Helper function to get status badge color
    const getStatusColor = (status) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            active: 'bg-green-100 text-green-800',
            completed: 'bg-blue-100 text-blue-800',
            verified: 'bg-purple-100 text-purple-800',
            overdue: 'bg-red-100 text-red-800'
        };
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    if (!item) return null;

    return (
        <tr className='bg-white shadow-md grid col-span-full w-fit border relative left-2/4 text-xs rounded-xl p-4 mt-2'>
             <td className="size-6 rotate-45 bg-white -mt-7 rounded-sm border-l border-t left-1/2 relative"></td>
            <td colSpan="" className="p-0">
                <Card className="bg-gray-50 border-0 shadow-none m-2">
                    <CardContent className="pt-4">
                        <div >
                            <div className='text-gray-500 mb-2'>
                                <h3 className="text-sm tracking-widest font-semibold mb-3">Task Details</h3>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Description:</span> {item.description || 'No description provided'}</p>
                                    <p>
                                        <span className="font-medium">Status:</span>{' '}
                                        <Badge className={getStatusColor(item.status)}>
                                            {item.status || 'Not set'}
                                        </Badge>
                                    </p>
                                    <p><span className="font-medium">Document Code:</span> {item.document_code || 'N/A'}</p>
                                    <p><span className="font-medium">Priority:</span> {item.priority ? item.priority.charAt(0).toUpperCase() + item.priority.slice(1) : 'N/A'}</p>
                                    <p><span className="font-medium">Frequency:</span> {item.frequency ? item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1) : 'N/A'}</p>
                                </div>
                            </div>
                            
                            <div className='text-gray-500'>
                                <h3 className="text-sm tracking-widest font-semibold mb-3">Timeline</h3>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Created:</span> {formatDate(item.created_at)}</p>
                                    <p><span className="font-medium">Updated:</span> {formatDate(item.updated_at)}</p>
                                    <p><span className="font-medium">Deadline:</span> {formatDate(item.deadline)}</p>
                                    <p><span className="font-medium">Active Since:</span> {formatDate(item.active_at)}</p>
                                    <p><span className="font-medium">Completed:</span> {formatDate(item.completed_at)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Task Responses Section */}
                        {/* {responses && responses.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold mb-3">Task Responses</h3>
                                <div className="border rounded-md overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {responses.map((response) => (
                                                <tr key={response.id}>
                                                    <td className="px-4 py-2 whitespace-nowrap">{response.field_label || 'Unknown Field'}</td>
                                                    <td className="px-4 py-2">{response.response_value || 'No response'}</td>
                                                    <td className="px-4 py-2">{response.response_notes || 'No notes'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )} */}

                        {/* {responses && responses.length === 0 && !loading && (
                            <div className="mt-4 p-4 bg-gray-100 rounded-md text-gray-600 text-center">
                                No responses recorded for this task yet.
                            </div>
                        )} */}

                        {/* {loading && (
                            <div className="mt-4 p-4 text-center">
                                <p>Loading responses...</p>
                                
                            </div>
                        )} */}
                        
                    </CardContent>
                </Card>
            </td>
        </tr>
    );
};

export default TaskDetailsModal;