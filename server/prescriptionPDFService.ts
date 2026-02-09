import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { storagePut } from './storage';

/**
 * Prescription PDF Export Service
 * Generates professional prescription PDFs with medication details
 */

export interface PrescriptionItem {
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  unit: string;
  instructions?: string;
}

export interface PrescriptionData {
  prescriptionId: number;
  animalName: string;
  animalType: string;
  prescriptionDate: Date;
  expiryDate: Date;
  veterinarian: string;
  veterinarianLicense: string;
  veterinarianClinic: string;
  items: PrescriptionItem[];
  totalCost: number;
  notes?: string;
  farmName: string;
  farmerName: string;
  farmerPhone: string;
}

/**
 * Generate prescription PDF
 */
export async function generatePrescriptionPDF(data: PrescriptionData): Promise<string> {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const { width, height } = page.getSize();

    // Header
    page.drawText('VETERINARY PRESCRIPTION', {
      x: 50,
      y: height - 50,
      size: 24,
      color: rgb(0.2, 0.4, 0.8),
    });

    // Farm and Farmer Info
    let yPosition = height - 100;
    page.drawText('FARM INFORMATION', {
      x: 50,
      y: yPosition,
      size: 12,
      color: rgb(0.2, 0.4, 0.8),
    });

    yPosition -= 20;
    page.drawText(`Farm: ${data.farmName}`, { x: 50, y: yPosition, size: 10 });
    yPosition -= 15;
    page.drawText(`Farmer: ${data.farmerName}`, { x: 50, y: yPosition, size: 10 });
    yPosition -= 15;
    page.drawText(`Phone: ${data.farmerPhone}`, { x: 50, y: yPosition, size: 10 });

    // Animal Information
    yPosition -= 25;
    page.drawText('ANIMAL INFORMATION', {
      x: 50,
      y: yPosition,
      size: 12,
      color: rgb(0.2, 0.4, 0.8),
    });

    yPosition -= 20;
    page.drawText(`Animal Name: ${data.animalName}`, { x: 50, y: yPosition, size: 10 });
    yPosition -= 15;
    page.drawText(`Animal Type: ${data.animalType}`, { x: 50, y: yPosition, size: 10 });

    // Prescription Details
    yPosition -= 25;
    page.drawText('PRESCRIPTION DETAILS', {
      x: 50,
      y: yPosition,
      size: 12,
      color: rgb(0.2, 0.4, 0.8),
    });

    yPosition -= 20;
    page.drawText(`Prescription ID: ${data.prescriptionId}`, { x: 50, y: yPosition, size: 10 });
    yPosition -= 15;
    page.drawText(`Date: ${data.prescriptionDate.toLocaleDateString()}`, { x: 50, y: yPosition, size: 10 });
    yPosition -= 15;
    page.drawText(`Expiry Date: ${data.expiryDate.toLocaleDateString()}`, { x: 50, y: yPosition, size: 10 });

    // Veterinarian Information
    yPosition -= 25;
    page.drawText('VETERINARIAN INFORMATION', {
      x: 50,
      y: yPosition,
      size: 12,
      color: rgb(0.2, 0.4, 0.8),
    });

    yPosition -= 20;
    page.drawText(`Name: ${data.veterinarian}`, { x: 50, y: yPosition, size: 10 });
    yPosition -= 15;
    page.drawText(`License: ${data.veterinarianLicense}`, { x: 50, y: yPosition, size: 10 });
    yPosition -= 15;
    page.drawText(`Clinic: ${data.veterinarianClinic}`, { x: 50, y: yPosition, size: 10 });

    // Medications Table
    yPosition -= 30;
    page.drawText('MEDICATIONS', {
      x: 50,
      y: yPosition,
      size: 12,
      color: rgb(0.2, 0.4, 0.8),
    });

    yPosition -= 25;

    // Table headers
    const colX = [50, 150, 250, 350, 450, 550];
    const headers = ['Drug', 'Dosage', 'Frequency', 'Duration', 'Qty', 'Unit'];

    headers.forEach((header, i) => {
      page.drawText(header, {
        x: colX[i],
        y: yPosition,
        size: 10,
        color: rgb(1, 1, 1),
      });
    });

    // Draw header background
    page.drawRectangle({
      x: 40,
      y: yPosition - 5,
      width: 520,
      height: 20,
      color: rgb(0.2, 0.4, 0.8),
    });

    // Redraw headers on background
    headers.forEach((header, i) => {
      page.drawText(header, {
        x: colX[i],
        y: yPosition,
        size: 10,
        color: rgb(1, 1, 1),
      });
    });

    yPosition -= 30;

    // Medication rows
    data.items.forEach((item) => {
      if (yPosition < 100) {
        // Add new page if needed
        const newPage = pdfDoc.addPage([612, 792]);
        yPosition = 750;
      }

      page.drawText(item.drugName, { x: colX[0], y: yPosition, size: 9 });
      page.drawText(item.dosage, { x: colX[1], y: yPosition, size: 9 });
      page.drawText(item.frequency, { x: colX[2], y: yPosition, size: 9 });
      page.drawText(item.duration, { x: colX[3], y: yPosition, size: 9 });
      page.drawText(item.quantity.toString(), { x: colX[4], y: yPosition, size: 9 });
      page.drawText(item.unit, { x: colX[5], y: yPosition, size: 9 });

      if (item.instructions) {
        yPosition -= 15;
        page.drawText(`Instructions: ${item.instructions}`, {
          x: 60,
          y: yPosition,
          size: 8,
          color: rgb(0.5, 0.5, 0.5),
        });
      }

      yPosition -= 20;
    });

    // Total Cost
    yPosition -= 20;
    page.drawText(`Total Cost: GHS ${data.totalCost}`, {
      x: 50,
      y: yPosition,
      size: 11,
      color: rgb(0.2, 0.4, 0.8),
    });

    // Notes
    if (data.notes) {
      yPosition -= 30;
      page.drawText('NOTES', {
        x: 50,
        y: yPosition,
        size: 12,
        color: rgb(0.2, 0.4, 0.8),
      });

      yPosition -= 20;
      page.drawText(data.notes, {
        x: 50,
        y: yPosition,
        size: 9,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    // Footer
    page.drawText('This prescription is valid until ' + data.expiryDate.toLocaleDateString(), {
      x: 50,
      y: 30,
      size: 8,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText('Generated by FarmKonnect - Veterinary Management System', {
      x: 50,
      y: 15,
      size: 8,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const fileName = `prescription-${data.prescriptionId}-${Date.now()}.pdf`;

    // Upload to S3
    const { url } = await storagePut(
      `prescriptions/${fileName}`,
      pdfBytes,
      'application/pdf'
    );

    return url;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`Failed to generate prescription PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate multiple prescription PDFs
 */
export async function generateBulkPrescriptionPDFs(
  prescriptions: PrescriptionData[]
): Promise<{ prescriptionId: number; url: string }[]> {
  const results: { prescriptionId: number; url: string }[] = [];

  for (const prescription of prescriptions) {
    try {
      const url = await generatePrescriptionPDF(prescription);
      results.push({
        prescriptionId: prescription.prescriptionId,
        url,
      });
    } catch (error) {
      console.error(`Failed to generate PDF for prescription ${prescription.prescriptionId}:`, error);
    }
  }

  return results;
}

/**
 * Generate prescription certificate
 */
export async function generatePrescriptionCertificate(data: PrescriptionData): Promise<string> {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();

    // Decorative border
    page.drawRectangle({
      x: 30,
      y: 30,
      width: width - 60,
      height: height - 60,
      borderColor: rgb(0.2, 0.4, 0.8),
      borderWidth: 3,
    });

    // Title
    page.drawText('VETERINARY PRESCRIPTION CERTIFICATE', {
      x: 50,
      y: height - 100,
      size: 28,
      color: rgb(0.2, 0.4, 0.8),
    });

    // Prescription details centered
    let yPosition = height - 200;

    page.drawText(`This certifies that the following prescription has been issued:`, {
      x: 100,
      y: yPosition,
      size: 12,
    });

    yPosition -= 40;

    page.drawText(`Animal: ${data.animalName} (${data.animalType})`, {
      x: 100,
      y: yPosition,
      size: 14,
    });

    yPosition -= 30;

    page.drawText(`Prescribed by: ${data.veterinarian}`, {
      x: 100,
      y: yPosition,
      size: 12,
    });

    yPosition -= 20;

    page.drawText(`License: ${data.veterinarianLicense}`, {
      x: 100,
      y: yPosition,
      size: 12,
    });

    yPosition -= 30;

    page.drawText(`Date: ${data.prescriptionDate.toLocaleDateString()}`, {
      x: 100,
      y: yPosition,
      size: 12,
    });

    yPosition -= 20;

    page.drawText(`Valid Until: ${data.expiryDate.toLocaleDateString()}`, {
      x: 100,
      y: yPosition,
      size: 12,
    });

    // Signature line
    yPosition -= 80;
    page.drawLine({
      start: { x: 100, y: yPosition },
      end: { x: 300, y: yPosition },
      color: rgb(0, 0, 0),
    });

    page.drawText('Veterinarian Signature', {
      x: 120,
      y: yPosition - 20,
      size: 10,
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const fileName = `prescription-cert-${data.prescriptionId}-${Date.now()}.pdf`;

    // Upload to S3
    const { url } = await storagePut(
      `prescriptions/certificates/${fileName}`,
      pdfBytes,
      'application/pdf'
    );

    return url;
  } catch (error) {
    console.error('Certificate generation error:', error);
    throw new Error(`Failed to generate prescription certificate: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
