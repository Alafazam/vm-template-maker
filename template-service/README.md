# Template Service

This service provides APIs for rendering PDFs using Velocity templates (.fo.vm files) and JSON data.

## Setup

1. All templates are now stored in `src/main/resources/templates` directory
2. Build the project with Maven: `mvn clean install`
3. Run the application: `mvn jetty:run`

## API Endpoints

### List All Templates

```
GET /api/templates
```

Returns a list of all template filenames available in the resources/templates directory.

### Get Detailed Template Information 

```
GET /api/templates/info
```

Returns detailed information about all templates including name, type, size, and path.

### Upload and Save Template

```
POST /api/templates/upload
```

Parameters:
- `file`: MultipartFile - The .fo.vm template file to upload and save
- `overwrite`: boolean - (Optional, default false) Whether to overwrite if a template with the same name exists

Returns information about the saved template.

### Render PDF with Custom JSON and Uploaded Template

```
POST /api/render-pdf
```

Parameters:
- `file`: MultipartFile - The .fo.vm template file
- `jsonString`: String - The JSON data to use for rendering

Returns a Base64 encoded string of the rendered PDF.

### Render PDF with Uploaded Template File

```
POST /api/render-pdf/template-upload
```

Parameters:
- `templateFile`: MultipartFile - The .fo.vm template file to use for rendering
- `jsonData`: String - The JSON data to use for rendering

Returns a Base64 encoded string of the rendered PDF.

### Render PDF with Sample JSON and Uploaded Template

```
POST /api/render-pdf/sample/{templateType}
```

Parameters:
- `file`: MultipartFile - The .fo.vm template file
- `templateType`: String - The type of template (invoice, label, etc.)

Uses predefined sample JSON files from the resources directory.
Returns a Base64 encoded string of the rendered PDF.

### Render PDF with Template from Resources and Custom JSON

```
POST /api/render-pdf/template/{templateName}
```

Parameters:
- `templateName`: String - The name of the template file in resources/templates directory
- `jsonString`: String - The JSON data to use for rendering

Returns a Base64 encoded string of the rendered PDF.

### Render PDF with Template from Resources and Sample JSON

```
POST /api/render-pdf/template/{templateName}/sample/{templateType}
```

Parameters:
- `templateName`: String - The name of the template file in resources/templates directory
- `templateType`: String - The type of sample data to use (invoice, label, etc.)

Uses template from resources and predefined sample JSON from resources directory.
Returns a Base64 encoded string of the rendered PDF.

## Sample JSON Files

Sample JSON files are available in the resources directory:
- `sample-invoice.json` - Sample data for invoice templates
- `sample-label.json` - Sample data for box label templates

## Usage Example

```
# Using template from uploaded file
curl -X POST \
  http://localhost:8890/velocity-engine-app/api/render-pdf/sample/invoice \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/your/template.fo.vm'

# Using template from resources
curl -X POST \
  http://localhost:8890/velocity-engine-app/api/render-pdf/template/standard_invoice.fo.vm/sample/invoice

# Upload and save a template
curl -X POST \
  http://localhost:8890/velocity-engine-app/api/templates/upload \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/your/template.fo.vm' \
  -F 'overwrite=true'

# Render PDF using an uploaded template file
curl -X POST \
  http://localhost:8890/velocity-engine-app/api/render-pdf/template-upload \
  -H 'Content-Type: multipart/form-data' \
  -F 'templateFile=@/path/to/your/template.fo.vm' \
  -F 'jsonData={"key": "value", "items": [{"id": 1, "name": "Item 1"}, {"id": 2, "name": "Item 2"}]}'
``` 