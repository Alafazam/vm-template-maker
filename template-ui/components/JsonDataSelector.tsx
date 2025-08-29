import React, { useState } from 'react';

interface JsonDataSelectorProps {
  selectedDataType: string;
  onDataTypeChange: (dataType: string) => void;
  jsonData: string;
  onJsonDataChange: (jsonData: string) => void;
}

const JsonDataSelector: React.FC<JsonDataSelectorProps> = ({
  selectedDataType,
  onDataTypeChange
}) => {
  const [jsonData, setJsonData] = useState<string>('');

  // Sample JSON data for different types
  const sampleData = {
    invoice: {
      "data": {
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
            "gstRate": 12,
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
            "gstRate": 12,
            "baseAmount": 1099.00,
            "taxAmount": 131.88,
            "totalAmount": 1230.88
          }
        ]
      }
    },
    label: {
      "data": {
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
    }
  };

  const handleDataTypeChange = (dataType: string) => {
    onDataTypeChange(dataType);
    // Update the JSON data when type changes
    setJsonData(JSON.stringify(sampleData[dataType as keyof typeof sampleData], null, 2));
  };

  const handleJsonDataChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonData(event.target.value);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-200">JSON Data Configuration</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Data Type
        </label>
        <select
          value={selectedDataType}
          onChange={(e) => handleDataTypeChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="invoice">Invoice Data</option>
          <option value="label">Shipping Label Data</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          JSON Data
        </label>
        <textarea
          value={jsonData}
          onChange={handleJsonDataChange}
          placeholder="Enter JSON data or select a data type above"
          className="w-full h-64 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="text-xs text-gray-400 mb-4">
        <p><strong>Invoice Data:</strong> Contains fields like vendorName, invoiceOrStockTransferNo, fromAddress, itemLines, etc.</p>
        <p><strong>Label Data:</strong> Contains fields like awbNo, orderNo, fromAddress.firstName, toAddress, etc.</p>
      </div>
    </div>
  );
};

export default JsonDataSelector; 