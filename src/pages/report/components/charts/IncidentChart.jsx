"use client"
import { useState } from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis,LineChart,Line } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetchMonthlyIncidents from "../../hooks/useFetchMonthlyIncidents"

const chartConfig = {
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
  }
};
const chartConfigLine = {
    totalIncidents: {
      label: "Total Incidents",
      color: "hsl(var(--chart-1))",
    }
};

const IncidentChart = () => {
  const [selectedYear,setSelectedYear] = useState(new Date().getFullYear());
  const { chartData, loading, error } = useFetchMonthlyIncidents(selectedYear);

  const handleYearChange = (value) => {
    setSelectedYear(parseInt(value,10));
  }
  // Transform the API data to the format needed for the chart
  const transformedData = chartData?.map(item => ({
    month: item.month,
    cleaning: item.cleaning,
    processing: item.processing,
    drying: item.drying,
    finished: item.finished,
    raw: item.raw,
    general: item.general
  })) || [];

  const transformedDataLine = chartData?.map(item => {
    // Calculate total incidents by summing all categories
    const totalIncidents = 
      item.cleaning + 
      item.processing + 
      item.drying + 
      item.finished + 
      item.raw + 
      item.general;
      
    return {
      month: item.month,
      totalIncidents: totalIncidents
    };
  }) || [];

  // Calculate percentage change if we have data for at least 2 months
  const calculateTrend = () => {
    if (transformedDataLine.length < 2) return { value: 0, isUp: true };
    
    const currentMonth = transformedDataLine[transformedDataLine.length - 1].totalIncidents;
    const previousMonth = transformedDataLine[transformedDataLine.length - 2].totalIncidents;
    
    if (previousMonth === 0) return { value: 0, isUp: true };
    
    const change = ((currentMonth - previousMonth) / previousMonth) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isUp: change >= 0
    };
  };

  const trend = calculateTrend();

  return (
    <>
        <Card className="my-5">
        <CardHeader>
          <div>
            <CardTitle>Incident Categories</CardTitle>
            <CardDescription>Monthly Breakdown 2024</CardDescription>
          </div>
          <Select defaultValue="2025" onValueChange={(value) => handleYearChange(value)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                  </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
            {loading ? (
            <div className="flex justify-center items-center h-64">Loading chart data...</div>
            ) : error ? (
            <div className="flex justify-center items-center h-64 text-red-500">Error loading chart data</div>
            ) : (
            <ChartContainer config={chartConfig} className="max-h-[250px] w-full">
                <BarChart accessibilityLayer data={transformedData}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="cleaning" fill={chartConfig.cleaning.color} radius={0} />
                <Bar dataKey="processing" fill={chartConfig.processing.color} radius={0} />
                <Bar dataKey="drying" fill={chartConfig.drying.color} radius={0} />
                <Bar dataKey="finished" fill={chartConfig.finished.color} radius={0} />
                <Bar dataKey="raw" fill={chartConfig.raw.color} radius={0} />
                <Bar dataKey="general" fill={chartConfig.general.color} radius={0} />
                </BarChart>
            </ChartContainer>
            )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
            <TrendingUp className="h-4 w-4 mr-1" /> 
            Incident tracking by category
            </div>
            <div className="leading-none text-muted-foreground">
            Showing incidents by department and process stage
            </div>
        </CardFooter>
        </Card>
 
          <Card>
              <CardHeader>
                <div>
                  <CardTitle>Incident Trend</CardTitle>
                  <CardDescription>Monthly Incident Tracking 2024</CardDescription>
                </div>
                <Select defaultValue="2025" onValueChange={(value) => handleYearChange(value)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                  {loading ? (
                      <div className="flex justify-center items-center h-64">Loading chart data...</div>
                  ) : error ? (
                      <div className="flex justify-center items-center h-64 text-red-500">Error loading chart data</div>
                  ) : (
                      <ChartContainer config={chartConfigLine} className="max-h-[250px] w-full">
                          <LineChart
                              accessibilityLayer
                              data={transformedDataLine}
                              margin={{
                                  left: 12,
                                  right: 12,
                              }}
                          >
                              <CartesianGrid vertical={false} />
                              <XAxis
                                  dataKey="month"
                                  tickLine={false}
                                  axisLine={false}
                                  tickMargin={8}
                                  tickFormatter={(value) => value.slice(0, 3)}
                              />
                              <ChartTooltip
                                  cursor={false}
                                  content={<ChartTooltipContent hideLabel />}
                              />
                              <Line
                                  dataKey="totalIncidents"
                                  type="natural"
                                  stroke={chartConfigLine.totalIncidents.color}
                                  strokeWidth={2}
                                  dot={{
                                      fill: chartConfigLine.totalIncidents.color,
                                  }}
                                  activeDot={{
                                      r: 6,
                                  }}
                              />
                          </LineChart>
                      </ChartContainer>
                  )}
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                  <div className="flex gap-2 font-medium leading-none">
                      {trend.isUp ? (
                          <>Trending up by {trend.value}% this month <TrendingUp className="h-4 w-4" /></>
                      ) : (
                          <>Trending down by {trend.value}% this month <TrendingUp className="h-4 w-4 rotate-180" /></>
                      )}
                  </div>
                  <div className="leading-none text-muted-foreground">
                      Showing total incidents across all departments
                  </div>
              </CardFooter>
          </Card>
    </>
  )
}

export default IncidentChart;