import { FullAdminAnalytics } from "@/lib/database/analytics";

/**
 * Triggers a browser download of text content as a file.
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formats a filename with current date (YYYY-MM-DD).
 */
export function getExportFilename(prefix: string, extension: string): string {
  const dateStr = new Date().toISOString().split("T")[0];
  return `${prefix}-${dateStr}.${extension}`;
}

/**
 * Converts generic array of objects to a CSV string.
 */
export function convertObjectsToCSV(data: Record<string, unknown>[]): string {
  if (!data || data.length === 0) return "";
  const headers = Object.keys(data[0]);

  const rows = data.map((row) =>
    headers
      .map((header) => {
        const val = row[header] === null || row[header] === undefined ? "" : String(row[header]);
        const escaped = val.replace(/"/g, '""');
        return escaped.includes(",") || escaped.includes("\n") || escaped.includes('"')
          ? `"${escaped}"`
          : escaped;
      })
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

/**
 * Converts full admin analytics object to structured CSV containing:
 * 1. Dashboard Summary & KPIs
 * 2. Runner Statistics
 * 3. Student Statistics
 * 4. 30-Day Trend Data
 */
export function generateAnalyticsCSV(analytics: FullAdminAnalytics): string {
  const lines: string[] = [];

  // Section 1: Dashboard Summary & KPIs
  lines.push("--- DASHBOARD SUMMARY & KPIS ---");
  lines.push("Metric,Value");
  lines.push(`Total Users,${analytics.summary.totalUsers}`);
  lines.push(`Students,${analytics.summary.students}`);
  lines.push(`Runners,${analytics.summary.runners}`);
  lines.push(`Admins,${analytics.summary.admins}`);
  lines.push(`Total Requests,${analytics.summary.totalRequests}`);
  lines.push(`Pending Requests,${analytics.summary.pending}`);
  lines.push(`Accepted Requests,${analytics.summary.accepted}`);
  lines.push(`Picked Up Requests,${analytics.summary.pickedUp}`);
  lines.push(`In Transit Requests,${analytics.summary.inTransit}`);
  lines.push(`Delivered Requests,${analytics.summary.delivered}`);
  lines.push(`Cancelled Requests,${analytics.summary.cancelled}`);
  lines.push(`Delivery Success Rate (%),${analytics.kpis.deliverySuccessRate}`);
  lines.push(`Cancellation Rate (%),${analytics.kpis.cancellationRate}`);
  lines.push(`Active Delivery Count,${analytics.kpis.activeDeliveryCount}`);
  lines.push(`Average Requests Per Day,${analytics.kpis.averageRequestsPerDay}`);
  lines.push("");

  // Section 2: Runner Statistics
  lines.push("--- RUNNER STATISTICS ---");
  lines.push("Runner ID,Runner Name,Completed Deliveries,Total Handled");
  analytics.runnerMetrics.topRunners.forEach((runner) => {
    lines.push(`"${runner.runnerId}","${runner.runnerName.replace(/"/g, '""')}",${runner.completedCount},${runner.totalHandled}`);
  });
  lines.push("");

  // Section 3: Student Statistics
  lines.push("--- STUDENT STATISTICS ---");
  lines.push("Student ID,Student Name,Requests Created");
  analytics.studentMetrics.topStudents.forEach((student) => {
    lines.push(`"${student.studentId}","${student.studentName.replace(/"/g, '""')}",${student.requestCount}`);
  });
  lines.push("");

  // Section 4: Daily Trends (30 Days)
  lines.push("--- DAILY TREND DATA (LAST 30 DAYS) ---");
  lines.push("Date,Requests Created,Deliveries Completed,New Users Registered");
  analytics.trends.requestsByDay.forEach((point, index) => {
    const deliveries = analytics.trends.deliveriesByDay[index]?.count || 0;
    const users = analytics.trends.newUsersByDay[index]?.count || 0;
    lines.push(`${point.rawDate},${point.count},${deliveries},${users}`);
  });

  return lines.join("\n");
}

/**
 * Downloads full admin analytics object as formatted JSON.
 */
export function exportAnalyticsToJSON(analytics: FullAdminAnalytics, customFilename?: string): void {
  const jsonContent = JSON.stringify(analytics, null, 2);
  const filename = customFilename || getExportFilename("analytics", "json");
  triggerFileDownload(jsonContent, filename, "application/json");
}

/**
 * Downloads full admin analytics object as structured CSV.
 */
export function exportAnalyticsToCSV(analytics: FullAdminAnalytics, customFilename?: string): void {
  const csvContent = generateAnalyticsCSV(analytics);
  const filename = customFilename || getExportFilename("analytics", "csv");
  triggerFileDownload(csvContent, filename, "text/csv");
}
