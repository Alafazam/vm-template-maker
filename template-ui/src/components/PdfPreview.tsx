import React, { useState, useEffect } from 'react';

interface PdfPreviewProps {
  selectedTemplate: string | null;
  userPrompt: string;
  onBack: () => void;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({
  selectedTemplate,
  userPrompt,
  onBack,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // In a real app, this would make an API call to generate the PDF
  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setError(null);
    
    const timer = setTimeout(() => {
      // In a real app, we would set the actual URL from the API response
      // For now, just simulate success
      setIsLoading(false);
      setPreviewUrl('/mock-pdf-preview.png');
      
      // Uncomment to simulate an error
      // setIsLoading(false);
      // setError('Failed to generate PDF. Please try again.');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [selectedTemplate, userPrompt]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">PDF Preview</h2>
      
      <div className="mb-6">
        <div className="bg-[#252538] rounded-xl p-4 mb-4">
          <h3 className="text-lg font-medium mb-2">Generation Details</h3>
          <p><span className="text-[#a0a0a0]">Template:</span> {selectedTemplate}</p>
          <p className="mt-2">
            <span className="text-[#a0a0a0]">Prompt:</span>
            <span className="ml-2 text-sm block mt-1 bg-[#1e1e2f] p-2 rounded border border-[#4b5563]">
              {userPrompt}
            </span>
          </p>
        </div>
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 bg-[#252538] rounded-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3b82f6]"></div>
            <p className="mt-4">Generating PDF preview...</p>
          </div>
        )}
        
        {!isLoading && error && (
          <div className="bg-[#321e1e] text-[#f87171] p-4 rounded-xl">
            <p>{error}</p>
            <button 
              className="mt-4 px-3 py-1 bg-[#2c2c3e] hover:bg-[#3c3c4e] rounded-lg text-[#e0e0e0] text-sm"
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
            <div className="bg-[#252538] rounded-xl p-4 w-full max-w-3xl mx-auto">
              {/* In a real app, this would display the actual PDF preview */}
              <div className="aspect-[8.5/11] bg-white rounded-lg flex items-center justify-center">
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