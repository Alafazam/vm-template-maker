import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { id: 1, name: 'Select Template' },
    { id: 2, name: 'Enter Prompt' },
    { id: 3, name: 'Preview PDF' },
  ];

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {/* Step circle */}
          <div className="flex flex-col items-center">
            <div 
              className={`
                flex items-center justify-center w-10 h-10 rounded-full
                ${currentStep >= step.id 
                  ? 'bg-[#3b82f6] text-white' 
                  : 'bg-[#374151] text-[#a0a0a0]'
                }
              `}
            >
              {step.id}
            </div>
            <span className={`mt-2 text-sm ${currentStep >= step.id ? 'text-[#e0e0e0]' : 'text-[#a0a0a0]'}`}>
              {step.name}
            </span>
          </div>

          {/* Connector line between steps */}
          {index < steps.length - 1 && (
            <div 
              className={`h-1 w-full max-w-[100px] mx-2 rounded
                ${currentStep > step.id ? 'bg-[#3b82f6]' : 'bg-[#374151]'}
              `}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator; 