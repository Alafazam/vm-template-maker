import React, { useState } from 'react';
import axios from 'axios';

interface ErrorDetailsProps {
  message: string;
  details?: string;
}

const ErrorDetails: React.FC<ErrorDetailsProps> = ({ message, details }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unchecked' | 'success' | 'failed'>('unchecked');
  
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };
  
  const checkConnection = async () => {
    setCheckingConnection(true);
    try {
      await axios.head('http://localhost:8890/velocity-engine-app');
      setConnectionStatus('success');
    } catch (error) {
      setConnectionStatus('failed');
    } finally {
      setCheckingConnection(false);
    }
  };
  
  return (
    <div className="mt-3 p-3 border border-red-300 bg-red-900 bg-opacity-20 rounded-md text-red-400 text-sm">
      <div className="flex items-start">
        <svg className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <p>{message}</p>
          
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {details && (
              <button 
                onClick={toggleDetails}
                className="text-xs text-red-300 hover:text-red-200 underline flex items-center"
              >
                <span>{showDetails ? 'Hide' : 'Show'} technical details</span>
                <svg 
                  className={`w-3 h-3 ml-1 transition-transform ${showDetails ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
            
            <button
              onClick={checkConnection}
              disabled={checkingConnection}
              className="text-xs text-red-300 hover:text-red-200 underline flex items-center"
            >
              {checkingConnection ? (
                <>
                  <div className="animate-spin h-3 w-3 border-t-2 border-b-2 border-red-300 rounded-full mr-1"></div>
                  <span>Checking connection...</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <span>Check external server</span>
                </>
              )}
            </button>
            
            {connectionStatus !== 'unchecked' && (
              <span className={`text-xs ${connectionStatus === 'success' ? 'text-green-400' : 'text-red-300'}`}>
                {connectionStatus === 'success' 
                  ? 'External server is running!' 
                  : 'External server is not running (port 8890)'}
              </span>
            )}
          </div>
          
          {showDetails && details && (
            <div className="mt-2 p-2 bg-red-950 bg-opacity-30 rounded border border-red-800 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
              {details}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDetails; 