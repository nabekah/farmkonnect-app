# FarmKonnect API Documentation

Complete API reference for the FarmKonnect agricultural management platform.

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [SDKs](#sdks)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Examples](#examples)

## Getting Started

### Base URL

```
https://api.farmkonnect.com/api/trpc
```

### Quick Start

1. **Obtain JWT Token** - Authenticate via Manus OAuth at `/api/oauth/callback`
2. **Install SDK** - Choose JavaScript or Python SDK
3. **Make Requests** - Use the SDK or REST API with your token

### Example Request

```bash
curl -X GET https://api.farmkonnect.com/api/trpc/farms.list \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Authentication

All API requests require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Obtaining a Token

1. Redirect user to Manus OAuth login portal
2. User authenticates and is redirected to `/api/oauth/callback`
3. Session cookie is set automatically
4. JWT token is available in the session context

### Token Expiration

- Tokens expire after 24 hours
- Refresh tokens are available for obtaining new tokens
- Implement token refresh logic in your client

## API Endpoints

### Farms Module

Manage farm properties and metadata.

#### List Farms
```
GET /farms.list?limit=10&offset=0
```

**Parameters:**
- `limit` (optional, default: 10) - Number of farms to return
- `offset` (optional, default: 0) - Number of farms to skip

**Response:**
```json
{
  "farms": [
    {
      "id": 1,
      "name": "Akosombo Farm",
      "location": "Eastern Region, Ghana",
      "size": 50,
      "type": "mixed",
      "gpsLatitude": 6.7924,
      "gpsLongitude": -0.0197,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 5
}
```

#### Get Farm Details
```
GET /farms.get?id=1
```

**Response:**
```json
{
  "id": 1,
  "name": "Akosombo Farm",
  "location": "Eastern Region, Ghana",
  "size": 50,
  "type": "mixed",
  "gpsLatitude": 6.7924,
  "gpsLongitude": -0.0197,
  "createdAt": "2024-01-15T10:30:00Z",
  "crops": 12,
  "livestock": 45,
  "workers": 8
}
```

#### Create Farm
```
POST /farms.create
```

**Request Body:**
```json
{
  "name": "New Farm",
  "location": "Ashanti Region, Ghana",
  "size": 25,
  "type": "crop",
  "gpsLatitude": 6.6753,
  "gpsLongitude": -1.6167
}
```

### Crops Module

Track crop cycles, soil health, and yields.

#### List Crops
```
GET /crops.list?farmId=1&status=active
```

**Parameters:**
- `farmId` (required) - Farm ID to filter crops
- `status` (optional) - Filter by status: `planning`, `planted`, `growing`, `harvesting`, `completed`

**Response:**
```json
[
  {
    "id": 1,
    "farmId": 1,
    "name": "Maize",
    "variety": "Hybrid H516",
    "plantedDate": "2024-01-20",
    "expectedHarvestDate": "2024-05-20",
    "status": "growing",
    "expectedYield": 5000,
    "actualYield": null
  }
]
```

#### Get Crop Analytics
```
GET /crops.getAnalytics?cropId=1
```

**Response:**
```json
{
  "cropId": 1,
  "name": "Maize",
  "totalArea": 10,
  "plantedDate": "2024-01-20",
  "expectedHarvestDate": "2024-05-20",
  "growthStage": "V8",
  "soilHealth": {
    "pH": 6.8,
    "nitrogen": 45,
    "phosphorus": 30,
    "potassium": 200
  },
  "weatherImpact": "Favorable",
  "estimatedYield": 5200,
  "riskFactors": ["Low nitrogen", "Pest pressure"]
}
```

### Livestock Module

Manage animals, health records, and vaccinations.

#### List Livestock
```
GET /livestock.list?farmId=1&type=cattle
```

**Parameters:**
- `farmId` (required) - Farm ID
- `type` (optional) - Animal type: `cattle`, `goat`, `sheep`, `pig`, `poultry`

**Response:**
```json
[
  {
    "id": 1,
    "farmId": 1,
    "name": "Bessie",
    "type": "cattle",
    "breed": "Holstein",
    "age": 48,
    "weight": 450,
    "healthStatus": "healthy",
    "productivityScore": 85,
    "lastVaccination": "2024-01-10"
  }
]
```

#### Get Health Records
```
GET /livestock.getHealthRecords?animalId=1
```

**Response:**
```json
[
  {
    "id": 1,
    "animalId": 1,
    "date": "2024-01-10",
    "type": "vaccination",
    "description": "Foot and Mouth Disease Vaccine",
    "veterinarian": "Dr. Kwame Asante",
    "notes": "Animal responded well to vaccine"
  }
]
```

### Breeding Module

Genetic compatibility and breeding recommendations.

#### Get Breeding Analytics
```
GET /breeding.getAnalytics?farmId=1
```

**Response:**
```json
{
  "totalBreedingEvents": 12,
  "successRate": 83.33,
  "breedingAnimals": 8,
  "averageBreedingAge": 4.5,
  "geneticDiversityScore": 78,
  "recommendedPairs": [
    {
      "sireId": 1,
      "damId": 5,
      "compatibilityScore": 92,
      "recommendation": "Excellent - High genetic compatibility"
    }
  ]
}
```

#### Calculate Compatibility
```
GET /breeding.calculateCompatibility?animal1Id=1&animal2Id=5
```

**Response:**
```json
{
  "animal1": { "id": 1, "name": "Bessie", "breed": "Holstein" },
  "animal2": { "id": 5, "name": "Daisy", "breed": "Holstein" },
  "compatibilityScore": 92,
  "recommendation": "Excellent",
  "factors": {
    "sameBreed": true,
    "optimalAgeGap": true,
    "healthStatus": true,
    "weightCompatibility": true
  }
}
```

### Marketplace Module

Product listings, orders, and transactions.

#### List Products
```
GET /marketplace.products?search=fertilizer&category=inputs&minPrice=100&maxPrice=5000
```

**Parameters:**
- `search` (optional) - Search products by name
- `category` (optional) - Filter by category
- `minPrice` (optional) - Minimum price in GHS
- `maxPrice` (optional) - Maximum price in GHS

**Response:**
```json
[
  {
    "id": 1,
    "name": "NPK 15-15-15 Fertilizer",
    "category": "inputs",
    "description": "Complete fertilizer for general crops",
    "price": 2500,
    "currency": "GHS",
    "stock": 50,
    "rating": 4.8,
    "seller": "AgroSupply Ghana",
    "imageUrl": "https://cdn.farmkonnect.com/products/npk-15-15-15.jpg"
  }
]
```

#### Create Order
```
POST /marketplace.createOrder
```

**Request Body:**
```json
{
  "buyerId": 1,
  "sellerId": 2,
  "items": [
    {
      "productId": 1,
      "quantity": 10,
      "price": 2500
    }
  ],
  "totalAmount": 25000,
  "deliveryAddress": "Kumasi, Ashanti Region",
  "paymentMethod": "bank_transfer"
}
```

**Response:**
```json
{
  "orderId": 101,
  "status": "confirmed",
  "createdAt": "2024-02-09T14:30:00Z",
  "estimatedDelivery": "2024-02-15",
  "totalAmount": 25000,
  "items": [
    {
      "productId": 1,
      "quantity": 10,
      "price": 2500,
      "subtotal": 25000
    }
  ]
}
```

### Weather Module

Weather forecasts and crop recommendations.

#### Get Weather Forecast
```
GET /weather.forecast?farmId=1&days=7
```

**Response:**
```json
{
  "location": "Eastern Region, Ghana",
  "forecast": [
    {
      "date": "2024-02-10",
      "temperature": 28,
      "humidity": 75,
      "precipitation": 2.5,
      "windSpeed": 12,
      "condition": "Partly Cloudy",
      "recommendation": "Good conditions for irrigation"
    }
  ]
}
```

### Financial Module

Expense and revenue tracking with forecasting.

#### Get Expenses
```
GET /financial.getExpenses?farmId=1&startDate=2024-01-01&endDate=2024-02-09
```

**Response:**
```json
[
  {
    "id": 1,
    "farmId": 1,
    "category": "inputs",
    "description": "Fertilizer purchase",
    "amount": 5000,
    "currency": "GHS",
    "date": "2024-01-15",
    "vendor": "AgroSupply Ghana"
  }
]
```

#### Get Financial Summary
```
GET /financial.getSummary?farmId=1&months=12
```

**Response:**
```json
{
  "farmId": 1,
  "period": "12 months",
  "totalRevenue": 150000,
  "totalExpenses": 85000,
  "netProfit": 65000,
  "profitMargin": 43.33,
  "monthlyBreakdown": [
    {
      "month": "January 2024",
      "revenue": 12000,
      "expenses": 7000,
      "profit": 5000
    }
  ]
}
```

## SDKs

### JavaScript SDK

```bash
npm install @farmkonnect/sdk
```

**Usage:**
```javascript
import { FarmKonnectClient } from '@farmkonnect/sdk';

const client = new FarmKonnectClient({
  baseUrl: 'https://api.farmkonnect.com',
  token: 'your-jwt-token'
});

// List farms
const farms = await client.farms.list({ limit: 10 });

// Get crop analytics
const analytics = await client.crops.getAnalytics({ cropId: 1 });

// Create order
const order = await client.marketplace.createOrder({
  buyerId: 1,
  sellerId: 2,
  items: [{ productId: 1, quantity: 10 }],
  totalAmount: 25000
});
```

### Python SDK

```bash
pip install farmkonnect-sdk
```

**Usage:**
```python
from farmkonnect import FarmKonnectClient

client = FarmKonnectClient(
    base_url='https://api.farmkonnect.com',
    token='your-jwt-token'
)

# List farms
farms = client.farms.list(limit=10)

# Get crop analytics
analytics = client.crops.get_analytics(crop_id=1)

# Create order
order = client.marketplace.create_order({
    'buyerId': 1,
    'sellerId': 2,
    'items': [{'productId': 1, 'quantity': 10}],
    'totalAmount': 25000
})
```

## Rate Limiting

API requests are rate limited to prevent abuse:

- **Rate Limit**: 1,000 requests per hour per API key
- **Rate Limit Headers**:
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

**Response when limit exceeded:**
```json
{
  "error": "Rate limit exceeded",
  "message": "You have exceeded the rate limit of 1000 requests per hour",
  "retryAfter": 3600
}
```

## Error Handling

### Error Response Format

```json
{
  "code": "INVALID_REQUEST",
  "message": "Invalid request parameters",
  "details": {
    "field": "farmId",
    "reason": "Farm ID must be a positive integer"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | User lacks permission to access resource |
| `NOT_FOUND` | 404 | Requested resource not found |
| `INVALID_REQUEST` | 400 | Invalid request parameters |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `SERVER_ERROR` | 500 | Internal server error |

## Examples

### Complete Workflow Example

```javascript
import { FarmKonnectClient } from '@farmkonnect/sdk';

async function farmManagementWorkflow() {
  const client = new FarmKonnectClient({
    token: 'your-jwt-token'
  });

  try {
    // 1. List farms
    const farms = await client.farms.list({ limit: 5 });
    console.log('Farms:', farms);

    // 2. Get first farm's crops
    const farmId = farms[0].id;
    const crops = await client.crops.list(farmId);
    console.log('Crops:', crops);

    // 3. Get crop analytics
    if (crops.length > 0) {
      const analytics = await client.crops.getAnalytics(crops[0].id);
      console.log('Analytics:', analytics);
    }

    // 4. Get livestock
    const livestock = await client.livestock.list(farmId);
    console.log('Livestock:', livestock);

    // 5. Get breeding recommendations
    const breeding = await client.breeding.getRecommendations(farmId);
    console.log('Breeding Recommendations:', breeding);

    // 6. Get financial summary
    const financial = await client.financial.getSummary(farmId, 12);
    console.log('Financial Summary:', financial);

  } catch (error) {
    console.error('API Error:', error.message);
  }
}

farmManagementWorkflow();
```

## Support

- **Documentation**: https://api.farmkonnect.com/docs
- **Email**: support@farmkonnect.com
- **GitHub**: https://github.com/farmkonnect
- **Status Page**: https://status.farmkonnect.com
