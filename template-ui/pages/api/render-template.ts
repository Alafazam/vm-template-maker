import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// PDF rendering service URL
const PDF_RENDER_SERVICE_URL = 'http://localhost:8000/render-pdf';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { templateContent } = req.body;

    // Check for required parameters
    if (!templateContent) {
      return res.status(400).json({ error: 'Template content is required' });
    }

    console.log('Received request to render PDF from template content');
    
    // Call the PDF rendering service
    const response = await axios.post(
      PDF_RENDER_SERVICE_URL,
      { template_content: templateContent },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer' // Important for binary data
      }
    );

    console.log('PDF rendering successful');
    
    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=rendered_document.pdf');
    
    // Send the PDF data
    return res.send(response.data);
    
  } catch (error: any) {
    console.error('Error rendering PDF:', error);
    
    let statusCode = 500;
    let errorMessage = 'Failed to render PDF';
    
    if (error.response) {
      statusCode = error.response.status;
      // Try to extract error message from response
      try {
        if (error.response.data) {
          const errorData = JSON.parse(error.response.data.toString());
          errorMessage = errorData.error || errorData.details || errorMessage;
        }
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return res.status(statusCode).json({ error: errorMessage });
  }
} 