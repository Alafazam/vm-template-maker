import React from 'react';

interface PromptInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  onPromptChange,
  onNext,
  onBack,
}) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Enter Your Prompt</h2>
      
      <div className="mb-6">
        <p className="text-[#a0a0a0] mb-4">
          Describe what you want to generate in the template. Be as specific as possible to get the best results.
        </p>
        
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Enter your prompt here..."
          className="input w-full h-60 resize-none"
        />
      </div>
      
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-between">
        <div className="flex-grow">
          <button
            onClick={onBack}
            className="btn-secondary w-full sm:w-auto"
          >
            Back
          </button>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onNext}
            disabled={prompt.trim().length < 10}
            className="btn-primary w-full sm:w-auto"
            title={prompt.trim().length < 10 ? "Please enter a more detailed prompt" : ""}
          >
            Generate Preview
          </button>
        </div>
      </div>
      
      {prompt.trim().length > 0 && prompt.trim().length < 10 && (
        <p className="text-[#f87171] text-sm mt-2">
          Please enter a more detailed prompt (at least 10 characters)
        </p>
      )}
    </div>
  );
};

export default PromptInput; 