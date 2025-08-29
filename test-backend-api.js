const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testBackendAPI() {
  try {
    console.log('Testing backend PDF generation API...');
    
    // Read a template file
    const templatePath = './templates/oto_box_label.fo.vm';
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // Sample JSON data
    const jsonData = {
      "vendorName": "Fashion Store",
      "currency": "INR",
      "primaryCurrencyUnit": "₹",
      "secondaryCurrencyUnit": "Paise",
      "invoiceOrStockTransferNo": "INV-FY24-12345",
      "invoiceOrStockTransferTime": "Wed Jun 26 17:42:11 IST 2024",
      "orderNo": "ORD123456789",
      "orderTime": "Wed Jun 26 17:42:11 IST 2024",
      "dispatchDate": "Wed Jun 26 17:42:11 IST 2024",
      "deliveryDate": "Wed Jun 26 17:42:11 IST 2024",
      "billingDate": "Wed Jun 26 17:42:11 IST 2024",
      "channelName": "Online Store",
      "channelOrderNo": "OS-123456789",
      "parentOrderNo": "PORD-12345",
      "customerNo": "CUST-98765",
      "fromPartyName": "Fashion Store",
      "toPartyName": "John Doe",
      "fromTaxId": "29AABCF1234A1Z5",
      "toTaxId": "ABCDE1234F",
      "panNo": "ABCDE1234F",
      "fromAddress": {
        "name": "Fashion Store",
        "line1": "456 Commerce Avenue",
        "line2": "Industrial Area",
        "line3": "Phase 2",
        "city": "Bangalore",
        "state": "Karnataka",
        "stateCode": "KA",
        "country": "India",
        "countryCode": "IN",
        "zip": "560002",
        "phone": "1800123456",
        "email": "support@fashionstore.com"
      },
      "billingAddress": {
        "name": "John Doe",
        "line1": "123 Main Street",
        "line2": "Apartment 4B",
        "line3": "",
        "city": "Bangalore",
        "state": "Karnataka",
        "stateCode": "KA",
        "country": "India",
        "countryCode": "IN",
        "zip": "560001",
        "phone": "9876543210",
        "email": "john.doe@example.com"
      },
      "quantity": 3,
      "boxCount": 1,
      "subBaseAmount": 2497.00,
      "subTaxAmount": 449.46,
      "subTotalAmount": 2946.46,
      "finalBaseAmount": 2596.00,
      "finalTaxAmount": 467.28,
      "finalTotalAmount": 3063.28,
      "baseShippingAmount": 99.00,
      "shippingTaxAmount": 17.82,
      "shippingAmount": 116.82,
      "baseCodChargeAmount": 0.00,
      "codChargeTaxAmount": 0.00,
      "codChargeAmount": 0.00,
      "totalAmountCents": "306328",
      "totalAmountInWords": "Three Thousand Sixty Three Rupees and Twenty Eight Paise Only",
      "storeCredits": 0.00,
      "giftCardDiscount": 0.00,
      "itemLines": [
        {
          "vendorSku": "VS-001-ABC",
          "channelSku": "SKU-001-ABC",
          "styleId": "ST001",
          "externalProductId": "EXT123",
          "itemName": "Premium T-Shirt",
          "category": "Apparel",
          "imageUrl": "https://example.com/images/tshirt.jpg",
          "mrp": 699.00,
          "mop": 599.00,
          "discount": 100.00,
          "quantity": 2,
          "weight": 0.25,
          "size": "L",
          "hsnId": "61091000",
          "gstRate": 12.0,
          "baseAmount": 1198.00,
          "taxAmount": 143.76,
          "totalAmount": 1341.76
        }
      ]
    };
    
    // Create FormData
    const formData = new FormData();
    formData.append('templateFile', Buffer.from(templateContent), {
      filename: 'test-template.fo.vm',
      contentType: 'text/plain'
    });
    formData.append('jsonData', JSON.stringify(jsonData));
    
    console.log('Sending request to backend...');
    
    // Call the backend API
    const response = await axios.post(
      'http://localhost:8890/velocity-engine-app/api/render-pdf/template-upload',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        responseType: 'text',
        timeout: 30000
      }
    );
    
    console.log('Response received!');
    console.log('Response status:', response.status);
    console.log('Response data length:', response.data.length);
    console.log('First 100 chars of response:', response.data.substring(0, 100));
    
    // Check if it looks like base64
    const isBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(response.data);
    console.log('Response looks like base64:', isBase64);
    
    if (isBase64 && response.data.length > 100) {
      // Save the PDF
      const pdfBuffer = Buffer.from(response.data, 'base64');
      fs.writeFileSync('test-output.pdf', pdfBuffer);
      console.log('PDF saved as test-output.pdf');
      
      // Check file size
      const stats = fs.statSync('test-output.pdf');
      console.log('PDF file size:', stats.size, 'bytes');
      
      // Check if it's a valid PDF by reading the first few bytes
      const pdfHeader = pdfBuffer.toString('ascii', 0, 4);
      console.log('PDF header:', pdfHeader);
      
      if (pdfHeader === '%PDF') {
        console.log('✅ Valid PDF generated!');
      } else {
        console.log('❌ Invalid PDF - wrong header:', pdfHeader);
      }
    } else {
      console.log('❌ Response does not appear to be valid base64 PDF data');
    }
    
  } catch (error) {
    console.error('Error testing backend API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testBackendAPI(); 