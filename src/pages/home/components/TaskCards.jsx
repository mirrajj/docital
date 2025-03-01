// src/components/dashboard/TaskCards.jsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import useTaskStatusData from '../hooks/useTaskStatusData';
import { Link } from 'react-router-dom';



const TaskCard = ({ title, description, count, icon, showExpandIcon = true }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    return (
        <div className='flex flex-col'>
            <Card className="h-fit  text-green-500 relative">
                <CardHeader className="pb-1">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium ">{title}</CardTitle>
                        {icon}
                    </div>
                    <CardDescription className="text-xs">{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold ">{count}</div>
                        {showExpandIcon && (
                            <button
                                onClick={toggleExpand}
                                className="text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-full hover:bg-gray-100"
                                aria-expanded={expanded}
                                aria-label={expanded ? "Collapse task details" : "Expand task details"}
                            >
                                {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                        )}
                    </div>


                </CardContent>
                {expanded && (

                    <CardFooter>
                        <Link to={"/monitoring"}>
                            <p className="text-xs text-blue-600 hover:underline">
                                View all {title.toLowerCase()}
                            </p>
                        </Link>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};

const TaskCards = () => {
    const { taskData, loading, error } = useTaskStatusData();
    return (
        <>
            {/* Pending Tasks */}
            <TaskCard
                title="Pending Tasks"
                description="Tasks that need attention"
                count={taskData.pending.count}
                icon={<Clock className="h-5 w-5 text-blue-500" />}
                // items={mockTaskData.pending.recent}
                itemKey="due"

            />

            {/* Completed Tasks */}
            <TaskCard
                title="Completed Tasks"
                description="Successfully completed tasks"
                count={taskData.completed.count}
                icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                // items={mockTaskData.completed.recent}
                itemKey="completed"

            />

            {/* Overdue Tasks */}
            <TaskCard
                title="Overdue Tasks"
                description="Tasks that are past due"
                count={taskData.overdue.count}
                icon={<AlertCircle className="h-5 w-5 text-red-500" />}
                // items={mockTaskData.overdue.recent}
                itemKey="due"

            />
        </>
    );
};

export default TaskCards;