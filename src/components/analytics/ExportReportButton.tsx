"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { convertObjectsToCSV, triggerFileDownload, getExportFilename } from "@/lib/utils/export";

interface ExportReportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
}

export function ExportReportButton({ data, filename }: ExportReportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (!data || data.length === 0) {
        alert("No data available to export");
        return;
      }

      const csvContent = convertObjectsToCSV(data);
      const outputFilename = getExportFilename(filename, "csv");
      triggerFileDownload(csvContent, outputFilename, "text/csv");
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant="secondary" 
      size="sm"
      onClick={handleExport} 
      disabled={isExporting || !data.length}
      className="gap-1.5 text-xs font-semibold"
      aria-label={`Export ${filename} as CSV`}
    >
      {isExporting ? (
        <LoadingSpinner size="xs" label="Exporting CSV…" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      <span>Export CSV</span>
    </Button>
  );
}
