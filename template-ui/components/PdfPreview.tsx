import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

interface PdfPreviewProps {
  selectedTemplate: string | null;
  userPrompt: string;
  onBack: () => void;
  templateContent?: string | null;
  simplified?: boolean;
  generatePdf?: boolean;
  onGenerateComplete?: () => void;
  hideTitle?: boolean;
}

// This would come from a database or API in a real app
const TEMPLATE_NAMES: Record<string, string> = {
  'standard_invoice': 'Standard Invoice',
  'oto_box_label': 'Box Label',
  'akg-b2b-invoice': 'B2B Invoice',
  'noon_shipping_label_template': 'Shipping Label',
  'fknits-noon-invoice': 'Noon Invoice',
  'uspl-einvoice-template': 'E-Invoice Template',
  'miniklub-invoice': 'Miniklub Invoice',
  'nykaa_invoice_template': 'Nykaa Invoice',
};

const PdfPreview: React.FC<PdfPreviewProps> = ({
  selectedTemplate,
  userPrompt,
  templateContent,
  onBack,
  simplified = false,
  generatePdf = false,
  onGenerateComplete,
  hideTitle = false
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fetch sample JSON data and render PDF when generatePdf is true
  useEffect(() => {
    if (generatePdf && selectedTemplate) {
      renderPdf();
    }
    
    // Reset when template changes
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    };
  }, [generatePdf, selectedTemplate]);

  // Function to get template content from localStorage
  const getStoredTemplate = (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Error retrieving template from storage:', e);
      return null;
    }
  };

  const renderPdf = async () => {
    if (!selectedTemplate) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Rendering PDF for template:', selectedTemplate);
      console.log('Using user prompt:', userPrompt);
      
      let content: string;
      
      // First try to get the modified content from localStorage
      const storedModifiedContent = getStoredTemplate('modifiedTemplateContent');
      
      // Then check the props
      if (templateContent) {
        // If we have template content from props, use that
        content = templateContent;
        console.log('Using template content from props');
      } else if (storedModifiedContent) {
        // If there's modified content in localStorage, use that
        content = storedModifiedContent;
        console.log('Using modified template content from localStorage');
      } else {
        // Finally, fall back to the original template content
        const originalContent = getStoredTemplate('templateContent');
        if (!originalContent) {
          throw new Error('Template content not found. Please go back and select the template again.');
        }
        content = originalContent;
        console.log('Using original template content from localStorage');
      }
      
      // Store the current prompt in localStorage for reference
      localStorage.setItem('currentPrompt', userPrompt);
      
      // Render the PDF using the template content directly
      const response = await axios.post(
        '/api/render',
        {
          templateName: selectedTemplate,
          templateContent: content
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
      
      // Update state with the PDF URL
      setPdfUrl(url);
      setLoading(false);
      
      // Call the complete callback if provided
      if (onGenerateComplete) {
        onGenerateComplete();
      }
      
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      
      // Try to get more detailed error information if available
      let errorMessage = 'Failed to generate PDF. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data) {
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
      setLoading(false);
      
      if (onGenerateComplete) {
        onGenerateComplete();
      }
    }
  };

  // Method to get the template display content based on the selected template
  const getTemplateContent = () => {
    if (!selectedTemplate) return null;

    switch(selectedTemplate) {
      case 'standard_invoice':
        return (
          <div className="p-6 text-gray-800 text-sm flex-1 overflow-hidden">
            <div className="flex justify-between mb-6">
              <div>
                <div className="font-bold text-xl">INVOICE</div>
                <div>Invoice #: INV-001</div>
                <div>Date: {new Date().toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">Your Company Name</div>
                <div>123 Business St</div>
                <div>City, ST 12345</div>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-3 mb-4">
              <div className="font-semibold">Bill To:</div>
              <div>Client Name</div>
              <div>456 Client Address</div>
              <div>Client City, ST 67890</div>
            </div>
            <table className="w-full border-collapse text-sm mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left py-2 px-3 border border-gray-300">Item</th>
                  <th className="text-right py-2 px-3 border border-gray-300">Qty</th>
                  <th className="text-right py-2 px-3 border border-gray-300">Price</th>
                  <th className="text-right py-2 px-3 border border-gray-300">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">Product 1</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">2</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">$25.00</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">$50.00</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">Product 2</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">1</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">$70.00</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">$70.00</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="border border-gray-300 px-3 py-2 text-right font-semibold">Total:</td>
                  <td className="border border-gray-300 px-3 py-2 text-right font-bold">$120.00</td>
                </tr>
              </tfoot>
            </table>
            
            <div className="border-t border-gray-200 pt-3">
              <div className="text-sm text-gray-600">
                <div className="mb-1">Payment is due within 30 days.</div>
                <div>Thank you for your business!</div>
              </div>
            </div>
          </div>
        );
      
      case 'oto_box_label':
        return (
          <div className="p-6 text-gray-800 text-sm flex-1 flex flex-col items-center justify-center">
            <div className="border-2 border-gray-800 rounded-md w-full max-w-[350px] p-5">
              <div className="font-bold text-center border-b-2 border-gray-800 pb-3 mb-4 text-xl">SHIPPING LABEL</div>
              <div className="flex justify-between mb-3">
                <div className="font-semibold">Order #:</div>
                <div>BOX-12345678</div>
              </div>
              <div className="flex justify-between mb-3">
                <div className="font-semibold">Ship Date:</div>
                <div>{new Date().toLocaleDateString()}</div>
              </div>
              <div className="border-t-2 border-gray-800 pt-3 mb-4">
                <div className="font-semibold">Ship To:</div>
                <div className="text-lg font-bold">John Smith</div>
                <div>123 Delivery St</div>
                <div>City, ST 12345</div>
                <div>Phone: (555) 123-4567</div>
              </div>
              <div className="my-4 flex justify-center">
                <div className="border-2 border-gray-800 p-3 text-center w-full">
                  <div className="text-xs mb-1">SCAN CODE</div>
                  <div className="font-mono text-center tracking-wider my-2">||||||||||||||||</div>
                  <div className="font-mono font-bold">BOX-12345678</div>
                </div>
              </div>
              <div className="text-center text-xs mt-3">
                <div>SHIPPING INSTRUCTIONS: Handle with care</div>
                <div className="font-bold mt-1">Priority Shipping</div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex-1 flex items-center justify-center p-10">
            <div className="text-center">
              <div className="mx-auto w-16 h-20 mb-4 bg-blue-100 flex items-center justify-center rounded shadow-sm">
                <svg className="w-10 h-10 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-gray-800 font-bold text-lg mb-1">{TEMPLATE_NAMES[selectedTemplate] || selectedTemplate}</h3>
              <p className="text-gray-600 text-sm">
                Document preview generated with the data provided
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={simplified ? '' : 'mt-6'}>
      {!hideTitle && <h2 className="text-xl font-semibold mb-4">Template Preview</h2>}
      
      <div className="border border-gray-700 rounded-lg overflow-hidden h-[500px] bg-white flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-800">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-300">Generating PDF preview...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-800 p-6">
            <svg className="w-12 h-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-300 text-center mb-4">{error}</p>
            <button
              onClick={renderPdf}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
            >
              Try Again
            </button>
          </div>
        ) : !pdfUrl ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-800 text-gray-400">
            {selectedTemplate ? (
              <>
                <svg className="w-12 h-12 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                </svg>
                <p className="mb-4 text-center">Click "Generate PDF" to preview the template</p>
                <button
                  onClick={renderPdf}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                >
                  Generate Preview
                </button>
              </>
            ) : (
              <>
                <svg className="w-12 h-12 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Please select a template to preview</p>
              </>
            )}
          </div>
        ) : (
          <iframe 
            ref={iframeRef}
            src={pdfUrl}
            className="w-full h-full flex-1 border-none"
            title="PDF Preview"
          />
        )}
      </div>
    </div>
  );
};

export default PdfPreview; 