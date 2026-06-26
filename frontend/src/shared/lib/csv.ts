import * as XLSX from "xlsx";

type Cell = string | number | null | undefined;

/**
 * Export a real .xlsx workbook (SheetJS). Opens with proper columns and keeps
 * numbers numeric — the reliable, readable spreadsheet export.
 */
export function downloadXlsx(
  filename: string,
  headers: string[],
  rows: Cell[][],
  sheetName = "Sheet1",
): void {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  // Auto-ish column widths for readability.
  ws["!cols"] = headers.map((h, i) => {
    const maxLen = Math.max(
      h.length,
      ...rows.map((r) => String(r[i] ?? "").length),
    );
    return { wch: Math.min(48, Math.max(10, maxLen + 2)) };
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

/** Quote a field only when it actually needs it (comma, quote, newline, edge spaces). */
function field(v: Cell): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s) || /^\s|\s$/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsv(rows: Cell[][]): string {
  return rows.map((r) => r.map(field).join(",")).join("\r\n");
}

/** Build a clean CSV (minimal quoting, Excel-friendly BOM) and download it. */
export function downloadCsv(filename: string, rows: Cell[][]): void {
  const csv = "﻿" + toCsv(rows); // BOM so Excel detects UTF-8
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export a real spreadsheet file (.xls) via an HTML table. Unlike CSV, this
 * always opens with proper columns in Excel / Numbers / Google Sheets,
 * regardless of the locale's list separator.
 */
export function downloadExcel(
  filename: string,
  headers: string[],
  rows: Cell[][],
): void {
  const esc = (v: Cell) =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const head = `<tr>${headers
    .map((h) => `<th style="text-align:left;background:#f0f0f0">${esc(h)}</th>`)
    .join("")}</tr>`;
  const body = rows
    .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`)
    .join("");
  const html =
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" ` +
    `xmlns:x="urn:schemas-microsoft-com:office:excel">` +
    `<head><meta charset="utf-8"></head>` +
    `<body><table border="1">${head}${body}</table></body></html>`;
  const url = URL.createObjectURL(
    new Blob([html], { type: "application/vnd.ms-excel" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".xls") ? filename : `${filename}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Readable timestamp for spreadsheets: 2026-06-17 11:32. */
export function csvDateTime(d?: string | null): string {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())} ${p(dt.getHours())}:${p(dt.getMinutes())}`;
}
