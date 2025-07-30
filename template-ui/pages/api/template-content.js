import axios from 'axios';

// Backend service URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8890/velocity-engine-app';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the template name from the query
    const { templateName } = req.query;
    
    if (!templateName) {
      return res.status(400).json({ error: 'Template name is required' });
    }

    console.log(`Fetching template content for: ${templateName}`);
    
    // Use the endpoint to get the template content
    // Note: Make sure the templateName has the correct extension (.fo.vm)
    const formattedTemplateName = templateName.endsWith('.fo.vm') ? templateName : `${templateName}.fo.vm`;
    const url = `${BACKEND_URL}/api/templates/${formattedTemplateName}/content`;
    console.log(`Calling backend URL: ${url}`);
    
    const response = await axios.get(url);
    
    // Return the template content
    res.status(200).json({ content: response.data });
  } catch (error) {
    console.error('Error fetching template content:', error);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch template content',
      details: error.message
    });
  }
} 