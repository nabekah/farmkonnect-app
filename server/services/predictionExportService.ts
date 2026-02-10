import { jsPDF } from "jspdf";
import { json2csv } from "json2csv";
import { v4 as uuidv4 } from "uuid";

export interface PredictionExportData {
  predictions: Array<{
    type: "yield" | "disease" | "market";
    cropType?: string;
    productType?: string;
    predictedValue: number;
    confidence: number;
    predictionDate: string;
    recommendation: string;
  }>;
  farmName: string;
  farmerId: string;
  exportDate: string;
  metrics: {
    totalPredictions: number;
    averageConfidence: number;
    riskLevel: "low" | "medium" | "high";
  };
}

export interface ShareableReport {
  id: string;
  farmName: string;
  farmerId: string;
  createdAt: string;
  expiresAt: string;
  accessToken: string;
  predictions: PredictionExportData["predictions"];
  metrics: PredictionExportData["metrics"];
  sharedWith: string[];
}

export class PredictionExportService {
  /**
   * Export predictions to CSV format
   */
  static exportToCSV(data: PredictionExportData): string {
    try {
      const csvData = data.predictions.map((pred) => ({
        Type: pred.type,
        "Crop/Product": pred.cropType || pred.productType || "N/A",
        "Predicted Value": pred.predictedValue,
        Confidence: `${(pred.confidence * 100).toFixed(1)}%`,
        "Prediction Date": pred.predictionDate,
        Recommendation: pred.recommendation,
      }));

      const csv = json2csv(csvData);
      return csv;
    } catch (error) {
      throw new Error(`Failed to export predictions to CSV: ${error}`);
    }
  }

  /**
   * Export predictions to PDF format
   */
  static exportToPDF(data: PredictionExportData): Buffer {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      doc.setFontSize(20);
      doc.text("Prediction Report", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      // Farm Information
      doc.setFontSize(12);
      doc.text(`Farm: ${data.farmName}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Export Date: ${new Date(data.exportDate).toLocaleDateString()}`, 20, yPosition);
      yPosition += 12;

      // Metrics Summary
      doc.setFontSize(14);
      doc.text("Summary Metrics", 20, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.text(`Total Predictions: ${data.metrics.totalPredictions}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Average Confidence: ${(data.metrics.averageConfidence * 100).toFixed(1)}%`, 25, yPosition);
      yPosition += 6;
      doc.text(`Risk Level: ${data.metrics.riskLevel.toUpperCase()}`, 25, yPosition);
      yPosition += 12;

      // Predictions Table
      doc.setFontSize(14);
      doc.text("Predictions", 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      const tableData = data.predictions.map((pred) => [
        pred.type,
        pred.cropType || pred.productType || "N/A",
        pred.predictedValue.toString(),
        `${(pred.confidence * 100).toFixed(1)}%`,
        pred.predictionDate,
      ]);

      doc.autoTable({
        head: [["Type", "Crop/Product", "Predicted Value", "Confidence", "Date"]],
        body: tableData,
        startY: yPosition,
        margin: 20,
        didDrawPage: (data) => {
          // Footer
          const pageCount = doc.internal.pages.length;
          doc.setFontSize(10);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
          );
        },
      });

      return Buffer.from(doc.output("arraybuffer"));
    } catch (error) {
      throw new Error(`Failed to export predictions to PDF: ${error}`);
    }
  }

  /**
   * Create a shareable report link
   */
  static createShareableReport(data: PredictionExportData, expirationDays: number = 7): ShareableReport {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000);

    return {
      id: uuidv4(),
      farmName: data.farmName,
      farmerId: data.farmerId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      accessToken: this.generateAccessToken(),
      predictions: data.predictions,
      metrics: data.metrics,
      sharedWith: [],
    };
  }

  /**
   * Generate a unique access token for sharing
   */
  private static generateAccessToken(): string {
    return uuidv4().replace(/-/g, "").substring(0, 32);
  }

  /**
   * Share report with email addresses
   */
  static async shareReport(report: ShareableReport, emails: string[]): Promise<void> {
    try {
      // TODO: Implement email sending using SendGrid
      // For now, just add emails to sharedWith list
      report.sharedWith.push(...emails);

      // Send emails with report link
      // const shareLink = `${process.env.FRONTEND_URL}/shared-prediction/${report.id}/${report.accessToken}`;
      // await sendGridService.sendPredictionReport(emails, shareLink, report);
    } catch (error) {
      throw new Error(`Failed to share report: ${error}`);
    }
  }

  /**
   * Generate shareable link
   */
  static generateShareLink(reportId: string, accessToken: string): string {
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    return `${baseUrl}/shared-prediction/${reportId}/${accessToken}`;
  }

  /**
   * Validate report access
   */
  static validateReportAccess(report: ShareableReport, accessToken: string): boolean {
    // Check if token matches
    if (report.accessToken !== accessToken) {
      return false;
    }

    // Check if report has expired
    const expiresAt = new Date(report.expiresAt);
    if (new Date() > expiresAt) {
      return false;
    }

    return true;
  }
}

export default PredictionExportService;
