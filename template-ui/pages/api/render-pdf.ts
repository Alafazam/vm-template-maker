import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { Fields, Files, File } from 'formidable';
import FormData from 'form-data';
import os from 'os';

// Disable body parsing for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to check if string is base64 encoded PDF
function isPdfBase64(str: string): boolean {
  // Check if it starts with the PDF magic number in base64 (JVBERi0)
  return str.startsWith('JVBERi0') && 
    // Basic check for base64 characters only
    /^[A-Za-z0-9+/=]+$/.test(str.trim());
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the multipart form data
    const form = new formidable.IncomingForm();
    const { fields, files } = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
      form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    // Get the file from the request
    const file = files.file as unknown as File;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File received:', file.originalFilename);
    console.log('File path:', file.filepath);
    console.log('File size:', fs.statSync(file.filepath).size);

    // Create a temporary file with the .fo.vm extension as required by the API
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, 'template.fo.vm');
    
    // Copy the uploaded file content to the temporary file
    fs.copyFileSync(file.filepath, tempFilePath);
    console.log('Copied file to temporary location:', tempFilePath);

    // Use form-data package for Node.js environment (not browser FormData)
    const formData = new FormData();
    
    // Read the file content and append it to formData
    const fileContent = fs.readFileSync(tempFilePath);
    formData.append('file', fileContent, { filename: 'template.fo.vm' });

    console.log('Making request to external API...');
    
    // Show the API endpoint we're calling
    const apiEndpoint = 'http://localhost:8890/velocity-engine-app/api/render-pdf/sample/invoice';
    console.log('API endpoint:', apiEndpoint);
    
    try {
      // Test if the endpoint is accessible with a simple request
      await axios.get(apiEndpoint, { timeout: 5000 });
      console.log('API endpoint is accessible');
    } catch (connError: any) {
      console.error('Connection test failed:', connError.message);
      if (connError.code === 'ECONNREFUSED') {
        return res.status(503).json({
          error: 'External API server is not accessible',
          details: 'Connection refused. Make sure the server is running at localhost:8890'
        });
      }
    }
    
    // Forward the request to the external API
    const response = await axios.post(
      apiEndpoint,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        responseType: 'arraybuffer',
        timeout: 30000, // 30 second timeout
        maxContentLength: 10 * 1024 * 1024, // 10MB max response size
      }
    );

    console.log('External API response received:', response.status);
    console.log('Response content type:', response.headers['content-type']);
    console.log('Response size:', response.data.length);

    // Clean up temporary file
    try {
      fs.unlinkSync(tempFilePath);
      console.log('Temporary file deleted');
    } catch (cleanupError) {
      console.error('Failed to clean up temporary file:', cleanupError);
    }

    // Check content type from the API's response
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    
    // Handle the response data based on content type
    if (contentType.includes('text/plain')) {
      // The API might be returning base64 encoded PDF as text
      try {
        const textData = Buffer.from(response.data).toString('utf8');
        
        // Check if this looks like a base64 encoded PDF
        if (isPdfBase64(textData)) {
          console.log('Detected base64 encoded PDF data, converting to binary PDF');
          // Convert base64 to binary PDF
          const pdfData = Buffer.from(textData, 'base64');
          
          // Set headers for PDF
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'inline; filename=generated.pdf');
          res.setHeader('Content-Length', pdfData.length);
          
          // Send the PDF data
          return res.send(pdfData);
        } else {
          // If it's just text, send it as is
          console.log('Response appears to be plain text, not base64 PDF');
          res.setHeader('Content-Type', 'text/plain');
          res.setHeader('Content-Disposition', 'inline; filename=response.txt');
          return res.send(textData);
        }
      } catch (decodeError) {
        console.error('Error decoding text response:', decodeError);
        res.setHeader('Content-Type', 'text/plain');
        return res.send(response.data);
      }
    } else {
      // For other content types (like application/pdf), pass through directly
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', 'inline; filename=generated.pdf');
      return res.send(response.data);
    }
  } catch (error: any) {
    console.error('Error proxying PDF generation request:', error);
    let errorDetails = error.message || 'Unknown error';
    
    // Log more detailed error information for debugging
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      
      // Try to parse the response data if it's not binary
      if (error.response.data) {
        try {
          // If it's a buffer, convert to string
          const errorData = error.response.data instanceof Buffer 
            ? error.response.data.toString('utf8')
            : error.response.data;
            
          console.error('Response data:', errorData);
          errorDetails = `Server responded with: ${errorData}`;
        } catch (e) {
          console.error('Could not parse error response data');
        }
      }
    } else if (error.code) {
      // Network errors
      if (error.code === 'ECONNREFUSED') {
        errorDetails = 'Connection refused. Make sure the external server is running.';
      } else if (error.code === 'ETIMEDOUT') {
        errorDetails = 'Connection timed out. The server might be busy or not responding.';
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to generate PDF',
      details: errorDetails
    });
  }
} 