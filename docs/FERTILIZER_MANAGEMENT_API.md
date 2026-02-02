# Fertilizer Management API Documentation

## Overview

The Fertilizer Management system provides comprehensive tools for tracking fertilizer inventory, analyzing soil health, and managing costs. This API documentation covers all available endpoints and their usage.

## Table of Contents

1. [Inventory Management](#inventory-management)
2. [Soil Health Recommendations](#soil-health-recommendations)
3. [Cost Analysis](#cost-analysis)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)

---

## Inventory Management

### Get Inventory by Farm

Retrieve all fertilizer inventory items for a specific farm.

**Endpoint:** `trpc.fertilizerManagement.inventory.getByFarm`

**Input:**
```typescript
{
  farmId: number
}
```

**Response:**
```typescript
Array<{
  id: number
  farmId: number
  fertilizerType: string
  currentStock: number
  reorderPoint: number
  reorderQuantity: number
  supplier?: string
  supplierContact?: string
  storageLocation?: string
  expiryDate?: Date
  isLowStock: boolean
  createdAt: Date
  updatedAt: Date
}>
```

**Example:**
```typescript
const inventory = await trpc.fertilizerManagement.inventory.getByFarm.query({
  farmId: 1
});
```

---

### Get Inventory Item

Retrieve details for a specific inventory item.

**Endpoint:** `trpc.fertilizerManagement.inventory.getItem`

**Input:**
```typescript
{
  id: number
}
```

**Response:**
```typescript
{
  id: number
  farmId: number
  fertilizerType: string
  currentStock: number
  reorderPoint: number
  reorderQuantity: number
  supplier?: string
  supplierContact?: string
  storageLocation?: string
  expiryDate?: Date
  isLowStock: boolean
  createdAt: Date
  updatedAt: Date
}
```

---

### Upsert Inventory Item

Create or update a fertilizer inventory item.

**Endpoint:** `trpc.fertilizerManagement.inventory.upsert`

**Input:**
```typescript
{
  farmId: number
  fertilizerType: string
  currentStock?: number
  reorderPoint?: number
  reorderQuantity?: number
  supplier?: string
  supplierContact?: string
  storageLocation?: string
  expiryDate?: Date
}
```

**Response:**
```typescript
{
  id: number
  farmId: number
  fertilizerType: string
  // ... other fields
}
```

**Example:**
```typescript
const item = await trpc.fertilizerManagement.inventory.upsert.mutate({
  farmId: 1,
  fertilizerType: 'Urea (46-0-0)',
  currentStock: 500,
  reorderPoint: 100,
  reorderQuantity: 200,
  supplier: 'ABC Fertilizers',
  supplierContact: '+1-555-0123',
  storageLocation: 'Warehouse A'
});
```

---

### Record Transaction

Record a stock transaction (purchase, usage, adjustment, damage, expiry).

**Endpoint:** `trpc.fertilizerManagement.inventory.recordTransaction`

**Input:**
```typescript
{
  inventoryId: number
  transactionType: 'purchase' | 'usage' | 'adjustment' | 'damage' | 'expiry'
  quantity: number
  cost?: number
  reason?: string
  referenceId?: number
}
```

**Response:**
```typescript
{
  id: number
  inventoryId: number
  transactionType: string
  quantity: number
  cost?: number
  reason?: string
  referenceId?: number
  createdAt: Date
}
```

**Example:**
```typescript
const transaction = await trpc.fertilizerManagement.inventory.recordTransaction.mutate({
  inventoryId: 1,
  transactionType: 'usage',
  quantity: 50,
  reason: 'Field application - Crop Cycle 1',
  referenceId: 123
});
```

---

### Get Transaction History

Retrieve transaction history for an inventory item.

**Endpoint:** `trpc.fertilizerManagement.inventory.getTransactionHistory`

**Input:**
```typescript
{
  inventoryId: number
  limit?: number
}
```

**Response:**
```typescript
Array<{
  id: number
  inventoryId: number
  transactionType: string
  quantity: number
  cost?: number
  reason?: string
  referenceId?: number
  createdAt: Date
}>
```

---

### Get Low Stock Items

Retrieve all items below their reorder point.

**Endpoint:** `trpc.fertilizerManagement.inventory.getLowStockItems`

**Input:**
```typescript
{
  farmId: number
}
```

**Response:**
```typescript
Array<{
  id: number
  fertilizerType: string
  currentStock: number
  reorderPoint: number
  reorderQuantity: number
  supplier?: string
  supplierContact?: string
  isLowStock: boolean
}>
```

---

### Get Expiring Items

Retrieve items expiring within a specified threshold.

**Endpoint:** `trpc.fertilizerManagement.inventory.getExpiringItems`

**Input:**
```typescript
{
  farmId: number
  daysThreshold?: number  // Default: 30
}
```

**Response:**
```typescript
Array<{
  id: number
  fertilizerType: string
  currentStock: number
  expiryDate: Date
  daysUntilExpiry: number
  storageLocation?: string
}>
```

---

### Get Inventory Value

Calculate total inventory value for a farm.

**Endpoint:** `trpc.fertilizerManagement.inventory.getInventoryValue`

**Input:**
```typescript
{
  farmId: number
}
```

**Response:**
```typescript
number  // Total value in currency units
```

---

## Soil Health Recommendations

### Analyze Soil Test

Analyze a soil test and generate fertilizer recommendations.

**Endpoint:** `trpc.fertilizerManagement.soilHealth.analyze`

**Input:**
```typescript
{
  soilTestId: number
  cycleId: number
}
```

**Response:**
```typescript
{
  soilTestId: number
  cycleId: number
  deficiencies: Array<{
    nutrient: string
    level: number
    optimalLevel: number
    severity: 'low' | 'moderate' | 'high' | 'critical'
    description: string
  }>
  recommendations: Array<{
    fertilizerType: string
    recommendedQuantityKg: number
    applicationTiming: string
    expectedYieldImprovement: number
    costBenefit: number
    alternativeOptions: string[]
    rationale: string
  }>
  overallHealthScore: number
  actionPriority: 'immediate' | 'high' | 'medium' | 'low'
}
```

**Example:**
```typescript
const analysis = await trpc.fertilizerManagement.soilHealth.analyze.mutate({
  soilTestId: 1,
  cycleId: 1
});
```

---

### Get Recommendations for Cycle

Retrieve all recommendations for a crop cycle.

**Endpoint:** `trpc.fertilizerManagement.soilHealth.getRecommendationsForCycle`

**Input:**
```typescript
{
  cycleId: number
}
```

**Response:**
```typescript
Array<{
  id: number
  soilTestId: number
  cycleId: number
  recommendedFertilizerType: string
  recommendedQuantityKg: number
  applicationTiming: string
  deficiencyType: string
  deficiencySeverity: string
  expectedYieldImprovement: number
  costBenefit: number
  alternativeOptions: string
  implementationStatus: 'pending' | 'applied' | 'completed' | 'cancelled'
  appliedDate?: Date
}>
```

---

### Update Recommendation Status

Update the implementation status of a recommendation.

**Endpoint:** `trpc.fertilizerManagement.soilHealth.updateRecommendationStatus`

**Input:**
```typescript
{
  recommendationId: number
  status: 'pending' | 'applied' | 'completed' | 'cancelled'
}
```

**Response:**
```typescript
{
  success: boolean
}
```

---

## Cost Analysis

### Analyze Cycle Costs

Analyze fertilizer costs for a crop cycle.

**Endpoint:** `trpc.fertilizerManagement.costAnalysis.analyzeCycleCosts`

**Input:**
```typescript
{
  cycleId: number
}
```

**Response:**
```typescript
{
  cycleId: number
  totalCostSpent: number
  costPerHectare: number
  roiPercentage: number
  mostExpensiveType: string
  costBreakdown: Record<string, number>
  recommendations: string[]
}
```

---

### Get Cost Trend

Retrieve cost trends for a fertilizer type.

**Endpoint:** `trpc.fertilizerManagement.costAnalysis.getCostTrend`

**Input:**
```typescript
{
  fertilizerType: string
  days?: number  // Default: 90
}
```

**Response:**
```typescript
Array<{
  date: string
  costPerKg: number
}>
```

---

### Compare Fertilizer Costs

Compare current costs across different fertilizer types.

**Endpoint:** `trpc.fertilizerManagement.costAnalysis.compareFertilizerCosts`

**Response:**
```typescript
Array<{
  type: string
  currentCostPerKg: number
  previousCostPerKg?: number
  priceChange?: number
}>
```

---

## Data Models

### InventoryItem

```typescript
interface InventoryItem {
  id: number
  farmId: number
  fertilizerType: string
  currentStock: number
  reorderPoint: number
  reorderQuantity: number
  supplier?: string
  supplierContact?: string
  storageLocation?: string
  expiryDate?: Date
  isLowStock: boolean
  createdAt: Date
  updatedAt: Date
}
```

### SoilDeficiency

```typescript
interface SoilDeficiency {
  nutrient: string
  level: number
  optimalLevel: number
  severity: 'low' | 'moderate' | 'high' | 'critical'
  description: string
}
```

### FertilizerRecommendation

```typescript
interface FertilizerRecommendation {
  fertilizerType: string
  recommendedQuantityKg: number
  applicationTiming: string
  expectedYieldImprovement: number
  costBenefit: number
  alternativeOptions: string[]
  rationale: string
}
```

### CostAnalysisResult

```typescript
interface CostAnalysisResult {
  cycleId: number
  totalCostSpent: number
  costPerHectare: number
  roiPercentage: number
  mostExpensiveType: string
  costBreakdown: Record<string, number>
  recommendations: string[]
}
```

---

## Error Handling

### Common Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 404 | Not Found | Resource not found |
| 400 | Bad Request | Invalid input parameters |
| 500 | Internal Server Error | Server-side error |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |

### Error Response Format

```typescript
{
  code: string
  message: string
  details?: any
}
```

### Example Error Handling

```typescript
try {
  const inventory = await trpc.fertilizerManagement.inventory.getByFarm.query({
    farmId: 1
  });
} catch (error) {
  console.error('Failed to fetch inventory:', error.message);
  // Handle error appropriately
}
```

---

## Best Practices

### 1. Inventory Management

- Regularly update stock levels after each transaction
- Set appropriate reorder points based on usage patterns
- Monitor expiry dates and prioritize using older stock
- Maintain supplier contact information for quick reordering

### 2. Soil Health

- Conduct soil tests at least once per crop cycle
- Act on recommendations promptly to avoid nutrient deficiencies
- Track recommendation implementation for future reference
- Use alternative fertilizers when cost-effective

### 3. Cost Optimization

- Monitor cost trends to identify price fluctuations
- Compare fertilizer options before purchasing
- Calculate ROI to ensure cost-effectiveness
- Implement cost-saving recommendations

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Queries**: 100 requests per minute
- **Mutations**: 50 requests per minute

---

## Support

For issues or questions, please contact the development team or submit an issue on the project repository.

---

**Last Updated:** February 2, 2026  
**API Version:** 1.0.0
