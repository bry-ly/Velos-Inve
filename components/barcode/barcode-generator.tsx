"use client";

import Barcode from "react-barcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconPrinter, IconDownload } from "@tabler/icons-react";
import { useRef } from "react";

interface BarcodeGeneratorProps {
  value: string;
  productName?: string;
  sku?: string;
  showControls?: boolean;
  format?: "CODE128" | "EAN13" | "UPC" | "CODE39";
  width?: number;
  height?: number;
}

export function BarcodeGenerator({
  value,
  productName,
  sku,
  showControls = true,
  format = "CODE128",
  width = 2,
  height = 80,
}: BarcodeGeneratorProps) {
  const barcodeRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!barcodeRef.current) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const barcodeHtml = barcodeRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Barcode - ${productName || value}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .label {
              text-align: center;
              padding: 10px;
              border: 1px dashed #ccc;
            }
            .product-name {
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 5px;
            }
            .sku {
              font-size: 12px;
              color: #666;
              margin-bottom: 10px;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .label { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="label">
            ${
              productName
                ? `<div class="product-name">${productName}</div>`
                : ""
            }
            ${sku ? `<div class="sku">SKU: ${sku}</div>` : ""}
            ${barcodeHtml}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    if (!barcodeRef.current) return;

    const svg = barcodeRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `barcode-${value}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!value) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No barcode value provided
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Barcode</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          ref={barcodeRef}
          className="flex justify-center bg-white p-4 rounded-md"
        >
          <Barcode
            value={value}
            format={format}
            width={width}
            height={height}
            displayValue={true}
            fontSize={14}
            margin={10}
            background="#ffffff"
            lineColor="#000000"
          />
        </div>
        {showControls && (
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <IconPrinter className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <IconDownload className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
