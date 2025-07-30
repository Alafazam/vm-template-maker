# Template Modification Service

A simple Flask API that uses OpenAI to modify XSL-FO Velocity templates (.fo.vm files) based on user instructions.

## Features

- Single API endpoint for template modification
- Supports both file uploads and JSON-based requests
- Returns modified templates as downloadable files or JSON responses
- Uses OpenAI's GPT-4 to intelligently modify XSL-FO Velocity templates
- Returns both the modified template and token usage analysis

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Set your OpenAI API key:
   ```
   export OPENAI_API_KEY=your_api_key_here
   ```
4. Run the server:
   ```
   python app.py
   ```

The server will run on port 8000 by default.

## API Usage

### Endpoint: `/api/modify-template`

#### Method 1: File Upload (Preferred)

**Method**: POST  
**Content-Type**: multipart/form-data

**Form Fields**:
- `template_file`: The XSL-FO Velocity template file to modify
- `prompt`: The specific change to make (e.g., 'Add a column for discount percentage')
- `api_key`: Your OpenAI API key (optional if set in environment)

**Response**: 
- A downloadable file with the modified template
- Analysis data in response headers:
  - `X-Completion-Tokens`: Number of completion tokens used
  - `X-Prompt-Tokens`: Number of prompt tokens used
  - `X-Total-Tokens`: Total number of tokens used

**Example curl command**:
```bash
curl -X POST http://localhost:8000/api/modify-template \
  -F "template_file=@/path/to/your/template.xml" \
  -F "prompt=Add a column for discount percentage after the vendor name column" \
  -F "api_key=your_openai_api_key" \
  -o modified_template.xml
```

#### Method 2: JSON Request (Backward Compatibility)

**Method**: POST  
**Content-Type**: application/json

**Request Body**:
```json
{
  "template_content": "Your XSL-FO Velocity template content here",
  "prompt": "The specific change to make (e.g., 'Change header from TAX INVOICE to PROFORMA INVOICE')",
  "api_key": "your_openai_api_key" 
}
```

**Response**:
```json
{
  "modified_template": "The modified template content",
  "analysis": {
    "completion_tokens": 1234,
    "prompt_tokens": 5678,
    "total_tokens": 6912
  }
}
```

**Example curl command**:
```bash
curl -X POST http://localhost:8000/api/modify-template \
  -H "Content-Type: application/json" \
  -d '{
    "template_content": "<fo:root xmlns:fo=\"http://www.w3.org/1999/XSL/Format\">...</fo:root>",
    "prompt": "Change the header text from TAX INVOICE to PROFORMA INVOICE",
    "api_key": "your_openai_api_key"
  }'
``` 