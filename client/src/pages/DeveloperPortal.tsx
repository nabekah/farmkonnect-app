import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, BookOpen, Zap, Shield, FileText, Github } from 'lucide-react';

export default function DeveloperPortal() {
  const [activeTab, setActiveTab] = useState<'getting-started' | 'api-reference' | 'examples' | 'sdks'>('getting-started');

  const sdks = [
    {
      name: 'JavaScript SDK',
      language: 'TypeScript/JavaScript',
      package: '@farmkonnect/sdk',
      version: '1.0.0',
      npm: 'npm install @farmkonnect/sdk',
      github: 'https://github.com/farmkonnect/sdk-js'
    },
    {
      name: 'Python SDK',
      language: 'Python 3.8+',
      package: 'farmkonnect-sdk',
      version: '1.0.0',
      npm: 'pip install farmkonnect-sdk',
      github: 'https://github.com/farmkonnect/sdk-python'
    }
  ];

  const codeExamples = [
    {
      title: 'List Farms (JavaScript)',
      language: 'javascript',
      code: `import { FarmKonnectClient } from '@farmkonnect/sdk';

const client = new FarmKonnectClient({
  baseUrl: 'https://api.farmkonnect.com',
  token: 'your-jwt-token'
});

// List all farms
const farms = await client.farms.list({ limit: 10 });
console.log(farms);`
    },
    {
      title: 'Get Crop Analytics (Python)',
      language: 'python',
      code: `from farmkonnect import FarmKonnectClient

client = FarmKonnectClient(
    base_url='https://api.farmkonnect.com',
    token='your-jwt-token'
)

# Get crop analytics
analytics = client.crops.get_analytics(crop_id=1)
print(analytics)`
    },
    {
      title: 'Create Order (cURL)',
      language: 'bash',
      code: `curl -X POST https://api.farmkonnect.com/api/trpc/marketplace.createOrder \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "buyerId": 1,
    "sellerId": 2,
    "items": [
      {"productId": 1, "quantity": 10}
    ],
    "totalAmount": 5000
  }'`
    }
  ];

  const apiEndpoints = [
    {
      category: 'Farms',
      endpoints: [
        { method: 'GET', path: '/api/trpc/farms.list', description: 'List all farms' },
        { method: 'GET', path: '/api/trpc/farms.get', description: 'Get farm details' },
        { method: 'POST', path: '/api/trpc/farms.create', description: 'Create new farm' },
        { method: 'PUT', path: '/api/trpc/farms.update', description: 'Update farm' }
      ]
    },
    {
      category: 'Crops',
      endpoints: [
        { method: 'GET', path: '/api/trpc/crops.list', description: 'List crops for farm' },
        { method: 'GET', path: '/api/trpc/crops.getAnalytics', description: 'Get crop analytics' },
        { method: 'POST', path: '/api/trpc/crops.create', description: 'Create new crop' }
      ]
    },
    {
      category: 'Livestock',
      endpoints: [
        { method: 'GET', path: '/api/trpc/livestock.list', description: 'List livestock' },
        { method: 'POST', path: '/api/trpc/livestock.create', description: 'Add animal' },
        { method: 'GET', path: '/api/trpc/livestock.getHealthRecords', description: 'Get health records' }
      ]
    },
    {
      category: 'Marketplace',
      endpoints: [
        { method: 'GET', path: '/api/trpc/marketplace.products', description: 'List products' },
        { method: 'POST', path: '/api/trpc/marketplace.createOrder', description: 'Create order' },
        { method: 'GET', path: '/api/trpc/marketplace.getCart', description: 'Get shopping cart' }
      ]
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-800';
      case 'POST':
        return 'bg-green-100 text-green-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Developer Portal</h1>
        <p className="text-gray-600 mt-2">Build integrations with FarmKonnect API</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">50+</div>
              <p className="text-sm text-gray-600 mt-1">API Endpoints</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">2</div>
              <p className="text-sm text-gray-600 mt-1">Official SDKs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">99.9%</div>
              <p className="text-sm text-gray-600 mt-1">Uptime SLA</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">&lt; 100ms</div>
              <p className="text-sm text-gray-600 mt-1">Avg Response Time</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('getting-started')}
          className={`px-4 py-2 font-medium ${activeTab === 'getting-started' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          Getting Started
        </button>
        <button
          onClick={() => setActiveTab('api-reference')}
          className={`px-4 py-2 font-medium ${activeTab === 'api-reference' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          API Reference
        </button>
        <button
          onClick={() => setActiveTab('examples')}
          className={`px-4 py-2 font-medium ${activeTab === 'examples' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          Code Examples
        </button>
        <button
          onClick={() => setActiveTab('sdks')}
          className={`px-4 py-2 font-medium ${activeTab === 'sdks' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          SDKs
        </button>
      </div>

      {/* Getting Started */}
      {activeTab === 'getting-started' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
              <CardDescription>Get up and running in 5 minutes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Get Your API Token</h4>
                <p className="text-sm text-gray-600 mb-2">Authenticate using Manus OAuth and obtain a JWT token from the callback endpoint.</p>
                <code className="bg-gray-100 p-2 rounded text-xs block">Authorization: Bearer YOUR_JWT_TOKEN</code>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. Install SDK</h4>
                <p className="text-sm text-gray-600 mb-2">Choose your preferred language and install the SDK:</p>
                <code className="bg-gray-100 p-2 rounded text-xs block">npm install @farmkonnect/sdk</code>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. Make Your First Request</h4>
                <p className="text-sm text-gray-600 mb-2">List farms using the SDK:</p>
                <code className="bg-gray-100 p-2 rounded text-xs block">const farms = await client.farms.list();</code>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4. Read Full Documentation</h4>
                <p className="text-sm text-gray-600">Visit our <a href="/api/docs" className="text-blue-600 hover:underline">API documentation</a> for complete reference.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">All API requests require authentication via JWT token in the Authorization header:</p>
              <code className="bg-gray-100 p-3 rounded text-xs block">Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</code>
            </CardContent>
          </Card>
        </div>
      )}

      {/* API Reference */}
      {activeTab === 'api-reference' && (
        <div className="space-y-4">
          {apiEndpoints.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle className="text-lg">{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.endpoints.map((endpoint, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                      <Badge className={getMethodColor(endpoint.method)}>{endpoint.method}</Badge>
                      <div className="flex-1">
                        <code className="text-sm font-mono">{endpoint.path}</code>
                        <p className="text-xs text-gray-600 mt-1">{endpoint.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          <Button className="w-full" variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            View Full API Documentation
          </Button>
        </div>
      )}

      {/* Code Examples */}
      {activeTab === 'examples' && (
        <div className="space-y-4">
          {codeExamples.map((example, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{example.title}</CardTitle>
                  <Badge variant="outline">{example.language}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                  <code>{example.code}</code>
                </pre>
                <Button size="sm" variant="outline" className="mt-3">
                  <Code className="w-4 h-4 mr-2" />
                  Copy Code
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* SDKs */}
      {activeTab === 'sdks' && (
        <div className="space-y-4">
          {sdks.map((sdk) => (
            <Card key={sdk.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{sdk.name}</CardTitle>
                    <CardDescription>{sdk.language}</CardDescription>
                  </div>
                  <Badge>{sdk.version}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Installation</p>
                  <code className="bg-gray-100 p-2 rounded text-xs block">{sdk.npm}</code>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Package</p>
                  <p className="text-sm text-gray-600">{sdk.package}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                  <Button size="sm" variant="outline">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle>REST API</CardTitle>
              <CardDescription>Use any HTTP client to interact with the API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">All endpoints are available at:</p>
              <code className="bg-gray-100 p-2 rounded text-xs block">https://api.farmkonnect.com/api/trpc</code>
              <Button size="sm" variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                View Swagger Docs
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            Check out our <a href="#" className="text-blue-600 hover:underline">documentation</a>, browse <a href="#" className="text-blue-600 hover:underline">code examples</a>, or contact <a href="mailto:support@farmkonnect.com" className="text-blue-600 hover:underline">support@farmkonnect.com</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
