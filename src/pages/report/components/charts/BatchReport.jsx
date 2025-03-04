  "use client"
import React, { useState, useEffect } from 'react';
import { PieChart, Pie } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import supabase from '../../../../config/supabaseClient';
import useFetchBatchData from '../../hooks/useFetchBatchData';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Define the chart configuration for our batch data
const chartConfig = {
  weight: { 
    label: "Weight",
  },
  "finished_product": {
    label: "finished-product",
    color: "hsl(var(--chart-1))",
  },
  "waste_material": {
    label: "waste-material",
    color: "hsl(var(--chart-2))",
  }
};

export function BatchReport() {
  const { loading: fetchLoading, error: batchError, fetchBatchData } = useFetchBatchData();
  
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batchRecord, setBatchRecord] = useState([]);
  const [trendPercentage, setTrendPercentage] = useState(null);
  const [trendDirection, setTrendDirection] = useState('up');
  
  // Format data for the chart
//   const formatBatchData = (batchData) => {
//     if (!batchData || !batchData.length) return [];
    
//     return batchData.map(item => ({
//       ...item,
//       fill: item.id === "Finished Product" ? "var(--chart-1)" : "var(--chart-2)"
//     }));
//   };
  
  // Fetch batch numbers from database
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setIsLoading(true);
        const { data: batchData, error } = await supabase
          .from('batch')
          .select('batch_no');

        if (error) {
          throw new Error('Failed to fetch batch data');
        }

        setBatches(batchData);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, []);

  // Fetch specific batch data when selection changes
  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      const result = await fetchBatchData(selectedBatch);
      setBatchRecord(result);
      
      // Calculate a mock trend percentage for demonstration
      const mockTrend = parseFloat((Math.random() * 10 - 5).toFixed(1));
      setTrendPercentage(Math.abs(mockTrend));
      setTrendDirection(mockTrend >= 0 ? 'up' : 'down');
      
      setIsLoading(false);
    };

    if (selectedBatch) getData();
  }, [selectedBatch]);

  const handleBatchChange = (e) => {
    setSelectedBatch(e.target.value);
  };

console.log(batchRecord);
  
  // Format date range (assuming the most recent 6 months)
  const getDateRange = () => {
    const now = new Date();
    const end = new Date(now).toLocaleString('default', { month: 'long', year: 'numeric' });
    const start = new Date(now.setMonth(now.getMonth() - 5)).toLocaleString('default', { month: 'long', year: 'numeric' });
    return `${start} - ${end}`;
  };

  return (
    <Card className="flex flex-col max-w-4xl mx-auto shadow-md">
      <CardHeader className="items-center pb-0">
        <CardTitle>Batch Report</CardTitle>
        <CardDescription>
          {selectedBatch ? `Batch: ${selectedBatch}` : 'Select a batch to view data'}
        </CardDescription>
      </CardHeader>
      
      <div className="px-6 pt-2">
        <label htmlFor="batch-select" className="block text-sm font-medium mb-2">
          Batch Number
        </label>

        {isLoading && !selectedBatch ? (
          <div className="animate-pulse flex space-x-4 mb-4">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm mb-4">
            Error: {error}. Please try again later.
          </div>
        ) : (
          <div className="relative mb-4">
            <select
              id="batch-select"
              value={selectedBatch}
              onChange={handleBatchChange}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm"
            >
              <option value="" disabled>Select a batch number</option>
              {batches.map((batch, index) => (
                <option key={index} value={batch.batch_no}>
                  {batch.batch_no}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="flex-1 pb-0">
        {isLoading && selectedBatch ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : selectedBatch && batchRecord.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie 
                data={batchRecord} 
                dataKey="weight" 
                nameKey="value" 
                label 
                // innerRadius={60} 
                // outerRadius={80} 
                // paddingAngle={5}
              />
            </PieChart>
          </ChartContainer>
        ) : selectedBatch ? (
          <div className="text-center py-10 text-gray-500">
            No data available for this batch
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            Select a batch to view the report
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex-col gap-2 text-sm">
        {selectedBatch && batchRecord.length > 0 && trendPercentage !== null && (
          <>
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending {trendDirection} by {trendPercentage}% from previous batch
              {trendDirection === 'up' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
            <div className="leading-none text-muted-foreground">
              Showing finished product vs waste material ratio
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

export default BatchReport;