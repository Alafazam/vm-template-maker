import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import FormData from 'form-data';

// Configuration
const TEMPLATE_SERVICE_URL = 'http://localhost:8000/api/modify-template';
const DEFAULT_API_KEY = process.env.OPENAI_API_KEY || "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract the template content and prompt from the request body
    const { templateContent, prompt, apiKey = DEFAULT_API_KEY } = req.body;

    if (!templateContent || !prompt) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'OpenAI API key is required' });
    }

    // Create a temporary file name for the template
    const filename = `template-${Date.now()}.fo.vm`;

    // Create a FormData object for the multipart request
    const formData = new FormData();
    formData.append('template_file', Buffer.from(templateContent), {
      filename,
      contentType: 'text/plain',
    });
    formData.append('prompt', prompt);
    formData.append('api_key', apiKey);

    // Call the template modification service
    console.log('Calling template modification service...');
    const response = await axios.post(TEMPLATE_SERVICE_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    // Return the modified template and analysis
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error in modify-template API:', error);
    return res.status(500).json({ 
      error: 'Failed to modify template', 
      details: error.response?.data?.error || error.message 
    });
  }
} 