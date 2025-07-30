import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Define the response type
type HealthResponse = {
  status: string;
  services: {
    app: boolean;
    pdfServer?: boolean;
  };
  time: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  // Only handle GET and HEAD requests
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', ['GET', 'HEAD']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  // Basic response structure
  const healthResponse: HealthResponse = {
    status: 'ok',
    services: {
      app: true
    },
    time: new Date().toISOString()
  };

  // Check the PDF server if this is a GET request (more comprehensive check)
  if (req.method === 'GET') {
    try {
      // Set a short timeout for the external server check
      // Use the root path with a simpler GET request that should be more reliable
      const pdfServerUrl = 'http://localhost:8890/velocity-engine-app/';
      await axios.get(pdfServerUrl, { timeout: 2000 });
      healthResponse.services.pdfServer = true;
    } catch (error) {
      console.error('PDF server health check failed:', error);
      healthResponse.services.pdfServer = false;
      
      // If the PDF server is down, set overall status to degraded
      healthResponse.status = 'degraded';
    }
  }

  // Return health status
  res.status(200).json(healthResponse);
} 