"use client";

import { useState } from "react";
import { FileJson, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { FullAdminAnalytics } from "@/lib/database/analytics";
import { exportAnalyticsToCSV, exportAnalyticsToJSON, convertObjectsToCSV, triggerFileDownload, getExportFilename } from "@/lib/utils/export";

interface AnalyticsExportButtonsProps {
  analytics?: FullAdminAnalytics;
  data?: Record<string, unknown>[];
  filenamePrefix?: string;
  className?: string;
}

export function AnalyticsExportButtons({
  analytics,
  data,
  filenamePrefix = "analytics",
  className = "",
}: AnalyticsExportButtonsProps) {
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingJSON, setIsExportingJSON] = useState(false);

  const handleCSVExport = () => {
    setIsExportingCSV(true);
    try {
      if (analytics) {
        exportAnalyticsToCSV(analytics, getExportFilename(filenamePrefix, "csv"));
      } else if (data && data.length > 0) {
        const csvContent = convertObjectsToCSV(data);
        triggerFileDownload(csvContent, getExportFilename(filenamePrefix, "csv"), "text/csv");
      } else {
        alert("No analytics data available to export.");
      }
    } catch (error) {
      console.error("Export CSV Error:", error);
      alert("Failed to export CSV report.");
    } finally {
      setIsExportingCSV(false);
    }
  };

  const handleJSONExport = () => {
    setIsExportingJSON(true);
    try {
      if (analytics) {
        exportAnalyticsToJSON(analytics, getExportFilename(filenamePrefix, "json"));
      } else if (data) {
        const jsonContent = JSON.stringify(data, null, 2);
        triggerFileDownload(jsonContent, getExportFilename(filenamePrefix, "json"), "application/json");
      } else {
        alert("No analytics data available to export.");
      }
    } catch (error) {
      console.error("Export JSON Error:", error);
      alert("Failed to export JSON report.");
    } finally {
      setIsExportingJSON(false);
    }
  };

  const isBusy = isExportingCSV || isExportingJSON;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleCSVExport}
        disabled={isBusy}
        className="gap-1.5 text-xs font-semibold"
        aria-label="Export Analytics as CSV"
      >
        {isExportingCSV ? (
          <LoadingSpinner size="xs" label="Exporting CSV…" />
        ) : (
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        )}
        <span>Export CSV</span>
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={handleJSONExport}
        disabled={isBusy}
        className="gap-1.5 text-xs font-semibold"
        aria-label="Export Analytics as JSON"
      >
        {isExportingJSON ? (
          <LoadingSpinner size="xs" label="Exporting JSON…" />
        ) : (
          <FileJson className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        )}
        <span>Export JSON</span>
      </Button>
    </div>
  );
}
