import axios from 'axios';
import { NextResponse } from 'next/server';

// Backend service URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8890/velocity-engine-app';

export async function GET() {
  try {
    console.log('Checking backend health...');
    const url = `${BACKEND_URL}/api/templates`;
    console.log(`Calling backend URL: ${url}`);
    
    const response = await axios.get(url, { timeout: 5000 });
    console.log('Backend health check successful');
    
    return NextResponse.json({ 
      status: 'healthy',
      backend: 'connected',
      templates: response.data.length
    });
  } catch (error: any) {
    console.error('Backend health check failed:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        backend: 'disconnected',
        error: error.message
      },
      { status: 503 }
    );
  }
} 