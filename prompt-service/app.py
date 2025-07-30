from flask import Flask, request, jsonify, send_file, Response
import os
import openai
from flask_cors import CORS
import io
import tempfile
import mimetypes
import datetime
import uuid

app = Flask(__name__)
# No maximum content length restriction
CORS(app)  # Enable CORS for all routes

# Configuration
OPENAI_MODEL = "gpt-4o"  # previously gpt-4-turbo
MAX_TOKENS = 8000  # Increased to handle larger templates
TEMPERATURE = 0.1
DEFAULT_API_KEY = os.environ.get('OPENAI_API_KEY', "")

# Create a debug directory if it doesn't exist
DEBUG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "debug_files")
os.makedirs(DEBUG_DIR, exist_ok=True)

# Function to save debug files
def save_debug_file(content, prefix, extension=".xml"):
    """Save content to a debug file with timestamp"""
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    filename = f"{prefix}_{timestamp}_{unique_id}{extension}"
    filepath = os.path.join(DEBUG_DIR, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Debug file saved: {filepath}")
    return filepath

# System prompt with rules
SYSTEM_PROMPT = """
You are a template modification specialist. You modify XSL-FO Velocity templates (.fo.vm files) 
based on user requests while following these strict rules:

TEMPLATE STRUCTURE RULES:
1. ALL TEMPLATES ARE TABLE-BASED: Templates are structured with nested tables (<fo:table>, <fo:table-row>, <fo:table-cell>)
2. PRESERVE VELOCITY SYNTAX: Keep all Velocity macros (#macro, #foreach, #if, #end) intact
3. MAINTAIN XML STRUCTURE: All modifications must result in valid XML
4. PRESERVE LAYOUT: Keep borders, padding, column widths, and other layout properties

VARIABLE HANDLING RULES:
5. RESPECT VARIABLE REFERENCES: Don't modify variable references ($data.variableName) unless specifically instructed
6. ONLY USE AVAILABLE DATA FIELDS: Only use variables that exist in the template_invoice_sample.json data model
7. VARIABLE REFERENCE FORMAT:
   - Top-level fields: $data.fieldName (e.g., $data.vendorName, $data.invoiceOrStockTransferNo)
   - Nested fields: $data.objectName.fieldName (e.g., $data.fromAddress.city, $data.itemLines[0].mrp)
   - Use proper array access for list items (e.g., $data.itemLines[0].itemName)

FORMATTING AND DISPLAY RULES:
8. STRING FORMATTING: Use #writeString($data.variableName) macro for all string variables
9. NUMBER FORMATTING: For rounding numbers to 2 decimal places, use $math.roundTo(2, $data.variableName)
10. TABLE COLUMN CALCULATIONS: When adding new columns to tables, recalculate ALL column widths so they sum to exactly 100%:
   - CRITICAL: You MUST perform width recalculation whenever modifying table columns
   - Step 1: Identify current columns and their widths (e.g., 25%, 25%, 50%)
   - Step 2: When adding a column, determine appropriate width for the new column (e.g., 20%)
   - Step 3: Proportionally reduce existing column widths to accommodate the new column
   - Step 4: Verify that all column width percentages sum exactly to 100%
   - Example: If original widths are [30%, 70%] and adding a 25% column:
     - Calculate reduction factor: 75/100 = 0.75
     - New widths: [30% × 0.75 = 22.5%, 70% × 0.75 = 52.5%, 25%] = [22.5%, 52.5%, 25%] = 100%

HELPER MACROS:
11. RESPECT HELPER MACROS: Maintain all helper macros like #writeString(), #writeDateTime(), #writeBarcodeWithoutText()

OUTPUT REQUIREMENTS:
12. RETURN COMPLETE TEMPLATE: Always return the entire modified template, not just changed parts

AVAILABLE DATA FIELDS:
The following fields are available in the data model (via $data.fieldName):

TOP-LEVEL FIELDS:
- vendorName, currency, primaryCurrencyUnit, secondaryCurrencyUnit
- invoiceOrStockTransferNo, invoiceOrStockTransferTime
- orderNo, orderTime, dispatchDate, deliveryDate, billingDate
- channelName, channelOrderNo, parentOrderNo, customerNo
- fromPartyName, toPartyName, fromTaxId, toTaxId, panNo
- forwardInvoiceNumber, forwardInvoiceDate, forwardChannelOrderId
- quantity, boxCount
- subBaseAmount, subTaxAmount, subTotalAmount
- finalBaseAmount, finalTaxAmount, finalTotalAmount
- baseShippingAmount, shippingTaxAmount, shippingAmount
- baseCodChargeAmount, codChargeTaxAmount, codChargeAmount
- totalAmountCents, totalAmountInWords
- storeCredits, giftCardDiscount
- totalCgstAmount, totalSgstAmount, totalIgstAmount
- invoiceCancelled, logoUrl, signatureUrl, stampUrl, remarks
- irn, qrCodeUrl, upiQrCodeUrl, awb, totalWeight, giftCharges
- exportType, orderType, placeOfSupply

NESTED OBJECTS:
- fromAddress: {name, line1, line2, line3, city, state, stateCode, country, countryCode, zip, phone, email}
- billingAddress: {name, line1, line2, line3, city, state, stateCode, country, countryCode, zip, phone, email}
- shippingAddress: {name, line1, line2, line3, city, state, stateCode, country, countryCode, zip, phone, email}
- paymentInfo: {mode, paymentDate, paymentGateway, transactionId, bankDetails}
- shipmentDimension: {length, breadth, height, weight}
- attributes: {customer_type, loyalty_tier, promo_code}
- invoiceMetaData: {generated_by, template_version, tracking_id}

ARRAYS:
- itemLines: Array of line items with fields:
  {vendorSku, channelSku, styleId, externalProductId, itemName, category, imageUrl, mrp, mop, discount, quantity, 
   weight, size, hsnId, color, ean, channelSerialNo, baseSellingPricePerUnit, baseSellingPriceTotal, netTaxAmountTotal, 
   actualSellingPricePerUnit, actualSellingPriceTotal, cgstRate, cgstAmount, sgstRate, sgstAmount, igstRate, igstAmount, 
   taxRule, baseShippingChargePerUnit, baseShippingChargeTotal, shippingTaxTotal, shippingChargeTotal, and more...}

- hsnBasedLineItems: Array of HSN-wise line items with fields:
  {hsnId, baseAmount, quantity, sgstTaxRate, sgstTaxTotal, cgstTaxRate, cgstTaxTotal, igstTaxRate, igstTaxTotal, 
   taxAmountTotal, totalAmount}
"""

@app.route('/api/modify-template', methods=['POST'])
def modify_template_api():
    """API endpoint to modify template content based on JSON request"""
    try:
        # Check if the request is multipart/form-data or JSON
        if request.files and 'template_file' in request.files:
            # File upload handling
            template_file = request.files['template_file']
            prompt = request.form.get('prompt')
            api_key = request.form.get('api_key', DEFAULT_API_KEY)
            
            # Read the file content
            template_content = template_file.read().decode('utf-8')
            original_filename = template_file.filename
            
            # Log original template length for debugging
            print(f"Original template received: {len(template_content)} characters")
            print(f"First 100 chars: {template_content[:100]}...")
            print(f"Last 100 chars: {template_content[-100:]}...")
            
            # Save original template to debug file
            input_file = save_debug_file(template_content, "input_template")
            print(f"Input template saved to: {input_file}")
            
            # Save prompt to debug file
            prompt_file = save_debug_file(prompt, "prompt", ".txt")
            print(f"Prompt saved to: {prompt_file}")
            
            # Validate the file extension
            allowed_extensions = ['.xml', '.fo', '.vm', '.xsl', '.xslt']
            if not any(original_filename.lower().endswith(ext) for ext in allowed_extensions):
                return jsonify({
                    "error": f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
                }), 400
                
        else:
            # Handle JSON request (backwards compatibility)
            data = request.get_json()
            template_content = data.get('template_content')
            prompt = data.get('prompt')
            api_key = data.get('api_key', DEFAULT_API_KEY)
            original_filename = "template.xml"  # Default filename for JSON requests
            
            # Save original template to debug file
            input_file = save_debug_file(template_content, "input_template_json")
            print(f"Input template saved to: {input_file}")
            
            # Save prompt to debug file
            prompt_file = save_debug_file(prompt, "prompt_json", ".txt")
            print(f"Prompt saved to: {prompt_file}")
        
        # Validate inputs
        if not template_content:
            return jsonify({"error": "Template content is required"}), 400
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        if not api_key:
            return jsonify({"error": "API key is required"}), 400
        
        # Log prompt for debugging
        print(f"Processing prompt: {prompt}")
        
        # Modify template
        modified_template, analysis = modify_template(template_content, prompt, api_key)
        
        # Save modified template to debug file
        output_file = save_debug_file(modified_template, "output_template")
        print(f"Modified template saved to: {output_file}")
        
        # Log output template for debugging
        print(f"Modified template length: {len(modified_template)} characters")
        print(f"First 100 chars of modified: {modified_template[:100]}...")
        print(f"Last 100 chars of modified: {modified_template[-100:]}...")
        
        # Log analysis
        print(f"Template modification analysis: {analysis}")
        
        # Generate the filename for modified template
        filename_parts = os.path.splitext(original_filename)
        modified_filename = f"{filename_parts[0]}_modified{filename_parts[1]}"
        print(f"Modified filename: {modified_filename}")
        
        # Create an in-memory file
        file_data = io.BytesIO(modified_template.encode('utf-8'))
        file_data.seek(0)
        
        # Log encoded size
        encoded_size = len(modified_template.encode('utf-8'))
        print(f"Encoded size of modified template: {encoded_size} bytes")
        
        # Create a response with the file
        print("Creating file response...")
        response = send_file(
            io.BytesIO(modified_template.encode('utf-8')),
            mimetype=mimetypes.guess_type(modified_filename)[0] or 'application/octet-stream',
            as_attachment=True,
            download_name=modified_filename,
            etag=False  # Disable etag to prevent caching issues
        )
        
        # Add the token usage headers to the response
        print("Adding headers to response...")
        response.headers['X-Completion-Tokens'] = str(analysis["completion_tokens"])
        response.headers['X-Prompt-Tokens'] = str(analysis["prompt_tokens"]) 
        response.headers['X-Total-Tokens'] = str(analysis["total_tokens"])
        response.headers['Access-Control-Expose-Headers'] = 'X-Completion-Tokens, X-Prompt-Tokens, X-Total-Tokens, Content-Disposition'
        
        print(f"Response headers: {dict(response.headers)}")
        print("Sending response back to client...")
        return response
        
    except Exception as e:
        import traceback
        print(f"ERROR in modify_template_api: {str(e)}")
        print(traceback.format_exc())
        
        # Save error to debug file
        error_content = f"Error: {str(e)}\n\nTraceback:\n{traceback.format_exc()}"
        error_file = save_debug_file(error_content, "error", ".log")
        print(f"Error saved to: {error_file}")
        
        return jsonify({"error": str(e)}), 500

def modify_template(template_content, user_prompt, api_key):
    """
    Modify a template based on user instructions
    
    Args:
        template_content (str): Original template content
        user_prompt (str): User's modification instructions
        api_key (str): OpenAI API key
        
    Returns:
        tuple: (modified_template, analysis_info)
    """
    try:
        # Set the API key
        openai.api_key = api_key
        
        # Log template size for debugging
        template_size = len(template_content)
        print(f"Template size: {template_size} characters")
        
        # Create a clear system prompt that emphasizes returning the complete template
        system_prompt = SYSTEM_PROMPT + "\n\nVERY IMPORTANT: Return the COMPLETE modified template without any truncation. Don't leave anything out."
        
        # Save system prompt to debug file
        system_prompt_file = save_debug_file(system_prompt, "system_prompt", ".txt")
        print(f"System prompt saved to: {system_prompt_file}")
        
        # Process the entire template at once
        print("Processing template with OpenAI")
        print(f"Using model: {OPENAI_MODEL}, max tokens: {MAX_TOKENS}, temperature: {TEMPERATURE}")
        
        # Make the API call with the older API format
        print("Starting OpenAI API call...")
        response = openai.ChatCompletion.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Apply this specific change to the template: {user_prompt}\n\nTemplate content:\n\n```xml\n{template_content}\n```"}
            ],
            temperature=TEMPERATURE,
            max_tokens=MAX_TOKENS
        )
        print("OpenAI API call completed successfully")
        
        # Log API response details
        print(f"OpenAI Response ID: {response.id}")
        print(f"Usage data: prompt tokens = {response.usage.prompt_tokens}, " +
              f"completion tokens = {response.usage.completion_tokens}, " +
              f"total tokens = {response.usage.total_tokens}")
        
        # Extract and clean the modified template
        modified_template = response.choices[0].message['content']
        print(f"Raw response length: {len(modified_template)} characters")
        
        # Save raw response to debug file
        raw_response_file = save_debug_file(modified_template, "raw_response", ".txt")
        print(f"Raw response saved to: {raw_response_file}")
        
        # If the response is wrapped in code blocks, extract just the template
        if "```xml" in modified_template or "```" in modified_template:
            import re
            print("Detecting code blocks in response, cleaning up...")
            code_block_match = re.search(r"```(?:xml)?\n(.*?)```", modified_template, re.DOTALL)
            if code_block_match:
                modified_template = code_block_match.group(1)
                print(f"Extracted content from code blocks, new length: {len(modified_template)} characters")
                
                # Save cleaned response to debug file
                cleaned_response_file = save_debug_file(modified_template, "cleaned_response", ".xml")
                print(f"Cleaned response saved to: {cleaned_response_file}")
        
        # Analysis
        analysis = {
            "completion_tokens": response.usage.completion_tokens,
            "prompt_tokens": response.usage.prompt_tokens,
            "total_tokens": response.usage.total_tokens
        }
        
        # Save analysis to debug file
        analysis_content = f"Completion Tokens: {analysis['completion_tokens']}\n" \
                          f"Prompt Tokens: {analysis['prompt_tokens']}\n" \
                          f"Total Tokens: {analysis['total_tokens']}"
        analysis_file = save_debug_file(analysis_content, "analysis", ".txt")
        print(f"Analysis saved to: {analysis_file}")
        
        # Verify the template isn't severely truncated
        if len(modified_template) < template_size * 0.5:
            print(f"WARNING: Modified template is significantly shorter than original. Original: {template_size}, Modified: {len(modified_template)}")
        else:
            print(f"Template modification successful. Original: {template_size}, Modified: {len(modified_template)}")
        
        return modified_template, analysis
    except Exception as e:
        import traceback
        print(f"ERROR in modify_template: {str(e)}")
        print(traceback.format_exc())
        
        # Save error to debug file
        error_content = f"Error: {str(e)}\n\nTraceback:\n{traceback.format_exc()}"
        error_file = save_debug_file(error_content, "modify_template_error", ".log")
        print(f"Error saved to: {error_file}")
        
        raise e

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    
    print(f"Starting Template Modification Service on port {port}")
    print(f"Using OpenAI model: {OPENAI_MODEL}")
    
    app.run(host='0.0.0.0', port=port, debug=True)