'use client';

import React, { useState } from 'react';
import axios from 'axios';

const sampleData = {
  invoice: {
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
      },
      {
        "vendorSku": "VS-002-DEF",
        "channelSku": "SKU-002-DEF",
        "styleId": "ST002",
        "externalProductId": "EXT456",
        "itemName": "Denim Jeans",
        "category": "Apparel",
        "imageUrl": "https://example.com/images/jeans.jpg",
        "mrp": 1299.00,
        "mop": 1099.00,
        "discount": 200.00,
        "quantity": 1,
        "weight": 0.5,
        "size": "32",
        "hsnId": "62034300",
        "gstRate": 12.0,
        "baseAmount": 1099.00,
        "taxAmount": 131.88,
        "totalAmount": 1230.88
      }
    ]
  },
  label: {
    "awbNo": "AWB123456789",
    "orderNo": "ORD123456789",
    "orderDate": "Mon Jan 14 14:22:33 IST 2024",
    "invoiceDate": "Mon Jan 15 10:30:45 IST 2024",
    "paymentType": "COD",
    "codAmount": "3063.28",
    "currencyCode": "INR",
    "fromAddress": {
      "firstName": "Fashion",
      "middleName": "",
      "lastName": "Store",
      "street1": "456 Commerce Avenue",
      "street2": "Industrial Area",
      "street3": "Phase 2",
      "city": "Bangalore",
      "phone": "1800123456"
    },
    "toAddress": {
      "firstName": "John",
      "middleName": "",
      "lastName": "Doe",
      "street1": "123 Main Street",
      "street2": "Apartment 4B",
      "street3": "",
      "city": "Bangalore",
      "phone": "9876543210"
    },
    "orderValue": "3063.28",
    "shipmentWeight": "1.25 kg",
    "boxSerialNo": "1",
    "totalBoxCount": "1",
    "transporterName": "Express Logistics",
    "orderLineItemList": [
      {
        "skuName": "Premium T-Shirt",
        "quantity": 2,
        "barcode": "8901234567890"
      },
      {
        "skuName": "Denim Jeans",
        "quantity": 1,
        "barcode": "8901234567891"
      }
    ],
    "templateAttributesData": {
      "box_timestamp": "Mon Jan 15 10:30:45 IST 2024"
    }
  }
};

export default function TestPage() {
  const [selectedDataType, setSelectedDataType] = useState<string>('invoice');
  const [jsonData, setJsonData] = useState(JSON.stringify(sampleData.invoice, null, 2));
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDataTypeChange = (dataType: string) => {
    setSelectedDataType(dataType);
    setJsonData(JSON.stringify(sampleData[dataType as keyof typeof sampleData], null, 2));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTemplateFile(file);
      setError(null);
    }
  };

  const handleGeneratePdf = async () => {
    if (!templateFile) {
      setError('Please upload a template file');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setPdfData(null);

      // Validate JSON
      const parsedJson = JSON.parse(jsonData);

      // Create FormData
      const formData = new FormData();
      formData.append('templateFile', templateFile);
      formData.append('jsonData', JSON.stringify(parsedJson));

      // Call our API route
      const response = await axios.post('/api/generate-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Convert base64 to PDF blob
      const pdfBlob = new Blob([Buffer.from(response.data.pdfData, 'base64')], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfData(pdfUrl);

    } catch (err: any) {
      console.error('Error generating PDF:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate PDF');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e2f] text-[#e0e0e0] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Template Testing Tool</h1>
        
        {/* Data Type Selector */}
        <div className="mb-6">
          <div className="bg-[#2c2c3e] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Data Type Selection</h2>
            <div className="flex items-center space-x-4">
              <label className="text-gray-300 font-medium">Select Data Type:</label>
              <select
                value={selectedDataType}
                onChange={(e) => handleDataTypeChange(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="invoice">Invoice Data</option>
                <option value="label">Shipping Label Data</option>
              </select>
              <div className="text-sm text-gray-400">
                <span className="font-medium">Invoice Data:</span> Contains fields like vendorName, invoiceOrStockTransferNo, fromAddress, itemLines, etc.
              </div>
              <div className="text-sm text-gray-400">
                <span className="font-medium">Label Data:</span> Contains fields like awbNo, orderNo, fromAddress.firstName, toAddress, etc.
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Side - JSON Editor */}
          <div className="bg-[#2c2c3e] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">JSON Data</h2>
            <textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              className="w-full h-96 bg-black text-white border border-gray-600 rounded-md p-4 font-mono text-sm resize-none"
              placeholder="Enter JSON data..."
            />
          </div>

          {/* Right Side - Template Upload */}
          <div className="bg-[#2c2c3e] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Template Upload</h2>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".fo.vm,.xml"
                onChange={handleFileChange}
                className="hidden"
                id="template-upload"
              />
              <label htmlFor="template-upload" className="cursor-pointer">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="text-lg font-medium">
                  {templateFile ? templateFile.name : 'Click to upload template file'}
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  Supports .fo.vm and .xml files
                </div>
              </label>
            </div>
            
            {templateFile && (
              <div className="mt-4 p-3 bg-green-900/20 border border-green-600 rounded-md">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-400">{templateFile.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center mb-6">
          <button
            onClick={handleGeneratePdf}
            disabled={!templateFile || isLoading}
            className={`px-8 py-3 rounded-lg font-semibold text-lg ${
              !templateFile || isLoading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Generating PDF...' : 'Generate PDF'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded-md">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* PDF Display */}
        {pdfData && (
          <div className="bg-[#2c2c3e] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Generated PDF</h2>
            <div className="border border-gray-600 rounded-lg overflow-hidden">
              <iframe
                src={pdfData}
                className="w-full h-96"
                title="Generated PDF"
              />
            </div>
            <div className="mt-4 text-center">
              <a
                href={pdfData}
                download="generated-template.pdf"
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 