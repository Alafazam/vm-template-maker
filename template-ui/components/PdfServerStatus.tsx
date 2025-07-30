import React, { useState, useEffect } from 'react';
import axios from 'axios';

type ServiceStatus = 'checking' | 'connected' | 'disconnected';

const PdfServerStatus: React.FC = () => {
  const [status, setStatus] = useState<ServiceStatus>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkServerStatus = async () => {
    setStatus('checking');
    try {
      const response = await axios.get('/api/health-check');
      if (response.data.services.pdfServer) {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      console.error('Error checking PDF server status:', error);
      setStatus('disconnected');
    } finally {
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    // Check status on component mount
    checkServerStatus();
    
    // Set up periodic checks every 30 seconds
    const intervalId = setInterval(checkServerStatus, 30000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className="text-xs text-gray-400">PDF Server:</div>
      <div className="flex items-center">
        <div 
          className={`w-2 h-2 rounded-full mr-1 ${
            status === 'checking' 
              ? 'bg-yellow-400 animate-pulse' 
              : status === 'connected' 
                ? 'bg-green-500' 
                : 'bg-red-500'
          }`}
        />
        <span className="text-xs font-medium">
          {status === 'checking' 
            ? 'Checking...' 
            : status === 'connected' 
              ? 'Connected' 
              : 'Disconnected'
          }
        </span>
      </div>
      {lastChecked && (
        <button 
          onClick={checkServerStatus}
          title={`Last checked: ${lastChecked.toLocaleTimeString()}`}
          className="text-xs text-blue-400 hover:text-blue-300 ml-2"
        >
          Refresh
        </button>
      )}
    </div>
  );
};

export default PdfServerStatus; 