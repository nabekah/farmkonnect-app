import { parse } from "csv-parse/sync";

export interface AnimalCSVRow {
  tagId: string;
  breed: string;
  gender: "male" | "female" | "unknown";
  birthDate?: string;
  animalType: string;
  notes?: string;
}

export interface CSVImportResult {
  success: boolean;
  totalRows: number;
  validRows: AnimalCSVRow[];
  errors: { row: number; error: string }[];
}

export function parseAnimalCSV(csvContent: string): CSVImportResult {
  const errors: { row: number; error: string }[] = [];
  const validRows: AnimalCSVRow[] = [];

  try {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];

    records.forEach((record, index) => {
      const rowNumber = index + 2; // +2 because of header and 1-based indexing

      try {
        // Validate required fields
        if (!record.tagId || !record.tagId.trim()) {
          errors.push({ row: rowNumber, error: "Tag ID is required" });
          return;
        }

        if (!record.animalType || !record.animalType.trim()) {
          errors.push({ row: rowNumber, error: "Animal Type is required" });
          return;
        }

        if (!record.breed || !record.breed.trim()) {
          errors.push({ row: rowNumber, error: "Breed is required" });
          return;
        }

        // Validate gender
        const gender = (record.gender || "unknown").toLowerCase();
        if (!["male", "female", "unknown"].includes(gender)) {
          errors.push({ row: rowNumber, error: "Gender must be male, female, or unknown" });
          return;
        }

        // Validate birth date if provided
        if (record.birthDate && record.birthDate.trim()) {
          const date = new Date(record.birthDate);
          if (isNaN(date.getTime())) {
            errors.push({ row: rowNumber, error: "Invalid birth date format (use YYYY-MM-DD)" });
            return;
          }
        }

        // Add valid row
        validRows.push({
          tagId: record.tagId.trim(),
          breed: record.breed.trim(),
          gender: gender as "male" | "female" | "unknown",
          birthDate: record.birthDate?.trim(),
          animalType: record.animalType.trim(),
          notes: record.notes?.trim(),
        });
      } catch (err) {
        errors.push({ row: rowNumber, error: `Invalid row format: ${err instanceof Error ? err.message : "Unknown error"}` });
      }
    });

    return {
      success: errors.length === 0,
      totalRows: records.length,
      validRows,
      errors,
    };
  } catch (err) {
    return {
      success: false,
      totalRows: 0,
      validRows: [],
      errors: [{ row: 0, error: `CSV parsing error: ${err instanceof Error ? err.message : "Unknown error"}` }],
    };
  }
}

export function generateCSVTemplate(): string {
  const headers = ["tagId", "animalType", "breed", "gender", "birthDate", "notes"];
  const exampleRows = [
    ["TAG001", "Cattle", "Holstein", "female", "2023-01-15", "Healthy cow"],
    ["TAG002", "Cattle", "Angus", "male", "2023-02-20", "Bull for breeding"],
    ["TAG003", "Sheep", "Merino", "female", "2023-03-10", "Wool production"],
  ];

  const csvContent = [
    headers.join(","),
    ...exampleRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return csvContent;
}
