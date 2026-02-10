import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Share2, Copy, CheckCircle, AlertCircle, Mail, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface PredictionExportShareProps {
  farmId: string;
  farmName: string;
}

export default function PredictionExportShare({ farmId, farmName }: PredictionExportShareProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv");
  const [shareEmails, setShareEmails] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // tRPC mutations
  const exportMutation = trpc.predictiveAnalytics.exportPredictions.useMutation();
  const shareMutation = trpc.predictiveAnalytics.sharePredictions.useMutation();

  const handleExport = async () => {
    setLoading(true);
    try {
      const result = await exportMutation.mutateAsync({
        farmId,
        format: exportFormat,
      });

      // Trigger download
      const link = document.createElement("a");
      link.href = result.downloadUrl;
      link.download = `predictions-${farmName}-${new Date().toISOString().split("T")[0]}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMessage(`✓ Predictions exported as ${exportFormat.toUpperCase()}`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      alert("Error exporting predictions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!shareEmails.trim()) {
      alert("Please enter at least one email address");
      return;
    }

    setLoading(true);
    try {
      const emails = shareEmails.split(",").map((e) => e.trim());
      const result = await shareMutation.mutateAsync({
        farmId,
        emails,
        expirationDays: 7,
      });

      setShareLink(result.shareLink);
      setSuccessMessage(`✓ Report shared with ${emails.length} recipient(s)`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      alert("Error sharing report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Predictions
          </CardTitle>
          <CardDescription>Download your prediction data in CSV or PDF format</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900 mb-2">Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as "csv" | "pdf")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="csv">CSV (Spreadsheet)</option>
                <option value="pdf">PDF (Report)</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleExport} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </>
                )}
              </Button>
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {exportFormat === "csv"
                ? "CSV format is ideal for importing into spreadsheet applications like Excel or Google Sheets."
                : "PDF format creates a formatted report suitable for printing or sharing with stakeholders."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Share Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Report
          </CardTitle>
          <CardDescription>Share your predictions with agronomists, advisors, or team members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Email Addresses</label>
            <textarea
              placeholder="Enter email addresses (comma-separated)"
              value={shareEmails}
              onChange={(e) => setShareEmails(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Example: john@example.com, jane@example.com</p>
          </div>

          <Button onClick={handleShare} disabled={loading} className="w-full">
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Sharing...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Share via Email
              </>
            )}
          </Button>

          {shareLink && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-2">Share Link</p>
              <div className="flex gap-2">
                <Input value={shareLink} readOnly className="text-sm" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Link expires in 7 days</p>
            </div>
          )}

          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Recipients will receive an email with a link to view your prediction report. The link expires after 7 days.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Recent Exports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recent Exports
          </CardTitle>
          <CardDescription>Your recently exported reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <p className="font-medium text-sm">Predictions Report - Feb 10, 2026</p>
                <p className="text-xs text-gray-500">CSV Format • 2.3 KB</p>
              </div>
              <Badge variant="outline">CSV</Badge>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <p className="font-medium text-sm">Predictions Report - Feb 09, 2026</p>
                <p className="text-xs text-gray-500">PDF Format • 145 KB</p>
              </div>
              <Badge variant="outline">PDF</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
