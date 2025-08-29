import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Configuration
const OPENAI_MODEL = "gpt-4o";
const MAX_TOKENS = 8000;
const TEMPERATURE = 0.1;

// System prompt with rules
const SYSTEM_PROMPT = `
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

VERY IMPORTANT: Return the COMPLETE modified template without any truncation. Don't leave anything out.
`;

// Function to save debug files
async function saveDebugFile(content: string, prefix: string, extension: string = ".xml") {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const uniqueId = Math.random().toString(36).substring(2, 10);
  const filename = `${prefix}_${timestamp}_${uniqueId}${extension}`;
  
  // Create debug directory if it doesn't exist
  const debugDir = join(process.cwd(), 'debug_files');
  if (!existsSync(debugDir)) {
    await mkdir(debugDir, { recursive: true });
  }
  
  const filepath = join(debugDir, filename);
  await writeFile(filepath, content, 'utf-8');
  
  console.log(`Debug file saved: ${filepath}`);
  return filepath;
}

// Function to modify template using OpenAI
async function modifyTemplate(templateContent: string, userPrompt: string, apiKey: string) {
  try {
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    console.log(`Template size: ${templateContent.length} characters`);
    console.log(`Using model: ${OPENAI_MODEL}, max tokens: ${MAX_TOKENS}, temperature: ${TEMPERATURE}`);

    // Save system prompt to debug file
    await saveDebugFile(SYSTEM_PROMPT, "system_prompt", ".txt");

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { 
          role: "user", 
          content: `Apply this specific change to the template: ${userPrompt}\n\nTemplate content:\n\n\`\`\`xml\n${templateContent}\n\`\`\`` 
        }
      ],
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
    });

    console.log("OpenAI API call completed successfully");
    console.log(`Usage data: prompt tokens = ${response.usage?.prompt_tokens}, completion tokens = ${response.usage?.completion_tokens}, total tokens = ${response.usage?.total_tokens}`);

    let modifiedTemplate = response.choices[0]?.message?.content || '';
    console.log(`Raw response length: ${modifiedTemplate.length} characters`);

    // Save raw response to debug file
    await saveDebugFile(modifiedTemplate, "raw_response", ".txt");

    // If the response is wrapped in code blocks, extract just the template
    if (modifiedTemplate.includes("```xml") || modifiedTemplate.includes("```")) {
      const codeBlockMatch = modifiedTemplate.match(/```(?:xml)?\n([\s\S]*?)```/);
      if (codeBlockMatch) {
        modifiedTemplate = codeBlockMatch[1];
        console.log(`Extracted content from code blocks, new length: ${modifiedTemplate.length} characters`);
        
        // Save cleaned response to debug file
        await saveDebugFile(modifiedTemplate, "cleaned_response", ".xml");
      }
    }

    const analysis = {
      completion_tokens: response.usage?.completion_tokens || 0,
      prompt_tokens: response.usage?.prompt_tokens || 0,
      total_tokens: response.usage?.total_tokens || 0
    };

    // Save analysis to debug file
    const analysisContent = `Completion Tokens: ${analysis.completion_tokens}\nPrompt Tokens: ${analysis.prompt_tokens}\nTotal Tokens: ${analysis.total_tokens}`;
    await saveDebugFile(analysisContent, "analysis", ".txt");

    // Verify the template isn't severely truncated
    if (modifiedTemplate.length < templateContent.length * 0.5) {
      console.log(`WARNING: Modified template is significantly shorter than original. Original: ${templateContent.length}, Modified: ${modifiedTemplate.length}`);
    } else {
      console.log(`Template modification successful. Original: ${templateContent.length}, Modified: ${modifiedTemplate.length}`);
    }

    return { modifiedTemplate, analysis };
  } catch (error) {
    console.error("ERROR in modify_template:", error);
    
    // Save error to debug file
    const errorContent = `Error: ${error}\n\nStack trace: ${error instanceof Error ? error.stack : 'No stack trace available'}`;
    await saveDebugFile(errorContent, "modify_template_error", ".log");
    
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const templateFile = formData.get('template_file') as File;
    const prompt = formData.get('prompt') as string;
    const apiKey = formData.get('api_key') as string || process.env.OPENAI_API_KEY;

    if (!templateFile) {
      return NextResponse.json({ error: "Template file is required" }, { status: 400 });
    }

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    // Read the file content
    const templateContent = await templateFile.text();
    const originalFilename = templateFile.name;

    console.log(`Original template received: ${templateContent.length} characters`);
    console.log(`Processing prompt: ${prompt}`);

    // Save original template to debug file
    await saveDebugFile(templateContent, "input_template");
    await saveDebugFile(prompt, "prompt", ".txt");

    // Modify template
    const { modifiedTemplate, analysis } = await modifyTemplate(templateContent, prompt, apiKey);

    // Save modified template to debug file
    await saveDebugFile(modifiedTemplate, "output_template");

    console.log(`Modified template length: ${modifiedTemplate.length} characters`);
    console.log(`Template modification analysis: ${JSON.stringify(analysis)}`);

    // Generate the filename for modified template
    const filenameParts = originalFilename.split('.');
    const extension = filenameParts.pop();
    const baseName = filenameParts.join('.');
    const modifiedFilename = `${baseName}_modified.${extension}`;

    // Create response with the modified template
    const response = new NextResponse(modifiedTemplate, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${modifiedFilename}"`,
        'X-Completion-Tokens': analysis.completion_tokens.toString(),
        'X-Prompt-Tokens': analysis.prompt_tokens.toString(),
        'X-Total-Tokens': analysis.total_tokens.toString(),
        'Access-Control-Expose-Headers': 'X-Completion-Tokens, X-Prompt-Tokens, X-Total-Tokens, Content-Disposition'
      }
    });

    return response;

  } catch (error) {
    console.error("ERROR in modify_template_api:", error);
    
    // Save error to debug file
    const errorContent = `Error: ${error}\n\nStack trace: ${error instanceof Error ? error.stack : 'No stack trace available'}`;
    await saveDebugFile(errorContent, "error", ".log");
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }, { status: 500 });
  }
}
