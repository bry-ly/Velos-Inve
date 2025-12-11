/**
 * Custom hook for exporting inventory data to CSV and Excel formats
 * Extracts export logic from components for reusability
 */

import { useCallback } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import type { Product } from "@/lib/types";

export function useInventoryExport(items: Product[]) {
  // Export to CSV
  const exportToCSV = useCallback(() => {
    const headers = [
      "Name",
      "SKU",
      "Category",
      "Manufacturer",
      "Model",
      "Condition",
      "Quantity",
      "Low Stock At",
      "Price",
      "Location",
      "Supplier",
      "Warranty (months)",
      "Tags",
    ];

    const csvRows = [
      headers.join(","),
      ...items.map((item) =>
        [
          `"${item.name}"`,
          `"${item.sku || ""}"`,
          `"${item.categoryName || "Uncategorized"}"`,
          `"${item.manufacturer || ""}"`,
          `"${item.model || ""}"`,
          `"${item.condition || ""}"`,
          item.quantity,
          item.lowStockAt || "",
          Number(item.price).toFixed(2),
          `"${item.location || ""}"`,
          `"${item.supplierName || ""}"`,
          item.warrantyMonths || "",
          `"${item.tags?.map((t) => t.name).join(", ") || ""}"`,
        ].join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `inventory-export-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Inventory exported to CSV successfully");
  }, [items]);

  // Export to Excel
  const exportToExcel = useCallback(() => {
    const headers = [
      "Name",
      "SKU",
      "Category",
      "Manufacturer",
      "Model",
      "Condition",
      "Quantity",
      "Low Stock At",
      "Price",
      "Location",
      "Supplier",
      "Warranty (months)",
      "Compatibility",
      "Notes",
      "Tags",
    ];

    const data = items.map((item) => [
      item.name,
      item.sku || "",
      item.categoryName || "Uncategorized",
      item.manufacturer || "",
      item.model || "",
      item.condition || "",
      item.quantity,
      item.lowStockAt || "",
      Number(item.price),
      item.location || "",
      item.supplierName || "",
      item.warrantyMonths || "",
      item.compatibility || "",
      item.notes || "",
      item.tags?.map((t) => t.name).join(", ") || "",
    ]);

    // Create workbook and worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

    // Set column widths for better readability
    const columnWidths = [
      { wch: 30 }, // Name
      { wch: 20 }, // SKU
      { wch: 15 }, // Category
      { wch: 15 }, // Manufacturer
      { wch: 15 }, // Model
      { wch: 12 }, // Condition
      { wch: 10 }, // Quantity
      { wch: 12 }, // Low Stock At
      { wch: 12 }, // Price
      { wch: 15 }, // Location
      { wch: 15 }, // Supplier
      { wch: 15 }, // Warranty
      { wch: 40 }, // Compatibility
      { wch: 40 }, // Notes
      { wch: 30 }, // Tags
    ];
    worksheet["!cols"] = columnWidths;

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `inventory-export-${new Date().toISOString().split("T")[0]}.xlsx`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Inventory exported to Excel successfully");
  }, [items]);

  return {
    exportToCSV,
    exportToExcel,
  };
}
