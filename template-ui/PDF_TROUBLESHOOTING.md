# PDF Generation Troubleshooting Guide

This guide provides steps to diagnose and fix issues with PDF generation in the template automation system.

## Common Issues

### 1. PDF doesn't open in the viewer

If the PDF is generated but doesn't display properly in the browser:

- Try using the "Reload" button in the PDF viewer modal
- Download the PDF and open it in a desktop PDF viewer
- Check browser console for any errors related to PDF loading
- The server may be returning base64-encoded data that needs to be decoded (this should be handled automatically)

### 2. Server returns 500 Internal Server Error

This can happen for several reasons:

- The external PDF server at `localhost:8890` might not be running
- The template XML may have syntax errors
- The server might be timing out during PDF generation
- There could be issues with the form data being sent to the server

## Diagnostic Steps

### 1. Run the test script

We've created a diagnostic tool that bypasses the web UI and directly tests the PDF generation:

```bash
cd template-ui
node test-pdf-generation.js
```

This script will:
- Test connection to the PDF server
- Send a request to generate a PDF
- Analyze the response
- Save the resulting file for inspection

### 2. Check server connectivity

Make sure the external PDF server is running:

```bash
curl -I http://localhost:8890/velocity-engine-app/
```

You should see a `HTTP/1.1 200 OK` response.

### 3. Validate the template

Make sure your template XML is valid:

```bash
cd ..
cat templates/akg-b2b-invoice.fo.vm
```

Look for any syntax errors in the XML template.

### 4. Check browser network tab

When using the web UI:
1. Open browser developer tools (F12)
2. Go to the Network tab
3. Click "Generate PDF"
4. Look for the `/api/render-pdf` request
5. Check the response content and headers

### 5. Test server API directly

Test the server API endpoint directly:

```bash
curl -X POST http://localhost:8890/velocity-engine-app/api/render-pdf/sample/invoice \
  -F "file=@../templates/akg-b2b-invoice.fo.vm" \
  -o test.pdf
```

Then try opening the `test.pdf` file.

## Fixes

### Fix for base64-encoded PDFs

If the server returns a base64-encoded PDF as text, the application should now automatically detect and decode it.

### Fix for template errors

If your template has validation errors:
1. Fix any XML syntax issues
2. Ensure the template is properly formatted
3. Try generating the PDF again

### Fix for server connection issues

If the server isn't running:
1. Start the external PDF service
2. Make sure it's running on port 8890
3. Check for any startup errors in the server logs

## Still Having Issues?

If problems persist:
1. Check the Node.js server logs for detailed error information
2. Look at browser console logs for client-side errors
3. Try a simpler template to isolate template-specific issues
4. Check network connectivity between the application server and the PDF service 