"use client"

import React, { useState, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { AlertCircle } from "lucide-react";
import useDailyTaskData from "../hooks/useDailyTaskData";

const chartConfig = {
  tasks: {
    label: "Tasks Completed",
  },
  quality: {
    label: "Quality",
    color: "hsl(var(--chart-1))",
  },
  processing: {
    label: "Processing",
    color: "hsl(var(--chart-2))",
  },
  drying: {
    label: "Drying",
    color: "hsl(var(--chart-3))",
  },
  finished: {
    label: "Finished Product",
    color: "hsl(var(--chart-4))",
  },
  raw: {
    label: "Raw Material",
    color: "hsl(var(--chart-5))",
  },
  general: {
    label: "General Office",
    color: "hsl(var(--chart-6))",
  },
  finance: {
    label: "Finance",
    color: "hsl(var(--chart-7))",
  },
  human: {
    label: "Human Resources",
    color: "hsl(var(--chart-8))",
  },
  security: {
    label: "Security",
    color: "hsl(var(--chart-9))",
  },
  procurement: {
    label: "Procurement",
    color: "hsl(var(--chart-10))",
  }
};

const DailyTaskChart = () => {
  const {hourlyData, loading, error} = useDailyTaskData();
  
  const [activeChart, setActiveChart] = useState("quality");

  const total = useMemo(() => {
    if (!hourlyData || hourlyData.length === 0) {
      return {
        quality: 0,
        processing: 0,
        drying: 0,
        finished: 0,
        raw: 0,
        general: 0,
        finance: 0,
        human: 0,
        security: 0,
        procurement: 0,
      };
    }
    
    return {
      quality: hourlyData.reduce((acc, curr) => acc + (curr.quality || 0), 0),
      processing: hourlyData.reduce((acc, curr) => acc + (curr.processing || 0), 0),
      drying: hourlyData.reduce((acc, curr) => acc + (curr.drying || 0), 0),
      finished: hourlyData.reduce((acc, curr) => acc + (curr.finished || 0), 0),
      raw: hourlyData.reduce((acc, curr) => acc + (curr.raw || 0), 0),
      general: hourlyData.reduce((acc, curr) => acc + (curr.general || 0), 0),
      finance: hourlyData.reduce((acc, curr) => acc + (curr.finance || 0), 0),
      human: hourlyData.reduce((acc, curr) => acc + (curr.human || 0), 0),
      security: hourlyData.reduce((acc, curr) => acc + (curr.security || 0), 0),
      procurement: hourlyData.reduce((acc, curr) => acc + (curr.procurement || 0), 0),
    };
  }, [hourlyData]);

  // Array of department keys for easy mapping
  const departments = ["quality", "processing", "drying", "finished", "raw", "general", "finance", "human", "security", "procurement"];

  // Render loading skeleton
  const renderLoading = () => (
    <div className="px-2 sm:p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-10 gap-4 mb-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
        
        {/* Chart bars skeleton */}
        <div className="h-60 flex items-end space-x-2">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="bg-gray-200 rounded w-full" 
              style={{ height: `${Math.random() * 60 + 20}%` }}
            ></div>
          ))}
        </div>
        
        {/* X-axis labels skeleton */}
        <div className="grid grid-cols-12 gap-2 mt-2">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="px-6 py-10 flex flex-col items-center justify-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-red-500 mb-2">Failed to load chart data</h3>
      <p className="text-sm text-gray-500 text-center max-w-md">
        There was a problem loading the hourly task data. Please try refreshing the page or contact support if the problem persists.
      </p>
    </div>
  );

  // Create department tab groups for responsive layout
  const departmentGroups = [
    departments.slice(0, 5),  // First row
    departments.slice(5, 10)  // Second row
  ];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5">
          <CardTitle className="tracking-wider text-gray-500">Hourly Task Completion</CardTitle>
          <CardDescription>
            Tasks completed by hour across departments
          </CardDescription>
        </div>
        
        {departmentGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="grid grid-cols-5">
            {group.map((key) => (
              <button
                key={key}
                data-active={activeChart === key}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-4 py-3 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-4 sm:py-4"
                onClick={() => setActiveChart(key)}
              >
                <span className="text-xs text-muted-foreground truncate">
                  {chartConfig[key].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-xl">
                  {total[key].toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        ))}
      </CardHeader>
      
      <CardContent className="px-2 sm:p-6">
        {loading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer className=" w-full text-sm">
              <BarChart
                data={hourlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip 
                  formatter={(value) => [`${value} tasks`, chartConfig[activeChart].label]}
                  labelFormatter={(value) => `Hour: ${value}`}
                />
                <Bar 
                  dataKey={activeChart} 
                  fill={chartConfig[activeChart].color} 
                  radius={[0, 0, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyTaskChart;