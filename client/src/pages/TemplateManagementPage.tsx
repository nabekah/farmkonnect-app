import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Eye, Edit2, Save, X, Plus, Mail, MessageSquare } from 'lucide-react';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms';
  subject?: string;
  body: string;
  variables: string[];
}

interface TemplatePreview {
  subject?: string;
  body: string;
}

const DEFAULT_TEMPLATES: Record<string, Record<string, NotificationTemplate>> = {
  breeding_reminder: {
    email: {
      id: 'breeding_reminder_email',
      name: 'Breeding Reminder - Email',
      type: 'email',
      subject: 'Breeding Reminder for {{animalName}} ({{animalId}})',
      body: `Dear {{farmerName}},

This is a reminder that {{animalName}} (ID: {{animalId}}) is due for breeding.

Animal Details:
- Name: {{animalName}}
- ID: {{animalId}}
- Breed: {{breed}}
- Current Age: {{age}} months
- Last Breeding: {{lastBreedingDate}}

Please ensure proper breeding protocols are followed.

Best regards,
FarmKonnect Team`,
      variables: ['farmerName', 'animalName', 'animalId', 'breed', 'age', 'lastBreedingDate'],
    },
    sms: {
      id: 'breeding_reminder_sms',
      name: 'Breeding Reminder - SMS',
      type: 'sms',
      body: `{{farmerName}}, {{animalName}} ({{animalId}}) is due for breeding. Contact your vet. - FarmKonnect`,
      variables: ['farmerName', 'animalName', 'animalId'],
    },
  },
  vaccination_reminder: {
    email: {
      id: 'vaccination_reminder_email',
      name: 'Vaccination Reminder - Email',
      type: 'email',
      subject: 'Vaccination Reminder for {{animalName}} ({{animalId}})',
      body: `Dear {{farmerName}},

This is a reminder that {{animalName}} (ID: {{animalId}}) is due for {{vaccineType}} vaccination.

Animal Details:
- Name: {{animalName}}
- ID: {{animalId}}
- Species: {{species}}
- Age: {{age}} months
- Last Vaccination: {{lastVaccinationDate}}

Please schedule an appointment with your veterinarian.

Best regards,
FarmKonnect Team`,
      variables: ['farmerName', 'animalName', 'animalId', 'vaccineType', 'species', 'age', 'lastVaccinationDate'],
    },
    sms: {
      id: 'vaccination_reminder_sms',
      name: 'Vaccination Reminder - SMS',
      type: 'sms',
      body: `{{farmerName}}, {{animalName}} is due for {{vaccineType}} vaccination. Schedule now. - FarmKonnect`,
      variables: ['farmerName', 'animalName', 'vaccineType'],
    },
  },
  harvest_reminder: {
    email: {
      id: 'harvest_reminder_email',
      name: 'Harvest Reminder - Email',
      type: 'email',
      subject: 'Harvest Reminder for {{cropName}} - {{farmName}}',
      body: `Dear {{farmerName}},

Your {{cropName}} crop is ready for harvest.

Crop Details:
- Crop Name: {{cropName}}
- Planting Date: {{plantingDate}}
- Expected Harvest Date: {{expectedHarvestDate}}
- Estimated Yield: {{estimatedYield}} {{yieldUnit}}
- Field: {{fieldName}}

Weather Forecast:
- Current Condition: {{weatherCondition}}
- Temperature: {{temperature}}°C

Please prepare your harvesting equipment.

Best regards,
FarmKonnect Team`,
      variables: ['farmerName', 'cropName', 'farmName', 'plantingDate', 'expectedHarvestDate', 'estimatedYield', 'yieldUnit', 'fieldName', 'weatherCondition', 'temperature'],
    },
    sms: {
      id: 'harvest_reminder_sms',
      name: 'Harvest Reminder - SMS',
      type: 'sms',
      body: `{{farmerName}}, {{cropName}} ready for harvest in {{daysToHarvest}} days. Est. yield: {{estimatedYield}} {{yieldUnit}}. - FarmKonnect`,
      variables: ['farmerName', 'cropName', 'daysToHarvest', 'estimatedYield', 'yieldUnit'],
    },
  },
};

