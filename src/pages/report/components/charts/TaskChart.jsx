import React, { useEffect, useState } from 'react';
import useFetchTaskData from '../../hooks/useFetchTaskData';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';


const TaskChart = () => {
    const {fetchTaskData,loading,error} = useFetchTaskData();
    const [uncompliance,setUncompliance] = useState([]);
    const [completion,setCompletion] = useState([]);

    const formatTaskCompletionData = (tasks) => {
        const groupedData = {};
    
        tasks.forEach(task => {
            if (!task.completion_time || !task.task?.department?.name) return; // Skip invalid data
    
            const date = task.completion_time.split("T")[0]; // Extract YYYY-MM-DD
            const department = task.task.department.name;
    
            // Initialize date entry if not exists
            if (!groupedData[date]) {
                groupedData[date] = { date };
            }
    
            // Increment task count per department
            groupedData[date][department] = (groupedData[date][department] || 0) + 1;
        });
    
        return Object.values(groupedData); // Convert grouped object to array
    };

    const formatUncomplianceData = (uncompliances) => {
        const groupedData = {};
    
        uncompliances.forEach(entry => {
            if (!entry.logged_at || !entry.task?.department?.name) return; // Skip invalid entries
    
            const date = entry.logged_at.split("T")[0]; // Extract YYYY-MM-DD
            const department = entry.task.department.name;
    
            // Initialize department entry if not exists
            if (!groupedData[department]) {
                groupedData[department] = {};
            }
    
            // Initialize date entry if not exists
            if (!groupedData[department][date]) {
                groupedData[department][date] = 0;
            }
    
            // Increment uncompliance count
            groupedData[department][date] += 1;
        });
    
        // Convert grouped data to Nivo format
        return Object.keys(groupedData).map(department => ({
            id: department,
            data: Object.keys(groupedData[department]).map(date => ({
                x: date,
                y: groupedData[department][date]
            }))
        }));
    };
    
    
    
    
    

    useEffect(() => {
        const getData = async() => {

            const result = await fetchTaskData();
            const {uncomplianceData,completionData} = result;
            setUncompliance(uncomplianceData);
            console.log(uncompliance);
            setCompletion(completionData);
        }
        getData();
    },[])

    if (uncompliance.length === 0 && completion === 0) {
        return <p>There is no data to display</p>
    }


    const formattedData = formatTaskCompletionData(completion);
    const formattedUncompliances = formatUncomplianceData(uncompliance);

  return (
    <>
          <div style={{ height: 400 }}>
              <ResponsiveBar
                  data={formattedData}
                  keys={Object.keys(formattedData[0] || {}).filter(key => key !== "date")} // Department names
                  indexBy="date"
                  groupMode='grouped'
                  margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                  padding={0.3}
                  colors={{ scheme: "paired" }}
                  borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                  axisBottom={{ tickRotation: -30 }}
                  enableLabel={false}
                  animate={true}
              />
          </div>
          <div style={{ height: 400 }}>
              <ResponsiveLine
                  data={formattedUncompliances}
                  margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                  xScale={{ type: "point" }}  // X-axis: Dates
                  yScale={{ type: "linear", min: "auto", max: "auto" }}  // Y-axis: Count of uncompliance cases
                  axisBottom={{ tickRotation: -30 }}
                  legends={[
                    {
                        dataFrom: 'keys',
                        anchor: 'bottom-right',
                        direction: 'column',
                        justify: false,
                        translateX: 120,
                        translateY: 0,
                        itemsSpacing: 2,
                        itemWidth: 100,
                        itemHeight: 20,
                        itemDirection: 'left-to-right',
                        itemOpacity: 0.85,
                        symbolSize: 20,
                        effects: [
                            {
                                on: 'hover',
                                style: {
                                    itemOpacity: 1
                                }
                            }
                        ]
                    }
                ]}
                  colors={{ scheme: "set1" }}
                  pointSize={8}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: "color", modifiers: [["darker", 0.3]] }}
                  enableGridX={false}
                  enableGridY={true}
                  useMesh={true}
              />
          </div>
    </>
  );
}

export default TaskChart;
