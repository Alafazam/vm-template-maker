#!/usr/bin/env node

/**
 * Test script for PDF generation
 * 
 * This script sends a direct request to the external PDF generation service
 * to help diagnose issues with the PDF rendering process.
 * 
 * Usage:
 *   node test-pdf-generation.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Path to template file
const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'akg-b2b-invoice.fo.vm');
// External API endpoint
const API_ENDPOINT = 'http://localhost:8890/velocity-engine-app/api/render-pdf/sample/invoice';
// Output file path
const OUTPUT_PATH = path.join(__dirname, 'test-output.pdf');

async function testPdfGeneration() {
  try {
    console.log('Starting PDF generation test...');
    console.log('Template path:', TEMPLATE_PATH);
    
    // Check if the template file exists
    if (!fs.existsSync(TEMPLATE_PATH)) {
      console.error('❌ Template file not found!');
      console.log('Please check the path:', TEMPLATE_PATH);
      return;
    }
    
    console.log('✓ Template file found, size:', fs.statSync(TEMPLATE_PATH).size, 'bytes');
    
    // Create form data
    const formData = new FormData();
    const fileContent = fs.readFileSync(TEMPLATE_PATH);
    formData.append('file', fileContent, { filename: 'template.fo.vm' });
    
    console.log('Form data created, sending request to:', API_ENDPOINT);
    
    // Test server connection
    try {
      console.log('Testing server connection...');
      await axios.get(API_ENDPOINT, { timeout: 3000 });
      console.log('✓ Server is reachable');
    } catch (connError) {
      console.error('❌ Server connection failed:', connError.message);
      if (connError.code === 'ECONNREFUSED') {
        console.log('Make sure the server is running at localhost:8890');
      }
      return;
    }
    
    // Make the request
    console.log('Sending PDF generation request...');
    const response = await axios.post(
      API_ENDPOINT,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        responseType: 'arraybuffer',
        timeout: 30000,
      }
    );
    
    console.log('✓ Response received:');
    console.log('  Status:', response.status);
    console.log('  Content-Type:', response.headers['content-type']);
    console.log('  Response size:', response.data.length, 'bytes');
    
    // Analyze the response
    const contentType = response.headers['content-type'];
    
    if (contentType && contentType.includes('text/plain')) {
      // It could be base64 encoded PDF
      const textData = Buffer.from(response.data).toString('utf8');
      console.log('Response contains text data, first 100 chars:', textData.substring(0, 100));
      
      if (textData.startsWith('JVBERi0')) { // PDF magic number in base64
        console.log('✓ Detected Base64 encoded PDF');
        try {
          // Convert base64 to binary
          const pdfData = Buffer.from(textData, 'base64');
          console.log('  Decoded PDF size:', pdfData.length, 'bytes');
          
          // Save the PDF to a file
          fs.writeFileSync(OUTPUT_PATH, pdfData);
          console.log('✓ Saved decoded PDF to:', OUTPUT_PATH);
        } catch (e) {
          console.error('❌ Error converting Base64 to PDF:', e.message);
        }
      } else {
        // It's just text
        console.log('⚠️ Response is plain text, not a PDF. Writing to text file...');
        fs.writeFileSync(OUTPUT_PATH + '.txt', textData);
        console.log('✓ Saved text response to:', OUTPUT_PATH + '.txt');
      }
    } else if (contentType && contentType.includes('application/pdf')) {
      // Direct PDF response
      console.log('✓ Response is a direct PDF');
      fs.writeFileSync(OUTPUT_PATH, response.data);
      console.log('✓ Saved PDF to:', OUTPUT_PATH);
    } else {
      // Unknown format
      console.log('⚠️ Unknown response format:', contentType);
      fs.writeFileSync(OUTPUT_PATH + '.bin', response.data);
      console.log('✓ Saved binary response to:', OUTPUT_PATH + '.bin');
    }
    
    console.log('\nTest completed successfully! 🎉');
    console.log('\nNext steps:');
    console.log('1. Try opening the generated file in a PDF viewer');
    console.log('2. If it works, the issue may be in the frontend PDF viewer');
    console.log('3. If it doesn\'t work, there might be an issue with the PDF generation server');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    
    if (error.response) {
      console.log('\nServer response details:');
      console.log('  Status:', error.response.status);
      console.log('  Headers:', JSON.stringify(error.response.headers, null, 2));
      
      if (error.response.data) {
        try {
          const errorText = Buffer.from(error.response.data).toString('utf8');
          console.log('  Response data:', errorText);
        } catch (e) {
          console.log('  Response data: [Binary data]');
        }
      }
    }
    
    console.log('\nCheck if:');
    console.log('1. The PDF server is running at localhost:8890');
    console.log('2. The template file is valid XML');
    console.log('3. Network connectivity is working');
  }
}

// Test function to verify base64 PDF conversion
async function testBase64PdfConversion() {
  console.log('========== Testing Base64 PDF Conversion ==========');
  
  try {
    // A small sample of base64 encoded PDF data (just the header)
    const sampleBase64 = 'JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDEgMCBSIC9MYXN0TW9kaWZpZWQgKEQ6MjAyMzA4MTUxMDM0MzVaKQovUmVzb3VyY2VzIDIgMCBSIC9NZWRpYUJveCBbMCAwIDU5NS4yNzU2IDg0MS44ODk4XSAvQ3JvcEJveCBbMCAwIDU5NS4yNzU2IDg0MS44ODk4XQovQ29udGVudHMgNiAwIFIgL1JvdGF0ZSAwIC9Hcm91cCA8PCAvVHlwZSAvR3JvdXAgL1MgL1RyYW5zcGFyZW5jeSAvQ1MgL0RldmljZVJHQiA+PiA+PgplbmRvYmoK';
    
    console.log('Sample base64 data length:', sampleBase64.length);
    
    // Convert base64 to binary
    const pdfBinary = Buffer.from(sampleBase64, 'base64');
    console.log('Converted binary data length:', pdfBinary.length);
    
    // Create a blob
    const blob = new Blob([pdfBinary], { type: 'application/pdf' });
    console.log('Created blob size:', blob.size);
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    console.log('Created URL for blob:', url);
    
    // Cleanup
    URL.revokeObjectURL(url);
    
    console.log('Base64 PDF conversion test passed successfully');
    return true;
  } catch (error) {
    console.error('Base64 PDF conversion test failed:', error);
    return false;
  }
}

// Run the test
testPdfGeneration();

// Run the test if this file is executed directly
if (require.main === module) {
  testBase64PdfConversion()
    .then(success => {
      console.log('Test result:', success ? 'PASSED' : 'FAILED');
    })
    .catch(error => {
      console.error('Test execution error:', error);
    });
} 