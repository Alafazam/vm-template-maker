# Template Automation UI

A dark-themed, responsive web UI for template automation. This application provides a three-step process:

1. **Select a Template**: Choose from available templates
2. **Enter Prompt**: Provide instructions for generating content
3. **Preview PDF**: View the generated PDF output

## Design

The UI follows modern SaaS dashboard design principles:
- Dark theme with charcoal base (#1e1e2f to #2c2c3e)
- Light grey text (#e0e0e0) with clear visual hierarchy
- Minimal accent colors (blue #3b82f6, green #22c55e)
- Card-based design with rounded corners and soft shadows
- Clean sans-serif fonts (Inter, Roboto)

## Getting Started

### Prerequisites

- Node.js 14.6.0 or newer
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd template-ui
   npm install
   # or
   yarn install
   ```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

```bash
npm run build
# or
yarn build
```

## Folder Structure

```
template-ui/
├── app/              # Next.js app directory
├── components/       # React components
├── styles/           # CSS and styling files
├── public/           # Static assets
└── ...configuration files
``` 