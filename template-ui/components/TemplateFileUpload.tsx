import React, { useState, useRef } from 'react';

interface TemplateFileUploadProps {
  onFileSelected: (file: File) => void;
  accept?: string;
}

const TemplateFileUpload: React.FC<TemplateFileUploadProps> = ({ 
  onFileSelected,
  accept = ".xml,.fo,.vm,.xsl"
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      onFileSelected(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      onFileSelected(file);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <label className="block mb-2 text-sm font-medium">Upload Template File</label>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-700 transition-colors ${
          dragging ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept={accept}
        />
        <svg 
          className="mx-auto h-12 w-12 text-gray-400" 
          stroke="currentColor" 
          fill="none" 
          viewBox="0 0 48 48" 
          aria-hidden="true"
        >
          <path 
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
        <div className="flex text-sm text-gray-400 mt-2 justify-center">
          <span className="relative font-medium text-blue-500 hover:text-blue-400">
            {selectedFile ? selectedFile.name : "Upload a file"}
          </span>
          {!selectedFile && <p className="pl-1">or drag and drop</p>}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          XML, XSL, or template files up to 10MB
        </p>
      </div>
      
      {selectedFile && (
        <div className="mt-2 flex items-center text-sm text-gray-400">
          <svg className="mr-1.5 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>File selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
        </div>
      )}
    </div>
  );
};

export default TemplateFileUpload; 