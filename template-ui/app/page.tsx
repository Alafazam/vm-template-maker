'use client';

import React, { useState, useEffect } from 'react';
import TemplateSelection from '../components/TemplateSelection';
import PromptInput from '../components/PromptInput';
import PdfPreview from '../components/PdfPreview';
import StepIndicator from '../components/StepIndicator';
import TemplateModification from '../components/TemplateModification';
import TemplateFileUpload from '../components/TemplateFileUpload';
import FileDownload from '../components/FileDownload';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [modifiedFile, setModifiedFile] = useState<File | null>(null);
  
  // Try to restore state from local storage on component mount
  useEffect(() => {
    // Restore selected template
    const storedTemplate = localStorage.getItem('selectedTemplate');
    if (storedTemplate) {
      setSelectedTemplate(storedTemplate);
    }
    
    // Template file can't be stored directly, but if a modified file exists, use that
    const modifiedTemplateUrl = localStorage.getItem('modifiedTemplateUrl');
    const modifiedTemplateName = localStorage.getItem('modifiedTemplateName');
    if (modifiedTemplateUrl && modifiedTemplateName) {
      // We can't recreate the exact File object, but knowing it exists can be helpful
      console.log('A modified template exists in storage:', modifiedTemplateName);
    }
  }, []);
  
  // Debug logging to check values
  useEffect(() => {
    console.log("Current state:", {
      currentStep,
      selectedTemplate,
      templateFile: templateFile?.name || 'No file selected',
      promptLength: userPrompt.length
    });
  }, [currentStep, selectedTemplate, templateFile, userPrompt]);
  
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
  
  const handleModificationComplete = (modifiedFile: File, analysis: any) => {
    setModifiedFile(modifiedFile);
    console.log('Template modified. Tokens used:', analysis);
    goToNextStep();
  };
  
  const handleFileSelected = (file: File) => {
    console.log('Template file selected:', file.name);
    setTemplateFile(file);
    
    // When selecting a template, also store the selected template name
    if (selectedTemplate) {
      localStorage.setItem('selectedTemplate', selectedTemplate);
    }
  };
  
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="card mb-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Template Automation</h1>
        
        <StepIndicator currentStep={currentStep} totalSteps={3} />
        
        <div className="mt-8">
          {currentStep === 1 && (
            <div>
              <TemplateSelection 
                selectedTemplate={selectedTemplate}
                onSelectTemplate={(template) => {
                  console.log('Template selected:', template);
                  setSelectedTemplate(template);
                }}
                onNext={() => {
                  if (selectedTemplate && templateFile) {
                    goToNextStep();
                  } else {
                    alert("Please select both a template and upload a template file.");
                  }
                }}
              />
              
              <div className="mt-8">
                <TemplateFileUpload onFileSelected={handleFileSelected} />
              </div>
              
              <div className="flex justify-end mt-8">
                <button
                  onClick={() => {
                    if (selectedTemplate && templateFile) {
                      goToNextStep();
                    } else {
                      alert("Please select both a template and upload a template file.");
                    }
                  }}
                  disabled={!selectedTemplate || !templateFile}
                  className={`px-4 py-2 rounded-md text-white ${
                    !selectedTemplate || !templateFile 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div>
              <div className="mb-4 text-sm text-gray-300 flex items-center">
                <span className="font-medium mr-2">Template File:</span> 
                {templateFile ? (
                  <span className="text-green-400 flex items-center">
                    <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {templateFile.name}
                  </span>
                ) : (
                  <span className="text-red-400">No file selected! Please go back and select a file.</span>
                )}
              </div>
              
              <PromptInput
                prompt={userPrompt}
                onPromptChange={setUserPrompt}
                showButtons={false}
              />
              
              <div className="mt-6">
                <TemplateModification
                  templateFile={templateFile}
                  prompt={userPrompt}
                  onModificationComplete={handleModificationComplete}
                />
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  onClick={goToPreviousStep}
                  className="px-4 py-2 border border-gray-700 rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700"
                >
                  Back
                </button>
              </div>
            </div>
          )}
          
          {currentStep === 3 && (
            <div>
              <PdfPreview
                selectedTemplate={selectedTemplate}
                userPrompt={userPrompt}
                templateFile={modifiedFile}
                onBack={goToPreviousStep}
              />
              
              {modifiedFile && (
                <div className="mt-6">
                  <FileDownload 
                    file={modifiedFile} 
                    buttonText="Download Modified Template"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 