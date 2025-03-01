import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Users, ClipboardCheck } from 'lucide-react';

// Mock data for upcoming events
const mockEventsData = [
  {
    id: 1,
    title: 'Supplier Audit',
    date: 'Feb 28, 2025',
    time: '10:00 AM',
    type: 'audit',
    participants: 4
  },
  {
    id: 2,
    title: 'Food Safety Training',
    date: 'Mar 1, 2025',
    time: '2:00 PM',
    type: 'training',
    participants: 12
  },
  {
    id: 3,
    title: 'Quality Control Meeting',
    date: 'Mar 3, 2025',
    time: '9:30 AM',
    type: 'meeting',
    participants: 7
  },
  {
    id: 4,
    title: 'Equipment Maintenance',
    date: 'Mar 5, 2025',
    time: '8:00 AM',
    type: 'maintenance',
    participants: 3
  }
];

// Helper function to get icon based on event type
const getEventIcon = (type) => {
  switch (type) {
    case 'audit':
      return <ClipboardCheck className="h-4 w-4 text-purple-500" />;
    case 'training':
      return <Users className="h-4 w-4 text-green-500" />;
    default:
      return <CalendarDays className="h-4 w-4 text-blue-500" />;
  }
};

const UpcomingEvents = () => {
  return (
    <Card className="w-1/2 flex max-h-10 items-center bg-white rounded-xl  p-2">
      <CardHeader className=" w-1/2 border-r">
        <CardTitle className="text-xs font-medium">Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-scroll self-center">
        <div className="mt-10 ">
          <div className="flex space-x-3 min-w-max rounded-lg">
            {mockEventsData.map(event => (
              <div 
                key={event.id} 
                className="flex items-center space-x-2 rounded-lg border bg-gray-200 hover:bg-gray-50 transition-colors min-w-48"
              >
                <div className="p-1.5 bg-gray-100 rounded-full">
                  {getEventIcon(event.type)}
                </div>
                <div>
                  <h4 className="font-medium text-xs">{event.title}</h4>
                  <div className="flex items-center text-xs text-gray-500 mt-0.5">
                    <span>{event.date}</span>
                    <span className="mx-1">•</span>
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-0.5" />
                      {event.participants}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents;