import React, { useEffect, useState } from 'react';

interface TemplateSelectionProps {
  selectedTemplate: string | null;
  onSelectTemplate: (template: string) => void;
  onNext: () => void;
}

// In a real app, this would be fetched from an API
const MOCK_TEMPLATES = [
  { id: 'standard_invoice', name: 'Standard Invoice', description: 'Basic invoice template' },
  { id: 'oto_box_label', name: 'Box Label', description: 'Standard box label template' },
  { id: 'akg-b2b-invoice', name: 'B2B Invoice', description: 'Business to business invoice' },
  { id: 'noon_shipping_label_template', name: 'Shipping Label', description: 'Standard shipping label' },
  { id: 'fknits-noon-invoice', name: 'Noon Invoice', description: 'Noon marketplace invoice' },
  { id: 'uspl-einvoice-template', name: 'E-Invoice Template', description: 'Electronic invoice format' },
  { id: 'miniklub-invoice', name: 'Miniklub Invoice', description: 'Miniklub branded invoice' },
  { id: 'nykaa_invoice_template', name: 'Nykaa Invoice', description: 'Nykaa marketplace invoice' },
];

const TemplateSelection: React.FC<TemplateSelectionProps> = ({
  selectedTemplate,
  onSelectTemplate,
  onNext,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [templates, setTemplates] = useState(MOCK_TEMPLATES);

  // Filter templates based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = MOCK_TEMPLATES.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setTemplates(filtered);
    } else {
      setTemplates(MOCK_TEMPLATES);
    }
  }, [searchTerm]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Select a Template</h2>
      
      {/* Search input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input w-full"
        />
      </div>
      
      {/* Templates grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {templates.map((template) => (
          <div 
            key={template.id}
            className={`
              p-4 rounded-xl border-2 cursor-pointer transition-all
              ${selectedTemplate === template.id 
                ? 'border-[#3b82f6] bg-[#2a2a3d]' 
                : 'border-[#4b5563] hover:border-[#6b7280] bg-[#2c2c3e]'
              }
            `}
            onClick={() => onSelectTemplate(template.id)}
          >
            <h3 className="font-medium text-lg">{template.name}</h3>
            <p className="text-[#a0a0a0] text-sm mt-1">{template.description}</p>
          </div>
        ))}
        
        {templates.length === 0 && (
          <div className="col-span-full text-center py-8 text-[#a0a0a0]">
            No templates found matching "{searchTerm}"
          </div>
        )}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-end mt-4">
        <button
          className="btn-primary"
          disabled={!selectedTemplate}
          onClick={onNext}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default TemplateSelection; 