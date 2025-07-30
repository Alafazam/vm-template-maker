import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;
        
        return (
          <div key={stepNumber} className="flex flex-1 items-center">
            {/* Step bubble */}
            <div 
              className={`relative flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-700 text-gray-400'
              }`}
            >
              {isCompleted ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                stepNumber
              )}
            </div>
            
            {/* Step label */}
            <div className="ml-3">
              <p 
                className={`text-sm font-medium ${
                  isActive 
                    ? 'text-white' 
                    : isCompleted 
                      ? 'text-green-400' 
                      : 'text-gray-400'
                }`}
              >
                {stepNumber === 1 ? 'Select Template' : 'Customize & Preview'}
              </p>
            </div>
            
            {/* Connector line */}
            {stepNumber < totalSteps && (
              <div className="flex-1 mx-4">
                <div 
                  className={`h-0.5 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-700'
                  }`}
                ></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator; 