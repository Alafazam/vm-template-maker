import React, { useState, useEffect, useRef } from 'react';

const PdfPreview = ({
  selectedTemplate,
  userPrompt,
  onBack,
  generatePdf = false,
  onGenerateComplete
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const prevGeneratePdfRef = useRef(generatePdf);

  // In a real app, this would make an API call to generate the PDF
  useEffect(() => {
    // Only generate if generatePdf changed from false to true
    if (generatePdf && !prevGeneratePdfRef.current && userPrompt.trim()) {
      console.log('Generating PDF based on button click');
      // Simulate API call
      setIsLoading(true);
      setError(null);
      
      const timer = setTimeout(() => {
        // In a real app, we would set the actual URL from the API response
        // For now, just simulate success
        setIsLoading(false);
        setPreviewUrl('/mock-pdf-preview.png');
        
        // Notify parent that generation is complete
        if (onGenerateComplete) {
          onGenerateComplete();
        }
        
        // Uncomment to simulate an error
        // setIsLoading(false);
        // setError('Failed to generate PDF. Please try again.');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    // Update the ref for the next render
    prevGeneratePdfRef.current = generatePdf;
  }, [generatePdf, userPrompt, onGenerateComplete]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">PDF Preview</h2>
      
      <div className="mb-6">
        <div className="bg-gray-900 rounded-xl p-4 mb-4">
          <h3 className="text-lg font-medium mb-2">Generation Details</h3>
          <p><span className="text-gray-400">Template:</span> {selectedTemplate}</p>
          <p className="mt-2">
            <span className="text-gray-400">Prompt:</span>
            <span className="ml-2 text-sm block mt-1 bg-black p-2 rounded border border-gray-600">
              {userPrompt}
            </span>
          </p>
        </div>
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-900 rounded-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4">Generating PDF preview...</p>
          </div>
        )}
        
        {!isLoading && error && (
          <div className="bg-red-900 bg-opacity-30 text-red-400 p-4 rounded-xl">
            <p>{error}</p>
            <button 
              className="mt-4 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm"
              onClick={() => {
                setIsLoading(true);
                setError(null);
                // In a real app, we would retry the API call
                setTimeout(() => {
                  setIsLoading(false);
                  setPreviewUrl('/mock-pdf-preview.png');
                }, 2000);
              }}
            >
              Retry
            </button>
          </div>
        )}
        
        {!isLoading && !error && previewUrl && (
          <div className="flex flex-col items-center">
            <div className="bg-gray-900 rounded-xl p-4 w-full max-w-3xl mx-auto">
              {/* In a real app, this would display the actual PDF preview */}
              <div className="bg-white rounded-lg flex items-center justify-center h-96">
                <p className="text-black">PDF Preview Would Appear Here</p>
              </div>
            </div>
            
            <div className="mt-6 flex gap-4">
              <button className="btn-secondary px-6">
                Download PDF
              </button>
              <button className="btn-primary px-6">
                Save PDF
              </button>
            </div>
          </div>
        )}
      </div>
      
      
    </div>
  );
};

export default PdfPreview; 