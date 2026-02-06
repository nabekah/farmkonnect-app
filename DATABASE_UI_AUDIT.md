# Database-UI Integration Audit Report

## Executive Summary
Comprehensive audit of 40+ database tables against UI pages and tRPC routers reveals critical disconnects where data cannot be saved or retrieved. Many tables have routers but pages call wrong endpoints, or pages exist with no backend support.

## Critical Issues Found

### 1. LIVESTOCK MANAGEMENT
**Status:** BROKEN - Data not saving/showing

**Database Tables:**
- `animals` - Animal records
- `animalTypes` - Animal type reference data
- `animalHealthRecords` - Health records
- `breedingRecords` - Breeding information
- `feedingRecords` - Feeding logs
- `performanceMetrics` - Performance tracking

**Router:** `livestockRouter` exists at `server/livestockRouter.ts`
- ✓ `livestock.animals.create` - Implemented
- ✓ `livestock.animals.list` - Implemented
- ✓ `livestock.animals.update` - Implemented
- ✓ `livestock.animals.delete` - Implemented

**UI Pages:**
- `client/src/pages/Livestock.tsx` - BROKEN
  - Calls `trpc.animals.list` (WRONG - should be `trpc.livestock.animals.list`)
  - Calls `trpc.farms.list` (WRONG - should be `trpc.livestock.farms.list`)
  - Calls `trpc.healthRecords.list` (WRONG - should be `trpc.livestock.healthRecords.list`)
  - Calls `trpc.vaccinations.record` (MISSING - not implemented)
  - Calls `trpc.performanceMetrics.record` (WRONG - should be `trpc.livestock.performanceMetrics.record`)

- `client/src/pages/LivestockManagement.tsx` - BROKEN
  - Similar endpoint mismatches

**Root Cause:** Page calls wrong tRPC paths, causing all mutations to fail silently

---

### 2. FARM MANAGEMENT
**Status:** PARTIAL - Farm list works but filtering broken

**Database Tables:**
- `farms` - Farm records
- `farmActivities` - Farm activity log

**Router:** No dedicated farm router - mixed into other routers

**UI Issues:**
- Farm type filtering not working
- Livestock farms appearing in crop selection dropdowns
- Farm-specific data not filtered

---

### 3. CROPS MANAGEMENT
**Status:** PARTIAL - Basic CRUD works but filtering broken

**Database Tables:**
- `crops` - Crop definitions
- `cropCycles` - Crop growing cycles
- `soilTests` - Soil test records
- `fertilizerApplications` - Fertilizer tracking
- `yieldRecords` - Yield data
- `cropHealthRecords` - Crop health
- `cropTreatments` - Treatment records

**Router:** `cropPlanningRouter` exists

**UI Issues:**
- CropPlanning.tsx shows livestock farms in dropdown
- No farm type filtering
- Crop cycles not linked to farms

---

### 4. MISSING ADMIN SETTINGS
**Status:** NOT IMPLEMENTED

**Required Features:**
- Admin panel to manage reference data (animal types, crop types, etc.)
- Settings page for supporting data lists
- No UI for managing:
  - Animal types
  - Crop types
  - Treatment types
  - Disease types
  - Fertilizer types
  - Equipment types

---

### 5. OTHER DISCONNECTS

#### Animals Table
- **Router:** `livestockRouter.animals` ✓
- **UI Pages:** Livestock.tsx (broken endpoints)
- **Issue:** Cannot create/list animals

#### Fish Farming
- **Tables:** `fishPonds`, `fishStockingRecords`, `fishPondActivities`
- **Router:** `fishFarmingRouter` ✓
- **UI Pages:** FishFarming.tsx
- **Issue:** Endpoints may not match

#### Workforce
- **Tables:** `farmWorkers`, `fieldWorkerProfiles`, `fieldWorkerTasks`
- **Router:** `workforceRouter` ✓
- **UI Pages:** WorkforceManagement.tsx
- **Issue:** Needs validation

#### Assets
- **Tables:** `farmAssets`
- **Router:** `assetRouter` ✓
- **UI Pages:** AssetManagement.tsx
- **Issue:** Needs validation

#### Reporting
- **Tables:** `reportSchedules`, `reportHistory`, `reportTemplates`, etc.
- **Router:** Multiple reporting routers ✓
- **UI Pages:** Multiple reporting pages
- **Issue:** Complex - needs validation

---

## Summary of Fixes Needed

| Module | Database Tables | Router | UI Pages | Status | Priority |
|--------|-----------------|--------|----------|--------|----------|
| Livestock | 6 | ✓ | ✗ | BROKEN | CRITICAL |
| Farms | 2 | ✗ | ✓ | PARTIAL | HIGH |
| Crops | 7 | ✓ | ✓ | PARTIAL | HIGH |
| Admin Settings | N/A | N/A | ✗ | MISSING | HIGH |
| Fish Farming | 3 | ✓ | ✓ | UNKNOWN | MEDIUM |
| Workforce | 3 | ✓ | ✓ | UNKNOWN | MEDIUM |
| Assets | 1 | ✓ | ✓ | UNKNOWN | MEDIUM |
| Reporting | 15+ | ✓ | ✓ | UNKNOWN | MEDIUM |

---

## Recommended Action Plan

1. **IMMEDIATE (CRITICAL):**
   - Fix Livestock.tsx endpoint calls
   - Fix LivestockManagement.tsx endpoint calls
   - Test livestock create/list/update

2. **HIGH PRIORITY:**
   - Create farm router with proper filtering
   - Fix crop page farm type filtering
   - Implement admin settings page
   - Add reference data management (animal types, crop types, etc.)

3. **MEDIUM PRIORITY:**
   - Validate all other routers match UI pages
   - Test end-to-end for each module
   - Add proper error handling

4. **TESTING:**
   - Create/read/update/delete for each module
   - Verify farm type filtering
   - Verify data persistence
