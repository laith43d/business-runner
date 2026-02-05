/**
 * Formatting utilities for currency, dates, and date ranges.
 * All formatting uses en-US locale.
 * Currency: IQD (Iraqi Dinar).
 */

/**
 * Format a number as IQD currency string using en-US number formatting.
 * Example: 1500.5 → "1,500.50 د.ع"
 */
export function formatCurrency(amount: number): string {
	const formatted = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(amount);

	return `${formatted} د.ع`;
}

/**
 * Format a timestamp (ms) to a date string (en-US).
 * Example: 1706745600000 → "February 1, 2024"
 */
export function formatDate(timestamp: number): string {
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}).format(new Date(timestamp));
}

/**
 * Format a timestamp (ms) to a short date (en-US).
 * Example: 1706745600000 → "02/01/2024"
 */
export function formatDateShort(timestamp: number): string {
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(new Date(timestamp));
}

/**
 * Format a date range to a readable Arabic string.
 */
export function formatDateRange(from: number, to: number): string {
	const fromStr = formatDate(from);
	const toStr = formatDate(to);
	return `من ${fromStr} إلى ${toStr}`;
}

/**
 * Convert a Date object or YYYY-MM-DD string to a timestamp at start of day (local).
 */
export function dateToTimestamp(date: Date | string): number {
	if (typeof date === 'string') {
		const [year, month, day] = date.split('-').map(Number);
		return new Date(year, month - 1, day).getTime();
	}
	return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * Convert a timestamp to YYYY-MM-DD string (for date inputs).
 */
export function timestampToDateString(timestamp: number): string {
	const d = new Date(timestamp);
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}
