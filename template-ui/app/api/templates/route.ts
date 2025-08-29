import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// Backend service URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8890/velocity-engine-app';

export async function GET() {
  try {
    console.log('Fetching templates from backend...');
    const url = `${BACKEND_URL}/api/templates`;
    console.log(`Calling backend URL: ${url}`);
    
    const response = await axios.get(url);
    console.log('Templates response:', response.data);
    
    // Return the template names as an array
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch templates',
        details: error.message
      },
      { status: error.response?.status || 500 }
    );
  }
} 