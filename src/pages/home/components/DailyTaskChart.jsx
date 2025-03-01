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
  ResponsiveContainer,
  Legend
} from "recharts";
import useDailyTaskData from "../hooks/useDailyTaskData";

// Mock data for hourly task completion by department
const mockHourlyData = [
  { 
    hour: '8 AM', 
    cleaning: 4, 
    processing: 3, 
    drying: 2, 
    finishedProduct: 1, 
    rawMaterial: 3, 
    generalOffice: 5 
  },
  { 
    hour: '9 AM', 
    cleaning: 7, 
    processing: 6, 
    drying: 4, 
    finishedProduct: 3, 
    rawMaterial: 5, 
    generalOffice: 8 
  },
  { 
    hour: '10 AM', 
    cleaning: 5, 
    processing: 8, 
    drying: 6, 
    finishedProduct: 4, 
    rawMaterial: 6, 
    generalOffice: 3 
  },
  { 
    hour: '11 AM', 
    cleaning: 8, 
    processing: 7, 
    drying: 5, 
    finishedProduct: 6, 
    rawMaterial: 4, 
    generalOffice: 2 
  },
  { 
    hour: '12 PM', 
    cleaning: 3, 
    processing: 4, 
    drying: 3, 
    finishedProduct: 2, 
    rawMaterial: 2, 
    generalOffice: 1 
  },
  { 
    hour: '1 PM', 
    cleaning: 6, 
    processing: 5, 
    drying: 4, 
    finishedProduct: 3, 
    rawMaterial: 3, 
    generalOffice: 2 
  },
  { 
    hour: '2 PM', 
    cleaning: 9, 
    processing: 7, 
    drying: 6, 
    finishedProduct: 5, 
    rawMaterial: 4, 
    generalOffice: 3 
  },
  { 
    hour: '3 PM', 
    cleaning: 5, 
    processing: 6, 
    drying: 7, 
    finishedProduct: 8, 
    rawMaterial: 5, 
    generalOffice: 4 
  },
  { 
    hour: '4 PM', 
    cleaning: 3, 
    processing: 4, 
    drying: 5, 
    finishedProduct: 6, 
    rawMaterial: 3, 
    generalOffice: 7 
  },
  { 
    hour: '5 PM', 
    cleaning: 2, 
    processing: 3, 
    drying: 4, 
    finishedProduct: 5, 
    rawMaterial: 2, 
    generalOffice: 6 
  },
];

const chartConfig = {
  tasks: {
    label: "Tasks Completed",
  },
  cleaning: {
    label: "Cleaning",
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
  finishedProduct: {
    label: "Finished Product",
    color: "hsl(var(--chart-4))",
  },
  rawMaterial: {
    label: "Raw Material",
    color: "hsl(var(--chart-5))",
  },
  generalOffice: {
    label: "General Office",
    color: "hsl(var(--chart-6))",
  }
};

const DailyTaskChart = () => {
  const {hourlyData,loading,error} = useDailyTaskData();
  
  const [activeChart, setActiveChart] = useState("cleaning");

  const total = useMemo(() => ({
    cleaning: hourlyData.reduce((acc, curr) => acc + curr.cleaning, 0),
    processing: hourlyData.reduce((acc, curr) => acc + curr.processing, 0),
    drying: hourlyData.reduce((acc, curr) => acc + curr.drying, 0),
    finishedProduct: hourlyData.reduce((acc, curr) => acc + curr.finished, 0),
    rawMaterial: hourlyData.reduce((acc, curr) => acc + curr.raw, 0),
    generalOffice: hourlyData.reduce((acc, curr) => acc + curr.general, 0),
  }), [hourlyData]);

//   console.log(hourlyData);

  // Array of department keys for easy mapping
  const departments = ["cleaning", "processing", "drying", "finishedProduct", "rawMaterial", "generalOffice"];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5">
          <CardTitle>Hourly Task Completion</CardTitle>
          <CardDescription>
            Tasks completed by hour across departments
          </CardDescription>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6">
          {departments.map((key) => (
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
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
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
      </CardContent>
    </Card>
  );
};

export default DailyTaskChart;