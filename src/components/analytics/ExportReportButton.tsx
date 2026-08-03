"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

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

      // Extract headers from the first object
      const headers = Object.keys(data[0]);
      
      // Convert to CSV
      const csvContent = [
        headers.join(","),
        ...data.map(row => 
          headers.map(header => {
            const val = row[header] === null || row[header] === undefined ? "" : String(row[header]);
            // Escape quotes and wrap in quotes if contains comma
            const escaped = val.replace(/"/g, '""');
            return escaped.includes(",") || escaped.includes("\n") || escaped.includes('"') 
              ? `"${escaped}"` 
              : escaped;
          }).join(",")
        )
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="secondary" onClick={handleExport} disabled={isExporting || !data.length}>
      {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
      Export CSV
    </Button>
  );
}
