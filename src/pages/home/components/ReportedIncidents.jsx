import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import useIncidentsData from '../hooks/useIncidentsData';


// Helper function to get status icon
const getStatusIcon = (status) => {
  switch (status) {
    case 'resolved':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'investigating':
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    default:
      return null;
  }
};

const ReportedIncidents = () => {

  const {incidentsData,loading,error} = useIncidentsData();
  // State to track the active severity filter
  const [activeSeverity, setActiveSeverity] = useState(null);
  
  // Get all available severity levels
  const severityLevels = ['high', 'medium', 'low'];
  
  // Calculate counts for each severity level
  const severityCounts = severityLevels.reduce((counts, severity) => {
    counts[severity] = incidentsData.filter(incident => incident.severity === severity).length;
    return counts;
  }, {});
  
  // Filter incidents based on selected severity
  const filteredIncidents = activeSeverity 
    ? incidentsData.filter(incident => incident.severity === activeSeverity) 
    : [];

  // Colors for severity tabs
  const severityColors = {
    high: 'bg-red-100 text-red-700 hover:bg-red-200',
    medium: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    low: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  };

  return (
    <Card className="h-fit">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <div>
          <CardTitle className="tracking-wider text-gray-500 border-r">Reported Incidents</CardTitle>
        </div>
        <div className="flex space-x-2">
          {severityLevels.map(severity => (
            <button
              key={severity}
              onClick={() => setActiveSeverity(activeSeverity === severity ? null : severity)}
              className={`px-3 py-1 rounded-full text-xs font-medium ${severityColors[severity]} ${
                activeSeverity === severity ? 'ring-2 ring-offset-1' : ''
              } flex items-center`}
            >
              <span>{severity.charAt(0).toUpperCase() + severity.slice(1)}</span>
              <span className="ml-1.5 bg-white bg-opacity-30 px-1.5 py-0.5 rounded-full text-xs">
                {severityCounts[severity]}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {activeSeverity ? (
          <div className="space-y-4">
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map(incident => (
                <div key={incident.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{incident.title}</h4>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">{incident.date}</div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="font-medium">Status:</div>
                    <div className="flex items-center">
                      {getStatusIcon(incident.status)}
                      <span className="ml-1 capitalize">{incident.status}</span>
                    </div>
                  </div>
                  {incident.resolution && (
                    <div className="mt-2 text-sm border-t pt-2">
                      <span className="font-medium">Resolution: </span>
                      {incident.resolution}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No incidents found with {activeSeverity} severity
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className='text-xs text-gray-400 '>Recent food safety and quality incidents</p>
            <p>Select a severity level to view incidents</p>
            
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportedIncidents;