import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Label } from 'recharts';
import { TrendingUp, TrendingDown, Loader2, AlertCircle, Info } from 'lucide-react';
import useTaskStatusData from '../hooks/useTaskStatusData';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

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
        return chartData?.reduce((acc, curr) => acc + curr.tasks, 0) || 0;
    }, [chartData]);

    const completionRate = useMemo(() => {
        if (!chartData || chartData.length === 0) return 0;
        const completed = chartData.find(item => item.status === 'completed')?.tasks || 0;
        return Math.round((completed / totalTasks) * 100) || 0;
    }, [chartData, totalTasks]);

    // Determine if user is lagging behind (assuming below 70% is lagging)
    const isLaggingBehind = completionRate < 70;
    const lagPercentage = isLaggingBehind ? 70 - completionRate : 0;

    // Render content based on loading/error state
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center h-64">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground">Loading task data...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-64">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <p className="text-red-500 font-medium mb-1">Error loading data</p>
                    <p className="text-sm text-muted-foreground text-center px-4">
                        Please try refreshing the page
                    </p>
                </div>
            );
        }

        return (
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
                        data={chartData || []}
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
        );
    };

    // Render footer info based on completion status
    const renderFooterInfo = () => {
        if (loading || error) return null;

        return (
            <>
                <div className="flex items-center gap-2 font-medium leading-none">
                    {isLaggingBehind ? (
                        <>
                            You're lagging behind by {lagPercentage}% <TrendingDown className="h-4 w-4 text-amber-500" />
                        </>
                    ) : (
                        <>
                            You're on track with your tasks <TrendingUp className="h-4 w-4 text-green-500" />
                        </>
                    )}
                </div>
                <div className="leading-none text-muted-foreground">
                    {totalTasks} total tasks tracked in the system
                </div>
            </>
        );
    };

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="items-center pb-0">
                <CardTitle>Task Completion Overview</CardTitle>
                <CardDescription>Current status of all tasks</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                {renderContent()}
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                {renderFooterInfo()}
            </CardFooter>
        </Card>
    );
};

export default TaskCompletionOverview;