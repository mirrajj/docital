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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ClipboardList, Download, FileX } from "lucide-react";

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

  const handleBatchChange = (value) => {
    setSelectedBatch(value);
  };


  return (
    <Card className="max-w-4xl mx-auto shadow-md mt-6 overflow-hidden ">
      <CardHeader className="pb-2 border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold">Batch Report</CardTitle>
            <CardDescription>
              {selectedBatch ? `Batch: ${selectedBatch}` : 'Select a batch to view data'}
            </CardDescription>
          </div>
          
          {!isLoading && !error && (
            <div className="w-48">
              <Select
                value={selectedBatch}
                onValueChange={handleBatchChange}
                disabled={isLoading}
              >
                <SelectTrigger id="batch-select" className="w-full">
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" " disabled>Select a batch number</SelectItem>
                  {batches.map((batch, index) => (
                    <SelectItem key={index} value={batch.batch_no}>
                      {batch.batch_no}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 pb-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading batch data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2 text-center max-w-md">
              <AlertTriangle className="h-10 w-10 text-destructive" />
              <p className="font-medium">Error loading batch data</p>
              <p className="text-sm text-muted-foreground">{error}. Please try again later.</p>
            </div>
          </div>
        ) : selectedBatch && batchRecord.length > 0 ? (
          <div className="space-y-6">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[300px] [&_.recharts-pie-label-text]:fill-foreground"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie 
                  data={batchRecord} 
                  dataKey="weight" 
                  nameKey="value" 
                  label 
                  innerRadius={60} 
                  outerRadius={100} 
                  paddingAngle={2}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
            
            {trendPercentage !== null && (
              <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg">
                <div className={`rounded-full p-1.5 ${trendDirection === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {trendDirection === 'up' ? (
                    <TrendingUp className={`h-5 w-5 ${trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                  ) : (
                    <TrendingDown className={`h-5 w-5 ${trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                  )}
                </div>
                <span className="font-medium">
                  Trending {trendDirection} by <span className="font-bold">{trendPercentage}%</span> from previous batch
                </span>
              </div>
            )}
          </div>
        ) : selectedBatch ? (
          <div className="flex flex-col items-center justify-center h-64 gap-2">
            <FileX className="h-12 w-12 text-muted-foreground/70" />
            <p className="text-lg font-medium">No data available</p>
            <p className="text-sm text-muted-foreground">This batch doesn't have any recorded data</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 gap-2">
            <ClipboardList className="h-12 w-12 text-muted-foreground/70" />
            <p className="text-lg font-medium">Select a batch to view the report</p>
            <p className="text-sm text-muted-foreground">Batch data will appear here</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
        <div className="w-full flex items-center justify-between">
          <span>Showing finished product vs waste material ratio</span>
          {selectedBatch && (
            <Button variant="ghost" size="sm" className="gap-1">
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default BatchReport;