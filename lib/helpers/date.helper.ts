/**
 * Date helper functions
 */

/**
 * Format a date string to Argentine locale format (DD/MM/YYYY)
 * @param dateString - ISO date string (e.g., "2024-12-25")
 * @returns Formatted date string (e.g., "25/12/2024")
 */
export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString("es-AR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
}

/**
 * Format a date to ISO string (YYYY-MM-DD)
 * @param date - Date object
 * @returns ISO date string
 */
export function formatDateToISO(date: Date): string {
	return date.toISOString().split("T")[0];
}

/**
 * Get current date in ISO format (YYYY-MM-DD)
 * @returns Current date as ISO string
 */
export function getCurrentDateISO(): string {
	return new Date().toISOString().split("T")[0];
}

/**
 * Format a date string to a more readable format
 * @param dateString - ISO date string
 * @param locale - Locale string (default: "es-AR")
 * @returns Formatted date string
 */
export function formatDateReadable(
	dateString: string,
	locale: string = "es-AR",
): string {
	const date = new Date(dateString);
	return date.toLocaleDateString(locale, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}





