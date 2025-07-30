#!/bin/bash

echo "Installing project dependencies..."
npm install

echo "Installing formidable for API form handling..."
npm install formidable@^3.5.1 @types/formidable --save

echo "Installing form-data for server-side FormData..."
npm install form-data --save

echo "Setup complete. You can now run the application with 'npm run dev'" 