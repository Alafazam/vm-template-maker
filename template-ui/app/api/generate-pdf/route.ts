import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// Backend service URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8890/velocity-engine-app';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const templateFile = formData.get('templateFile') as File;
    const jsonData = formData.get('jsonData') as string;

    if (!templateFile) {
      return NextResponse.json(
        { error: 'Template file is required' },
        { status: 400 }
      );
    }

    if (!jsonData) {
      return NextResponse.json(
        { error: 'JSON data is required' },
        { status: 400 }
      );
    }

    // Validate JSON
    try {
      JSON.parse(jsonData);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON data' },
        { status: 400 }
      );
    }

    console.log('Generating PDF with template and JSON data');
    
    // Create FormData for backend call
    const backendFormData = new FormData();
    backendFormData.append('templateFile', templateFile);
    backendFormData.append('jsonData', jsonData);

    // Call backend API
    const response = await axios.post(
      `${BACKEND_URL}/api/render-pdf/template-upload`,
      backendFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'text',
      }
    );

    // Return the base64 PDF data
    return NextResponse.json({ 
      pdfData: response.data,
      success: true 
    });

  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF',
        details: error.response?.data || error.message
      },
      { status: error.response?.status || 500 }
    );
  }
} 