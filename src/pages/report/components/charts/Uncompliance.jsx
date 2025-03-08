"use client"
import React,{useState} from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import useUncomplianceData from "../../hooks/useFetchMonthlyUncompliance"
import {
  Card,
  CardContent,
  CardDescription,
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


const chartConfig = {
  incidents: { 
    label: "Uncompliances",
  },
  processingdepartment: {
    label: "Processing Department",
    color: "hsl(var(--chart-1))",
  },
  dryingdepartment: {
    label: "Drying Department",
    color: "hsl(var(--chart-2))",
  },
  cleaningdepartment: {
    label: "Cleaning Department",
    color: "hsl(var(--chart-3))",
  },
  finishedproductdepartment: {
    label: "Finished Products",
    color: "hsl(var(--chart-4))",
  },
  rawmaterialdepartment: {
    label: "Raw Materials",
    color: "hsl(var(--chart-5))",
  },
  generalofficespace: {
    label: "General Office",
    color: "hsl(var(--chart-6))",
  }
}

const Uncompliance = () => {
  const [selectedYear,setSelectedYear] = useState(new Date().getFullYear());
  const {uncomplianceData,loading,error} = useUncomplianceData(selectedYear);

  const [activeChart, setActiveChart] = React.useState("processingdepartment")
  
  const departmentKeys = Object.keys(chartConfig).filter(key => key !== 'incidents')

  const handleYearChange = (value) => {
    setSelectedYear(parseInt(value,10));
  }

  // Calculate totals for each department
  const total = React.useMemo(() => {
    const result = {}
    
    departmentKeys.forEach(dept => {
      result[dept] = uncomplianceData.reduce((acc, curr) => 
        acc + (curr[dept] || 0), 0)
    })
    
    return result
  }, [uncomplianceData, departmentKeys])
  
  // Fill in missing values with zeros for consistent charting
  const normalizedData = uncomplianceData.map(item => {
    const newItem = { ...item }
    departmentKeys.forEach(dept => {
      newItem[dept] = item[dept] || 0
    })
    return newItem
  })

  return (
    <Card className="my-5">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Uncompliance Trends</CardTitle>
          <div className="flex flex-col gap-2">
            <CardDescription className="text-xs">
              Uncompliances By Departments for 2025
            </CardDescription>
            <Select defaultValue="2025"  onValueChange={(value) => handleYearChange(value)}>
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
          </div>
        </div>
        <div className="flex">
          {["processingdepartment", "dryingdepartment","rawmaterialdepartment","generalofficespace","cleaningdepartment","finishedproductdepartment"].map((key) => {
            return (
              <button
                key={key}
                data-active={activeChart === key}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(key)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[key].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={normalizedData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="incidents"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={chartConfig[activeChart].color}
              strokeWidth={2}
              dot={true}
              activeDot={{
                r: 6,
                fill: chartConfig[activeChart].color,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      
    </Card>
  )
}

export default Uncompliance