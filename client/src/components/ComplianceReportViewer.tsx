import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Download, RefreshCw, TrendingUp } from "lucide-react";

interface ComplianceReportViewerProps {
  farmId: string;
}

export const ComplianceReportViewer: React.FC<ComplianceReportViewerProps> = ({ farmId }) => {
  const [reportType, setReportType] = useState<"full" | "access_control" | "data_protection" | "incident_response" | "audit_trail">("full");
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: report, isLoading: reportLoading, refetch: generateReport } = trpc.complianceReports.generateComplianceReport.useQuery(
    {
      farmId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reportType
    },
    { enabled: !!farmId }
  );

  const { data: metrics } = trpc.complianceReports.getComplianceMetrics.useQuery(
    { farmId },
    { enabled: !!farmId }
  );

  const handleGenerateReport = () => {
    generateReport();
  };

  const handleDownloadPDF = () => {
    // In a real implementation, this would generate and download a PDF
    const reportJSON = JSON.stringify(report, null, 2);
    const blob = new Blob([reportJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance-report-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Compliance Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{metrics.metrics.totalEvents}</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Critical Events</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-red-600">{metrics.metrics.criticalEvents}</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">MFA Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-green-600">{metrics.metrics.mfaEvents}</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Access Events</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-blue-600">{metrics.metrics.accessEvents}</span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Generator */}
      <Card>
        <CardHeader>
          <CardTitle>ISO 27001 Compliance Report</CardTitle>
          <CardDescription>Generate detailed compliance reports for audit purposes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="full">Full Report</option>
                <option value="access_control">Access Control</option>
                <option value="data_protection">Data Protection</option>
                <option value="incident_response">Incident Response</option>
                <option value="audit_trail">Audit Trail</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={handleGenerateReport}
                disabled={reportLoading}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>

          {/* Report Content */}
          {report && (
            <div className="space-y-4 mt-6">
              {/* Report Header */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Report ID: {report.reportId}</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadPDF}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Generated: {new Date(report.generatedAt).toLocaleString()}
                </p>
              </div>

              {/* Compliance Summary */}
              {report.complianceSummary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Compliance Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Overall Compliance</span>
                      <Badge className="bg-green-100 text-green-800">
                        {report.complianceSummary.compliancePercentage}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Controls Compliant</span>
                      <span className="font-medium">
                        {report.complianceSummary.controlsCompliant}/{report.complianceSummary.controlsActive}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Next Audit Due</span>
                      <span className="text-sm">
                        {new Date(report.complianceSummary.nextAuditDue).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Report Sections */}
              <Tabs defaultValue="access_control" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  {report.sections.accessControl && <TabsTrigger value="access_control">Access Control</TabsTrigger>}
                  {report.sections.dataProtection && <TabsTrigger value="data_protection">Data Protection</TabsTrigger>}
                  {report.sections.incidentResponse && <TabsTrigger value="incident_response">Incidents</TabsTrigger>}
                  {report.sections.auditTrail && <TabsTrigger value="audit_trail">Audit Trail</TabsTrigger>}
                </TabsList>

                {/* Access Control Section */}
                {report.sections.accessControl && (
                  <TabsContent value="access_control">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Access Control (A.9)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Failed Logins</p>
                            <p className="text-2xl font-bold text-red-600">
                              {report.sections.accessControl.failedLoginAttempts}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">MFA Verifications</p>
                            <p className="text-2xl font-bold text-green-600">
                              {report.sections.accessControl.mfaVerifications}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">MFA Enabled</p>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {/* Data Protection Section */}
                {report.sections.dataProtection && (
                  <TabsContent value="data_protection">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Data Protection (A.10)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Encryption Status</p>
                            <Badge className="mt-1 bg-green-100 text-green-800">
                              {report.sections.dataProtection.encryptionStatus}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Backup Status</p>
                            <Badge className="mt-1 bg-green-100 text-green-800">
                              {report.sections.dataProtection.backupStatus}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {/* Incident Response Section */}
                {report.sections.incidentResponse && (
                  <TabsContent value="incident_response">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Incident Response (A.16)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Total Incidents</p>
                            <p className="text-2xl font-bold">
                              {report.sections.incidentResponse.totalIncidents}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Critical</p>
                            <p className="text-2xl font-bold text-red-600">
                              {report.sections.incidentResponse.criticalIncidents}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Response Time</p>
                            <p className="text-sm font-medium">
                              {report.sections.incidentResponse.responseTime}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {/* Audit Trail Section */}
                {report.sections.auditTrail && (
                  <TabsContent value="audit_trail">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Audit Trail (A.12)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Total Events</p>
                          <p className="text-2xl font-bold mb-4">
                            {report.sections.auditTrail.totalEvents}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">Top Events</p>
                          <div className="space-y-1">
                            {report.sections.auditTrail.topEvents?.slice(0, 5).map((event: any) => (
                              <div key={event.eventType} className="flex justify-between text-sm">
                                <span>{event.eventType}</span>
                                <span className="font-medium">{event.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
