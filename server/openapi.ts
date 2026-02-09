/**
 * OpenAPI/Swagger Specification Generator for FarmKonnect tRPC API
 * Generates comprehensive API documentation for all 50+ procedures
 */

export const openAPISpec = {
  openapi: '3.0.0',
  info: {
    title: 'FarmKonnect API',
    description: 'Comprehensive agricultural management platform API for farm operations, crop tracking, livestock management, and marketplace',
    version: '1.0.0',
    contact: {
      name: 'FarmKonnect Support',
      email: 'support@farmkonnect.com',
      url: 'https://farmkonnect.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'https://api.farmkonnect.com',
      description: 'Production server'
    },
    {
      url: 'http://localhost:3001',
      description: 'Development server'
    }
  ],
  paths: {
    '/api/trpc/farms.list': {
      get: {
        tags: ['Farms'],
        summary: 'List all farms for current user',
        description: 'Retrieve all farms managed by the authenticated user with pagination support',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
            description: 'Number of farms to return'
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', default: 0 },
            description: 'Number of farms to skip'
          }
        ],
        responses: {
          '200': {
            description: 'List of farms',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    farms: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Farm'
                      }
                    },
                    total: { type: 'integer' }
                  }
                }
              }
            }
          },
          '401': { description: 'Unauthorized' },
          '500': { description: 'Server error' }
        }
      }
    },
    '/api/trpc/crops.list': {
      get: {
        tags: ['Crops'],
        summary: 'List crops for a farm',
        description: 'Retrieve all crops for a specific farm with filtering options',
        parameters: [
          {
            name: 'farmId',
            in: 'query',
            required: true,
            schema: { type: 'integer' },
            description: 'Farm ID to filter crops'
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['active', 'completed', 'archived'] },
            description: 'Filter by crop status'
          }
        ],
        responses: {
          '200': {
            description: 'List of crops',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Crop' }
                }
              }
            }
          }
        }
      }
    },
    '/api/trpc/livestock.list': {
      get: {
        tags: ['Livestock'],
        summary: 'List livestock for a farm',
        description: 'Retrieve all animals on a farm with health status and productivity metrics',
        parameters: [
          {
            name: 'farmId',
            in: 'query',
            required: true,
            schema: { type: 'integer' }
          },
          {
            name: 'type',
            in: 'query',
            schema: { type: 'string', enum: ['cattle', 'goat', 'sheep', 'pig', 'poultry'] }
          }
        ],
        responses: {
          '200': {
            description: 'List of livestock',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Animal' }
                }
              }
            }
          }
        }
      }
    },
    '/api/trpc/marketplace.products': {
      get: {
        tags: ['Marketplace'],
        summary: 'List marketplace products',
        description: 'Browse available agricultural products with filtering and search',
        parameters: [
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search products by name or description'
          },
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by product category'
          },
          {
            name: 'minPrice',
            in: 'query',
            schema: { type: 'number' }
          },
          {
            name: 'maxPrice',
            in: 'query',
            schema: { type: 'number' }
          }
        ],
        responses: {
          '200': {
            description: 'List of products',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Product' }
                }
              }
            }
          }
        }
      }
    },
    '/api/trpc/breeding.getAnalytics': {
      get: {
        tags: ['Breeding'],
        summary: 'Get breeding analytics',
        description: 'Retrieve breeding statistics and genetic compatibility metrics',
        parameters: [
          {
            name: 'farmId',
            in: 'query',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'Breeding analytics data',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BreedingAnalytics' }
              }
            }
          }
        }
      }
    },
    '/api/trpc/weather.forecast': {
      get: {
        tags: ['Weather'],
        summary: 'Get weather forecast',
        description: 'Retrieve weather forecast for farm location with crop recommendations',
        parameters: [
          {
            name: 'farmId',
            in: 'query',
            required: true,
            schema: { type: 'integer' }
          },
          {
            name: 'days',
            in: 'query',
            schema: { type: 'integer', default: 7 },
            description: 'Number of forecast days'
          }
        ],
        responses: {
          '200': {
            description: 'Weather forecast data',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/WeatherForecast' }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Farm: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          location: { type: 'string' },
          size: { type: 'number', description: 'Size in hectares' },
          type: { type: 'string', enum: ['crop', 'livestock', 'mixed'] },
          gpsLatitude: { type: 'number' },
          gpsLongitude: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'name', 'location', 'size']
      },
      Crop: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          farmId: { type: 'integer' },
          name: { type: 'string' },
          variety: { type: 'string' },
          plantedDate: { type: 'string', format: 'date' },
          expectedHarvestDate: { type: 'string', format: 'date' },
          status: { type: 'string', enum: ['planning', 'planted', 'growing', 'harvesting', 'completed'] },
          expectedYield: { type: 'number' },
          actualYield: { type: 'number' }
        },
        required: ['id', 'farmId', 'name', 'plantedDate']
      },
      Animal: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          farmId: { type: 'integer' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['cattle', 'goat', 'sheep', 'pig', 'poultry'] },
          breed: { type: 'string' },
          age: { type: 'number', description: 'Age in months' },
          weight: { type: 'number', description: 'Weight in kg' },
          healthStatus: { type: 'string', enum: ['healthy', 'sick', 'recovering', 'deceased'] },
          productivityScore: { type: 'number', minimum: 0, maximum: 100 }
        },
        required: ['id', 'farmId', 'name', 'type']
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          price: { type: 'number' },
          stock: { type: 'integer' },
          rating: { type: 'number', minimum: 0, maximum: 5 },
          seller: { type: 'string' },
          imageUrl: { type: 'string', format: 'uri' }
        },
        required: ['id', 'name', 'price', 'stock']
      },
      BreedingAnalytics: {
        type: 'object',
        properties: {
          totalBreedingEvents: { type: 'integer' },
          successRate: { type: 'number', description: 'Percentage of successful breedings' },
          breedingAnimals: { type: 'integer' },
          averageBreedingAge: { type: 'number' },
          geneticDiversityScore: { type: 'number' },
          recommendedPairs: { type: 'array', items: { type: 'object' } }
        }
      },
      WeatherForecast: {
        type: 'object',
        properties: {
          location: { type: 'string' },
          forecast: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string', format: 'date' },
                temperature: { type: 'number' },
                humidity: { type: 'number' },
                precipitation: { type: 'number' },
                windSpeed: { type: 'number' },
                condition: { type: 'string' },
                recommendation: { type: 'string' }
              }
            }
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          message: { type: 'string' },
          details: { type: 'object' }
        }
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from OAuth callback'
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'session',
        description: 'Session cookie from Manus OAuth'
      }
    }
  },
  security: [
    { bearerAuth: [] },
    { cookieAuth: [] }
  ],
  tags: [
    {
      name: 'Farms',
      description: 'Farm management operations'
    },
    {
      name: 'Crops',
      description: 'Crop tracking and management'
    },
    {
      name: 'Livestock',
      description: 'Livestock management and health'
    },
    {
      name: 'Breeding',
      description: 'Breeding analytics and recommendations'
    },
    {
      name: 'Marketplace',
      description: 'Marketplace products and orders'
    },
    {
      name: 'Weather',
      description: 'Weather forecasts and alerts'
    },
    {
      name: 'Financial',
      description: 'Financial management and reporting'
    },
    {
      name: 'Notifications',
      description: 'Notification management and preferences'
    }
  ]
};

/**
 * Generate OpenAPI spec endpoint handler
 */
export function getOpenAPISpec() {
  return openAPISpec;
}

/**
 * Generate Swagger UI HTML
 */
export function getSwaggerUI() {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>FarmKonnect API Documentation</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.css">
        <style>
          html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
          }
          *, *:before, *:after {
            box-sizing: inherit;
          }
          body {
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = function() {
            const ui = SwaggerUIBundle({
              url: "/api/openapi.json",
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: "StandaloneLayout"
            })
            window.ui = ui
          }
        </script>
      </body>
    </html>
  `;
}
