/**
 * CSV export utility.
 * Handles proper escaping, UTF-8 BOM for Arabic text in Excel,
 * and triggers a browser download.
 */

/**
 * Escape a CSV cell value — wrap in double quotes if it contains
 * commas, quotes, or newlines. Double any existing quotes.
 */
function escapeCSVCell(value: unknown): string {
	const str = value == null ? '' : String(value);
	if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

/**
 * Convert an array of objects to a CSV string.
 * Column headers come from the keys of the first object.
 */
function toCSVString(data: Record<string, unknown>[]): string {
	if (data.length === 0) return '';

	const headers = Object.keys(data[0]);
	const headerRow = headers.map(escapeCSVCell).join(',');

	const rows = data.map((row) =>
		headers.map((h) => escapeCSVCell(row[h])).join(','),
	);

	return [headerRow, ...rows].join('\r\n');
}

/**
 * Export an array of objects as a downloadable CSV file.
 * Uses UTF-8 BOM (byte order mark) so Excel correctly detects Arabic text.
 *
 * @param data - Array of objects to export. Keys become column headers (use Arabic keys).
 * @param filename - Name for the downloaded file (should end with .csv).
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
	if (data.length === 0) return;

	const csv = toCSVString(data);

	// UTF-8 BOM for Excel Arabic compatibility
	const BOM = '\uFEFF';
	const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });

	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.style.display = 'none';
	document.body.appendChild(link);
	link.click();

	// Cleanup
	setTimeout(() => {
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}, 100);
}
