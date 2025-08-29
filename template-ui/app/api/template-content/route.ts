import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// Backend service URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8890/velocity-engine-app';

export async function GET(request: NextRequest) {
  try {
    // Get the template name from the query
    const { searchParams } = new URL(request.url);
    const templateName = searchParams.get('templateName');
    
    if (!templateName) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching template content for: ${templateName}`);
    
    // Use the endpoint to get the template content
    // Note: Make sure the templateName has the correct extension (.fo.vm)
    const formattedTemplateName = templateName.endsWith('.fo.vm') ? templateName : `${templateName}.fo.vm`;
    const url = `${BACKEND_URL}/api/templates/${formattedTemplateName}/content`;
    console.log(`Calling backend URL: ${url}`);
    
    const response = await axios.get(url);
    
    // Return the template content
    return NextResponse.json({ content: response.data });
  } catch (error: any) {
    console.error('Error fetching template content:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch template content',
        details: error.message
      },
      { status: error.response?.status || 500 }
    );
  }
} 