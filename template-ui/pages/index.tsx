import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import TemplateSelection from '../components/TemplateSelection';
import PromptInput from '../components/PromptInput';
import PdfPreview from '../components/PdfPreview';
import StepIndicator from '../components/StepIndicator';
import TemplateModification from '../components/TemplateModification';
import PdfPreviewModal from '../components/modal/PdfPreviewModal';
import PdfViewerModal from '../components/modal/PdfViewerModal';
import ErrorDetails from '../components/ErrorDetails';
import PdfServerStatus from '../components/PdfServerStatus';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateContent, setTemplateContent] = useState<string | null>(null);
  const [modifiedTemplateContent, setModifiedTemplateContent] = useState<string | null>(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [animationDirection, setAnimationDirection] = useState<'right' | 'left'>('right');
  const [isAnimating, setIsAnimating] = useState(false);
  const [generatePdfClicked, setGeneratePdfClicked] = useState(false);
  const [templateAnalysis, setTemplateAnalysis] = useState<any>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  
  // New state for PDF viewer modal
  const [pdfViewerModalOpen, setPdfViewerModalOpen] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfErrorDetails, setPdfErrorDetails] = useState<string | null>(null);
  
  // Function to clear localStorage
  const clearLocalStorage = () => {
    console.log('Clearing localStorage...');
    
    // Items to clear
    const localStorageKeys = [
      'selectedTemplate',
      'templateContent',
      'modifiedTemplateContent',
      'templateAnalysis',
      'currentPrompt'
    ];
    
    // Clear each item
    localStorageKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Also clear any state related to templates
    setSelectedTemplate(null);
    setTemplateContent(null);
    setModifiedTemplateContent(null);
    setTemplateAnalysis(null);
    setUserPrompt('');
    
    console.log('localStorage cleared successfully');
  };
  
  // Clear localStorage when component mounts - this happens on page load/refresh
  useEffect(() => {
    clearLocalStorage();
  }, []);
  
  // Watch for step changes - clear localStorage when returning to step 1
  useEffect(() => {
    if (currentStep === 1) {
      clearLocalStorage();
    }
  }, [currentStep]);
  
  // Fetch template content when selectedTemplate changes
  useEffect(() => {
    // Only fetch if we have a selected template
    if (selectedTemplate) {
      fetchTemplateContent(selectedTemplate);
    }
  }, [selectedTemplate]);
  
  // Function to fetch template content from API
  const fetchTemplateContent = async (templateName: string) => {
    try {
      setTemplateLoading(true);
      setTemplateError(null);
      
      console.log(`Fetching content for template: ${templateName}`);
      const response = await axios.get(`/api/template-content?templateName=${templateName}`);
      
      console.log('Template content received');
      
      // Extract content from response
      const templateContent = response.data.content;
      
      // Store content both in state and localStorage
      setTemplateContent(templateContent);
      setModifiedTemplateContent(null); // Reset modified content when template changes
      localStorage.setItem('templateContent', templateContent);
      localStorage.setItem('selectedTemplate', templateName);
      
    } catch (error: any) {
      console.error('Error fetching template content:', error);
      setTemplateError('Failed to load template content. Please try again.');
    } finally {
      setTemplateLoading(false);
    }
  };
  
  const goToNextStep = () => {
    if (currentStep < 2 && !isAnimating) {
      setAnimationDirection('right');
      setIsAnimating(true);
      
      // Short delay to allow animation
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 300);
      
      // Reset animation state
      setTimeout(() => {
        setIsAnimating(false);
      }, 600);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 1 && !isAnimating) {
      setAnimationDirection('left');
      setIsAnimating(true);
      
      // Short delay to allow animation
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
      }, 300);
      
      // Reset animation state
      setTimeout(() => {
        setIsAnimating(false);
      }, 600);
    }
  };
  
  // Generate animation classes based on direction and state
  const getAnimationClass = () => {
    if (isAnimating) {
      return animationDirection === 'right' 
        ? 'animate-exit-left opacity-0 transform -translate-x-10'
        : 'animate-exit-right opacity-0 transform translate-x-10';
    }
    
    return animationDirection === 'right'
      ? 'animate-slide-in-right'
      : 'animate-slide-in-left';
  };

  // Function to generate PDF - simply set the flag to true
  const handleGeneratePdf = () => {
    console.log('Generate PDF button clicked');
    console.log('AI Prompt:', userPrompt);
    
    // Update the template content in localStorage with the newest prompt
    if (selectedTemplate) {
      localStorage.setItem('currentPrompt', userPrompt);
    }
    
    setGeneratePdfClicked(true);
  };
  
  // Handler for when PDF generation is complete
  const handlePdfGenerationComplete = () => {
    console.log('PDF generation complete, resetting flag');
    setGeneratePdfClicked(false);
  };
  
  // Handle template selection with error handling
  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
  };

  // Handle template modification completion
  const handleModificationComplete = (modifiedTemplate: string, analysis: any) => {
    console.log('Template modification complete with new analysis:', analysis);
    
    // Update state
    setModifiedTemplateContent(modifiedTemplate);
    setTemplateAnalysis(analysis);
    
    // Store all info in localStorage
    localStorage.setItem('modifiedTemplateContent', modifiedTemplate);
    localStorage.setItem('templateAnalysis', JSON.stringify(analysis));
    
    // Clear the prompt to indicate this prompt has been applied
    setUserPrompt('');
  };
  
  // Function to get template content from localStorage (handles chunked storage)
  const getStoredTemplate = (key: string): string | null => {
    try {
      // Just get the template directly from localStorage
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Error retrieving template from storage:', e);
      return null;
    }
  };
  
  // Function to handle template download
  const handleTemplateDownload = () => {
    // Get the modified template from localStorage
    const templateContent = localStorage.getItem('modifiedTemplateContent');
    if (templateContent) {
      // Create a blob and download link
      const blob = new Blob([templateContent], { type: 'text/xml' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Remove any existing .fo.vm extension from the selectedTemplate before appending it
      const templateName = selectedTemplate ? selectedTemplate.replace(/\.fo\.vm$/, '') : 'template';
      link.download = `modified_${templateName}.fo.vm`;
      
      console.log('Downloading template with filename:', link.download);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } else {
      console.error('No template content found for download');
    }
  };
  
  // Function to generate PDF directly from modified template
  const generatePdfFromModifiedTemplate = async (retryCount = 0) => {
    if (!modifiedTemplateContent) {
      console.error('No modified template content available');
      setPdfError('No template content available. Please modify the template first.');
      return;
    }
    
    const maxRetries = 2;
    const templateType = 'invoice'; // Default template type
    const backendUrl = `http://localhost:8890/velocity-engine-app/api/render-pdf/sample/${templateType}`;
    
    console.log('---------- PDF GENERATION DEBUG INFO ----------');
    console.log('Backend URL:', backendUrl);
    console.log('Template type:', templateType);
    console.log('Modified template size:', modifiedTemplateContent.length, 'bytes');
    
    try {
      setPdfLoading(true);
      setPdfError(null);
      setPdfErrorDetails(null);
      console.log('Generating PDF from modified template, attempt:', retryCount + 1);
      
      // Create a file object from the template content
      const templateFile = new Blob([modifiedTemplateContent], { type: 'text/xml' });
      console.log('Template file created, size:', templateFile.size, 'bytes');
      
      // Create FormData and append the file
      const formData = new FormData();
      formData.append('file', templateFile, 'template.fo.vm');
      console.log('FormData created with file named "template.fo.vm"');
      
      // Directly call backend endpoint
      console.log('Making direct API call to backend service:', backendUrl);
      
      // Make API request directly to the backend service
      const response = await axios.post(
        backendUrl,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          responseType: 'text', // Change to text to handle base64 response
          // Add timeout to avoid hanging requests
          timeout: 30000
        }
      );
      
      console.log('---------- RESPONSE DEBUG INFO ----------');
      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', response.headers);
      console.log('Response content type:', response.headers['content-type']);
      console.log('Response data type:', typeof response.data);
      console.log('Response data length:', response.data ? response.data.length : 0);
      
      if (typeof response.data === 'string') {
        // Log the first part of the response
        const previewLength = Math.min(200, response.data.length);
        console.log(`Response data preview (first ${previewLength} chars):`, response.data.substring(0, previewLength));
        
        // Check if it looks like base64
        const isBase64Like = /^[A-Za-z0-9+/=]+$/.test(response.data.substring(0, 100).trim());
        console.log('Response data looks like valid base64:', isBase64Like);
        
        // Check for PDF header in base64
        console.log('Starts with PDF header in base64 (JVBERi):', response.data.startsWith('JVBERi'));
      }
      console.log('---------- END RESPONSE DEBUG INFO ----------');
      
      // DIRECT HANDLING: Always try to process as base64 first, regardless of content type
      if (typeof response.data === 'string' && response.data.trim()) {
        try {
          console.log('MAIN APPROACH: Attempting to process response as base64 encoded PDF');
          const pdfData = Buffer.from(response.data, 'base64');
          const responseBlob = new Blob([pdfData], { type: 'application/pdf' });
          console.log('Converted base64 to PDF, blob size:', responseBlob.size, 'bytes');
          
          // Set the PDF blob and open the viewer
          setPdfBlob(responseBlob);
          setPdfViewerModalOpen(true);
          return; // Exit early if successful
        } catch (e) {
          console.error('Failed to process as base64, falling back to content-type based handling:', e);
          // Continue to the content-type based handling below
        }
      }
      
      // FALLBACK: Process the response based on content-type
      if (response.headers['content-type'] && response.headers['content-type'].includes('text/plain')) {
        // Backend returns base64 encoded PDF as text/plain
        console.log('Received text/plain response, checking if it is base64 encoded PDF');
        const textData = response.data;
        console.log('Text response starts with:', textData.substring(0, 50));
        
        if (textData && textData.trim()) {
          try {
            // Check if it starts with JVBERi which is %PDF in base64
            if (textData.startsWith('JVBERi')) {
              console.log('Detected base64 encoded PDF starting with JVBERi');
              // Convert base64 to binary PDF
              console.log('Converting base64 to binary PDF');
              const pdfData = Buffer.from(textData, 'base64');
              const responseBlob = new Blob([pdfData], { type: 'application/pdf' });
              console.log('Converted base64 to PDF, blob size:', responseBlob.size, 'bytes');
              
              // Set the PDF blob and open the viewer
              setPdfBlob(responseBlob);
              setPdfViewerModalOpen(true);
            } else {
              // Assume it's still a base64 PDF even if it doesn't start with the exact header
              console.log('Attempting to convert response as base64 even though it does not start with JVBERi');
              const pdfData = Buffer.from(textData, 'base64');
              const responseBlob = new Blob([pdfData], { type: 'application/pdf' });
              console.log('Force-converted to PDF, blob size:', responseBlob.size, 'bytes');
              
              setPdfBlob(responseBlob);
              setPdfViewerModalOpen(true);
            }
          } catch (e) {
            console.error('Error converting base64 to PDF:', e);
            setPdfError('Unable to convert the server response to a PDF. The response may not be valid base64 data.');
            setPdfErrorDetails(textData.substring(0, 500) + (textData.length > 500 ? '...' : ''));
          }
        } else {
          console.error('Received empty text response');
          setPdfError('Server returned an empty response. Please try again.');
        }
      } else if (!response.headers['content-type'] || response.headers['content-type'] === 'application/json') {
        // Try to treat the response as a base64 encoded PDF regardless of content type
        console.log('Received response with content type:', response.headers['content-type']);
        console.log('Attempting to treat as base64 data anyway...');
        
        try {
          if (typeof response.data === 'string' && response.data.trim()) {
            console.log('Response data appears to be string, trying to convert from base64');
            const pdfData = Buffer.from(response.data, 'base64');
            const responseBlob = new Blob([pdfData], { type: 'application/pdf' });
            console.log('Force-converted to PDF, blob size:', responseBlob.size, 'bytes');
            
            setPdfBlob(responseBlob);
            setPdfViewerModalOpen(true);
          } else {
            throw new Error('Response data is not a string or is empty');
          }
        } catch (e) {
          console.error('Error treating response as base64:', e);
          setPdfError('Failed to interpret server response as PDF data.');
          setPdfErrorDetails('Content type: ' + (response.headers['content-type'] || 'none') + 
                            ', Data type: ' + typeof response.data +
                            ', Data preview: ' + 
                            (typeof response.data === 'string' ? response.data.substring(0, 100) : 'not a string'));
        }
      } else if (response.headers['content-type'] && response.headers['content-type'].includes('application/pdf')) {
        // Direct binary PDF response
        console.log('Received binary PDF response');
        const responseBlob = new Blob([response.data], { type: 'application/pdf' });
        console.log('PDF blob created, size:', responseBlob.size, 'bytes');
        setPdfBlob(responseBlob);
        setPdfViewerModalOpen(true);
      } else {
        // Unknown or unexpected response type
        console.error('Unexpected response type:', response.headers['content-type']);
        setPdfError('Server returned an unexpected response type. Expected PDF or base64 text.');
        
        if (response.data) {
          try {
            if (typeof response.data === 'string') {
              // Last ditch attempt - try as base64 anyway
              try {
                console.log('Last attempt to convert as base64');
                const pdfData = Buffer.from(response.data, 'base64');
                const responseBlob = new Blob([pdfData], { type: 'application/pdf' });
                console.log('Last-ditch conversion to PDF, blob size:', responseBlob.size, 'bytes');
                
                setPdfBlob(responseBlob);
                setPdfViewerModalOpen(true);
                return; // Exit early if successful
              } catch (lastError) {
                console.error('Final base64 conversion failed:', lastError);
              }
              
              setPdfErrorDetails(response.data.substring(0, 500) + (response.data.length > 500 ? '...' : ''));
            } else {
              setPdfErrorDetails(JSON.stringify(response.data));
            }
          } catch (e) {
            console.error('Error parsing response data:', e);
            setPdfErrorDetails('Could not parse response data');
          }
        }
      }
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      console.log('Error details:', error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: typeof error.response.data === 'string' ? error.response.data.substring(0, 100) : 'non-string data'
      } : error.message || 'Unknown error');
      
      // Try to directly handle the error response as base64 PDF if possible
      if (error.response && error.response.data && typeof error.response.data === 'string') {
        try {
          console.log('Attempting to process error response as base64 PDF:', error.response.data.substring(0, 50));
          const pdfData = Buffer.from(error.response.data, 'base64');
          const responseBlob = new Blob([pdfData], { type: 'application/pdf' });
          console.log('Converted error response to PDF, blob size:', responseBlob.size, 'bytes');
          
          setPdfBlob(responseBlob);
          setPdfViewerModalOpen(true);
          
          // Exit early since we've handled it
          setPdfLoading(false);
          return;
        } catch (conversionError) {
          console.error('Failed to process error response as base64:', conversionError);
          // Continue with normal error handling
        }
      }
      
      // Handle axios errors
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.code === 'ECONNABORTED') {
          setPdfError('Request timed out. The PDF server may be busy or not responding.');
        } else if (axiosError.response) {
          // Server responded with an error
          const status = axiosError.response.status;
          
          if (status === 500) {
            setPdfError('Internal server error. The PDF generation service encountered a problem.');
          } else if (status === 503) {
            setPdfError('The PDF generation service is currently unavailable. Please make sure the external server is running at localhost:8890.');
          } else {
            setPdfError(`Server error: ${status}. Please try again later.`);
          }
          
          // Try to extract detailed error message from response
          if (axiosError.response.data) {
            try {
              // If it's a string, use it directly
              if (typeof axiosError.response.data === 'string') {
                setPdfErrorDetails(axiosError.response.data.substring(0, 500));
              } else if (axiosError.response.data instanceof ArrayBuffer) {
                const decoder = new TextDecoder('utf-8');
                const text = decoder.decode(axiosError.response.data);
                console.log('Error response text:', text);
                try {
                  const errorObj = JSON.parse(text);
                  setPdfErrorDetails(errorObj.details || errorObj.error || text);
                } catch (jsonError) {
                  setPdfErrorDetails(text);
                }
              } else {
                setPdfErrorDetails(JSON.stringify(axiosError.response.data));
              }
            } catch (parseError) {
              console.error('Error parsing error details:', parseError);
            }
          }
        } else if (axiosError.request) {
          // No response received
          setPdfError('No response received from server. Please check your connection and try again.');
        } else {
          setPdfError(axiosError.message || 'An unknown error occurred');
        }
      } else {
        // Generic error handler
        setPdfError(error.message || 'An unknown error occurred during PDF generation');
      }
      
      // Retry logic for certain errors
      if (retryCount < maxRetries && !axios.isAxiosError(error)) {
        console.log(`Retrying PDF generation (${retryCount + 1}/${maxRetries})...`);
        setTimeout(() => {
          generatePdfFromModifiedTemplate(retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
        return;
      }
    } finally {
      console.log('---------- END PDF GENERATION DEBUG INFO ----------');
      if (retryCount === 0) { // Only update loading state if not in a retry
        setPdfLoading(false);
      }
    }
  };
  
  // Handle opening preview modal
  const openPreviewModal = () => {
    setGeneratePdfClicked(true);
    setPreviewModalOpen(true);
  };

  // Handle closing preview modal
  const closePreviewModal = () => {
    setPreviewModalOpen(false);
    setGeneratePdfClicked(false);
  };
  
  // Handle closing PDF viewer modal
  const closePdfViewerModal = () => {
    setPdfViewerModalOpen(false);
  };
  
  return (
    <>
      <header className="bg-gray-900 bg-opacity-70 backdrop-filter backdrop-blur-md border-b border-gray-800 border-opacity-70 py-2 sticky top-0 z-50">
        <div className="container-content flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-500">
              Template Automation
            </div>
          </div>
          <PdfServerStatus />
        </div>
      </header>
      
      <main className="container-content py-8">
        <div className="card relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 bg-opacity-10 to-indigo-600 opacity-5 pointer-events-none"></div>
          
          <h1 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-500 relative z-10">Smart Template Generator</h1>
          
          <StepIndicator currentStep={currentStep} totalSteps={2} />
          
          <div className={`mt-6 relative transition-all duration-300 ${getAnimationClass()}`}>
            {currentStep === 1 && (
              <TemplateSelection 
                selectedTemplate={selectedTemplate}
                onSelectTemplate={handleTemplateSelect}
                onNext={goToNextStep}
              />
            )}
            
            {currentStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Customize Template</h2>
                  <div className="mb-6 p-4 rounded-lg border border-gray-800 bg-gray-900 bg-opacity-40">
                    <div className="flex items-center mb-3">
                      <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-medium">Selected Template:</span>
                      <span className="ml-2 text-blue-400">{selectedTemplate}</span>
                    </div>
                    
                    {templateLoading && (
                      <div className="text-sm text-blue-400 flex items-center mt-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                        Loading template content...
                      </div>
                    )}
                    
                    {templateError && (
                      <div className="text-sm text-red-400 mt-2">
                        {templateError}
                      </div>
                    )}
                    
                    <button 
                      onClick={goToPreviousStep}
                      className="text-sm flex items-center text-gray-400 hover:text-white transition-colors mt-2"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Change template
                    </button>
                  </div>
                  
                  <PromptInput
                    prompt={userPrompt}
                    onPromptChange={setUserPrompt}
                    showButtons={false}
                  />

                  <div className="mt-4">
                    <TemplateModification 
                      templateContent={templateContent}
                      prompt={userPrompt}
                      onModificationComplete={handleModificationComplete}
                    />
                  </div>

                  {modifiedTemplateContent && (
                    <div className="mt-4 p-4 rounded-lg border border-blue-800 bg-blue-900 bg-opacity-20">
                      <button
                        onClick={handleTemplateDownload}
                        className="w-full inline-flex items-center justify-center px-3 py-2 border border-blue-800 text-xs font-medium rounded-md shadow-sm text-blue-400 bg-transparent hover:bg-blue-800 hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Modified Template
                      </button>
                    </div>
                  )}

                  <div className="mt-6">
                    <button
                      onClick={() => generatePdfFromModifiedTemplate(0)}
                      disabled={!modifiedTemplateContent || pdfLoading}
                      className={`w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        !modifiedTemplateContent || pdfLoading
                          ? 'bg-green-600 opacity-50 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                      }`}
                    >
                      {pdfLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Generating PDF...
                        </>
                      ) : (
                        'Generate PDF from Modified Template'
                      )}
                    </button>
                    
                    {pdfError && (
                      <ErrorDetails message={pdfError} details={pdfErrorDetails || undefined} />
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <button
                      onClick={openPreviewModal}
                      disabled={!modifiedTemplateContent}
                      className={`w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        !modifiedTemplateContent
                          ? 'bg-blue-600 opacity-50 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview Template
                    </button>
                  </div>
                </div>
                
                {/* Generation Details */}
                <div>
                  {true && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Generation Details</h2>
                      <div className="bg-gray-900 bg-opacity-90 p-4 rounded-lg border border-gray-800">
                        <div className="text-white">
                          <div className="flex mb-1">
                            <span className="font-medium mr-2">Template:</span>
                            <span className="text-blue-400">{selectedTemplate}</span>
                          </div>
                          {true && (
                            <div>
                              <div className="font-medium mb-1">Prompt:</div>
                              <div className="bg-gray-800 bg-opacity-50 p-2 rounded text-gray-300 max-h-[80px] overflow-y-auto text-sm">
                                {userPrompt}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Use the PdfPreviewModal component */}
      <PdfPreviewModal
        isOpen={previewModalOpen}
        onClose={closePreviewModal}
        selectedTemplate={selectedTemplate}
        userPrompt={userPrompt}
        templateContent={modifiedTemplateContent || templateContent}
        generatePdf={generatePdfClicked}
        onGenerateComplete={handlePdfGenerationComplete}
      />
      
      {/* Use the new PdfViewerModal component for viewing generated PDFs */}
      <PdfViewerModal
        isOpen={pdfViewerModalOpen}
        onClose={closePdfViewerModal}
        pdfData={pdfBlob}
        title="Generated PDF Document"
        isLoading={pdfLoading}
        error={pdfError}
      />
    </>
  );
} 