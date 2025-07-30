import axios from 'axios';

// Backend service URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8890/velocity-engine-app';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract the templateName and optional templateContent from the request body
    const { templateName, templateContent } = req.body;
    
    if (!templateName) {
      return res.status(400).json({ error: 'Template name is required' });
    }

    console.log(`Rendering PDF for template: ${templateName}`);
    console.log(`Template content provided: ${templateContent ? 'Yes' : 'No'}`);
    
    let url;
    let requestBody = {};
    
    // If templateContent is provided, use the render-with-content endpoint
    if (templateContent) {
      url = `${BACKEND_URL}/api/render-pdf/content`;
      requestBody = {
        templateName,
        content: templateContent
      };
      console.log('Using content-based rendering endpoint');
    } else {
      // Use the standard template-based endpoint
      url = `${BACKEND_URL}/api/render-pdf/template/${templateName}/sample/invoice`;
      console.log('Using template-name-based rendering endpoint');
    }
    
    console.log(`Calling backend URL: ${url}`);
    
    // Make the request to the backend
    const response = await axios.post(
      url,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Response received, type:', typeof response.data);
    console.log('Response headers:', response.headers);
    
    // Check if the response is a base64 string
    if (typeof response.data === 'string') {
      console.log('Response is a string, likely base64. Converting to binary...');
      // Decode base64 to binary
      const pdfData = Buffer.from(response.data, 'base64');
      
      // Set appropriate headers for the PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=template.pdf');
      
      // Send the decoded PDF data
      res.status(200).send(pdfData);
    } else {
      // Handle binary response
      console.log('Response is not a string, sending as is...');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=template.pdf');
      res.status(200).send(Buffer.from(response.data));
    }
  } catch (error) {
    console.error('Error rendering template:', error);
    console.error('Error details:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to render template',
      details: error.message
    });
  }
} 