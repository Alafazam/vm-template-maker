import React, { useEffect, useState } from 'react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfData: Blob | null;
  title?: string;
  isLoading?: boolean;
  error?: string | null;
}

const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  pdfData,
  title = 'PDF Viewer',
  isLoading = false,
  error = null
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(true);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [displayError, setDisplayError] = useState<string | null>(null);
  
  // Create URL for PDF blob when data changes
  useEffect(() => {
    if (pdfData) {
      // Determine content type
      const contentType = pdfData.type || '';
      
      // Check if the content is actually a PDF or text
      if (contentType.includes('text/plain')) {
        setIsPdf(false);
        // Read the text content
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            setTextContent(e.target.result as string);
          }
        };
        reader.readAsText(pdfData);
      } else {
        // Handle PDF data
        setIsPdf(true);
        try {
          const url = URL.createObjectURL(pdfData);
          setPdfUrl(url);
          
          // Clean up URL object when component unmounts
          return () => {
            URL.revokeObjectURL(url);
          };
        } catch (err) {
          console.error('Error creating PDF URL:', err);
          setDisplayError('Failed to display the PDF. The generated file may be corrupted.');
        }
      }
    } else {
      setPdfUrl(null);
      setTextContent(null);
      setDisplayError(null);
    }
  }, [pdfData]);
  
  const handleDownload = () => {
    if (pdfData) {
      try {
        const url = URL.createObjectURL(pdfData);
        const link = document.createElement('a');
        link.href = url;
        
        // Choose appropriate filename and extension based on content type
        const extension = isPdf ? 'pdf' : 'txt';
        link.download = `generated_document_${new Date().getTime()}.${extension}`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Error downloading file:', err);
        setDisplayError('Failed to download the file. Please try again.');
      }
    }
  };
  
  const handleReload = () => {
    // Force reload the iframe - sometimes helps with PDF display issues
    if (pdfUrl) {
      const currentUrl = pdfUrl;
      setPdfUrl(null);
      setTimeout(() => {
        setPdfUrl(currentUrl);
      }, 100);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl flex flex-col" style={{height: "95vh"}}>
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h3 className="text-lg font-medium text-white">{title}</h3>
          <div className="flex items-center">
            {pdfData && (
              <button 
                onClick={handleDownload}
                disabled={!pdfData}
                className="text-gray-200 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md mr-4 text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download {isPdf ? 'PDF' : 'Content'}
              </button>
            )}
            {isPdf && pdfUrl && (
              <button 
                onClick={handleReload}
                className="text-gray-200 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md mr-4 text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reload
              </button>
            )}
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Modal Content */}
        <div className="flex-1 bg-white relative" style={{height: "calc(95vh - 60px)"}}>
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="ml-4 text-gray-700">Generating PDF...</p>
            </div>
          )}
          
          {/* Error State */}
          {(error || displayError) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white">
              <div className="bg-red-100 rounded-full p-4 inline-block mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Error Generating PDF</h3>
              <p className="text-gray-600 mb-6 max-w-md">{error || displayError}</p>
              <div className="flex flex-col items-center space-y-3">
                <p className="text-sm text-gray-500">Please check that:</p>
                <ul className="text-sm text-left text-gray-500 list-disc pl-5">
                  <li>The template XML is valid</li>
                  <li>The external PDF server is running at localhost:8890</li>
                  <li>You have proper network connectivity</li>
                </ul>
                <button 
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
          
          {/* PDF Viewer */}
          {pdfUrl && isPdf && !isLoading && !error && !displayError && (
            <>
              <iframe 
                src={pdfUrl}
                className="w-full h-full border-0"
                title="PDF Viewer"
                onError={() => {
                  setDisplayError('Failed to display the PDF. The generated file may be corrupted.');
                }}
              />
              <div className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-70 text-xs text-white px-2 py-1 rounded-md">
                If the PDF doesn't display correctly, try the reload button or download it.
              </div>
            </>
          )}
          
          {/* Text Content Viewer */}
          {textContent && !isPdf && !isLoading && !error && !displayError && (
            <div className="w-full h-full overflow-auto p-4 font-mono text-sm bg-gray-100">
              <pre className="whitespace-pre-wrap">{textContent}</pre>
            </div>
          )}
          
          {/* No Content State */}
          {!pdfUrl && !textContent && !isLoading && !error && !displayError && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <p className="text-gray-700">No content to display. Please try generating the PDF again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfViewerModal; 