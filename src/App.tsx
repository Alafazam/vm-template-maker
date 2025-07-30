import React, { useState } from 'react';
import TemplateSelection from './components/TemplateSelection';
import PromptInput from './components/PromptInput';
import PdfPreview from './components/PdfPreview';
import StepIndicator from './components/StepIndicator';
import './styles/globals.css';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  
  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return (
    <div className="bg-[#1e1e2f] text-[#e0e0e0] min-h-screen">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="card mb-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Template Automation</h1>
          
          <StepIndicator currentStep={currentStep} />
          
          <div className="mt-8">
            {currentStep === 1 && (
              <TemplateSelection 
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
                onNext={goToNextStep}
              />
            )}
            
            {currentStep === 2 && (
              <PromptInput
                prompt={userPrompt}
                onPromptChange={setUserPrompt}
                onNext={goToNextStep}
                onBack={goToPreviousStep}
              />
            )}
            
            {currentStep === 3 && (
              <PdfPreview
                selectedTemplate={selectedTemplate}
                userPrompt={userPrompt}
                onBack={goToPreviousStep}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App; 