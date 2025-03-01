
import React from 'react';
import TaskCards from './components/TaskCards';
import UpcomingEvents from './components/UpcomingEvents';
import ReportedIncidents from './components/ReportedIncidents';
// import DailyReports from './components/DailyReports';
import Overview from './components/Overview';
import DailyTaskChart from './components/DailyTaskChart';




const Dashboard = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
        <div className='h-fit'>
            <UpcomingEvents />

        </div>
      {/* <h1 className="text-3xl font-bold mb-6">Food Documentation Dashboard</h1> */}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TaskCards />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Overview />
        <ReportedIncidents />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
      </div>
      
      <div className="w-full">
        <DailyTaskChart />
        {/* <DailyReports /> */}
      </div>
    </div>
  );
};

export default Dashboard;