export default function TemplateManagementPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('templates');

  const allTemplates = useMemo(() => {
    const templates: NotificationTemplate[] = [];
    for (const notificationType in DEFAULT_TEMPLATES) {
      const typeTemplates = DEFAULT_TEMPLATES[notificationType];
      for (const channel in typeTemplates) {
        templates.push(typeTemplates[channel]);
      }
    }
    return templates;
  }, []);

  const renderTemplate = (template: NotificationTemplate, variables: Record<string, string>): TemplatePreview => {
    let body = template.body;
    let subject = template.subject || '';

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      body = body.replace(new RegExp(placeholder, 'g'), value || `[${key}]`);
      subject = subject.replace(new RegExp(placeholder, 'g'), value || `[${key}]`);
    }

    return { subject: subject || undefined, body };
  };

  const handleSelectTemplate = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setEditingTemplate(null);
    // Initialize preview data with sample values
    const sampleData: Record<string, string> = {};
    template.variables.forEach((variable) => {
      sampleData[variable] = `Sample ${variable}`;
    });
    setPreviewData(sampleData);
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate({ ...template });
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      // In a real app, this would save to the database
      console.log('Saving template:', editingTemplate);
      setSelectedTemplate(editingTemplate);
      setEditingTemplate(null);
    }
  };

  const handleCopyTemplate = (template: NotificationTemplate) => {
    const templateText = `
Template: ${template.name}
Type: ${template.type}
${template.subject ? `Subject: ${template.subject}` : ''}
Body: ${template.body}
Variables: ${template.variables.join(', ')}
    `.trim();

    navigator.clipboard.writeText(templateText);
    alert('Template copied to clipboard!');
  };

  const preview = selectedTemplate ? renderTemplate(selectedTemplate, previewData) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Notification Templates</h1>
          <p className="text-slate-600">Manage and customize notification templates for all notification types</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="preview">Preview & Test</TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Template List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Available Templates</CardTitle>
                    <CardDescription>Select a template to view or edit</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                    {allTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleSelectTemplate(template)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          selectedTemplate?.id === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-slate-900">{template.name}</p>
                            <p className="text-xs text-slate-500">{template.variables.length} variables</p>
                          </div>
                          {template.type === 'email' ? (
                            <Mail className="w-4 h-4 text-blue-500" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Template Details */}
              <div className="lg:col-span-2">
                {selectedTemplate ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{selectedTemplate.name}</CardTitle>
                          <CardDescription>
                            <Badge className="mt-2">
                              {selectedTemplate.type === 'email' ? 'Email' : 'SMS'}
                            </Badge>
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyTemplate(selectedTemplate)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTemplate(selectedTemplate)}
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedTemplate.subject && (
                        <div>
                          <label className="text-sm font-medium text-slate-700">Subject</label>
                          <Input value={selectedTemplate.subject} readOnly className="mt-1" />
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-slate-700">Body</label>
                        <Textarea value={selectedTemplate.body} readOnly className="mt-1 h-32" />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700">Variables</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedTemplate.variables.map((variable) => (
                            <Badge key={variable} variant="secondary">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="flex items-center justify-center h-64">
                    <CardContent className="text-center">
                      <p className="text-slate-500">Select a template to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            {selectedTemplate ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Variable Input */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sample Data</CardTitle>
                    <CardDescription>Enter sample values for template variables</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedTemplate.variables.map((variable) => (
                      <div key={variable}>
                        <label className="text-sm font-medium text-slate-700">{variable}</label>
                        <Input
                          value={previewData[variable] || ''}
                          onChange={(e) =>
                            setPreviewData({ ...previewData, [variable]: e.target.value })
                          }
                          placeholder={`Enter ${variable}`}
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Preview</CardTitle>
                    <CardDescription>How the notification will look</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                    {preview && (
                      <>
                        {preview.subject && (
                          <div>
                            <label className="text-sm font-medium text-slate-700">Subject</label>
                            <div className="mt-1 p-3 bg-slate-50 rounded border border-slate-200">
                              <p className="text-sm text-slate-900">{preview.subject}</p>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium text-slate-700">Body</label>
                          <div className="mt-1 p-3 bg-slate-50 rounded border border-slate-200">
                            <p className="text-sm text-slate-900 whitespace-pre-wrap">{preview.body}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="flex items-center justify-center h-64">
                <CardContent className="text-center">
                  <p className="text-slate-500">Select a template to preview</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
