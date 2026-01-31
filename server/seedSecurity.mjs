import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
// Import schema tables directly
const schema = {
  modulePermissions: null,
  customRoles: null,
  rolePermissions: null,
  securitySettings: null,
};

// We'll use raw SQL instead since we can't import TS files in .mjs

/**
 * Seed Security System
 * Initializes module permissions and default roles
 */

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: "default" });

console.log("🔐 Seeding security system...\n");

// ============================================================================
// 1. Initialize Module Permissions
// ============================================================================
console.log("📋 Creating module permissions...");

const modules = [
  // Agriculture
  { moduleName: "farms", displayName: "Farm Management", category: "Agriculture", description: "Manage farms and farm details" },
  { moduleName: "crops", displayName: "Crop Management", category: "Agriculture", description: "Manage crops, cycles, and yields" },
  { moduleName: "livestock", displayName: "Livestock Management", category: "Agriculture", description: "Manage animals, health, and breeding" },
  { moduleName: "inventory", displayName: "Inventory Management", category: "Agriculture", description: "Manage farm inventory and supplies" },
  { moduleName: "irrigation", displayName: "Irrigation Management", category: "Agriculture", description: "Manage irrigation schedules and zones" },
  
  // Business
  { moduleName: "marketplace", displayName: "Marketplace", category: "Business", description: "Buy and sell agricultural products" },
  { moduleName: "orders", displayName: "Order Management", category: "Business", description: "Manage marketplace orders" },
  { moduleName: "payments", displayName: "Payment Management", category: "Business", description: "Process payments and transactions" },
  { moduleName: "transport", displayName: "Transport Management", category: "Business", description: "Manage delivery and logistics" },
  
  // Extension Services
  { moduleName: "training", displayName: "Training Programs", category: "Extension", description: "Manage training and extension services" },
  { moduleName: "merl", displayName: "MERL System", category: "Extension", description: "Monitoring, Evaluation, Reporting, Learning" },
  
  // Technology
  { moduleName: "iot", displayName: "IoT Devices", category: "Technology", description: "Manage IoT sensors and devices" },
  { moduleName: "weather", displayName: "Weather Integration", category: "Technology", description: "Access weather data and forecasts" },
  { moduleName: "notifications", displayName: "Notifications", category: "Technology", description: "Manage system notifications" },
  
  // Administration
  { moduleName: "users", displayName: "User Management", category: "Administration", description: "Manage user accounts and profiles" },
  { moduleName: "roles", displayName: "Role Management", category: "Administration", description: "Manage roles and permissions" },
  { moduleName: "security", displayName: "Security Settings", category: "Administration", description: "Manage security and audit logs" },
  { moduleName: "business_strategy", displayName: "Business Strategy", category: "Administration", description: "Strategic planning and SWOT analysis" },
];

for (const module of modules) {
  await db.insert(schema.modulePermissions).values(module);
  console.log(`  ✓ ${module.displayName}`);
}

console.log(`\n✅ Created ${modules.length} module permissions\n`);

// ============================================================================
// 2. Create Default System Roles
// ============================================================================
console.log("👥 Creating default system roles...");

const roles = [
  {
    roleName: "super_admin",
    displayName: "Super Administrator",
    description: "Full system access with all permissions",
    isSystemRole: true,
    createdBy: 1, // System
  },
  {
    roleName: "farm_manager",
    displayName: "Farm Manager",
    description: "Manage farm operations, crops, and livestock",
    isSystemRole: true,
    createdBy: 1,
  },
  {
    roleName: "extension_officer",
    displayName: "Extension Officer",
    description: "Manage training programs and provide extension services",
    isSystemRole: true,
    createdBy: 1,
  },
  {
    roleName: "marketplace_vendor",
    displayName: "Marketplace Vendor",
    description: "Sell products in the marketplace",
    isSystemRole: true,
    createdBy: 1,
  },
  {
    roleName: "transporter",
    displayName: "Transporter",
    description: "Manage delivery and transport requests",
    isSystemRole: true,
    createdBy: 1,
  },
  {
    roleName: "buyer",
    displayName: "Buyer",
    description: "Purchase products from marketplace",
    isSystemRole: true,
    createdBy: 1,
  },
  {
    roleName: "veterinarian",
    displayName: "Veterinarian",
    description: "Manage animal health and provide veterinary services",
    isSystemRole: true,
    createdBy: 1,
  },
  {
    roleName: "iot_technician",
    displayName: "IoT Technician",
    description: "Manage IoT devices and sensor readings",
    isSystemRole: true,
    createdBy: 1,
  },
];

for (const role of roles) {
  await db.insert(schema.customRoles).values(role);
  console.log(`  ✓ ${role.displayName}`);
}

console.log(`\n✅ Created ${roles.length} default roles\n`);

// ============================================================================
// 3. Assign Default Permissions to Roles
// ============================================================================
console.log("🔑 Assigning permissions to roles...");

// Get all modules and roles
const allModules = await db.select().from(schema.modulePermissions);
const allRoles = await db.select().from(schema.customRoles);

// Helper to find role/module by name
const findRole = (name) => allRoles.find((r) => r.roleName === name);
const findModule = (name) => allModules.find((m) => m.moduleName === name);

// Super Admin - Full access to everything
const superAdminRole = findRole("super_admin");
for (const module of allModules) {
  await db.insert(schema.rolePermissions).values({
    roleId: superAdminRole.id,
    permissionId: module.id,
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canExport: true,
  });
}
console.log("  ✓ Super Administrator: Full access to all modules");

