// src/components/dashboard/TaskCompletionOverview.jsx
// "use client"

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Label } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';


import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import {
    //   ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

import useTaskStatusData from '../hooks/useTaskStatusData';


const chartConfig = {
    tasks: {
        label: "Tasks",
    },
    completed: {
        label: "Completed",
        color: "hsl(var(--chart-1))",
    },
    pending: {
        label: "Pending",
        color: "hsl(var(--chart-2))",
    },
    overdue: {
        label: "Overdue",
        color: "hsl(var(--chart-3))",
    },
}

const TaskCompletionOverview = () => {


    const { chartData, loading, error } = useTaskStatusData();


    const totalTasks = useMemo(() => {
        return chartData?.reduce((acc, curr) => acc + curr.tasks, 0);
    }, [chartData]);

    const completionRate = useMemo(() => {
        return Math.round((chartData[0]?.tasks / totalTasks) * 100)
    }, [totalTasks]);



    // Calculate week-over-week change (mock data)
    const weeklyChange = 3.7;
    const isTrendingUp = weeklyChange > 0;

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="items-center pb-0">
                <CardTitle>Task Completion Overview</CardTitle>
                <CardDescription>Current status of all tasks</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-64"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="tasks"
                            nameKey="status"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {completionRate}%
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Completion Rate
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    {isTrendingUp ? (
                        <>
                            Trending up by {weeklyChange}% this week <TrendingUp className="h-4 w-4 text-green-500" />
                        </>
                    ) : (
                        <>
                            Trending down by {Math.abs(weeklyChange)}% this week <TrendingDown className="h-4 w-4 text-red-500" />
                        </>
                    )}
                </div>
                <div className="leading-none text-muted-foreground">
                    {totalTasks} total tasks tracked in the system
                </div>
            </CardFooter>
        </Card>
    );
};

export default TaskCompletionOverview;