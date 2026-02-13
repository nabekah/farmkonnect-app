import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, BorderStyle } from 'docx';
import * as XLSX from 'xlsx';
import { Decimal } from 'decimal.js';

export interface ExportOptions {
  farmId?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  type: 'expenses' | 'revenue' | 'summary';
  format: 'pdf' | 'excel';
}

export interface ExportData {
  title: string;
  period: string;
  farmName?: string;
  data: any[];
  summary?: {
    totalAmount: number;
    itemCount: number;
    averageAmount: number;
    byCategory?: Record<string, number>;
  };
}

/**
 * Generate Excel file from financial data
 */
export async function generateExcelReport(exportData: ExportData): Promise<Buffer> {
  const workbook = XLSX.utils.book_new();

  // Create summary sheet
  const summaryData = [
    ['Financial Report'],
    ['Title', exportData.title],
    ['Period', exportData.period],
    ...(exportData.farmName ? [['Farm', exportData.farmName]] : []),
    [],
    ['Summary Statistics'],
    ['Total Amount', exportData.summary?.totalAmount || 0],
    ['Item Count', exportData.summary?.itemCount || 0],
    ['Average Amount', exportData.summary?.averageAmount || 0],
  ];

  if (exportData.summary?.byCategory) {
    summaryData.push(['', '']);
    summaryData.push(['By Category']);
    Object.entries(exportData.summary.byCategory).forEach(([category, amount]) => {
      summaryData.push([category, amount]);
    });
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Create detailed data sheet
  if (exportData.data && exportData.data.length > 0) {
    const headers = Object.keys(exportData.data[0]);
    const dataRows = exportData.data.map((item) =>
      headers.map((header) => {
        const value = item[header];
        return value instanceof Decimal ? value.toNumber() : value;
      })
    );

    const dataSheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Details');
  }

  // Generate buffer
  return new Promise((resolve, reject) => {
    XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' }, (err, buffer) => {
      if (err) reject(err);
      else resolve(buffer as Buffer);
    });
  });
}

/**
 * Generate PDF file from financial data (using docx format as fallback)
 */
export async function generatePdfReport(exportData: ExportData): Promise<Buffer> {
  const sections = [];

  // Title section
  sections.push(
    new Paragraph({
      text: exportData.title,
      style: 'Heading1',
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Report info
  sections.push(
    new Paragraph({
      text: `Period: ${exportData.period}`,
      spacing: { after: 100 },
    })
  );

  if (exportData.farmName) {
    sections.push(
      new Paragraph({
        text: `Farm: ${exportData.farmName}`,
        spacing: { after: 200 },
      })
    );
  }

  // Summary section
  if (exportData.summary) {
    sections.push(
      new Paragraph({
        text: 'Summary',
        style: 'Heading2',
        spacing: { before: 200, after: 100 },
      })
    );

    const summaryTable = new Table({
      rows: [
        new TableRow({
          cells: [
            new TableCell({ children: [new Paragraph('Metric')] }),
            new TableCell({ children: [new Paragraph('Value')] }),
          ],
        }),
        new TableRow({
          cells: [
            new TableCell({ children: [new Paragraph('Total Amount')] }),
            new TableCell({
              children: [new Paragraph(formatCurrency(exportData.summary.totalAmount))],
            }),
          ],
        }),
        new TableRow({
          cells: [
            new TableCell({ children: [new Paragraph('Item Count')] }),
            new TableCell({
              children: [new Paragraph(exportData.summary.itemCount.toString())],
            }),
          ],
        }),
        new TableRow({
          cells: [
            new TableCell({ children: [new Paragraph('Average Amount')] }),
            new TableCell({
              children: [new Paragraph(formatCurrency(exportData.summary.averageAmount))],
            }),
          ],
        }),
      ],
    });

    sections.push(summaryTable);
  }

  // Category breakdown
  if (exportData.summary?.byCategory && Object.keys(exportData.summary.byCategory).length > 0) {
    sections.push(
      new Paragraph({
        text: 'By Category',
        style: 'Heading2',
        spacing: { before: 200, after: 100 },
      })
    );

    const categoryRows = [
      new TableRow({
        cells: [
          new TableCell({ children: [new Paragraph('Category')] }),
          new TableCell({ children: [new Paragraph('Amount')] }),
        ],
      }),
      ...Object.entries(exportData.summary.byCategory).map(
        ([category, amount]) =>
          new TableRow({
            cells: [
              new TableCell({ children: [new Paragraph(category)] }),
              new TableCell({
                children: [new Paragraph(formatCurrency(amount as number))],
              }),
            ],
          })
      ),
    ];

    sections.push(
      new Table({
        rows: categoryRows,
      })
    );
  }

  // Detailed data section
  if (exportData.data && exportData.data.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Detailed Records',
        style: 'Heading2',
        spacing: { before: 200, after: 100 },
      })
    );

    const headers = Object.keys(exportData.data[0]);
    const dataRows = [
      new TableRow({
        cells: headers.map(
          (header) =>
            new TableCell({
              children: [new Paragraph(header)],
            })
        ),
      }),
      ...exportData.data.slice(0, 50).map(
        (item) =>
          new TableRow({
            cells: headers.map(
              (header) =>
                new TableCell({
                  children: [
                    new Paragraph(
                      item[header] instanceof Decimal
                        ? formatCurrency(item[header].toNumber())
                        : String(item[header])
                    ),
                  ],
                })
            ),
          })
      ),
    ];

    sections.push(
      new Table({
        rows: dataRows,
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        children: sections,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

/**
 * Format currency value
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Generate export filename with timestamp
 */
export function generateExportFilename(type: string, format: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `financial-${type}-${timestamp}.${format === 'pdf' ? 'docx' : 'xlsx'}`;
}
