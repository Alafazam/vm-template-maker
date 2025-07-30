import React from 'react';

interface PromptInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSubmit?: () => void;
  showButtons?: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ 
  prompt, 
  onPromptChange,
  onSubmit,
  showButtons = true 
}) => {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium">Enter AI Prompt</label>
      <div className="relative rounded-md shadow-sm">
        <textarea
          rows={8}
          placeholder="Describe what you want to generate, e.g., 'Create an invoice for 3 items of clothing with a total of $120'..."
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="form-input block w-full rounded-md bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm text-white p-3"
        />
        {/* <div className="absolute inset-y-0 right-0 pr-3 flex items-start pt-1.5">
          <span className="inline-flex bg-blue-700 text-white text-xs font-medium px-2 py-1 rounded-md">
            AI Prompt
          </span>
        </div> */}
      </div>
      <div className="text-xs text-gray-400 mt-1 mb-4">
        Enter a natural language description of what you want to generate. Be specific about details.
      </div>
      
      {showButtons && (
        <div className="flex justify-end space-x-2">
          <button
            className="inline-flex items-center px-3 py-1.5 border border-gray-700 text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => onPromptChange('')}
          >
            Clear
          </button>
          <button
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={!prompt.trim()}
            onClick={onSubmit}
          >
            Modify Template
          </button>
        </div>
      )}
    </div>
  );
};

export default PromptInput; 