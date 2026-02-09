import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, BarChart3, Award, Leaf } from 'lucide-react';

export default function AdvancedReporting() {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel'>('pdf');
  const [activeTab, setActiveTab] = useState<'certificates' | 'analytics' | 'financial' | 'breeding' | 'compliance'>('certificates');

  const exportReports = [
    {
      id: 'certificates',
      title: 'Training Certificates',
      description: 'Export training completion certificates for farmers',
      icon: Award,
      formats: ['pdf'],
      lastGenerated: '2026-02-08',
      count: 26
    },
    {
      id: 'analytics',
      title: 'Farm Analytics Report',
      description: 'Comprehensive farm performance metrics and statistics',
      icon: BarChart3,
      formats: ['pdf', 'excel'],
      lastGenerated: '2026-02-07',
      count: 1
    },
    {
      id: 'financial',
      title: 'Financial Reports',
      description: 'Monthly revenue, expenses, and profitability analysis',
      icon: FileText,
      formats: ['pdf', 'excel'],
      lastGenerated: '2026-02-06',
      count: 13
    },
    {
      id: 'breeding',
      title: 'Breeding Analytics',
      description: 'Genetic diversity, breeding success rates, and recommendations',
      icon: Leaf,
      formats: ['pdf', 'excel'],
      lastGenerated: '2026-02-05',
      count: 5
    },
    {
      id: 'compliance',
      title: 'Compliance Reports',
      description: 'Veterinary, environmental, labor, and safety compliance',
      icon: FileText,
      formats: ['pdf'],
      lastGenerated: '2026-02-04',
      count: 4
    }
  ];

  const recentExports = [
    {
      name: 'certificate-CERT-2026-001.pdf',
      type: 'Training Certificate',
      date: '2026-02-08 14:30',
      size: '245 KB',
      status: 'completed'
    },
    {
      name: 'farm-analytics-1-1707000000000.xlsx',
      type: 'Farm Analytics',
      date: '2026-02-07 10:15',
      size: '1.2 MB',
      status: 'completed'
    },
    {
      name: 'financial-report-1-February-2026.pdf',
      type: 'Financial Report',
      date: '2026-02-06 09:45',
      size: '512 KB',
      status: 'completed'
    },
    {
      name: 'breeding-report-1.excel',
      type: 'Breeding Analytics',
      date: '2026-02-05 16:20',
      size: '856 KB',
      status: 'completed'
    }
  ];

  const handleExport = (reportId: string, format: 'pdf' | 'excel') => {
    console.log(`Exporting ${reportId} as ${format}`);
    // In production, this would trigger the actual export
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced Reporting & Exports</h1>
        <p className="text-gray-600 mt-2">Generate and download comprehensive farm reports</p>
      </div>

      {/* Quick Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exportReports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-base">{report.title}</CardTitle>
                  </div>
                  <Badge variant="secondary">{report.count}</Badge>
                </div>
                <CardDescription className="text-xs">{report.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p>Last generated: {report.lastGenerated}</p>
                </div>
                <div className="flex gap-2">
                  {report.formats.includes('pdf') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExport(report.id, 'pdf')}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                  )}
                  {report.formats.includes('excel') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExport(report.id, 'excel')}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Excel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Exports</CardTitle>
          <CardDescription>Your recently generated and downloaded reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentExports.map((export_, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <p className="font-medium text-sm">{export_.name}</p>
                  <p className="text-xs text-gray-600">{export_.type} • {export_.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{export_.size}</span>
                  <Badge variant="outline" className="text-green-600">
                    {export_.status}
                  </Badge>
                  <Button size="sm" variant="ghost">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Report Builder</CardTitle>
          <CardDescription>Create custom reports with selected data and metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <select className="w-full border rounded-lg p-2 text-sm">
                <option>Farm Performance</option>
                <option>Financial Summary</option>
                <option>Livestock Health</option>
                <option>Crop Yield Analysis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <select className="w-full border rounded-lg p-2 text-sm">
                <option>Last 30 days</option>
                <option>Last 3 months</option>
                <option>Last 6 months</option>
                <option>Last year</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Include Sections</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Summary Statistics</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Charts & Visualizations</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Detailed Data Tables</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Recommendations</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Generate PDF
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Generate Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
          <CardDescription>Set up automatic report generation and delivery</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Monthly Financial Report</p>
                  <p className="text-xs text-gray-600">Sent on the 1st of each month</p>
                </div>
                <Badge className="bg-blue-600">Active</Badge>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Weekly Farm Analytics</p>
                  <p className="text-xs text-gray-600">Sent every Monday at 8:00 AM</p>
                </div>
                <Badge className="bg-green-600">Active</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              + Add Scheduled Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
