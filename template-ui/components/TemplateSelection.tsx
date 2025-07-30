import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface TemplateSelectionProps {
  selectedTemplate: string | null;
  onSelectTemplate: (template: string) => void;
  onNext: () => void;
}

const TemplateSelection: React.FC<TemplateSelectionProps> = ({
  selectedTemplate,
  onSelectTemplate,
  onNext
}) => {
  const [templates, setTemplates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [renderingPdf, setRenderingPdf] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    // Cleanup PDF URL when component unmounts
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/templates');
      
      // Handle the templates response based on its structure
      console.log('Templates API response:', response.data);
      
      // Extract the template names from the response
      // Assuming the API returns the templates in some format
      // Adjust this based on the actual response format
      let templateNames = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.templates || []);
      
      // Rearrange templates to put standard_invoice.fo.vm first
      templateNames = templateNames.sort((a: string, b: string) => {
        // If either is standard_invoice.fo.vm, handle special case
        if (a === 'standard_invoice.fo.vm') return -1;
        if (b === 'standard_invoice.fo.vm') return 1;
        // Otherwise, normal alphabetical sort
        return a.localeCompare(b);
      });
      
      setTemplates(templateNames);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to fetch templates. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (template: string) => {
    onSelectTemplate(template);
  };
  
  const handlePreviewPdf = async () => {
    if (!selectedTemplate) return;
    
    try {
      setRenderingPdf(true);
      
      console.log('Requesting PDF preview for template:', selectedTemplate);
      
      // Render the PDF using the direct template endpoint
      const response = await axios.post(
        '/api/render',
        {
          templateName: selectedTemplate
        },
        {
          responseType: 'arraybuffer'  // Important: Get binary data directly
        }
      );
      
      console.log('PDF response received, creating blob...');
      
      // Create a blob URL for the PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      console.log('PDF blob URL created:', url);
      
      // Set the PDF URL and show modal
      setPdfUrl(url);
      setShowPdfModal(true);
    } catch (error: any) {
      console.error('Error rendering PDF:', error);
      // Try to get more detailed error information if available
      let errorMessage = 'Failed to render PDF. Please try again later.';
      if (error.response?.data) {
        try {
          // If the error response is JSON
          const blob = new Blob([error.response.data]);
          const text = await blob.text();
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
      }
      setError(errorMessage);
    } finally {
      setRenderingPdf(false);
    }
  };

  const closePdfModal = () => {
    setShowPdfModal(false);
  };

  const filteredTemplates = templates.filter(template => 
    template.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Select a Template</h2>
        
        <div className="flex space-x-3">
          {selectedTemplate && (
            <button
              onClick={handlePreviewPdf}
              className="px-6 py-2 rounded-md text-white font-medium bg-gray-700 hover:bg-gray-600 transition-all duration-200 flex items-center"
              disabled={renderingPdf}
            >
              {renderingPdf ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview Sample PDF
                </>
              )}
            </button>
          )}
          
          <button
            onClick={onNext}
            disabled={!selectedTemplate}
            className={`px-6 py-2 rounded-md text-white font-medium transition-all duration-200 flex items-center ${
              selectedTemplate
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-700 cursor-not-allowed'
            }`}
          >
            Next
            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="search"
          className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900 bg-opacity-30 p-4 rounded-lg border border-red-700 text-red-300">
          <p>{error}</p>
          <button 
            onClick={fetchTemplates}
            className="mt-2 px-4 py-1 bg-red-800 hover:bg-red-700 rounded text-white text-sm"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2">No templates match your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
              {filteredTemplates.map((template) => (
                <div
                  key={template}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedTemplate === template
                      ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                  }`}
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="overflow-hidden w-full">
                      <h3 className="font-medium text-white truncate w-full" title={template}>{template}</h3>
                      <p className="text-xs text-gray-400 mt-1 truncate" title="FO Velocity Template">FO Velocity Template</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* PDF Preview Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-white mb-4">
                      Sample PDF Preview: {selectedTemplate}
                    </h3>
                    <div className="mt-2">
                      <div className="bg-white rounded-lg overflow-hidden" style={{ height: "70vh" }}>
                        {pdfUrl && (
                          <iframe 
                            src={pdfUrl} 
                            className="w-full h-full"
                            title="PDF Preview"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closePdfModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelection; 