import axios from 'axios';

// Backend service URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8890/velocity-engine-app';

export default async function handler(req, res) {
  try {
    console.log('Fetching templates from backend...');
    const url = `${BACKEND_URL}/api/templates`;
    console.log(`Calling backend URL: ${url}`);
    
    const response = await axios.get(url);
    console.log('Templates response:', response.data);
    
    // Return the template names as an array
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch templates',
      details: error.message
    });
  }
} 