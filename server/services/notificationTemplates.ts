/**
 * Notification Template System
 * Provides customizable templates for email and SMS notifications
 */

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms';
  subject?: string; // For email
  body: string;
  variables: string[]; // List of variables like {{animalId}}, {{farmName}}
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariables {
  [key: string]: string | number | boolean | Date;
}

/**
 * Default notification templates
 */
export const DEFAULT_TEMPLATES: Record<string, Record<string, NotificationTemplate>> = {
  breeding_reminder: {
    email: {
      id: 'breeding_reminder_email',
      name: 'Breeding Reminder - Email',
      type: 'email',
      subject: 'Breeding Reminder for {{animalName}} ({{animalId}})',
      body: `
Dear {{farmerName}},

This is a reminder that {{animalName}} (ID: {{animalId}}) is due for breeding.

**Animal Details:**
- Name: {{animalName}}
- ID: {{animalId}}
- Breed: {{breed}}
- Current Age: {{age}} months
- Last Breeding: {{lastBreedingDate}}
- Days Since Last Breeding: {{daysSinceLastBreeding}}

**Farm Information:**
- Farm Name: {{farmName}}
- Location: {{location}}

Please ensure proper breeding protocols are followed. If you have any questions, please contact your veterinarian.

Best regards,
FarmKonnect Team
      `,
      variables: [
        'farmerName',
        'animalName',
        'animalId',
        'breed',
        'age',
        'lastBreedingDate',
        'daysSinceLastBreeding',
        'farmName',
        'location',
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    sms: {
      id: 'breeding_reminder_sms',
      name: 'Breeding Reminder - SMS',
      type: 'sms',
      body: `{{farmerName}}, {{animalName}} ({{animalId}}) is due for breeding. Days since last: {{daysSinceLastBreeding}}. Contact your vet. - FarmKonnect`,
      variables: ['farmerName', 'animalName', 'animalId', 'daysSinceLastBreeding'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  vaccination_reminder: {
    email: {
      id: 'vaccination_reminder_email',
      name: 'Vaccination Reminder - Email',
      type: 'email',
      subject: 'Vaccination Reminder for {{animalName}} ({{animalId}})',
      body: `
Dear {{farmerName}},

This is a reminder that {{animalName}} (ID: {{animalId}}) is due for vaccination.

**Animal Details:**
- Name: {{animalName}}
- ID: {{animalId}}
- Species: {{species}}
- Age: {{age}} months
- Last Vaccination: {{lastVaccinationDate}}
- Vaccine Type: {{vaccineType}}

**Farm Information:**
- Farm Name: {{farmName}}
- Veterinarian: {{veterinarianName}}
- Contact: {{veterinarianContact}}

Please schedule an appointment with your veterinarian as soon as possible to ensure your animal's health and protection.

Best regards,
FarmKonnect Team
      `,
      variables: [
        'farmerName',
        'animalName',
        'animalId',
        'species',
        'age',
        'lastVaccinationDate',
        'vaccineType',
        'farmName',
        'veterinarianName',
        'veterinarianContact',
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    sms: {
      id: 'vaccination_reminder_sms',
      name: 'Vaccination Reminder - SMS',
      type: 'sms',
      body: `{{farmerName}}, {{animalName}} ({{animalId}}) is due for {{vaccineType}} vaccination. Last: {{lastVaccinationDate}}. Schedule now. - FarmKonnect`,
      variables: ['farmerName', 'animalName', 'animalId', 'vaccineType', 'lastVaccinationDate'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  harvest_reminder: {
    email: {
      id: 'harvest_reminder_email',
      name: 'Harvest Reminder - Email',
      type: 'email',
      subject: 'Harvest Reminder for {{cropName}} - {{farmName}}',
      body: `
Dear {{farmerName}},

This is a reminder that your {{cropName}} crop is ready for harvest.

**Crop Details:**
- Crop Name: {{cropName}}
- Crop ID: {{cropId}}
- Planting Date: {{plantingDate}}
- Expected Harvest Date: {{expectedHarvestDate}}
- Days to Harvest: {{daysToHarvest}}
- Estimated Yield: {{estimatedYield}} {{yieldUnit}}
- Field: {{fieldName}}

**Farm Information:**
- Farm Name: {{farmName}}
- Location: {{location}}
- Total Area: {{totalArea}} {{areaUnit}}

**Weather Forecast:**
- Current Condition: {{weatherCondition}}
- Temperature: {{temperature}}°C
- Rainfall Expected: {{rainfallExpected}}mm

Please prepare your harvesting equipment and schedule your harvest accordingly. Check the weather forecast before proceeding.

Best regards,
FarmKonnect Team
      `,
      variables: [
        'farmerName',
        'cropName',
        'cropId',
        'plantingDate',
        'expectedHarvestDate',
        'daysToHarvest',
        'estimatedYield',
        'yieldUnit',
        'fieldName',
        'farmName',
        'location',
        'totalArea',
        'areaUnit',
        'weatherCondition',
        'temperature',
        'rainfallExpected',
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    sms: {
      id: 'harvest_reminder_sms',
      name: 'Harvest Reminder - SMS',
      type: 'sms',
      body: `{{farmerName}}, {{cropName}} ready for harvest in {{daysToHarvest}} days. Est. yield: {{estimatedYield}} {{yieldUnit}}. - FarmKonnect`,
      variables: ['farmerName', 'cropName', 'daysToHarvest', 'estimatedYield', 'yieldUnit'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  stock_alert: {
    email: {
      id: 'stock_alert_email',
      name: 'Stock Alert - Email',
      type: 'email',
      subject: 'Low Stock Alert: {{itemName}} - {{farmName}}',
      body: `
Dear {{farmerName}},

This is an alert that {{itemName}} stock is running low on your farm.

**Stock Details:**
- Item Name: {{itemName}}
- Item ID: {{itemId}}
- Current Stock: {{currentStock}} {{unit}}
- Minimum Threshold: {{minimumThreshold}} {{unit}}
- Stock Status: {{stockStatus}}
- Last Updated: {{lastUpdated}}

**Supplier Information:**
- Supplier: {{supplierName}}
- Contact: {{supplierContact}}
- Lead Time: {{leadTime}} days

**Farm Information:**
- Farm Name: {{farmName}}
- Location: {{location}}

Please place an order to replenish your stock. Click the link below to view available suppliers:
{{supplierLink}}

Best regards,
FarmKonnect Team
      `,
      variables: [
        'farmerName',
        'itemName',
        'itemId',
        'currentStock',
        'unit',
        'minimumThreshold',
        'stockStatus',
        'lastUpdated',
        'supplierName',
        'supplierContact',
        'leadTime',
        'farmName',
        'location',
        'supplierLink',
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    sms: {
      id: 'stock_alert_sms',
      name: 'Stock Alert - SMS',
      type: 'sms',
      body: `{{farmerName}}, {{itemName}} stock low: {{currentStock}}/{{minimumThreshold}} {{unit}}. Reorder now. - FarmKonnect`,
      variables: ['farmerName', 'itemName', 'currentStock', 'minimumThreshold', 'unit'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  weather_alert: {
    email: {
      id: 'weather_alert_email',
      name: 'Weather Alert - Email',
      type: 'email',
      subject: 'Weather Alert: {{alertType}} - {{farmName}}',
      body: `
Dear {{farmerName}},

This is a weather alert for your farm.

**Alert Details:**
- Alert Type: {{alertType}}
- Severity: {{severity}}
- Description: {{description}}
- Time: {{alertTime}}

**Weather Forecast:**
- Current Temperature: {{currentTemperature}}°C
- Wind Speed: {{windSpeed}} km/h
- Humidity: {{humidity}}%
- Rainfall Expected: {{rainfallExpected}}mm
- Duration: {{duration}}

**Recommended Actions:**
{{recommendedActions}}

**Farm Information:**
- Farm Name: {{farmName}}
- Location: {{location}}

Please take necessary precautions to protect your crops and livestock.

Best regards,
FarmKonnect Team
      `,
      variables: [
        'farmerName',
        'alertType',
        'farmName',
        'severity',
        'description',
        'alertTime',
        'currentTemperature',
        'windSpeed',
        'humidity',
        'rainfallExpected',
        'duration',
        'recommendedActions',
        'location',
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    sms: {
      id: 'weather_alert_sms',
      name: 'Weather Alert - SMS',
      type: 'sms',
      body: `{{farmerName}}, {{alertType}} alert for {{farmName}}: {{description}}. Severity: {{severity}}. - FarmKonnect`,
      variables: ['farmerName', 'alertType', 'farmName', 'description', 'severity'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  order_update: {
    email: {
      id: 'order_update_email',
      name: 'Order Update - Email',
      type: 'email',
      subject: 'Order {{orderId}} - {{orderStatus}}',
      body: `
Dear {{farmerName}},

Your order has been updated.

**Order Details:**
- Order ID: {{orderId}}
- Status: {{orderStatus}}
- Order Date: {{orderDate}}
- Expected Delivery: {{expectedDelivery}}

**Items Ordered:**
{{itemsList}}

**Tracking Information:**
- Tracking Number: {{trackingNumber}}
- Carrier: {{carrier}}
- Track Order: {{trackingLink}}

**Total Amount:** {{totalAmount}} {{currency}}

If you have any questions about your order, please contact our support team.

Best regards,
FarmKonnect Team
      `,
      variables: [
        'farmerName',
        'orderId',
        'orderStatus',
        'orderDate',
        'expectedDelivery',
        'itemsList',
        'trackingNumber',
        'carrier',
        'trackingLink',
        'totalAmount',
        'currency',
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    sms: {
      id: 'order_update_sms',
      name: 'Order Update - SMS',
      type: 'sms',
      body: `{{farmerName}}, Order {{orderId}} is {{orderStatus}}. Delivery: {{expectedDelivery}}. Track: {{trackingLink}} - FarmKonnect`,
      variables: ['farmerName', 'orderId', 'orderStatus', 'expectedDelivery', 'trackingLink'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
};

/**
 * Render a template with variables
 */
export function renderTemplate(
  template: NotificationTemplate,
  variables: TemplateVariables
): { subject?: string; body: string } {
  let body = template.body;
  let subject = template.subject || '';

  // Replace all variables in the template
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    const stringValue = String(value);

    body = body.replace(new RegExp(placeholder, 'g'), stringValue);
    subject = subject.replace(new RegExp(placeholder, 'g'), stringValue);
  }

  return {
    subject: subject || undefined,
    body,
  };
}

/**
 * Get template by notification type and channel
 */
export function getTemplate(
  notificationType: string,
  channel: 'email' | 'sms'
): NotificationTemplate | null {
  const templates = DEFAULT_TEMPLATES[notificationType];
  if (!templates) {
    return null;
  }

  return templates[channel] || null;
}

/**
 * Validate template variables
 */
export function validateTemplateVariables(
  template: NotificationTemplate,
  variables: TemplateVariables
): { valid: boolean; missingVariables: string[] } {
  const missingVariables: string[] = [];

  for (const variable of template.variables) {
    if (!(variable in variables)) {
      missingVariables.push(variable);
    }
  }

  return {
    valid: missingVariables.length === 0,
    missingVariables,
  };
}

/**
 * Get all available templates
 */
export function getAllTemplates(): NotificationTemplate[] {
  const allTemplates: NotificationTemplate[] = [];

  for (const notificationType in DEFAULT_TEMPLATES) {
    const typeTemplates = DEFAULT_TEMPLATES[notificationType];
    for (const channel in typeTemplates) {
      allTemplates.push(typeTemplates[channel]);
    }
  }

  return allTemplates;
}

/**
 * Get templates by notification type
 */
export function getTemplatesByType(notificationType: string): NotificationTemplate[] {
  const templates = DEFAULT_TEMPLATES[notificationType];
  if (!templates) {
    return [];
  }

  return Object.values(templates);
}

/**
 * Create custom template
 */
export function createCustomTemplate(
  id: string,
  name: string,
  type: 'email' | 'sms',
  body: string,
  subject?: string,
  variables?: string[]
): NotificationTemplate {
  // Extract variables from body if not provided
  const extractedVariables = variables || extractVariablesFromTemplate(body);
  if (subject) {
    extractedVariables.push(...extractVariablesFromTemplate(subject));
  }

  // Remove duplicates
  const uniqueVariables = [...new Set(extractedVariables)];

  return {
    id,
    name,
    type,
    subject,
    body,
    variables: uniqueVariables,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Extract variables from template string
 */
export function extractVariablesFromTemplate(template: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    variables.push(match[1]);
  }

  return [...new Set(variables)]; // Remove duplicates
}
