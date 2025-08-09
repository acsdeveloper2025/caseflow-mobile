import React from 'react';
import { Case } from '../types';

interface TimelineEvent {
  label: string;
  timestamp: string;
  icon: string;
  color: string;
}

interface CaseTimelineProps {
  caseData: Case;
}

const CaseTimeline: React.FC<CaseTimelineProps> = ({ caseData }) => {
  // Format timestamp to readable format
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Calculate duration between two timestamps
  const calculateDuration = (startTime: string, endTime: string): string => {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMs = end.getTime() - start.getTime();
      
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffDays > 0) {
        return `${diffDays}d ${diffHours}h`;
      } else if (diffHours > 0) {
        return `${diffHours}h ${diffMinutes}m`;
      } else {
        return `${diffMinutes}m`;
      }
    } catch (error) {
      return '';
    }
  };

  // Build timeline events from case data
  const buildTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // 1. Case Assigned (always present)
    if (caseData.createdAt) {
      events.push({
        label: 'Case Assigned',
        timestamp: caseData.createdAt,
        icon: '📋',
        color: 'text-blue-400'
      });
    }

    // 2. Started Work (if case was moved to in progress)
    if (caseData.inProgressAt) {
      events.push({
        label: 'Started Work',
        timestamp: caseData.inProgressAt,
        icon: '🚀',
        color: 'text-yellow-400'
      });
    }

    // 3. Case Saved (if case was saved)
    if (caseData.savedAt) {
      events.push({
        label: 'Case Saved',
        timestamp: caseData.savedAt,
        icon: '💾',
        color: 'text-purple-400'
      });
    }

    // 4. Case Completed (if case is completed)
    if (caseData.completedAt) {
      events.push({
        label: 'Case Completed',
        timestamp: caseData.completedAt,
        icon: '✅',
        color: 'text-green-400'
      });
    }

    // Sort events by timestamp
    return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const timelineEvents = buildTimelineEvents();

  // Don't render if no events
  if (timelineEvents.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-700">
      <h4 className="text-sm font-semibold text-brand-primary mb-3 flex items-center gap-2">
        <span>📊</span>
        Case Timeline
      </h4>
      
      <div className="space-y-3">
        {timelineEvents.map((event, index) => {
          const isLast = index === timelineEvents.length - 1;
          const nextEvent = timelineEvents[index + 1];
          const duration = nextEvent ? calculateDuration(event.timestamp, nextEvent.timestamp) : null;
          
          return (
            <div key={`${event.label}-${event.timestamp}`} className="relative">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-4 top-8 w-0.5 h-6 bg-gray-600"></div>
              )}
              
              {/* Timeline event */}
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-sm border border-gray-600">
                  {event.icon}
                </div>
                
                {/* Event details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${event.color}`}>
                      {event.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  
                  {/* Duration to next event */}
                  {duration && (
                    <div className="mt-1 text-xs text-gray-500">
                      Duration: {duration}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Total case duration */}
      {timelineEvents.length >= 2 && (
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Total Duration:</span>
            <span className="text-brand-primary font-medium">
              {calculateDuration(timelineEvents[0].timestamp, timelineEvents[timelineEvents.length - 1].timestamp)}
            </span>
          </div>
        </div>
      )}
      
      {/* Case efficiency indicator */}
      {caseData.createdAt && caseData.completedAt && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Efficiency:</span>
            <span className={`font-medium ${getEfficiencyColor(caseData.createdAt, caseData.completedAt)}`}>
              {getEfficiencyLabel(caseData.createdAt, caseData.completedAt)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to determine efficiency color based on completion time
const getEfficiencyColor = (createdAt: string, completedAt: string): string => {
  try {
    const start = new Date(createdAt);
    const end = new Date(completedAt);
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    if (diffHours <= 24) return 'text-green-400'; // Excellent
    if (diffHours <= 72) return 'text-yellow-400'; // Good
    if (diffHours <= 168) return 'text-orange-400'; // Average
    return 'text-red-400'; // Needs improvement
  } catch (error) {
    return 'text-gray-400';
  }
};

// Helper function to get efficiency label
const getEfficiencyLabel = (createdAt: string, completedAt: string): string => {
  try {
    const start = new Date(createdAt);
    const end = new Date(completedAt);
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    if (diffHours <= 24) return 'Excellent';
    if (diffHours <= 72) return 'Good';
    if (diffHours <= 168) return 'Average';
    return 'Needs Improvement';
  } catch (error) {
    return 'Unknown';
  }
};

export default CaseTimeline;
