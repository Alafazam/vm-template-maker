import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface TemplateModificationProps {
  templateContent: string | null;
  prompt: string;
  onModificationComplete: (modifiedTemplate: string, analysis: any) => void;
}

const TemplateModification: React.FC<TemplateModificationProps> = ({
  templateContent,
  prompt,
  onModificationComplete
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Debug logging for props
  useEffect(() => {
    console.log('TemplateModification props:', {
      templateContentLength: templateContent ? templateContent.length : 0,
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 30) + (prompt.length > 30 ? '...' : '')
    });
  }, [templateContent, prompt]);
  
  // Function to retrieve template content from localStorage
  const getStoredTemplate = (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Error retrieving template from storage:', e);
      return null;
    }
  };
  
  const handleModifyTemplate = async () => {
    if (!templateContent || !prompt.trim()) {
      setError('Template content and prompt are required');
      console.error('Missing required data:', {
        templateContent: templateContent ? 'Present' : 'Missing',
        promptEmpty: !prompt.trim()
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Modifying template with prompt:', prompt);
      
      // Create FormData and append the template content and other form fields
      const formData = new FormData();
      
      // Check if there's a previously modified template in localStorage
      let contentToModify = templateContent;
      const previouslyModifiedContent = getStoredTemplate('modifiedTemplateContent');
      
      // If this isn't the first modification, use the previously modified content
      if (previouslyModifiedContent) {
        console.log('Using previously modified template content for further modification');
        console.log('Previously modified content length:', previouslyModifiedContent.length);
        contentToModify = previouslyModifiedContent;
      } else {
        console.log('Using original template content');
        console.log('Original content length:', templateContent?.length || 0);
      }
      
      // Create a file from the template content
      const templateBlob = new Blob([contentToModify], { type: 'text/xml' });
      console.log('Blob size:', templateBlob.size, 'bytes');
      const templateFile = new File([templateBlob], 'template.xml', { type: 'text/xml' });
      
      formData.append('template_file', templateFile);
      formData.append('prompt', prompt);
      formData.append('api_key', process.env.NEXT_PUBLIC_OPENAI_API_KEY || "");
      
      // Call API using FormData
      const response = await axios.post('/api/modify-template', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob', // Important: request blob response
        maxContentLength: Infinity, // Allow larger responses
        maxBodyLength: Infinity    // Allow larger request bodies
      });

      console.log('Response from template service:', response);
      console.log('Response blob size:', response.data.size, 'bytes');
      
      // Extract token usage from response headers
      const allHeaders = response.headers;
      let completionTokens = 0;
      let promptTokens = 0;
      let totalTokens = 0;
      
      // Try to find token usage headers in a case-insensitive way
      Object.keys(allHeaders).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (lowerKey === 'x-completion-tokens') completionTokens = parseInt(allHeaders[key], 10);
        if (lowerKey === 'x-prompt-tokens') promptTokens = parseInt(allHeaders[key], 10);
        if (lowerKey === 'x-total-tokens') totalTokens = parseInt(allHeaders[key], 10);
      });
      
      // Create analysis object
      const analysis = {
        completion_tokens: completionTokens || 0,
        prompt_tokens: promptTokens || 0,
        total_tokens: totalTokens || 0
      };
      
      console.log('Template modification analysis:', analysis);
      
      // Convert blob response to text
      const modifiedTemplate = await response.data.text();
      
      // Debug the response
      console.log('Modified template length:', modifiedTemplate.length);
      
      // Store in localStorage
      try {
        localStorage.setItem('modifiedTemplateContent', modifiedTemplate);
        localStorage.setItem('templateAnalysis', JSON.stringify(analysis));
      } catch (e) {
        console.error('Error storing template in localStorage:', e);
        // Continue anyway - we can still use the template even if localStorage fails
      }
      
      // Call the callback with the modified template content and analysis
      onModificationComplete(modifiedTemplate, analysis);
      
    } catch (error: any) {
      console.error('Error modifying template:', error);
      
      // Try to extract error message from response if it's a blob
      if (error.response?.data instanceof Blob) {
        try {
          const errorText = await error.response.data.text();
          const errorJson = JSON.parse(errorText);
          setError(errorJson.error || 'Failed to modify template. Please try again.');
        } catch (e) {
          setError(error.message || 'Failed to modify template. Please try again.');
        }
      } else {
        setError(error.response?.data?.error || error.message || 'Failed to modify template. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {!templateContent && (
        <div className="mb-3 text-sm text-red-500">
          Warning: No template content available. Please go back to step 1 and select a template.
        </div>
      )}
      
      <button
        onClick={handleModifyTemplate}
        disabled={isLoading || !prompt.trim() || !templateContent}
        className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
          isLoading || !prompt.trim() || !templateContent
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Modifying Template...
          </>
        ) : (
          'Modify Template'
        )}
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};

export default TemplateModification; 