// Farm Manager - Agriculture modules
const farmManagerRole = findRole("farm_manager");
const farmModules = ["farms", "crops", "livestock", "inventory", "irrigation", "weather", "iot"];
for (const moduleName of farmModules) {
  const module = findModule(moduleName);
  if (module) {
    await db.insert(schema.rolePermissions).values({
      roleId: farmManagerRole.id,
      permissionId: module.id,
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canExport: true,
    });
  }
}
console.log("  ✓ Farm Manager: Agriculture modules");

// Extension Officer - Training and MERL
const extensionRole = findRole("extension_officer");
const extensionModules = ["training", "merl", "farms", "crops", "livestock"];
for (const moduleName of extensionModules) {
  const module = findModule(moduleName);
  if (module) {
    await db.insert(schema.rolePermissions).values({
      roleId: extensionRole.id,
      permissionId: module.id,
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: moduleName === "training" || moduleName === "merl",
      canExport: true,
    });
  }
}
console.log("  ✓ Extension Officer: Training and MERL modules");

// Marketplace Vendor - Marketplace and orders
const vendorRole = findRole("marketplace_vendor");
const vendorModules = ["marketplace", "orders", "payments", "transport"];
for (const moduleName of vendorModules) {
  const module = findModule(moduleName);
  if (module) {
    await db.insert(schema.rolePermissions).values({
      roleId: vendorRole.id,
      permissionId: module.id,
      canView: true,
      canCreate: moduleName === "marketplace",
      canEdit: moduleName === "marketplace",
      canDelete: moduleName === "marketplace",
      canExport: true,
    });
  }
}
console.log("  ✓ Marketplace Vendor: Marketplace modules");

// Transporter - Transport only
const transporterRole = findRole("transporter");
const transportModule = findModule("transport");
if (transportModule) {
  await db.insert(schema.rolePermissions).values({
    roleId: transporterRole.id,
    permissionId: transportModule.id,
    canView: true,
    canCreate: false,
    canEdit: true, // Can update delivery status
    canDelete: false,
    canExport: false,
  });
}
console.log("  ✓ Transporter: Transport module");

// Buyer - Marketplace view and orders
const buyerRole = findRole("buyer");
const buyerModules = ["marketplace", "orders", "payments"];
for (const moduleName of buyerModules) {
  const module = findModule(moduleName);
  if (module) {
    await db.insert(schema.rolePermissions).values({
      roleId: buyerRole.id,
      permissionId: module.id,
      canView: true,
      canCreate: moduleName === "orders",
      canEdit: false,
      canDelete: false,
      canExport: false,
    });
  }
}
console.log("  ✓ Buyer: Marketplace and orders");

// Veterinarian - Livestock health
const vetRole = findRole("veterinarian");
const vetModules = ["livestock", "farms"];
for (const moduleName of vetModules) {
  const module = findModule(moduleName);
  if (module) {
    await db.insert(schema.rolePermissions).values({
      roleId: vetRole.id,
      permissionId: module.id,
      canView: true,
      canCreate: moduleName === "livestock",
      canEdit: moduleName === "livestock",
      canDelete: false,
      canExport: true,
    });
  }
}
console.log("  ✓ Veterinarian: Livestock modules");

// IoT Technician - IoT devices
const iotRole = findRole("iot_technician");
const iotModules = ["iot", "farms"];
for (const moduleName of iotModules) {
  const module = findModule(moduleName);
  if (module) {
    await db.insert(schema.rolePermissions).values({
      roleId: iotRole.id,
      permissionId: module.id,
      canView: true,
      canCreate: moduleName === "iot",
      canEdit: moduleName === "iot",
      canDelete: moduleName === "iot",
      canExport: true,
    });
  }
}
console.log("  ✓ IoT Technician: IoT modules");

console.log("\n✅ Permissions assigned successfully\n");

// ============================================================================
// 4. Initialize Security Settings
// ============================================================================
console.log("⚙️  Initializing security settings...");

const settings = [
  { settingKey: "session_timeout_minutes", settingValue: "30", description: "Session timeout in minutes" },
  { settingKey: "max_failed_login_attempts", settingValue: "5", description: "Maximum failed login attempts before account lock" },
  { settingKey: "account_lock_duration_minutes", settingValue: "30", description: "Account lock duration after max failed attempts" },
  { settingKey: "password_min_length", settingValue: "8", description: "Minimum password length" },
  { settingKey: "require_mfa_for_admin", settingValue: "true", description: "Require MFA for admin accounts" },
  { settingKey: "require_approval_for_new_users", settingValue: "true", description: "Require admin approval for new user registrations" },
  { settingKey: "max_concurrent_sessions", settingValue: "3", description: "Maximum concurrent sessions per user" },
];

for (const setting of settings) {
  await db.insert(schema.securitySettings).values(setting);
  console.log(`  ✓ ${setting.settingKey}: ${setting.settingValue}`);
}

console.log("\n✅ Security settings initialized\n");

// ============================================================================
// Done
// ============================================================================
console.log("🎉 Security system seeded successfully!\n");
console.log("Summary:");
console.log(`  - ${modules.length} module permissions created`);
console.log(`  - ${roles.length} default roles created`);
console.log(`  - Permissions assigned to all roles`);
console.log(`  - ${settings.length} security settings initialized`);
console.log("\n✅ Ready to use!\n");

await connection.end();
process.exit(0);
