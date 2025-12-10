/**
 * CSV/Excel Export Utilities for Inventory
 * Provides functions to export inventory data in various formats
 */

import type { Product } from "@/lib/types";

export interface ExportProduct {
  Name: string;
  SKU: string;
  Manufacturer: string;
  Model: string;
  Quantity: number;
  Price: number | string; // Allow both types like Product
  Condition: string;
  Location: string;
  Category: string;
  "Low Stock Threshold": number | string;
  Supplier: string;
  "Warranty (Months)": number | string;
  Specifications: string;
  Compatibility: string;
  Notes: string;
}

/**
 * Convert products to CSV-ready format
 */
export function productsToCSVData(products: Product[]): ExportProduct[] {
  return products.map((product) => ({
    Name: product.name,
    SKU: product.sku || "",
    Manufacturer: product.manufacturer || "",
    Model: product.model || "",
    Quantity: product.quantity,
    Price: product.price,
    Condition: product.condition || "",
    Location: product.location || "",
    Category: product.categoryName || "",
    "Low Stock Threshold": product.lowStockAt ?? "",
    Supplier: product.supplier || "",
    "Warranty (Months)": product.warrantyMonths ?? "",
    Specifications: product.specs || "",
    Compatibility: product.compatibility || "",
    Notes: product.notes || "",
  }));
}

/**
 * Generate CSV content from products
 */
export function generateCSV(products: Product[]): string {
  const data = productsToCSVData(products);

  if (data.length === 0) {
    return "No data to export";
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // Add header row
  csvRows.push(headers.join(","));

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header as keyof ExportProduct];
      // Escape values that contain commas or quotes
      const stringValue = String(value ?? "");
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

/**
 * Download CSV file in the browser
 */
export function downloadCSV(csvContent: string, filename: string = "inventory-export.csv"): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Parse CSV content to product data for import
 */
export function parseCSV(csvContent: string): Array<Record<string, string>> {
  const lines = csvContent.split("\n").filter((line) => line.trim());
  
  if (lines.length < 2) {
    throw new Error("CSV must contain at least a header row and one data row");
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);
  
  // Parse data rows
  const data: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue; // Skip empty lines
    
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    data.push(row);
  }

  return data;
}

/**
 * Parse a single CSV line, handling quotes and commas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}

/**
 * Convert parsed CSV data to product import format
 */
export function csvToProductImportData(
  csvData: Array<Record<string, string>>
): Array<{
  name: string;
  manufacturer: string;
  sku?: string;
  model?: string;
  quantity?: number;
  price?: number;
  condition?: string;
  location?: string;
  categoryName?: string;
  lowStockAt?: number;
  supplier?: string;
  warrantyMonths?: number;
  specs?: string;
  compatibility?: string;
  notes?: string;
}> {
  return csvData.map((row) => ({
    name: row.Name || row.name || "",
    manufacturer: row.Manufacturer || row.manufacturer || "",
    sku: row.SKU || row.sku || undefined,
    model: row.Model || row.model || undefined,
    quantity: parseNumber(row.Quantity || row.quantity),
    price: parseNumber(row.Price || row.price),
    condition: row.Condition || row.condition || "new",
    location: row.Location || row.location || undefined,
    categoryName: row.Category || row.category || undefined,
    lowStockAt: parseNumber(row["Low Stock Threshold"] || row.lowStockAt),
    supplier: row.Supplier || row.supplier || undefined,
    warrantyMonths: parseNumber(row["Warranty (Months)"] || row.warrantyMonths),
    specs: row.Specifications || row.specs || undefined,
    compatibility: row.Compatibility || row.compatibility || undefined,
    notes: row.Notes || row.notes || undefined,
  }));
}

/**
 * Parse a string to number, return undefined if invalid
 */
function parseNumber(value: string | undefined): number | undefined {
  if (!value || value.trim() === "") return undefined;
  const num = parseFloat(value);
  return isNaN(num) ? undefined : num;
}

/**
 * Validate import data and return errors
 */
export function validateImportData(
  data: ReturnType<typeof csvToProductImportData>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  data.forEach((product, index) => {
    const rowNum = index + 2; // +2 because index is 0-based and we skip header

    if (!product.name || !product.name.trim()) {
      errors.push(`Row ${rowNum}: Name is required`);
    }
    if (!product.manufacturer || !product.manufacturer.trim()) {
      errors.push(`Row ${rowNum}: Manufacturer is required`);
    }
    if (product.quantity !== undefined && product.quantity < 0) {
      errors.push(`Row ${rowNum}: Quantity cannot be negative`);
    }
    if (product.price !== undefined && product.price < 0) {
      errors.push(`Row ${rowNum}: Price cannot be negative`);
    }
    if (
      product.condition &&
      !["new", "used", "refurbished", "for-parts"].includes(product.condition)
    ) {
      errors.push(
        `Row ${rowNum}: Invalid condition. Must be one of: new, used, refurbished, for-parts`
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a sample CSV template for import
 */
export function generateImportTemplate(): string {
  const headers = [
    "Name",
    "Manufacturer",
    "SKU",
    "Model",
    "Quantity",
    "Price",
    "Condition",
    "Location",
    "Category",
    "Low Stock Threshold",
    "Supplier",
    "Warranty (Months)",
    "Specifications",
    "Compatibility",
    "Notes",
  ];

  const sampleData = [
    [
      "Sample Product 1",
      "Sample Manufacturer",
      "SKU-001",
      "Model-A",
      "100",
      "99.99",
      "new",
      "Warehouse A",
      "Electronics",
      "10",
      "Sample Supplier",
      "12",
      "Sample specs",
      "Compatible with Model B",
      "Sample notes",
    ],
    [
      "Sample Product 2",
      "Another Manufacturer",
      "SKU-002",
      "Model-B",
      "50",
      "149.99",
      "used",
      "Warehouse B",
      "Hardware",
      "5",
      "Another Supplier",
      "6",
      "",
      "",
      "",
    ],
  ];

  const rows = [headers.join(",")];
  sampleData.forEach((row) => {
    rows.push(row.map((cell) => `"${cell}"`).join(","));
  });

  return rows.join("\n");
}
