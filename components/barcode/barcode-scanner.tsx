"use client";

import { useZxing, type UseZxingOptions } from "react-zxing";
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconScan, IconX, IconKeyboard } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: Error) => void;
  className?: string;
  placeholder?: string;
}

export function BarcodeScanner({
  onScan,
  onError,
  className,
  placeholder = "Enter barcode manually...",
}: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState("");
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  // Use type assertion due to react-zxing types being out of sync with actual API
  const zxingOptions = {
    paused: !isScanning,
    onDecodeResult: (result: { getText: () => string }) => {
      const barcode = result.getText();
      if (barcode && barcode !== lastScanned) {
        setLastScanned(barcode);
        onScan(barcode);
        setIsScanning(false);
      }
    },
    onError: (error: unknown) => {
      console.error("Barcode scan error:", error);
      onError?.(error as Error);
    },
  } as UseZxingOptions;

  const { ref } = useZxing(zxingOptions);

  const handleManualSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (manualEntry.trim()) {
        onScan(manualEntry.trim());
        setManualEntry("");
      }
    },
    [manualEntry, onScan]
  );

  const toggleScanner = useCallback(() => {
    setIsScanning((prev) => !prev);
    setLastScanned(null);
  }, []);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <IconScan className="h-4 w-4" />
            Barcode Scanner
          </span>
          <Button
            variant={isScanning ? "destructive" : "outline"}
            size="sm"
            onClick={toggleScanner}
          >
            {isScanning ? (
              <>
                <IconX className="h-4 w-4 mr-1" />
                Stop
              </>
            ) : (
              <>
                <IconScan className="h-4 w-4 mr-1" />
                Scan
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isScanning && (
          <div className="relative aspect-video bg-black rounded-md overflow-hidden">
            <video
              ref={ref}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-3/4 h-1/2 border-2 border-white/50 rounded-lg relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
              </div>
            </div>
            <div className="absolute bottom-2 left-0 right-0 text-center">
              <span className="text-xs text-white/80 bg-black/50 px-2 py-1 rounded">
                Position barcode within the frame
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <IconKeyboard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={manualEntry}
              onChange={(e) => setManualEntry(e.target.value)}
              placeholder={placeholder}
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={!manualEntry.trim()}>
            Submit
          </Button>
        </form>

        {lastScanned && (
          <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/30 rounded-md border border-green-200 dark:border-green-800">
            <span className="text-sm">
              Last scanned: <strong>{lastScanned}</strong>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLastScanned(null)}
            >
              Clear
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
