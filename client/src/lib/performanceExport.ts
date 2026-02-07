/**
 * Performance Export Utilities
 * Handles CSV and PDF export of performance data
 */

export interface PerformanceData {
  userId: number;
  totalHours: string;
  totalEntries: number;
  avgDuration: string;
  lastActive: Date;
}

export interface DailyHoursData {
  date: string;
  hours: number;
}

/**
 * Export performance metrics as CSV
 */
export function exportPerformanceCSV(
  metrics: PerformanceData[],
  filename?: string
): void {
  const headers = ['Worker ID', 'Total Hours', 'Total Entries', 'Avg Duration (min)', 'Last Active'];
  const rows = metrics.map((m) => [
    m.userId,
    m.totalHours,
    m.totalEntries,
    m.avgDuration,
    m.lastActive.toISOString().split('T')[0],
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `performance-report-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Export daily hours as CSV
 */
export function exportDailyHoursCSV(
  dailyHours: DailyHoursData[],
  filename?: string
): void {
  const headers = ['Date', 'Hours'];
  const rows = dailyHours.map((d) => [d.date, d.hours.toFixed(2)]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `daily-hours-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Export performance data as JSON
 */
export function exportPerformanceJSON(
  metrics: PerformanceData[],
  dailyHours: DailyHoursData[],
  filename?: string
): void {
  const data = {
    exportDate: new Date().toISOString(),
    summary: {
      totalWorkers: metrics.length,
      totalHours: metrics.reduce((sum, m) => sum + parseFloat(m.totalHours), 0).toFixed(2),
      totalEntries: metrics.reduce((sum, m) => sum + m.totalEntries, 0),
    },
    workers: metrics,
    dailyHours,
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `performance-report-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Generate HTML report for performance data
 */
export function generatePerformanceHTML(
  metrics: PerformanceData[],
  dailyHours: DailyHoursData[]
): string {
  const totalHours = metrics.reduce((sum, m) => sum + parseFloat(m.totalHours), 0).toFixed(2);
  const totalEntries = metrics.reduce((sum, m) => sum + m.totalEntries, 0);
  const avgDuration = metrics.length > 0
    ? (metrics.reduce((sum, m) => sum + parseFloat(m.avgDuration), 0) / metrics.length).toFixed(0)
    : 0;

  const metricsTableRows = metrics
    .map(
      (m) =>
        `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${m.userId}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${m.totalHours}h</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${m.totalEntries}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${m.avgDuration}m</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${m.lastActive.toLocaleDateString()}</td>
    </tr>`
    )
    .join('');

  const dailyHoursTableRows = dailyHours
    .map(
      (d) =>
        `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${d.date}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${d.hours.toFixed(2)}h</td>
    </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Performance Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
    h1 { color: #1f2937; margin-bottom: 10px; }
    h2 { color: #374151; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
    .summary-card { background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; }
    .summary-card .value { font-size: 24px; font-weight: bold; color: #3b82f6; }
    .summary-card .label { font-size: 12px; color: #6b7280; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #d1d5db; }
    td { padding: 8px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <h1>Worker Performance Report</h1>
  <p>Generated on ${new Date().toLocaleString()}</p>

  <h2>Summary</h2>
  <div class="summary">
    <div class="summary-card">
      <div class="value">${metrics.length}</div>
      <div class="label">Active Workers</div>
    </div>
    <div class="summary-card">
      <div class="value">${totalHours}h</div>
      <div class="label">Total Hours</div>
    </div>
    <div class="summary-card">
      <div class="value">${totalEntries}</div>
      <div class="label">Total Entries</div>
    </div>
    <div class="summary-card">
      <div class="value">${avgDuration}m</div>
      <div class="label">Avg Duration</div>
    </div>
  </div>

  <h2>Worker Metrics</h2>
  <table>
    <thead>
      <tr>
        <th>Worker ID</th>
        <th>Total Hours</th>
        <th>Entries</th>
        <th>Avg Duration</th>
        <th>Last Active</th>
      </tr>
    </thead>
    <tbody>
      ${metricsTableRows}
    </tbody>
  </table>

  <h2>Daily Hours Distribution</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Hours</th>
      </tr>
    </thead>
    <tbody>
      ${dailyHoursTableRows}
    </tbody>
  </table>

  <div class="footer">
    <p>This report was automatically generated by FarmKonnect Performance Dashboard.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Export performance data as HTML and trigger download
 */
export function exportPerformanceHTML(
  metrics: PerformanceData[],
  dailyHours: DailyHoursData[],
  filename?: string
): void {
  const html = generatePerformanceHTML(metrics, dailyHours);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `performance-report-${new Date().toISOString().split('T')[0]}.html`;
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Print performance report
 */
export function printPerformanceReport(
  metrics: PerformanceData[],
  dailyHours: DailyHoursData[]
): void {
  const html = generatePerformanceHTML(metrics, dailyHours);
  const printWindow = window.open('', '', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}
