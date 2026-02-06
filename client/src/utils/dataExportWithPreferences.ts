import { DashboardPreferences } from '@/hooks/useDashboardPreferences';

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  preferences: DashboardPreferences;
  farmData: any;
  fileName?: string;
}

/**
 * Filter KPI data based on dashboard preferences
 */
export const filterKPIsByPreferences = (
  kpiData: Record<string, any>,
  preferences: DashboardPreferences
) => {
  const filtered: Record<string, any> = {};

  if (preferences.visibleKPIs.revenue && kpiData.revenue) {
    filtered.revenue = kpiData.revenue;
  }
  if (preferences.visibleKPIs.expenses && kpiData.expenses) {
    filtered.expenses = kpiData.expenses;
  }
  if (preferences.visibleKPIs.profit && kpiData.profit) {
    filtered.profit = kpiData.profit;
  }
  if (preferences.visibleKPIs.animals && kpiData.animals) {
    filtered.animals = kpiData.animals;
  }
  if (preferences.visibleKPIs.workers && kpiData.workers) {
    filtered.workers = kpiData.workers;
  }
  if (preferences.visibleKPIs.ponds && kpiData.ponds) {
    filtered.ponds = kpiData.ponds;
  }
  if (preferences.visibleKPIs.assets && kpiData.assets) {
    filtered.assets = kpiData.assets;
  }

  return filtered;
};

/**
 * Export data to CSV format
 */
export const exportToCSV = (
  data: Record<string, any>,
  fileName: string = 'farm-report.csv'
) => {
  const rows: string[] = [];

  // Header
  rows.push('Metric,Value');

  // Data rows
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'object') {
      rows.push(`${key},`);
      Object.entries(value).forEach(([subKey, subValue]) => {
        rows.push(`  ${subKey},${subValue}`);
      });
    } else {
      rows.push(`${key},${value}`);
    }
  });

  const csv = rows.join('\n');
  downloadFile(csv, fileName, 'text/csv');
};

/**
 * Export data to JSON format
 */
export const exportToJSON = (
  data: Record<string, any>,
  fileName: string = 'farm-report.json'
) => {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, fileName, 'application/json');
};

/**
 * Helper function to trigger file download
 */
const downloadFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate farm report with preferences
 */
export const generateFarmReport = (options: ExportOptions) => {
  const { format, preferences, farmData, fileName } = options;

  // Filter KPIs based on preferences
  const filteredKPIs = filterKPIsByPreferences(farmData.kpis, preferences);

  // Add metadata
  const reportData = {
    generatedAt: new Date().toISOString(),
    farmId: farmData.farmId,
    farmName: farmData.farmName,
    kpis: filteredKPIs,
    selectedFarm: preferences.selectedFarmId ? `Farm ID: ${preferences.selectedFarmId}` : 'All Farms',
  };

  // Export based on format
  const timestamp = new Date().toISOString().split('T')[0];
  const defaultFileName = `farm-report-${timestamp}`;

  switch (format) {
    case 'csv':
      exportToCSV(reportData, `${fileName || defaultFileName}.csv`);
      break;
    case 'json':
      exportToJSON(reportData, `${fileName || defaultFileName}.json`);
      break;
    case 'pdf':
      // PDF export would require additional library like jsPDF
      console.warn('PDF export requires additional setup');
      exportToJSON(reportData, `${fileName || defaultFileName}.json`);
      break;
  }
};

/**
 * Export worker performance report
 */
export const exportWorkerPerformanceReport = (
  workers: any[],
  preferences: DashboardPreferences,
  fileName?: string
) => {
  const rows: string[] = [];

  // Header
  rows.push('Worker Name,Farm,Status,Hours Logged,Activity Count,Performance Score');

  // Data rows
  workers.forEach((worker) => {
    rows.push(
      `${worker.name},${worker.farmName},${worker.status},${worker.hoursLogged},${worker.activityCount},${worker.performanceScore}`
    );
  });

  const csv = rows.join('\n');
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `${fileName || `worker-report-${timestamp}`}.csv`, 'text/csv');
};

/**
 * Export financial report
 */
export const exportFinancialReport = (
  financialData: any,
  preferences: DashboardPreferences,
  fileName?: string
) => {
  const reportData = {
    generatedAt: new Date().toISOString(),
    selectedFarm: preferences.selectedFarmId ? `Farm ID: ${preferences.selectedFarmId}` : 'All Farms',
    revenue: preferences.visibleKPIs.revenue ? financialData.revenue : undefined,
    expenses: preferences.visibleKPIs.expenses ? financialData.expenses : undefined,
    profit: preferences.visibleKPIs.profit ? financialData.profit : undefined,
  };

  // Remove undefined fields
  Object.keys(reportData).forEach(
    (key) => reportData[key as keyof typeof reportData] === undefined && delete reportData[key as keyof typeof reportData]
  );

  const json = JSON.stringify(reportData, null, 2);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(json, `${fileName || `financial-report-${timestamp}`}.json`, 'application/json');
};
