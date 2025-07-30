import React from 'react';
import PdfPreview from '../PdfPreview';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: string | null;
  userPrompt: string;
  templateContent: string | null;
  generatePdf: boolean;
  onGenerateComplete: () => void;
}

const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  selectedTemplate,
  userPrompt,
  templateContent,
  generatePdf,
  onGenerateComplete
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h3 className="text-lg font-medium text-white">Template Preview</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-hidden bg-white">
          <div className="h-[70vh]">
            <PdfPreview
              selectedTemplate={selectedTemplate}
              userPrompt={userPrompt}
              templateContent={templateContent}
              onBack={() => {}}
              simplified={true}
              generatePdf={generatePdf}
              onGenerateComplete={onGenerateComplete}
              hideTitle={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal; 