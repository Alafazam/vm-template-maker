import React from 'react';

interface FileDownloadProps {
  file: File | null;
  label?: string;
  buttonText?: string;
  className?: string;
}

const FileDownload: React.FC<FileDownloadProps> = ({ 
  file, 
  label = "Download Modified Template",
  buttonText = "Download File",
  className = ""
}) => {
  const handleDownload = () => {
    if (!file) return;
    
    // Create a download URL for the file
    const url = URL.createObjectURL(file);
    
    // Create a temporary anchor element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  if (!file) return null;
  
  return (
    <div className={className}>
      {label && <div className="text-sm font-medium mb-2">{label}</div>}
      <button
        onClick={handleDownload}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <svg className="mr-2 -ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {buttonText}
      </button>
    </div>
  );
};

export default FileDownload; 